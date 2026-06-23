import { type NextRequest, NextResponse } from 'next/server'
import {
  putPublishDelivery,
  getLatestPublishDelivery,
  getMappedCmsKey,
  setMappedCmsKey,
} from '@/lib/cmpPreviewStore'
import { mapCmpPreviewToBlog } from '@/lib/cmpBlog'
import { cmsConfigured, upsertBlogPage, type BlogPageProperties } from '@/lib/cmsApi'

// CMP publish webhook — PHASE 4, STEP 1: capture & inspect.
//
// When a CMP workflow completes (publish), CMP fires a webhook here. We don't
// yet know the event name or payload shape, so this route only captures: verify
// the inbound `callback-secret`, log the full delivery to the server console
// (Vercel → Functions logs, prefixed [cmp-publish]), stash the latest, and echo
// it back. GET returns the most recent delivery as JSON for browser inspection.
//
// Once we know the shape, the next step maps the fields (reusing lib/cmpBlog.ts)
// and CREATES a draft OT_BlogPage via the CMS Management API — updating the same
// page on re-publish (content_guid → CMS key), per the agreed design.
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

// Creates/updates a draft OT_BlogPage from the published CMP content. Best-effort
// and fully logged — never throws into the webhook response. Skipped unless the
// CMS creds + target container are configured.
async function upsertBlogFromPublish(body: unknown): Promise<void> {
  const containerKey = process.env.CMP_BLOG_CONTAINER_KEY
  if (!cmsConfigured() || !containerKey) {
    console.log('[cmp-publish] CMS not configured (creds or CMP_BLOG_CONTAINER_KEY) — skipping blog create')
    return
  }

  const mapped = mapCmpPreviewToBlog(body)
  if (!mapped || !mapped.contentGuid) {
    console.warn('[cmp-publish] payload had no mappable blog / content_guid — skipping')
    return
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

    console.log(
      `[cmp-publish] blog ${result.action} (cms ${result.cmsKey}, guid ${mapped.contentGuid}) → ${result.status} ${result.body}`,
    )
  } catch (err) {
    console.error('[cmp-publish] blog upsert failed:', err)
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

  await putPublishDelivery({ receivedAt: meta.receivedAt, meta, payload: body })

  console.log('[cmp-publish] webhook received:\n' + JSON.stringify({ meta, body }, null, 2))

  const eventName = (body as { event_name?: string })?.event_name

  // asset_published fires when content is published to this webhook channel —
  // that's our cue to create/update the draft OT_BlogPage in the CMS.
  if (eventName === 'asset_published') {
    await upsertBlogFromPublish(body)
  }

  return NextResponse.json({ ok: true, eventName, captured: meta })
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
