import { type NextRequest, NextResponse } from 'next/server'
import {
  putPublishDelivery,
  getLatestPublishDelivery,
  getMappedCmsKey,
  setMappedCmsKey,
} from '@/lib/cmpPreviewStore'
import { mapCmpPreviewToBlog } from '@/lib/cmpBlog'
import { cmsConfigured, upsertBlogPage, type BlogPageProperties } from '@/lib/cmsApi'

// CMP publish webhook — PHASE 4: capture + create/update the blog.
//
// When a CMP workflow completes (publish), CMP fires an `asset_published` webhook
// here. We verify the inbound `callback-secret`, map the payload (reusing
// lib/cmpBlog.ts), and create/update a draft OT_BlogPage via the CMS Management
// API — updating the same page on re-publish (content_guid → CMS key). The full
// delivery is logged to the server console (Vercel → Functions logs, prefixed
// [cmp-publish]) and stashed; GET returns the most recent delivery as JSON for
// browser inspection, including the `cmsWrite` outcome of the last write.
//
// Requires CMP_BLOG_CONTAINER_KEY (target container) + the CMS creds; without
// them the write is skipped (visible as cmsWrite.status === 'skipped').
//
// Reuses CMP_CALLBACK_SECRET — set the same callback secret on the CMP publish
// webhook as on the preview webhook (or we can split to a second var later).

export const dynamic = 'force-dynamic'
export const revalidate = 0

type CapturedMeta = {
  receivedAt: string
  method: string
  contentType: string
  query: Record<string, string>
  headers: Record<string, string>
}

// Reads the body without trusting the content-type header (mirrors the preview
// webhook): JSON first, then form encodings, then raw text re-parsed as JSON.
// URL-friendly slug from the headline (CMP has no slug field).
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Outcome of the CMS write, surfaced in the webhook response (and the captured
// delivery) so the branch taken is visible without trawling Vercel logs.
type CmsWriteOutcome =
  | { status: 'skipped'; reason: string }
  | { status: 'created' | 'updated'; cmsKey?: string; httpStatus: number; detail?: string }
  | { status: 'error'; detail: string }

// Creates/updates a draft OT_BlogPage from the published CMP content. Best-effort
// and fully logged — never throws into the webhook response. Skipped unless the
// CMS creds + target container are configured. Returns a structured outcome.
async function upsertBlogFromPublish(body: unknown): Promise<CmsWriteOutcome> {
  const containerKey = process.env.CMP_BLOG_CONTAINER_KEY
  if (!cmsConfigured() || !containerKey) {
    const reason = !cmsConfigured()
      ? 'CMS creds not set (OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET)'
      : 'CMP_BLOG_CONTAINER_KEY not set'
    console.log(`[cmp-publish] skipping blog create — ${reason}`)
    return { status: 'skipped', reason }
  }

  const mapped = mapCmpPreviewToBlog(body)
  if (!mapped || !mapped.contentGuid) {
    console.warn('[cmp-publish] payload had no mappable blog / content_guid — skipping')
    return { status: 'skipped', reason: 'payload had no mappable blog / content_guid' }
  }

  const c = mapped.content
  const properties: BlogPageProperties = {
    headline: c.headline,
    subHeadline: c.subHeadline || undefined,
    topic: c.topic || undefined,
    // CMS stores rich text as an HTML string; existing blogs wrap body in a <div>.
    body: c.body?.html ? `<div>${c.body.html}</div>` : undefined,
    readTime: c.readTime || undefined,
  }
  // Reference the federated CMP DAM asset directly (no copy into the CMS).
  if (mapped.featuredImageAssetGuid) {
    properties.featuredImage = `cms://content/${mapped.featuredImageAssetGuid}`
  }

  try {
    // Look up a prior CMS key for this CMP content (idempotent re-publish).
    const existingKey = (await getMappedCmsKey(mapped.contentGuid)) ?? undefined

    const result = await upsertBlogPage({
      existingKey,
      container: containerKey,
      locale: mapped.locale,
      displayName: c.headline || 'Untitled',
      routeSegment: slugify(c.headline || mapped.contentGuid),
      properties,
    })

    // Persist the mapping on first create so re-publish updates the same page.
    if (result.action === 'created' && result.cmsKey) {
      await setMappedCmsKey(mapped.contentGuid, result.cmsKey)
    }

    const ok = result.status >= 200 && result.status < 300
    console.log(
      `[cmp-publish] blog ${ok ? result.action : `${result.action} FAILED`} (cms ${result.cmsKey}, guid ${mapped.contentGuid}) → ${result.status} ${result.body}`,
    )

    if (!ok) {
      return { status: 'error', detail: `CMS ${result.status}: ${result.body}` }
    }
    return {
      status: result.action,
      cmsKey: result.cmsKey,
      httpStatus: result.status,
    }
  } catch (err) {
    console.error('[cmp-publish] blog upsert failed:', err)
    return { status: 'error', detail: err instanceof Error ? err.message : String(err) }
  }
}

async function readBody(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await req.json()
    } catch {
      /* fall through */
    }
  }
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const form = await req.formData()
      return Object.fromEntries(form.entries())
    } catch {
      /* fall through */
    }
  }
  const text = await req.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.CMP_CALLBACK_SECRET
  if (expectedSecret) {
    const provided = req.headers.get('callback-secret')
    if (provided !== expectedSecret) {
      console.warn('[cmp-publish] rejected webhook — callback-secret mismatch')
      return NextResponse.json({ ok: false, error: 'invalid callback secret' }, { status: 401 })
    }
  }

  const body = await readBody(req)

  const meta: CapturedMeta = {
    receivedAt: new Date().toISOString(),
    method: req.method,
    contentType: req.headers.get('content-type') ?? '',
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(req.headers.entries()),
  }

  const eventName = (body as { event_name?: string })?.event_name

  // asset_published fires when content is published to this webhook channel —
  // that's our cue to create/update the draft OT_BlogPage in the CMS. Run it
  // before capturing so the outcome is visible on the GET inspection endpoint.
  let cmsWrite: CmsWriteOutcome | undefined
  if (eventName === 'asset_published') {
    cmsWrite = await upsertBlogFromPublish(body)
  }

  await putPublishDelivery({ receivedAt: meta.receivedAt, meta: { ...meta, cmsWrite }, payload: body })

  console.log('[cmp-publish] webhook received:\n' + JSON.stringify({ meta, cmsWrite, body }, null, 2))

  return NextResponse.json({ ok: true, eventName, cmsWrite, captured: meta })
}

export async function GET() {
  const latest = await getLatestPublishDelivery()
  if (!latest) {
    return NextResponse.json({
      ok: true,
      message:
        'No publish payload captured yet. Point the CMP publish/workflow-complete ' +
        'webhook (POST) at this URL, complete a workflow, then reload to inspect.',
    })
  }
  return NextResponse.json({
    ok: true,
    message: 'Most recently captured CMP publish webhook delivery.',
    captured: latest.meta,
    payload: latest.payload,
  })
}
