// Edge Runtime compatible — no Node.js APIs. Safe to import from middleware.ts.

const SESSION_COOKIE = 'opti-admin-session'
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

export { SESSION_COOKIE, SESSION_MAX_AGE }

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function computeSessionToken(): Promise<string> {
  const user = process.env.OPTI_ADMIN_USER     ?? ''
  const pass = process.env.OPTI_ADMIN_PASSWORD ?? ''
  const data = new TextEncoder().encode(`${user}:${pass}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return uint8ToBase64Url(new Uint8Array(hash))
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.OPTI_ADMIN_USER && process.env.OPTI_ADMIN_PASSWORD)
}
