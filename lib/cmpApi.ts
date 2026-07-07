// ─── Optimizely CMP API client ──────────────────────────────────────────────
//
// Server-to-server access to CMP via the OAuth2 client-credentials flow. Used by
// the preview webhook to acknowledge/complete a preview and to resolve a CMP
// asset (library image) to a public CDN URL.
//
// Verified against the live API:
//   • token   — POST (form-encoded) accounts.cmp.optimizely.com/o/oauth2/v1/token
//               { grant_type, client_id, client_secret } → { access_token, expires_in≈3600 }
//   • asset   — GET asset-urls/{guid} (Bearer, follow 302) → metadata JSON whose
//               `url` is a PUBLIC CDN image (is_public:true) + `alt_text`
//   • ack/cmp — POST to the absolute acknowledge/complete links from the webhook
//               payload, Bearer auth (request body shapes per documented contract)

const TOKEN_URL = 'https://accounts.cmp.optimizely.com/o/oauth2/v1/token'

// Module-scoped token cache. Survives within a warm serverless instance; a cold
// start just re-mints. Refreshed 60s before expiry.
let cachedToken: { token: string; expiresAt: number } | null = null

export function cmpConfigured(): boolean {
  return Boolean(process.env.CMP_CLIENT_ID && process.env.CMP_CLIENT_SECRET)
}

export async function getCmpAccessToken(): Promise<string> {
  const clientId = process.env.CMP_CLIENT_ID
  const clientSecret = process.env.CMP_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('CMP_CLIENT_ID / CMP_CLIENT_SECRET are not set')
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) {
    throw new Error(`CMP token mint failed: ${res.status} ${await res.text()}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = {
    token: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000,
  }
  return cachedToken.token
}

// Resolves a CMP asset URL (the `links.self` from a library-asset field, i.e.
// .../v3/asset-urls/{guid}) to a public CDN image URL + alt text. Returns nulls
// on any failure so the caller can render without an image rather than throwing.
export async function resolveCmpAsset(
  assetUrl: string,
): Promise<{ url: string | null; alt: string }> {
  try {
    const token = await getCmpAccessToken()
    const res = await fetch(assetUrl, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'follow',
    })
    if (!res.ok) return { url: null, alt: '' }
    const json = (await res.json()) as { url?: string; alt_text?: string }
    return { url: json.url ?? null, alt: json.alt_text ?? '' }
  } catch {
    return { url: null, alt: '' }
  }
}

// Acknowledge that we can generate the preview. Request shape confirmed against
// the live API: `acknowledgedBy` (a string identifying the generator) is
// required; content_hash is sent too so CMP can tell whether a cached preview is
// stale. We identify ourselves with the CMP app's client id.
export async function acknowledgePreview(
  acknowledgeUrl: string,
  contentHash: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const token = await getCmpAccessToken()
  const res = await fetch(acknowledgeUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acknowledgedBy: process.env.CMP_CLIENT_ID ?? 'site-accelerator',
      content_hash: contentHash,
    }),
  })
  const body = await res.text()
  return { ok: res.ok, status: res.status, body }
}

// Complete the preview by handing CMP the URL(s) to embed. Request shape
// confirmed against the live API: `keyedPreviews` maps a label (shown in CMP's
// preview dropdown) → the preview URL as a plain string.
export async function completePreview(
  completeUrl: string,
  keyedPreviews: Record<string, string>,
): Promise<{ ok: boolean; status: number; body: string }> {
  const token = await getCmpAccessToken()
  const res = await fetch(completeUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyedPreviews }),
  })
  const body = await res.text()
  return { ok: res.ok, status: res.status, body }
}
