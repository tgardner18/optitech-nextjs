// Edge Runtime compatible — no Node.js APIs. Safe to import from middleware.ts.

const SESSION_COOKIE = 'opti-admin-session'
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours (seconds)

export { SESSION_COOKIE, SESSION_MAX_AGE }

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function hmacKey(): Promise<CryptoKey> {
  const user = process.env.OPTI_ADMIN_USER     ?? ''
  const pass = process.env.OPTI_ADMIN_PASSWORD ?? ''
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${user}:${pass}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

// Token format: "<expiresAtSeconds>.<base64url-hmac>"
// The HMAC signs the expiry timestamp, binding the token to its validity window.
export async function computeSessionToken(expiresAt: number): Promise<string> {
  const key = await hmacKey()
  const sig  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(expiresAt)))
  return `${expiresAt}.${uint8ToBase64Url(new Uint8Array(sig))}`
}

// Returns true only when the token is structurally valid, not expired, and the
// HMAC signature matches the current OPTI_ADMIN_USER / OPTI_ADMIN_PASSWORD.
export async function verifySessionToken(token: string): Promise<boolean> {
  const dot = token.indexOf('.')
  if (dot === -1) return false

  const expiresAt = parseInt(token.slice(0, dot), 10)
  if (isNaN(expiresAt)) return false

  if (expiresAt < Math.floor(Date.now() / 1000)) return false

  const expected = await computeSessionToken(expiresAt)

  // Constant-time comparison: XOR every character code to prevent early return.
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.OPTI_ADMIN_USER && process.env.OPTI_ADMIN_PASSWORD)
}
