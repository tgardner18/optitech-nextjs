import { cookies } from 'next/headers'
import { computeSessionToken, SESSION_COOKIE } from './auth'

/**
 * Server-side admin session check for API routes. Mirrors the inline guard in
 * app/api/opti-admin/component-usage/route.ts, extracted for reuse.
 */
export async function isValidAdminSession(): Promise<boolean> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value
  if (!session) return false
  return session === (await computeSessionToken())
}
