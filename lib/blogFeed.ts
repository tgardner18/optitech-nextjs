import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BlogFeedPost = {
  _metadata: {
    key:       string
    published: string
    url:       { default: string | null; hierarchical?: string | null; base?: string | null }
  }
  headline:       string
  topic?:         string
  featuredImage?: { url: { default: string | null } }
  authorRef?:     { name: string } | null
  readTime?:      string
}

export type BlogFeedResult = {
  posts:  BlogFeedPost[]
  /** All unique topic slugs present in the filtered result set. */
  topics: string[]
}

// ─── GraphQL ───────────────────────────────────────────────────────────────────

// Fetch all published blog pages for the requested locale in a single query.
// We over-fetch (100 items) so client-side pagination is instant.
// Content Graph may return multiple locale variants for the same content key;
// we deduplicate below. A parallel OT_Author query avoids a per-post round-trip
// (ContentReference.item resolves as "Data" for _component types in Graph).
const BLOG_FEED_QUERY = `
  query GetBlogFeedPosts($locale: String!) {
    OT_BlogPage(
      limit: 100,
      where: { _metadata: { locale: { eq: $locale } } },
      orderBy: { _metadata: { published: DESC } }
    ) {
      items {
        _metadata {
          key
          published
          url { default hierarchical base }
        }
        headline
        topic
        featuredImage { url { default } }
        authorRef { key }
        readTime
      }
    }
    OT_Author(limit: 30) {
      items {
        _metadata { key }
        name
      }
    }
  }
`

// ─── Data access ───────────────────────────────────────────────────────────────

/**
 * Fetches all blog posts for `locale`, scoped to the current site and
 * optionally to an `articleRootPath` prefix. The result is React-cached so
 * multiple Blog Feed blocks on the same page share a single Graph round-trip.
 *
 * @param locale          BCP-47 locale string (e.g. "en", "fr")
 * @param articleRootPath Hierarchical URL of the article root page (e.g.
 *                        "/blog/"). Posts whose hierarchical URL begins with
 *                        this prefix are included. Pass null to include all.
 * @param siteBaseUrl     Protocol + host of the current site (e.g.
 *                        "https://example.vercel.app"). Used to filter out
 *                        posts from other sites sharing the same Graph index.
 *                        Pass null/undefined to skip site filtering.
 */
export const getBlogFeedPosts = cache(async function getBlogFeedPosts(
  locale: string,
  articleRootPath: string | null,
  siteBaseUrl?: string | null,
): Promise<BlogFeedResult> {
  try {
    const data = await getClient().request(BLOG_FEED_QUERY, { locale })

    const items: any[]      = (data as any)?.OT_BlogPage?.items ?? []
    const authorItems: any[] = (data as any)?.OT_Author?.items  ?? []

    // Build key → name map from parallel author query
    const authorMap = new Map<string, string>()
    for (const a of authorItems) {
      const ak = a._metadata?.key as string | undefined
      if (ak && a.name) authorMap.set(ak, String(a.name))
    }

    // Deduplicate by content key — Graph returns one row per locale variant;
    // all variants share the same _metadata.key, so we keep only the first
    // occurrence (latest published, guaranteed by orderBy DESC).
    const seen = new Set<string>()
    let posts = items.filter(p => {
      const k = p._metadata?.key as string | undefined
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })

    // ── Site scoping ─────────────────────────────────────────────────────────
    // Content Graph indexes all sites in the same tenant. Without scoping,
    // blog posts from every site would appear in the feed.
    // Prefer `url.base` (a CMS-provided field containing the site's base URL)
    // when available; fall back to matching the default URL against siteBaseUrl.
    if (siteBaseUrl) {
      const normalizedBase = siteBaseUrl.replace(/\/$/, '')
      posts = posts.filter(p => {
        // url.base is the canonical site base URL (e.g. "https://example.com")
        const base        = p._metadata?.url?.base
        const defaultUrl  = p._metadata?.url?.default
        if (typeof base === 'string' && base) {
          return base.replace(/\/$/, '') === normalizedBase
        }
        // Fallback: check whether the post's default URL starts with the site base
        if (typeof defaultUrl === 'string' && defaultUrl) {
          return defaultUrl.startsWith(normalizedBase + '/')
            || defaultUrl === normalizedBase
        }
        return true // keep if URL info is absent — better to over-include than drop
      })
    }

    // Scope to article root when provided.
    // The hierarchical URL looks like "/blog/my-post/" — we filter to items
    // whose path starts with the root's hierarchical URL (normalised to always
    // end with "/").
    if (articleRootPath) {
      const prefix = articleRootPath.replace(/\/?$/, '/')
      posts = posts.filter(p => {
        const h = p._metadata?.url?.hierarchical
        return typeof h === 'string' && h.startsWith(prefix)
      })
    }

    // Collect unique topics in the order they first appear (already sorted DESC
    // by publish date, so this gives "most recently active topic first").
    const topicSet = new Set<string>()
    for (const p of posts) {
      if (p.topic) topicSet.add(String(p.topic))
    }

    // Resolve author names and shape into BlogFeedPost
    const resolved: BlogFeedPost[] = posts.map(p => {
      const authorKey  = p.authorRef?.key as string | undefined
      const authorName = authorKey ? authorMap.get(authorKey) : undefined
      return {
        _metadata: {
          key:       p._metadata.key,
          published: p._metadata.published,
          url: {
            default:      p._metadata?.url?.default      ?? null,
            hierarchical: p._metadata?.url?.hierarchical ?? null,
            base:         p._metadata?.url?.base         ?? null,
          },
        },
        headline:      p.headline      ?? '',
        topic:         p.topic         ?? undefined,
        featuredImage: p.featuredImage ?? undefined,
        authorRef:     authorName ? { name: authorName } : null,
        readTime:      p.readTime      ?? undefined,
      }
    })

    return {
      posts:  resolved,
      topics: [...topicSet],
    }
  } catch {
    return { posts: [], topics: [] }
  }
})
