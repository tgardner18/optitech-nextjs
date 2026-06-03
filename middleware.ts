import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { computeSessionToken, SESSION_COOKIE } from './lib/admin/auth'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/opti-admin')) {
    // Login page is always accessible — let Next.js render it
    if (pathname === '/opti-admin/login') {
      return NextResponse.next()
    }

    const session = request.cookies.get(SESSION_COOKIE)?.value
    if (!session) {
      return redirectToLogin(request, pathname)
    }

    const expected = await computeSessionToken()
    if (session !== expected) {
      return redirectToLogin(request, pathname)
    }

    return NextResponse.next()
  }

  // ── All other routes: locale detection via next-intl ───────────────────────
  return intlMiddleware(request)
}

function redirectToLogin(request: NextRequest, from: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/opti-admin/login'
  url.search   = ''
  if (from !== '/opti-admin' && from !== '/opti-admin/') {
    url.searchParams.set('from', from)
  }
  return NextResponse.redirect(url)
}

export const config = {
  // Match /opti-admin/* AND all routes next-intl needs (excludes static files and API routes).
  matcher: [
    '/opti-admin/:path*',
    '/((?!api|_next/static|_next/image|favicon\\.ico|scripts/|icons/|.*\\..*).*)',
  ],
}
