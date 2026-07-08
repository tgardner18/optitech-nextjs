import { cache } from 'react'
import { headers } from 'next/headers'
import { config, getClient as _getClient } from '@optimizely/cms-sdk'
import type { GraphVariationInput } from '@optimizely/cms-sdk'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config'
import { resolveCornerStyle, resolvePrimaryFont, resolveMotionScale, resolveNavbarStyle, NAVBAR_STYLES } from '@/lib/theme-axes'
import type { Locale } from '@/lib/i18n/config'
import { getLocale as getNextIntlLocale } from 'next-intl/server'

// setContext is called per-request to tell the SDK the active locale.
// Import lazily to avoid pulling in React server-only code at module init.
let _setContext: ((ctx: Record<string, unknown>) => void) | undefined

let initialized = false

function ensureInitialized() {
  if (initialized) return
  const key = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY
  if (!key) throw new Error('OPTIMIZELY_GRAPH_SINGLE_KEY is not set')
  config({ apiKey: key })
  initialized = true
}

export function getClient() {
  ensureInitialized()
  return _getClient()
}

/**
 * Sets the Optimizely SDK context for the current request.
 * Must be called before any SDK rendering so preview attributes and
 * composition rendering have access to the active locale.
 */
export async function setRequestContext(locale: Locale): Promise<void> {
  try {
    if (!_setContext) {
      const mod = await import('@optimizely/cms-sdk/react/server')
      _setContext = (mod as any).setContext
    }
    _setContext?.({ locale })
  } catch {
    // Server-only module; safe to swallow outside React tree
  }
}

/**
 * Returns the active locale for the current request.
 *
 * Delegates to next-intl's getLocale(), which reads the locale resolved by
 * the next-intl middleware (stored internally via the next-intl plugin).
 * Falls back to DEFAULT_LOCALE for routes excluded from the middleware
 * (e.g. /preview, /api/*) where no locale context is available.
 *
 * Safe to call from any server component or route handler.
 */
export async function getRequestLocale(): Promise<Locale> {
  try {
    const locale = await getNextIntlLocale()
    return isSupportedLocale(locale) ? (locale as Locale) : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

/**
 * Returns the host (hostname + port if non-standard) from the current request.
 * Preserves the port so that frontEndDomain values like "localhost:3000" match.
 */
export async function getRequestDomain(): Promise<string> {
  try {
    const h = await headers()
    return h.get('host') ?? ''
  } catch {
    return ''
  }
}

/**
 * Returns the full base URL (protocol + host) for the current request.
 * Used to filter content queries to the correct Optimizely site channel,
 * matching what is stored as _metadata.url.base in Content Graph.
 * e.g. "https://your-site.vercel.app" or "http://localhost:3000"
 */
export async function getRequestBaseUrl(): Promise<string> {
  try {
    const h    = await headers()
    const host = h.get('host') ?? ''
    if (!host) return ''
    // x-forwarded-proto may be a comma-separated list; take the first value.
    const proto = h.get('x-forwarded-proto')?.split(',')[0].trim()
      ?? (host.startsWith('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  } catch {
    return ''
  }
}

// All fields consumed by layout (theme CSS), Header, and Footer.
const THEME_QUERY = `
  query GetThemeManagers($locale: [Locales]) {
    OT_ThemeManager(limit: 100, orderBy: { _metadata: { published: DESC } }) {
      items {
        _metadata { key }
        frontEndDomain
        logo { url { default } }
        logoAlt
        logoFit
        logoInvertDark
        defaultMode
        ctaLabel
        ctaUrl { default }
        footerRef { key }
        copyright
        colorBrand
        colorBrandHover
        colorAccent
        colorAccentHover
        colorFgOnAccent
        colorCanvas
        colorSurface
        colorCanvasLight
        colorSurfaceLight
        colorFgOnBrand
        colorFg
        colorFgLight
        colorFgMuted
        colorFgMutedLight
        cornerStyle
        primaryFont
        motionIntensity
        navbarStyle
        siteName
        defaultSeoDescription
        defaultSocialImage { url { default } }
        twitterHandle
        organizationDescription
        webExperimentationProjectId
        featureExperimentationSdkKey
        odpPublicKey
        peeriusScriptUrl
        contentRecsApiKey
        contentRecsClientId
        contentRecsDeliveryId
        primaryNavigation {
          menuLink { text title target url { default } }
          subNavItems {
            menuLink { text title target url { default } }
            description
            icon
          }
        }
      }
    }
    OT_FooterBlock(limit: 20, locale: $locale) {
      items {
        _metadata { key locale }
        footerStyle
        footerLogo { url { default } }
        footerLogoSize
        footerLogoInvertDark
        footerLeftMode
        description { html }
        links {
          label
          url { default }
        }
      }
    }
  }
`

// ── Locale-aware content fetching ─────────────────────────────────────────────

/**
 * Picks the best result from a getContentByPath response for the given locale.
 * Prefers exact locale match, then default locale, then first available item.
 */
function pickByLocale(results: any[], locale: Locale): any | null {
  if (!results.length) return null
  if (results.length === 1) return results[0]
  const al = locale.toLowerCase()
  const dl = DEFAULT_LOCALE.toLowerCase()
  return (
    results.find((r: any) => {
      const rl = (r._metadata?.locale ?? '').toLowerCase()
      return rl === al || rl.startsWith(`${al}-`) || al.startsWith(`${rl}-`)
    }) ??
    results.find((r: any) => (r._metadata?.locale ?? '').toLowerCase() === dl) ??
    results[0]
  )
}

/**
 * Fetches a CMS page/experience by URL path with full locale awareness.
 *
 * Strategy (Content Graph indexes localized content at locale-prefixed URLs):
 *   English home   → url.default = "/"
 *   Spanish home   → url.default = "/es/"
 *   French article → url.default = "/fr/polished-landing/"  (slug may differ!)
 *
 * 1. For the default locale: look up `path` directly.
 * 2. For non-default locales:
 *    a. Try `/<locale><path>` first — the common case where the slug is the
 *       same across locales (e.g. /es/about for an /about page).
 *    b. If that returns nothing, look up the English version at `path` to get
 *       the content key, then fetch that key for the requested locale. This
 *       handles pages where the URL slug changes per locale.
 *    c. If still nothing, return the English version as a fallback so the
 *       page renders content rather than 404-ing.
 */
export async function getLocalizedContentByPath(
  path: string,
  locale: Locale,
  baseUrl?: string,
  variationSlug?: string | null,
): Promise<any | null> {
  await setRequestContext(locale)
  const host = baseUrl || undefined

  // When an FX content experiment buckets the visitor into a CMS variation,
  // fetch that variation instead of the original. `include: 'SOME'` +
  // `includeOriginal: false` returns only the named variation (or nothing if it
  // doesn't exist — callers fall back to the already-fetched default).
  const variation: GraphVariationInput | undefined = variationSlug
    ? { include: 'SOME', value: [variationSlug], includeOriginal: false }
    : undefined

  // ── Default locale ────────────────────────────────────────────────────────
  if (locale === DEFAULT_LOCALE) {
    const results = await getClient().getContentByPath(path, { host, variation })
    return results?.length ? pickByLocale(results, locale) : null
  }

  // ── Non-default locale: step 1 — locale-prefixed path ─────────────────────
  // Content Graph stores translated pages at /<locale><path>.
  const prefixedResults = await getClient().getContentByPath(`/${locale}${path}`, { host, variation })
  if (prefixedResults?.length) {
    return pickByLocale(prefixedResults, locale)
  }

  // ── Non-default locale: step 2 — key-based locale lookup ──────────────────
  // The locale-prefixed path wasn't found. Two possibilities:
  //   (A) No translation published → fall back to English.
  //   (B) Translation exists but the URL slug changed per locale
  //       (e.g. /ui-testing2/ in English → /fr/polished-landing/ in French).
  // Fetch the English version first to get the content key, then ask for
  // that key's translation in the requested locale.
  const defaultResults = await getClient().getContentByPath(path, { host })
  if (!defaultResults?.length) return null

  const defaultContent = pickByLocale(defaultResults, DEFAULT_LOCALE) ?? defaultResults[0]
  const contentKey = defaultContent?._metadata?.key as string | undefined

  if (contentKey) {
    try {
      // getItems with a locale-bearing GraphReference fetches that locale's version.
      const localizedItems = await getClient().getItems({ key: contentKey, locale })
      const localized = (localizedItems ?? []).find(
        (r: any) => (r._metadata?.locale ?? '').toLowerCase() === locale.toLowerCase(),
      )
      if (localized) return localized
    } catch {
      // getItems may throw for non-page content types — fall through to English.
    }
  }

  // ── Fallback: English content ──────────────────────────────────────────────
  return defaultContent
}

// ── cms:// link resolution helpers ───────────────────────────────────────────
//
// The Optimizely CMS link picker stores internal page references as
// "cms://content/{contentKey}" instead of a plain web URL. Content Graph's
// link type returns the raw cms:// URI — it does NOT auto-resolve it.
// We detect these and replace them with the page's canonical front-end path
// via a single batch _Content query, run once inside _fetchAllThemeManagers.

/** Returns the content key from a cms://content/{key} URI, or null. */
function parseCmsContentKey(url: string | null | undefined): string | null {
  if (!url?.startsWith('cms://content/')) return null
  return url.slice('cms://content/'.length).split(/[?#]/)[0] || null
}

/**
 * Batch-resolves content keys to their canonical published URL pathnames.
 * Uses the default (English) locale so callers can apply locale prefixes.
 * Returns Map<contentKey → pathname>, e.g. "abc" → "/about".
 * Keys that cannot be resolved are omitted — the caller falls back to '#'.
 */
async function resolveCmsLinks(keys: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(keys)].filter(Boolean)
  if (!unique.length) return new Map()
  try {
    const data = await getClient().request(
      `query ResolveCmsLinks($keys: [String]) {
         _Content(
           where: { _metadata: { key: { in: $keys } status: { eq: "Published" } locale: { eq: "en" } } }
           limit: 100
         ) {
           items { _metadata { key url { default } } }
         }
       }`,
      { keys: unique },
    )
    const map = new Map<string, string>()
    for (const item of (data?._Content?.items ?? []) as any[]) {
      const key  = item._metadata?.key as string | undefined
      const raw  = item._metadata?.url?.default as string | undefined
      if (!key || !raw) continue
      // Absolute URL → extract pathname only (strip origin so callers get a
      // relative path they can locale-prefix).
      let path = raw
      if (path.startsWith('http')) {
        try { path = new URL(path).pathname } catch { continue }
      }
      map.set(key, path)
    }
    return map
  } catch {
    return new Map()
  }
}

/** Resolves a cms://content/{key} value using the pre-built map; passes other values through. */
function applyLinkResolution(
  url: string | null | undefined,
  resolved: Map<string, string>,
): string | null | undefined {
  const key = parseCmsContentKey(url)
  return key ? (resolved.get(key) ?? url) : url
}

// One Graph fetch per request per locale; layout, Header, and Footer all share this cache.
// React cache() memoizes by argument so each locale gets its own cached result.
// Content Graph returns all published versions of each item. We deduplicate by
// content key so each ThemeManager item appears only once (latest version first,
// guaranteed by orderBy published DESC in the query).
const _fetchAllThemeManagers = cache(async function fetchAllThemeManagers(locale: string) {
  try {
    const data  = await getClient().request(THEME_QUERY, { locale: [locale] })
    const items = (data?.OT_ThemeManager?.items ?? []) as any[]

    // Build a key → data map for footer blocks so we can attach them below.
    // ContentReference.item is not resolvable for _component types in Graph —
    // they come back as __typename: "Data". We fetch them as a parallel root
    // query and join by key instead.
    const footerItems = (data?.OT_FooterBlock?.items ?? []) as any[]
    const footerMap = new Map<string, any>()
    for (const fb of footerItems) {
      const fk = fb._metadata?.key as string | undefined
      if (fk) footerMap.set(fk, fb)
    }

    const seen  = new Set<string>()
    const deduped = items
      .filter((item: any) => {
        const key = item._metadata?.key as string | undefined
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((item: any) => {
        const footerKey = item.footerRef?.key as string | undefined
        const resolvedFooter = footerKey ? footerMap.get(footerKey) ?? null : null
        // Attach resolved footer data under footerRef.item so Footer.tsx's
        // existing `settings?.footerRef?.item` accessor continues to work.
        return resolvedFooter
          ? { ...item, footerRef: { ...item.footerRef, item: resolvedFooter } }
          : item
      })

    // ── Resolve all cms://content/{key} nav/cta link references ──────────
    // Collect every cms:// key across ALL ThemeManagers in one pass, then
    // resolve them in a single batch Content Graph request.
    const cmsKeys: string[] = []
    for (const item of deduped) {
      const ctaKey = parseCmsContentKey(item.ctaUrl?.default)
      if (ctaKey) cmsKeys.push(ctaKey)
      for (const nav of (item.primaryNavigation ?? []) as any[]) {
        const nk = parseCmsContentKey(nav.menuLink?.url?.default)
        if (nk) cmsKeys.push(nk)
        for (const sub of (nav.subNavItems ?? []) as any[]) {
          const sk = parseCmsContentKey(sub.menuLink?.url?.default)
          if (sk) cmsKeys.push(sk)
        }
      }
    }
    const linkMap = await resolveCmsLinks(cmsKeys)

    // Rewrite cms:// values in-place so downstream consumers (Header, Footer)
    // always receive plain web paths — no cms:// handling needed elsewhere.
    return deduped.map((item: any) => ({
      ...item,
      ctaUrl: item.ctaUrl
        ? { ...item.ctaUrl, default: applyLinkResolution(item.ctaUrl?.default, linkMap) }
        : item.ctaUrl,
      primaryNavigation: ((item.primaryNavigation ?? []) as any[]).map((nav: any) => ({
        ...nav,
        menuLink: nav.menuLink
          ? {
              ...nav.menuLink,
              url: nav.menuLink.url
                ? { ...nav.menuLink.url, default: applyLinkResolution(nav.menuLink.url.default, linkMap) }
                : nav.menuLink.url,
            }
          : nav.menuLink,
        subNavItems: ((nav.subNavItems ?? []) as any[]).map((sub: any) => ({
          ...sub,
          menuLink: sub.menuLink
            ? {
                ...sub.menuLink,
                url: sub.menuLink.url
                  ? { ...sub.menuLink.url, default: applyLinkResolution(sub.menuLink.url.default, linkMap) }
                  : sub.menuLink.url,
              }
            : sub.menuLink,
        })),
      })),
    }))
  } catch {
    return []
  }
})

/**
 * Returns the ThemeManager instance whose frontEndDomain matches `domain`,
 * or null if no match is found.
 *
 * Returning null on no match is intentional: an unrecognised domain (e.g. a
 * fresh Vercel deployment whose URL hasn't been registered in any ThemeManager
 * yet) should render with the default CSS token values ("generic default-theme
 * branding") rather than inheriting whatever theme was most recently published.
 * All callers (Header, Footer, layout) handle null gracefully via optional
 * chaining and hardcoded fallback values.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSiteSettings(domain = '', locale = DEFAULT_LOCALE): Promise<any | null> {
  const items = await _fetchAllThemeManagers(locale)
  if (!items.length) return null
  return items.find((i: any) => i.frontEndDomain === domain) ?? null
}

/**
 * Builds an inline <style> block that overrides --ot-* CSS custom properties
 * based on ThemeManager color values. Returns an empty string if no overrides are set.
 */
/**
 * Builds an inline <style> block that overrides --ot-* CSS custom properties
 * based on ThemeManager color values. Returns an empty string if no overrides are set.
 *
 * Dark-mode overrides are emitted to BOTH :root AND [data-theme="dark"] so that
 * nested dark surfaces (brand sections, glass rows, hero panels) pick up the
 * correct ThemeManager values even when they appear inside a light-mode page.
 * Without the [data-theme="dark"] block, :root overrides cascade from <html>
 * and may be superseded by the [data-theme="light"] ancestor rule.
 */
export function buildThemeCSS(settings: any): string {
  if (!settings) return ''

  const root: string[] = []   // :root — applies globally (dark mode default)
  const dark: string[] = []   // [data-theme="dark"] — nested dark surfaces
  const light: string[] = []  // [data-theme="light"] — light mode overrides

  // Brand & accent — constant across modes; :root only
  if (settings.colorBrand)        root.push(`--ot-brand: ${settings.colorBrand}`)
  if (settings.colorBrandHover)   root.push(`--ot-brand-hover: ${settings.colorBrandHover}`)
  if (settings.colorAccent)       root.push(`--ot-accent: ${settings.colorAccent}`)
  if (settings.colorAccentHover)  root.push(`--ot-accent-hover: ${settings.colorAccentHover}`)
  if (settings.colorFgOnAccent)   root.push(`--ot-fg-on-accent: ${settings.colorFgOnAccent}`)

  // Canvas / Surface — dark mode: root + [data-theme="dark"]
  if (settings.colorCanvas)  { root.push(`--ot-canvas: ${settings.colorCanvas}`);   dark.push(`--ot-canvas: ${settings.colorCanvas}`) }
  if (settings.colorSurface) { root.push(`--ot-surface: ${settings.colorSurface}`); dark.push(`--ot-surface: ${settings.colorSurface}`) }

  // Canvas / Surface — light mode only
  if (settings.colorCanvasLight)  light.push(`--ot-canvas: ${settings.colorCanvasLight}`)
  if (settings.colorSurfaceLight) light.push(`--ot-surface: ${settings.colorSurfaceLight}`)

  // Foreground on brand — always light; root + [data-theme="dark"] so nested dark elements win
  if (settings.colorFgOnBrand) { root.push(`--ot-fg-on-brand: ${settings.colorFgOnBrand}`); dark.push(`--ot-fg-on-brand: ${settings.colorFgOnBrand}`) }

  // Foreground — dark mode: root + [data-theme="dark"]
  if (settings.colorFg)      { root.push(`--ot-fg: ${settings.colorFg}`);           dark.push(`--ot-fg: ${settings.colorFg}`) }
  if (settings.colorFgMuted) { root.push(`--ot-fg-muted: ${settings.colorFgMuted}`); dark.push(`--ot-fg-muted: ${settings.colorFgMuted}`) }

  // Foreground — light mode only
  if (settings.colorFgLight)      light.push(`--ot-fg: ${settings.colorFgLight}`)
  if (settings.colorFgMutedLight) light.push(`--ot-fg-muted: ${settings.colorFgMutedLight}`)

  // ── Non-color theme axes — mode-invariant, :root only ──────────────────────
  // CMS stores option keys; lib/theme-axes.ts owns the values and returns null
  // for unset/default so the token's own default applies (→ identical to today).
  const corner = resolveCornerStyle(settings.cornerStyle)
  if (corner) {
    root.push(`--ot-radius-surface: ${corner.surface}`)
    root.push(`--ot-radius-control: ${corner.control}`)
  }

  // Primary font drives the whole sans hierarchy (display → body → label).
  const primaryFontVar = resolvePrimaryFont(settings.primaryFont)
  if (primaryFontVar) root.push(`--ot-font-sans: ${primaryFontVar}, system-ui, sans-serif`)

  // Scales every --ot-dur-* token (incl. ambient loops). Cannot re-enable motion
  // a visitor disabled — the reduce-motion static blocks are independent of this.
  const motionScale = resolveMotionScale(settings.motionIntensity)
  if (motionScale != null) root.push(`--ot-motion-scale: ${motionScale}`)

  // Sidebar layout emits the rail width so the content wrapper and any full-bleed
  // section math can consume it. Non-sidebar variants leave the token at its 0px
  // default (defined in globals.css), so calc(100vw - var(--ot-sidebar-width)) is
  // always safe without a per-site fallback.
  const navbarStyle = resolveNavbarStyle(settings.navbarStyle)
  const sidebarWidth = NAVBAR_STYLES[navbarStyle].sidebarWidth
  if (sidebarWidth) root.push(`--ot-sidebar-width: ${sidebarWidth}`)

  if (!root.length && !dark.length && !light.length) return ''

  const fmt = (v: string) => `${v};`
  const parts: string[] = []
  if (root.length)  parts.push(`:root { ${root.map(fmt).join(' ')} }`)
  if (dark.length)  parts.push(`[data-theme="dark"] { ${dark.map(fmt).join(' ')} }`)
  if (light.length) parts.push(`[data-theme="light"] { ${light.map(fmt).join(' ')} }`)

  return parts.join('\n')
}
