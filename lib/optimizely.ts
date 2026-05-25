import { cache } from 'react'
import { headers } from 'next/headers'
import { config, getClient as _getClient } from '@optimizely/cms-sdk'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

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
 * Reads the x-locale header set by middleware, falls back to DEFAULT_LOCALE.
 * Safe to call from any server component or route handler.
 */
export async function getRequestLocale(): Promise<Locale> {
  try {
    const h      = await headers()
    const locale = h.get('x-locale')
    return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
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
 * e.g. "https://optitech-nextjs-tim.vercel.app" or "http://localhost:3000"
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
  query GetThemeManagers {
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
        primaryNavigation {
          menuLink { text title target url { default } }
          subNavItems {
            menuLink { text title target url { default } }
            description
          }
        }
      }
    }
    OT_FooterBlock(limit: 20) {
      items {
        _metadata { key }
        description { html }
        links {
          label
          url { default }
        }
      }
    }
  }
`

/**
 * Fetches a CMS page/experience by URL path with locale awareness.
 *
 * The SDK's getContentByPath may return multiple locale variants of the same
 * content item. This helper prefers the requested locale, falls back to the
 * default locale, then to any available item.
 */
export async function getLocalizedContentByPath(
  path: string,
  locale: Locale,
  baseUrl?: string,
): Promise<any | null> {
  await setRequestContext(locale)
  const results = await getClient().getContentByPath(path, { host: baseUrl || undefined })
  if (!results?.length) return null
  if (results.length === 1) return results[0]
  // Multiple locale variants — prefer the requested locale.
  // Use prefix matching so app locale 'es' matches CMS locale 'es-MX', etc.
  const al = locale.toLowerCase()
  const preferred = results.find((r: any) => {
    const rl = (r._metadata?.locale ?? '').toLowerCase()
    return rl === al || rl.startsWith(al + '-') || al.startsWith(rl + '-')
  })
  const fallback = results.find(
    (r: any) => r._metadata?.locale?.toLowerCase() === DEFAULT_LOCALE.toLowerCase(),
  )
  return preferred ?? fallback ?? results[0]
}

// One Graph fetch per request; layout, Header, and Footer all share this cache.
// Content Graph returns all published versions of each item. We deduplicate by
// content key so each ThemeManager item appears only once (latest version first,
// guaranteed by orderBy published DESC in the query).
const _fetchAllThemeManagers = cache(async function fetchAllThemeManagers() {
  try {
    const data  = await getClient().request(THEME_QUERY, {})
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
    return items
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
 * yet) should render with the default CSS token values ("generic OptiTech
 * branding") rather than inheriting whatever theme was most recently published.
 * All callers (Header, Footer, layout) handle null gracefully via optional
 * chaining and hardcoded fallback values.
 */
export async function getSiteSettings(domain = ''): Promise<any | null> {
  const items = await _fetchAllThemeManagers()
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

  if (!root.length && !dark.length && !light.length) return ''

  const fmt = (v: string) => `${v};`
  const parts: string[] = []
  if (root.length)  parts.push(`:root { ${root.map(fmt).join(' ')} }`)
  if (dark.length)  parts.push(`[data-theme="dark"] { ${dark.map(fmt).join(' ')} }`)
  if (light.length) parts.push(`[data-theme="light"] { ${light.map(fmt).join(' ')} }`)

  return parts.join('\n')
}
