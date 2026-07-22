import { type NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

// Autocomplete is powered by a lightweight relevance search rather than
// Graph's native autocomplete field (which requires queryable indexing,
// incompatible with the searchable indexing needed for fulltext search).
// Returning actual content titles as suggestions is also a better demo
// experience — it shows the content directly, not just word completions.
const SUGGEST_QUERY = `
  query SuggestSearch($query: String!, $locale: String!) {
    OT_BlogPage(
      orderBy: { _ranking: RELEVANCE }
      where: {
        _fulltext: { match: $query, fuzzy: true, synonyms: ONE }
        _metadata: { locale: { eq: $locale } }
      }
      limit: 5
    ) {
      items { headline }
    }
    OT_EventPage(
      orderBy: { _ranking: RELEVANCE }
      where: {
        _fulltext: { match: $query, fuzzy: true, synonyms: ONE }
        _metadata: { locale: { eq: $locale } }
      }
      limit: 4
    ) {
      items { title }
    }
  }
`

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json([])

  const locale = req.headers.get('x-locale') ?? DEFAULT_LOCALE

  try {
    const data = await getClient().request(SUGGEST_QUERY, { query: q, locale })

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
