import 'server-only'
import { cache } from 'react'
import { getClient } from '@/lib/optimizely'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

// Re-export pure utilities so server-side callers only need one import.
export type { TokenMap } from '@/lib/token-replace'
export { replaceTokens, applyTokensToContent } from '@/lib/token-replace'

const TOKEN_QUERY = `
  query GetTokenManager($locale: [Locales]) {
    OT_TokenManager(limit: 10, locale: $locale, orderBy: { _metadata: { published: DESC } }) {
      items {
        _metadata { key }
        tokens {
          tokenKey
          tokenValue
        }
      }
    }
  }
`

const _fetchTokenManager = cache(async function fetchTokenManager(locale: string) {
  try {
    const data  = await getClient().request(TOKEN_QUERY, { locale: [locale] })
    const items = (data?.OT_TokenManager?.items ?? []) as any[]
    if (!items.length) return {}

    const manager = items[0]
    const entries = (manager?.tokens ?? []) as Array<{ tokenKey?: string; tokenValue?: string }>

    const map: Record<string, string> = {}
    for (const entry of entries) {
      const k = entry?.tokenKey?.trim()
      if (k) map[k] = entry.tokenValue ?? ''
    }
    return map
  } catch {
    return {}
  }
})

/**
 * Returns the active token map for the given locale.
 * Server components only — React-cached per request.
 */
export async function getTokenMap(locale = DEFAULT_LOCALE): Promise<Record<string, string>> {
  return _fetchTokenManager(locale)
}
