import { cache } from 'react'
import { headers } from 'next/headers'
import { config, getClient as _getClient } from '@optimizely/cms-sdk'

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

/** Extracts the hostname (without port) from the current request's Host header. */
export async function getRequestDomain(): Promise<string> {
  try {
    const h = await headers()
    return (h.get('host') ?? '').split(':')[0]
  } catch {
    return ''
  }
}

// All fields consumed by layout (theme CSS), Header, and Footer.
const THEME_QUERY = `
  query GetThemeManagers {
    OT_ThemeManager(limit: 20) {
      items {
        frontEndDomain
        logo { url { default } }
        logoAlt
        logoFit
        logoInvertDark
        defaultMode
        ctaLabel
        ctaUrl { default }
        copyright
        footerTagline
        colorBrand
        colorBrandHover
        colorAccent
        colorCanvas
        colorSurface
        colorCanvasLight
        colorSurfaceLight
        primaryNavigation {
          menuLink { text title target url { default } }
          subNavItems {
            menuLink { text title target url { default } }
            description
          }
        }
        footerColumns {
          title
          linkItems {
            label
            url { default }
          }
        }
        legalLinks {
          label
          url { default }
        }
      }
    }
  }
`

// One Graph fetch per request; layout, Header, and Footer all share this cache.
const _fetchAllThemeManagers = cache(async function fetchAllThemeManagers() {
  try {
    const data = await getClient().request(THEME_QUERY, {})
    return (data?.OT_ThemeManager?.items ?? []) as any[]
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

  if (settings.colorBrand)        root.push(`--ot-brand: ${settings.colorBrand}`)
  if (settings.colorBrandHover)   root.push(`--ot-brand-hover: ${settings.colorBrandHover}`)
  if (settings.colorAccent)       root.push(`--ot-accent: ${settings.colorAccent}`)
  if (settings.colorCanvas)       root.push(`--ot-canvas: ${settings.colorCanvas}`)
  if (settings.colorSurface)      root.push(`--ot-surface: ${settings.colorSurface}`)
  if (settings.colorCanvasLight)  light.push(`--ot-canvas: ${settings.colorCanvasLight}`)
  if (settings.colorSurfaceLight) light.push(`--ot-surface: ${settings.colorSurfaceLight}`)

  if (!root.length && !light.length) return ''

  const parts: string[] = []
  if (root.length)  parts.push(`:root { ${root.map(v => `${v};`).join(' ')} }`)
  if (light.length) parts.push(`[data-theme="light"] { ${light.map(v => `${v};`).join(' ')} }`)

  return parts.join('\n')
}
