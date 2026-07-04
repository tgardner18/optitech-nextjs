import { type NextRequest, NextResponse } from 'next/server'
import { putDelivery, getLatestDelivery } from '@/lib/cmpPreviewStore'
import { mapCmpPreviewToBlog } from '@/lib/cmpBlog'
import { cmpConfigured, acknowledgePreview, completePreview } from '@/lib/cmpApi'

// CMP blog preview webhook.
//
// Optimizely CMP fires a POST here when an editor requests a preview. The flow:
//   1. Verify the inbound `callback-secret` header against CMP_CALLBACK_SECRET.
//   2. Persist the delivery (KV) keyed by preview_id so the render page can load
//      it later — CMP caches the completed URL and fetches it on its own clock.
//   3. POST `acknowledge` (with content_hash) — tells CMP we can render it.
//   4. POST `complete` with keyed_previews → our /cmp-preview render URL, which
//      CMP embeds in its preview pane (framing allowed in next.config.mjs).
//
// GET returns the most recently captured delivery as JSON (inspection aid).
//
// If CMP_* env vars are absent the route still captures + stores (so the
// renderer works in dev), and simply skips the acknowledge/complete round-trip.

export const dynamic = 'force-dynamic'
export const revalidate = 0

type CapturedMeta = {
  receivedAt: string
  method: string
  contentType: string
  query: Record<string, string>
  headers: Record<string, string>
}

// Reads the request body without assuming a content type: tries JSON first, then
// form encodings, then falls back to raw text (re-parsing as JSON in case the
// content-type header lied, which webhooks sometimes do).
async function readBody(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      return await req.json()
    } catch {
      /* malformed JSON — fall through to raw text */
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
      /* fall through to raw text */
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

// Completes the CMP preview handshake: acknowledge, then hand CMP the render URL.
// Best-effort — logs each callback's status/body so a body-shape mismatch is
// visible immediately. Never throws into the webhook response path.
async function runPreviewHandshake(mapped: NonNullable<ReturnType<typeof mapCmpPreviewToBlog>>, origin: string) {
  const { previewId, contentHash, links } = mapped
  if (!cmpConfigured()) {
    console.log('[cmp-preview] CMP_* not configured — skipping acknowledge/complete')
    return
  }

  try {
    if (links?.acknowledge && contentHash) {
      const ack = await acknowledgePreview(links.acknowledge, contentHash)
      console.log(`[cmp-preview] acknowledge → ${ack.status} ${ack.body}`)
    }

    if (links?.complete && previewId) {
      const renderUrl = `${origin}/cmp-preview?id=${encodeURIComponent(previewId)}`
      // The dictionary key is the label shown in CMP's preview dropdown; the
      // value is the preview URL as a plain string.
      const done = await completePreview(links.complete, { 'Web Preview': renderUrl })
      console.log(`[cmp-preview] complete (${renderUrl}) → ${done.status} ${done.body}`)
    }
  } catch (err) {
    console.error('[cmp-preview] handshake failed:', err)
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Verify the inbound webhook secret (when configured) ──────────────────
  const expectedSecret = process.env.CMP_CALLBACK_SECRET
  if (expectedSecret) {
    const provided = req.headers.get('callback-secret')
    if (provided !== expectedSecret) {
      console.warn('[cmp-preview] rejected webhook — callback-secret mismatch')
      return NextResponse.json({ ok: false, error: 'invalid callback secret' }, { status: 401 })
    }
  }

  const body = await readBody(req)

  const REDACT = new Set(['callback-secret', 'authorization', 'cookie'])
  const meta: CapturedMeta = {
    receivedAt: new Date().toISOString(),
    method: req.method,
    contentType: req.headers.get('content-type') ?? '',
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(
      [...req.headers.entries()].filter(([k]) => !REDACT.has(k.toLowerCase())),
    ),
  }

  const previewId = (body as { data?: { preview_id?: string } })?.data?.preview_id

  // ── 2. Persist (durable) so the render page can load it later ───────────────
  await putDelivery({ receivedAt: meta.receivedAt, meta, payload: body }, previewId)

  if (process.env.NODE_ENV !== 'production') {
    console.log('[cmp-preview] webhook received:\n' + JSON.stringify({ meta, body }, null, 2))
  }

  // ── 3 + 4. Acknowledge + complete the preview back to CMP ───────────────────
  const mapped = mapCmpPreviewToBlog(body)
  if (mapped) {
    await runPreviewHandshake(mapped, req.nextUrl.origin)
  }

  return NextResponse.json({ ok: true, previewId, captured: meta })
}

export async function GET() {
  const latest = await getLatestDelivery()
  if (!latest) {
    return NextResponse.json({
      ok: true,
      message:
        'No payload captured yet. Point the CMP preview webhook (POST) at this URL, ' +
        'trigger a preview, then reload this page to inspect the delivery.',
    })
  }

  return NextResponse.json({
    ok: true,
    message: 'Most recently captured CMP webhook delivery.',
    captured: latest.meta,
    payload: latest.payload,
  })
}
