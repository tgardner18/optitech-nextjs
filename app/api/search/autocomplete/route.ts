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

// Autocomplete is powered by a lightweight relevance search rather than
// Graph's native autocomplete field (which requires queryable indexing,
// incompatible with the searchable indexing needed for fulltext search).
// Returning actual content titles as suggestions is also a better demo
// experience — it shows the content directly, not just word completions.
function buildSuggestQuery(withDomain: boolean): string {
  const domainVar   = withDomain ? ', $domain: String' : ''
  const metaFilter  = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  return `
    query SuggestSearch($query: String!, $locale: String!${domainVar}) {
      OT_BlogPage(
        orderBy: { _ranking: RELEVANCE }
        where: {
          _fulltext: { match: $query, fuzzy: true, synonyms: ONE }
          ${metaFilter}
        }
        limit: 5
      ) {
        items { headline }
      }
      OT_EventPage(
        orderBy: { _ranking: RELEVANCE }
        where: {
          _fulltext: { match: $query, fuzzy: true, synonyms: ONE }
          ${metaFilter}
        }
        limit: 4
      ) {
        items { title }
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

    const headlines: string[] = ((data as any)?.OT_BlogPage?.items  ?? []).map((i: any) => i.headline).filter(Boolean)
    const titles:    string[] = ((data as any)?.OT_EventPage?.items ?? []).map((i: any) => i.title).filter(Boolean)

    for (const s of [...headlines, ...titles]) {
      if (!seen.has(s)) {
        seen.add(s)
        suggestions.push(s)
        if (suggestions.length >= 8) break
      }
    }

    return NextResponse.json(suggestions)
  } catch (err) {
    console.error('[autocomplete] query failed:', err)
    return NextResponse.json([])
  }
}
