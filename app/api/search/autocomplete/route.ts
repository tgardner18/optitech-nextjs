import { type NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

const SCOPE_QUERY = `
  query GetSearchScope {
    OT_ThemeManager(limit: 20) {
      items {
        frontEndDomain
        searchScope
      }
    }
  }
`

// Autocomplete uses a single _Content query so all content types compete on
// the same relevance score — blogs don't crowd out events just because they're
// fetched first. We over-fetch (20) then filter out settings/nav singletons
// client-side, stopping once we have 8 usable suggestions.
const EXCLUDED_TYPES = new Set([
  'OT_SiteSettings', 'OT_ThemeManager', 'OT_NavigationItem',
  'OT_NavigationSubItem', 'OT_FooterColumn', 'OT_FooterLink',
])

function buildSuggestQuery(withDomain: boolean): string {
  const domainVar   = withDomain ? ', $domain: String' : ''
  const metaFilter  = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  return `
    query SuggestSearch($query: String!, $locale: String!${domainVar}) {
      _Content(
        orderBy: { _ranking: RELEVANCE }
        where: {
          _fulltext: { match: $query, fuzzy: true, synonyms: ONE }
          ${metaFilter}
        }
        limit: 20
      ) {
        items {
          _metadata { displayName types url { default } }
        }
      }
    }
  `
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json([])

  const locale = req.headers.get('x-locale') ?? DEFAULT_LOCALE
  const host   = req.nextUrl.host

  let filterBase: string | null = null
  let allSites = false

  try {
    const scopeData  = await getClient().request(SCOPE_QUERY, {})
    const themeItems: any[] = (scopeData as any)?.OT_ThemeManager?.items ?? []
    const matched = themeItems.find((i: any) => i.frontEndDomain === host) ?? themeItems[0] ?? null
    if (matched) {
      allSites = matched.searchScope === 'allSites'
      const domain = (matched.frontEndDomain as string | undefined) ?? ''
      if (domain) {
        const proto = domain.startsWith('localhost') ? 'http' : 'https'
        filterBase = `${proto}://${domain}`
      }
    }
  } catch {
    // scope unavailable — proceed without domain restriction
  }

  const withDomain = !allSites && filterBase !== null
  const domainVars = withDomain ? { domain: filterBase } : {}
  const vars       = { query: q, locale, ...domainVars }

  try {
    const data = await getClient().request(buildSuggestQuery(withDomain), vars)

    const seen        = new Set<string>()
    const suggestions: string[] = []
    const items: any[] = (data as any)?._Content?.items ?? []

    for (const item of items) {
      const types: string[]  = item._metadata?.types ?? []
      const name: string     = item._metadata?.displayName ?? ''
      if (!name) continue
      if (!item._metadata?.url?.default) continue
      if (types.some((t: string) => EXCLUDED_TYPES.has(t))) continue
      if (!seen.has(name)) {
        seen.add(name)
        suggestions.push(name)
        if (suggestions.length >= 8) break
      }
    }

    return NextResponse.json(suggestions)
  } catch (err) {
    console.error('[autocomplete] query failed:', err)
    return NextResponse.json([])
  }
}
