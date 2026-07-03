/**
 * FX Datafile Refresh Webhook
 *
 * Optimizely Feature Experimentation calls this when the datafile changes;
 * resetting the server-side FX client singleton makes the next page request
 * fetch a fresh datafile (instant experiment propagation during demos).
 *
 * FX Webhook config:
 *   - URL:    https://your-site.com/api/fx-refresh
 *   - Events: Datafile → Updated
 *
 * Verification: FX signs the payload with HMAC-SHA1 using the webhook secret;
 * the signature arrives in the X-Hub-Signature header as "sha1=<hex digest>".
 *
 * GET is also supported for manual cache-busting from the browser.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { resetClient } from '@/lib/fx'

// node:crypto requires the Node.js runtime (not Edge).
export const runtime = 'nodejs'

async function verifySignature(
  request: NextRequest,
  secret: string,
): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('x-hub-signature')
  const body = await request.text()
  if (!signature) return { valid: false, body }
  const expected = 'sha1=' + createHmac('sha1', secret).update(body).digest('hex')
  return { valid: signature === expected, body }
}

// POST — called by the FX webhook on datafile update.
export async function POST(request: NextRequest) {
  const secret = process.env.OPTIMIZELY_FX_WEBHOOK_SECRET

  if (secret) {
    const { valid, body } = await verifySignature(request, secret)
    if (!valid) {
      console.warn('[FX Webhook] Invalid signature — rejecting')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    resetClient()

    let trigger = 'unknown'
    try {
      const parsed = JSON.parse(body)
      trigger = parsed?.event ?? 'unknown'
      console.log('[FX Webhook] Cache cleared — event:', trigger, 'timestamp:', parsed?.timestamp)
    } catch {
      console.log('[FX Webhook] Cache cleared — no body parsed')
    }

    return NextResponse.json({ ok: true, trigger })
  }

  // No secret configured — accept without verification.
  resetClient()
  console.log('[FX Webhook] Cache cleared (no secret configured, skipping verification)')
  return NextResponse.json({ ok: true, trigger: 'unverified' })
}

// GET — manual cache-bust from the browser address bar.
export async function GET() {
  resetClient()
  console.log('[FX Webhook] Cache cleared manually via GET')
  return NextResponse.json({ ok: true, trigger: 'manual' })
}
