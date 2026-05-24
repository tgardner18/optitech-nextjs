/**
 * Next.js middleware — locale detection and URL normalisation.
 *
 * Strategy: default locale (English) has no URL prefix. All other locales
 * use a path prefix: /fr/, /de/, /es/. The middleware:
 *
 * 1. Reads the locale from the first URL segment.
 * 2. Falls back to the `locale` cookie, then Accept-Language header.
 * 3. Sets the resolved locale as an `x-locale` request header so server
 *    components can read it without accessing the URL.
 * 4. Rewrites non-default locale paths internally so the catch-all slug
 *    handler sees the bare path (e.g. /fr/about → /about with locale=fr).
 * 5. Redirects bare /en/ prefix to the non-prefixed equivalent.
 *
 * Static files and Next.js internals are excluded automatically via the
 * matcher config below.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  stripLocalePrefix,
} from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

const LOCALE_COOKIE = 'optitech-locale'

/**
 * BCP-47 regional variants the CMS may use in content URLs.
 * Maps full locale codes (lower-cased for comparison) → app locale.
 * When such a prefix is detected in the URL, we 301-redirect to the
 * canonical short-code form so the proxy can then handle it normally.
 */
const BCP47_CANONICAL: Record<string, Locale> = {
  'es-mx': 'es',
}

/** Parse the best locale from the Accept-Language header. */
function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE
  const tags = header
    .split(',')
    .map(s => s.split(';')[0].trim().toLowerCase().slice(0, 2))
  for (const tag of tags) {
    if (isSupportedLocale(tag)) return tag
  }
  return DEFAULT_LOCALE
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Normalize BCP-47 regional variants → canonical short codes ─────────
  // The CMS may publish content with locale-prefixed URLs like /es-MX/path.
  // Redirect those to the canonical app locale prefix (/es/path) so the
  // regular locale detection loop below can handle them consistently.
  for (const [bcp47, canonical] of Object.entries(BCP47_CANONICAL)) {
    const pfx = `/${bcp47}`
    const pfxSlash = `${pfx}/`
    if (pathname.toLowerCase() === pfx || pathname.toLowerCase().startsWith(pfxSlash)) {
      const stripped = pathname.slice(pfx.length) || '/'
      const url = request.nextUrl.clone()
      url.pathname = canonical === DEFAULT_LOCALE
        ? stripped
        : `/${canonical}${stripped === '/' ? '' : stripped}`
      return NextResponse.redirect(url, 301)
    }
  }

  // ── Detect locale from URL prefix ─────────────────────────────────────
  let detectedLocale: Locale = DEFAULT_LOCALE
  let hasPrefix = false

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      detectedLocale = locale
      hasPrefix = true
      break
    }
  }

  // Redirect /en/... → /... (English doesn't use a prefix)
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const stripped = pathname.slice(3) || '/'
    const url = request.nextUrl.clone()
    url.pathname = stripped
    return NextResponse.redirect(url, 308)
  }

  // Fall back to cookie → Accept-Language for the default English path
  if (!hasPrefix) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
    if (cookieLocale && isSupportedLocale(cookieLocale)) {
      detectedLocale = cookieLocale
    } else {
      detectedLocale = parseAcceptLanguage(request.headers.get('accept-language'))
    }

    // If a non-English preference was detected but no prefix exists,
    // redirect to the prefixed URL so locale is bookmarkable.
    // Skip for API routes, static assets, and preview paths.
    if (
      detectedLocale !== DEFAULT_LOCALE &&
      !pathname.startsWith('/api/') &&
      !pathname.startsWith('/preview') &&
      !pathname.startsWith('/_next/')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
      const res = NextResponse.redirect(url)
      res.cookies.set(LOCALE_COOKIE, detectedLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
      return res
    }
  }

  // ── Rewrite non-default locale paths internally ────────────────────────
  // The catch-all slug handler (/app/(site)/[...slug]/page.tsx) sees the
  // bare path without locale prefix. The x-locale header carries the locale.
  const response = hasPrefix
    ? NextResponse.rewrite(
        new URL(stripLocalePrefix(pathname), request.url),
        { request: { headers: new Headers(request.headers) } },
      )
    : NextResponse.next()

  // Propagate locale via header so server components can read it.
  response.headers.set('x-locale', detectedLocale)

  // Persist locale cookie on every response (refreshes expiry on navigation).
  response.cookies.set(LOCALE_COOKIE, detectedLocale, {
    path:    '/',
    maxAge:  60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files with extensions
     * - api routes handled separately
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
