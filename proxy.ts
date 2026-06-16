/**
 * Next.js proxy — locale detection, URL normalisation, and admin auth.
 * (Next.js 16+ renames "middleware" → "proxy"; same concept, new file name.)
 *
 * Why custom instead of next-intl's createMiddleware:
 *   next-intl's createMiddleware is designed for apps that have a [locale]
 *   directory segment (app/[locale]/page.tsx). This project intentionally omits
 *   the [locale] segment to keep routes clean — locale is a cross-cutting
 *   concern, not a URL segment from the app's perspective.
 *
 *   With createMiddleware, visiting /es/showcase results in a pass-through (not
 *   a rewrite) because next-intl computes the locale-prefixed URL and sees it
 *   equals the current URL, so it just calls next(). Without [locale] routes in
 *   the app, Next.js then routes /es/showcase to [...slug] instead of the
 *   showcase page — causing everything to 404.
 *
 * What this proxy does:
 *   1. Guards /opti-admin/* routes with an env-var session cookie check.
 *   2. Detects locale from URL prefix (/es/about → locale=es, path=/about)
 *   3. Strips the locale prefix via NextResponse.rewrite so the app router sees
 *      the clean path (/es/showcase → internally serves /showcase)
 *   4. Sets X-NEXT-INTL-LOCALE request header so next-intl's getLocale() and
 *      getRequestConfig() receive the correct locale in server components.
 *   5. For non-prefixed URLs (/showcase, /), reads the NEXT_LOCALE cookie so
 *      the locale persists across navigation (set by LocaleSelector on switch).
 *
 * Strategy (mirrors localePrefix: 'as-needed'):
 *   - Default locale (English) → no URL prefix  (/about)
 *   - Non-default locales      → URL prefix      (/fr/about, /es/about)
 *
 * Excluded from proxy (see matcher):
 *   - /api/*     — API routes have their own locale handling (or none).
 *   - /preview   — CMS preview route: locale comes from search params (loc=).
 *   - /_next/*   — Next.js build artefacts.
 *   - Static file extensions (svg, png, woff2, etc.).
 */

import { NextRequest, NextResponse } from 'next/server'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { computeSessionToken, SESSION_COOKIE } from '@/lib/admin/auth'

/** Header name used by next-intl server APIs (getLocale, getRequestConfig). */
const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE'

/** Cookie name used by LocaleSelector to persist locale preference. */
const LOCALE_COOKIE = 'NEXT_LOCALE'

/**
 * Canonical visitor identifier, minted server-side on first page visit.
 *
 * One id, three systems:
 *   - Optimizely Web Experimentation reads it client-side for BYOID.
 *   - Optimizely Feature Experimentation uses it as the FX userId (server-side
 *     variant resolution) so decisions are stable across requests.
 *   - ODP identifies the visitor by this id so realtime audience segments align
 *     with the FX/Web identity (no vuid reconciliation needed).
 *
 * NOT httpOnly: the Web Experimentation snippet and ODP client are browser JS
 * and must be able to read it.
 */
const USER_ID_COOKIE   = 'optimizely_user_id'
const USER_ID_MAX_AGE  = 60 * 60 * 24 * 365 // 1 year in seconds

// ── Admin helpers ─────────────────────────────────────────────────────────────

function redirectToLogin(request: NextRequest, from: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/opti-admin/login'
  url.search   = ''
  if (from !== '/opti-admin' && from !== '/opti-admin/') {
    url.searchParams.set('from', from)
  }
  return NextResponse.redirect(url)
}

// ── Main proxy ────────────────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 0. Mint canonical visitor id ──────────────────────────────────────────
  // Runs before everything else so it covers every matched route. We set it on
  // request.cookies *now* (before the headers below are cloned) so this same
  // render sees it via cookies(), and attach it to whatever response we return
  // via setVisitorId() so the browser persists it.
  let mintedVisitorId: string | undefined
  if (!request.cookies.get(USER_ID_COOKIE)?.value) {
    mintedVisitorId = crypto.randomUUID()
    request.cookies.set(USER_ID_COOKIE, mintedVisitorId)
  }
  const setVisitorId = (res: NextResponse): NextResponse => {
    if (mintedVisitorId) {
      res.cookies.set(USER_ID_COOKIE, mintedVisitorId, {
        httpOnly: false, // Web Exp (BYOID) + ODP client read this in the browser
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path:     '/',
        maxAge:   USER_ID_MAX_AGE,
      })
    }
    return res
  }

  // ── Admin route protection ────────────────────────────────────────────────
  // All /opti-admin/* routes require a valid session cookie, except the login
  // page itself. The session token is SHA-256(OPTI_ADMIN_USER:OPTI_ADMIN_PASSWORD)
  // so changing either env var immediately invalidates all sessions.
  if (pathname.startsWith('/opti-admin')) {
    if (pathname !== '/opti-admin/login') {
      const session = request.cookies.get(SESSION_COOKIE)?.value
      if (!session) {
        return redirectToLogin(request, pathname)
      }
      const expected = await computeSessionToken()
      if (session !== expected) {
        return redirectToLogin(request, pathname)
      }
    }
    return setVisitorId(NextResponse.next())
  }

  // ── 1. Detect locale from URL prefix ──────────────────────────────────────
  // Check whether the first path segment is a supported non-default locale.
  // e.g. /es/showcase → firstSegment='es'  → locale='es', internalPath='/showcase'
  //      /fr/         → firstSegment='fr'  → locale='fr', internalPath='/'
  //      /showcase    → firstSegment='showcase' → not a locale, no change
  const firstSegment = pathname.split('/')[1] ?? ''
  let locale: Locale = DEFAULT_LOCALE
  let internalPath   = pathname

  if (firstSegment && isSupportedLocale(firstSegment) && firstSegment !== DEFAULT_LOCALE) {
    locale       = firstSegment as Locale
    internalPath = pathname.slice(`/${firstSegment}`.length) || '/'
  } else {
    // No locale prefix in URL — check NEXT_LOCALE cookie for preferred locale.
    // LocaleSelector writes this cookie before navigating, so non-English users
    // who return to an unprefixed URL (e.g. after following a link) still get
    // their preferred language in the locale context.
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
    if (cookieLocale && isSupportedLocale(cookieLocale)) {
      locale = cookieLocale as Locale
    }
  }

  // ── 2. Build request headers with locale injected ─────────────────────────
  // next-intl's getLocale() and getRequestConfig() read this header from
  // next/headers() inside server components — we must set it on the REQUEST
  // (not the response) so it flows through to the server-side handlers.
  const headers = new Headers(request.headers)
  headers.set(LOCALE_HEADER, locale)

  // ── 3. Rewrite or pass through ────────────────────────────────────────────
  if (internalPath !== pathname) {
    // Locale prefix was stripped — rewrite to the clean path so the app router
    // matches the correct page (e.g. /es/showcase → /showcase → showcase page,
    // not [...slug] with slug=['es','showcase']).
    const url = request.nextUrl.clone()
    url.pathname = internalPath
    return setVisitorId(NextResponse.rewrite(url, { request: { headers } }))
  }

  // No rewrite needed — just forward the locale header.
  return setVisitorId(NextResponse.next({ request: { headers } }))
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - api routes (handled separately)
     *   - /preview (CMS preview; locale resolved from ?loc= param)
     *   - _next/static, _next/image (Next.js internals)
     *   - Static files with well-known extensions
     */
    '/((?!api|preview|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
