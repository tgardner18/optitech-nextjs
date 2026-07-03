/**
 * Optimizely Content Recommendations (Idio) fetch.
 * ─────────────────────────────────────────────────────────────────────────
 * Called server-side by the Content Recommendations block adapter. Hits the
 * shared demo proxy (avoids CORS + keeps the delivery key server-side) with the
 * visitor's `iv` id (set by ia.js — injected in app/layout.tsx) and returns a
 * normalized list of recommended content items. Returns [] on any failure so a
 * recommendations outage never breaks the page.
 */
import { cache } from 'react'

const PROXY_BASE = 'https://fxrestapi.optidemo.com/api/content_recommendations'

export interface ContentRecItem {
  title: string
  abstract: string
  linkUrl: string
  imageUrl: string | null
  topic: string | null
  source: string | null
  author: string | null
}

interface RawRec {
  title?: string
  name?: string
  abstract?: string
  description?: string
  summary?: string
  link_url?: string
  url?: string
  main_image_url?: string
  image_url?: string
  image?: string
  topics?: Array<{ title?: string }>
  source?: { title?: string } | null
  author?: { title?: string } | null
}

function normalize(raw: RawRec): ContentRecItem | null {
  const linkUrl = raw.link_url || raw.url
  if (!linkUrl) return null // an item with no link is unusable
  return {
    title: raw.title || raw.name || 'Untitled',
    abstract: raw.abstract || raw.description || raw.summary || '',
    linkUrl,
    imageUrl: raw.main_image_url || raw.image_url || raw.image || null,
    topic: raw.topics?.[0]?.title ?? null,
    source: raw.source?.title ?? null,
    author: raw.author?.title ?? null,
  }
}

interface FetchArgs {
  apiKey: string
  rpp: number
  visitorId: string
}

/**
 * React cache()-wrapped so multiple Content Recommendations blocks on one page
 * (same key/rpp/visitor) share a single request.
 */
export const fetchContentRecommendations = cache(
  async ({ apiKey, rpp, visitorId }: FetchArgs): Promise<ContentRecItem[]> => {
    if (!apiKey) return []

    const url = `${PROXY_BASE}?visitor_id=${encodeURIComponent(visitorId)}&key=${encodeURIComponent(apiKey)}&rpp=${encodeURIComponent(String(rpp))}`

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
      if (!res.ok) return []
      const data = await res.json()
      // The API returns either a bare array or a wrapper ({ content } / { items }).
      const list: RawRec[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.items)
            ? data.items
            : []
      return list.map(normalize).filter((x): x is ContentRecItem => x !== null)
    } catch {
      return []
    }
  },
)
