import { type NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'
import type { SearchResult } from '@/lib/search'

const BLOG_QUERY = `
  query SearchBlogs($query: String!, $limit: Int!) {
    OT_BlogPage(
      where: { _fulltext: { match: $query } }
      limit: $limit
    ) {
      items {
        _metadata { key published url { default } }
        headline
        subHeadline
        topic
      }
    }
  }
`

// Generic content query — falls back gracefully if _Content type is unavailable
const CONTENT_QUERY = `
  query SearchContent($query: String!, $limit: Int!) {
    _Content(
      where: { _fulltext: { match: $query } }
      limit: $limit
    ) {
      items {
        _metadata { key url { default } types }
        name
      }
    }
  }
`

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q     = (searchParams.get('q') ?? '').trim()
  const type  = (searchParams.get('type') ?? 'all') as 'all' | 'Blog' | 'Page'
  const limit = 12

  if (q.length < 2) return NextResponse.json([])

  const results: SearchResult[] = []

  // Blog results
  if (type !== 'Page') {
    try {
      const data = await getClient().request(BLOG_QUERY, { query: q, limit })
      const items: any[] = (data as any)?.OT_BlogPage?.items ?? []
      for (const item of items) {
        if (!item._metadata?.url?.default) continue
        results.push({
          id:        item._metadata.key,
          title:     item.headline   ?? 'Untitled',
          url:       item._metadata.url.default,
          type:      'Blog',
          topic:     item.topic      || undefined,
          published: item._metadata.published || undefined,
          excerpt:   item.subHeadline || undefined,
        })
      }
    } catch (err) {
      console.error('[search] blog query failed:', err)
    }
  }

  // Generic page results via _Content (best-effort)
  if (type !== 'Blog') {
    try {
      const data = await getClient().request(CONTENT_QUERY, { query: q, limit })
      const items: any[] = (data as any)?._Content?.items ?? []
      for (const item of items) {
        const types: string[] = item._metadata?.types ?? []
        // Skip blog pages already captured, system types, and component types
        if (types.includes('OT_BlogPage')) continue
        if (types.some((t: string) => t.startsWith('Sys') || t === '_Component')) continue
        if (!item._metadata?.url?.default) continue
        results.push({
          id:    item._metadata.key,
          title: item.name ?? 'Untitled',
          url:   item._metadata.url.default,
          type:  'Page',
        })
      }
    } catch {
      // _Content type may not be present in this schema version — silently skip
    }
  }

  return NextResponse.json(results)
}
