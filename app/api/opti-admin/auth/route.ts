import { NextResponse } from 'next/server'
import { computeSessionToken, isAdminConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/admin/auth'

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin credentials are not configured on this server.' },
      { status: 503 },
    )
  }

  let username: string
  let password: string

  try {
    const body = await request.json() as { username?: string; password?: string }
    username = String(body.username ?? '')
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const expectedUser = process.env.OPTI_ADMIN_USER     ?? ''
  const expectedPass = process.env.OPTI_ADMIN_PASSWORD ?? ''

  if (username !== expectedUser || password !== expectedPass) {
    // Constant-time comparison isn't critical here (env-var auth, not multi-user),
    // but we return a generic message to avoid username enumeration.
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const token = await computeSessionToken(expiresAt)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'lax',
    maxAge:    SESSION_MAX_AGE,
    path:      '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
