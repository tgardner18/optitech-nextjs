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
        footerRef {
          item {
            ... on OT_FooterBlock {
              description { html }
              links {
                label
                url { default }
              }
            }
          }
        }
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
  // Multiple locale variants — prefer the requested locale
  const preferred = results.find(
    (r: any) => r._metadata?.locale?.toLowerCase() === locale.toLowerCase(),
  )
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
    const seen  = new Set<string>()
    return items.filter((item: any) => {
      const key = item._metadata?.key as string | undefined
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch {
    return []
  }
})

/**
 * Returns the ThemeManager instance whose frontEndDomain matches `domain`,
 * falling back to the first available instance if none match.
 */
export async function getSiteSettings(domain = ''): Promise<any | null> {
  const items = await _fetchAllThemeManagers()
  if (!items.length) return null
  return items.find((i: any) => i.frontEndDomain === domain) ?? items[0]
}

/**
 * Builds an inline <style> block that overrides --ot-* CSS custom properties
 * based on ThemeManager color values. Returns an empty string if no overrides are set.
 */
export function buildThemeCSS(settings: any): string {
  if (!settings) return ''

  const root: string[] = []
  const light: string[] = []

  // Brand
  if (settings.colorBrand)        root.push(`--ot-brand: ${settings.colorBrand}`)
  if (settings.colorBrandHover)   root.push(`--ot-brand-hover: ${settings.colorBrandHover}`)
  // Accent
  if (settings.colorAccent)       root.push(`--ot-accent: ${settings.colorAccent}`)
  if (settings.colorAccentHover)  root.push(`--ot-accent-hover: ${settings.colorAccentHover}`)
  if (settings.colorFgOnAccent)   root.push(`--ot-fg-on-accent: ${settings.colorFgOnAccent}`)
  // Canvas / Surface — dark mode
  if (settings.colorCanvas)       root.push(`--ot-canvas: ${settings.colorCanvas}`)
  if (settings.colorSurface)      root.push(`--ot-surface: ${settings.colorSurface}`)
  // Canvas / Surface — light mode
  if (settings.colorCanvasLight)  light.push(`--ot-canvas: ${settings.colorCanvasLight}`)
  if (settings.colorSurfaceLight) light.push(`--ot-surface: ${settings.colorSurfaceLight}`)
  // Foreground
  if (settings.colorFgOnBrand)    root.push(`--ot-fg-on-brand: ${settings.colorFgOnBrand}`)
  if (settings.colorFgMuted)      root.push(`--ot-fg-muted: ${settings.colorFgMuted}`)
  if (settings.colorFgMutedLight) light.push(`--ot-fg-muted: ${settings.colorFgMutedLight}`)

  if (!root.length && !light.length) return ''

  const parts: string[] = []
  if (root.length)  parts.push(`:root { ${root.map(v => `${v};`).join(' ')} }`)
  if (light.length) parts.push(`[data-theme="light"] { ${light.map(v => `${v};`).join(' ')} }`)

  return parts.join('\n')
}
