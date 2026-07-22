import { type NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

const AUTOCOMPLETE_QUERY = `
  query Autocomplete($q: String!, $locale: String!) {
    OT_BlogPage(where: { _metadata: { locale: { eq: $locale } } }) {
      autocomplete {
        headline(value: $q, limit: 5)
      }
    }
    OT_EventPage(where: { _metadata: { locale: { eq: $locale } } }) {
      autocomplete {
        title(value: $q, limit: 4)
      }
    }
  }
`

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json([])

  const locale = req.headers.get('x-locale') ?? DEFAULT_LOCALE

  try {
    const data = await getClient().request(AUTOCOMPLETE_QUERY, { q, locale })
    const seen        = new Set<string>()
    const suggestions: string[] = []

    const headlines: string[] = (data as any)?.OT_BlogPage?.autocomplete?.headline ?? []
    const titles: string[]    = (data as any)?.OT_EventPage?.autocomplete?.title    ?? []

    for (const s of [...headlines, ...titles]) {
      if (s && !seen.has(s)) {
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
