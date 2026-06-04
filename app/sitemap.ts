import type { MetadataRoute } from 'next'
import { getClient } from '@/lib/optimizely'

// Query all published BlankExperience and OT_BlogPage items.
// _metadata.url.default is the canonical relative URL stored by Content Graph.
const SITEMAP_QUERY = `
  query GetPublishedPages {
    BlankExperience(
      where: { _metadata: { status: { eq: "Published" } } }
      limit: 200
    ) {
      items {
        _metadata {
          url { default }
          lastModified
          published
        }
        noIndex
      }
    }
    OT_BlogPage(
      where: { _metadata: { status: { eq: "Published" } } }
      limit: 200
    ) {
      items {
        _metadata {
          url { default }
          lastModified
          published
        }
        noIndex
      }
    }
  }
`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  if (!siteUrl) return []

  try {
    const data = await getClient().request(SITEMAP_QUERY, {})

    const expItems   = (data?.BlankExperience?.items   ?? []) as any[]
    const blogItems  = (data?.OT_BlogPage?.items       ?? []) as any[]
    const allItems   = [...expItems, ...blogItems]

    const seen = new Set<string>()

    return allItems
      .filter((item: any) => !item.noIndex)
      .map((item: any): MetadataRoute.Sitemap[number] | null => {
        const raw = item._metadata?.url?.default as string | null | undefined
        if (!raw) return null

        // URL may be absolute (from Graph) or relative — normalise to absolute.
        let fullUrl: string
        try {
          fullUrl = raw.startsWith('http') ? raw : `${siteUrl}${raw}`
          // Ensure the URL belongs to this site.
          const parsed = new URL(fullUrl)
          if (!parsed.pathname.startsWith('/')) return null
        } catch {
          return null
        }

        if (seen.has(fullUrl)) return null
        seen.add(fullUrl)

        const rawDate = item._metadata?.lastModified ?? item._metadata?.published
        const lastModified = rawDate ? new Date(rawDate) : undefined
        const isHome = new URL(fullUrl).pathname === '/'

        return {
          url: fullUrl,
          lastModified,
          changeFrequency: isHome ? 'daily' : 'weekly',
          priority: isHome ? 1.0 : 0.8,
        }
      })
      .filter((e): e is MetadataRoute.Sitemap[number] => e !== null)
  } catch {
    return []
  }
}
