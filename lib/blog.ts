import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuthorData = {
  name:     string
  role?:    string
  photo?:   { url: { default: string | null } }
  bio?:     { html: string }
  linkedIn?: string | null
  twitter?:  string | null
}

export type BlogPageContent = {
  _metadata: {
    key: string
    published: string
    url: { default: string | null; hierarchical?: string | null }
  }
  enableExternalPreview?: boolean
  headline:      string
  subHeadline?:  string
  topic?:        string
  blogStyle?:    string
  featuredImage?: { url: { default: string | null } }
  featuredVideo?: { url: { default: string | null } }
  body?:          { html: string }
  /** Resolved author reference — replaces inline author/authorRole/authorPhoto fields */
  authorRef?:    AuthorData | null
  readTime?:     string
  // ── SEO / Search & Discovery ──────────────────────────────────────────────
  seoTitle?:         string | null
  seoDescription?:   string | null
  canonicalUrl?:     { default?: string | null } | null
  ogImage?:          { url?: { default?: string | null } | null } | null
  pageAnswer?:       string | null
  schemaType?:       string | null
  noIndex?:          boolean | null
  customSchemaJson?: string | null
}

export type BlogPostSummary = {
  _metadata: { key: string; published: string; url: { default: string | null } }
  headline:    string
  topic?:      string
  featuredImage?: { url: { default: string | null } }
  authorRef?:    Pick<AuthorData, 'name'> | null
  readTime?:   string
}

// ─── GraphQL queries ────────────────────────────────────────────────────────────

const BLOG_PAGE_QUERY = `
  query GetBlogPage($key: String!, $locale: String) {
    OT_BlogPage(
      where: { _metadata: { key: { eq: $key }, locale: { eq: $locale }, status: { eq: "Published" } } }
      limit: 1
    ) {
      items {
        _metadata { key locale published url { default } }
        headline
        subHeadline
        topic
        blogStyle
        featuredImage { url { default } }
        featuredVideo { url { default } }
        body { html }
        authorRef { key }
        readTime
        seoTitle
        seoDescription
        canonicalUrl { default }
        ogImage { url { default } }
        pageAnswer
        schemaType
        noIndex
        customSchemaJson
      }
    }
  }
`

/**
 * OT_Author data is fetched separately because ContentReference.item for
 * _component types returns __typename: "Data" in Content Graph — the type
 * cannot be resolved via the ContentReference item resolver. We get the
 * author key from the blog page, then query OT_Author directly by that key.
 */
const AUTHOR_QUERY = `
  query GetAuthor($key: String!) {
    OT_Author(where: { _metadata: { key: { eq: $key } } }, limit: 1) {
      items {
        _metadata { key }
        name
        role
        bio  { html }
        photo    { url { default } }
        linkedIn { default }
        twitter  { default }
      }
    }
  }
`

/**
 * Fallback used when AUTHOR_QUERY throws — typically because the photo field
 * was not present in the Content Graph schema when OT_Author was last pushed.
 * Omitting photo lets name/role/bio still render with an initials avatar.
 */
const AUTHOR_QUERY_NO_PHOTO = `
  query GetAuthorNoPhoto($key: String!) {
    OT_Author(where: { _metadata: { key: { eq: $key } } }, limit: 1) {
      items {
        _metadata { key }
        name
        role
        bio  { html }
        linkedIn { default }
        twitter  { default }
      }
    }
  }
`

/**
 * Latest posts query fetches blog page metadata plus a parallel OT_Author
 * lookup so we can resolve author names without a per-item round-trip.
 * The ContentReference.item approach is avoided for the same reason as above.
 * Locale filtering reduces cross-locale duplicates; site scoping (applied
 * in getLatestBlogPosts below) eliminates cross-channel duplicates that arise
 * when the same content is indexed for multiple Optimizely site channels.
 */
const LATEST_POSTS_QUERY = `
  query GetLatestBlogPosts($locale: String!) {
    OT_BlogPage(
      limit: 12,
      where: { _metadata: { locale: { eq: $locale }, status: { eq: "Published" } } },
      orderBy: { _metadata: { published: DESC } }
    ) {
      items {
        _metadata { key published url { default base } }
        headline
        topic
        featuredImage { url { default } }
        authorRef { key }
        readTime
      }
    }
    OT_Author(limit: 20) {
      items {
        _metadata { key }
        name
      }
    }
  }
`

// ─── Data access ────────────────────────────────────────────────────────────────

/**
 * Resolve full author profile data from an author content key. Exported so the
 * blog detail route can resolve the author in preview/draft mode, where the raw
 * preview content only carries the unresolved ContentReference ({ key }).
 */
export async function fetchAuthorByKey(key: string): Promise<AuthorData | null> {
  try {
    const data = await getClient().request(AUTHOR_QUERY, { key })
    const item = (data as any)?.OT_Author?.items?.[0] ?? null
    if (!item || !item.name) return null
    return {
      name:     item.name ?? '',
      role:     item.role ?? undefined,
      bio:      item.bio  ?? undefined,
      photo:    item.photo ?? undefined,
      linkedIn: item.linkedIn?.default ?? null,
      twitter:  item.twitter?.default  ?? null,
    }
  } catch {
    // Primary query failed — most likely the photo field isn't in the Content
    // Graph schema yet (OT_Author was pushed before photo was added). Retry
    // without photo so name/role/bio still render with an initials avatar.
    try {
      const data = await getClient().request(AUTHOR_QUERY_NO_PHOTO, { key })
      const item = (data as any)?.OT_Author?.items?.[0] ?? null
      if (!item || !item.name) return null
      return {
        name:     item.name ?? '',
        role:     item.role ?? undefined,
        bio:      item.bio  ?? undefined,
        photo:    undefined,
        linkedIn: item.linkedIn?.default ?? null,
        twitter:  item.twitter?.default  ?? null,
      }
    } catch {
      return null
    }
  }
}

/**
 * Returns just the author's display name for a given author content key.
 * Used by the draft state banner to show the author without a full AuthorData fetch.
 */
export async function getAuthorName(key: string): Promise<string | null> {
  try {
    const data = await getClient().request(AUTHOR_QUERY, { key })
    return (data as any)?.OT_Author?.items?.[0]?.name ?? null
  } catch {
    return null
  }
}

export async function getBlogPage(key: string, locale = 'en'): Promise<BlogPageContent | null> {
  try {
    const data = await getClient().request(BLOG_PAGE_QUERY, { key, locale })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item = (data as any)?.OT_BlogPage?.items?.[0] ?? null

    // No translation for the requested locale — fall back to English so the
    // page renders with default-locale content rather than 404-ing.
    if (!item && locale !== 'en') {
      const fallback = await getClient().request(BLOG_PAGE_QUERY, { key, locale: 'en' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      item = (fallback as any)?.OT_BlogPage?.items?.[0] ?? null
    }

    if (!item) return null

    // authorRef is a ContentReference — item resolver returns "Data" for
    // _component types. Fetch author separately using the reference key.
    const authorKey = item.authorRef?.key as string | undefined
    const authorRef = authorKey ? await fetchAuthorByKey(authorKey) : null

    return { ...item, authorRef }
  } catch {
    return null
  }
}

export const getLatestBlogPosts = cache(async function getLatestBlogPosts(
  excludeKey?: string,
  locale = 'en',
  siteBaseUrl?: string | null,
): Promise<BlogPostSummary[]> {
  try {
    const data = await getClient().request(LATEST_POSTS_QUERY, { locale })
    let items: any[] = (data as any)?.OT_BlogPage?.items ?? []

    // Build key → name map from the parallel OT_Author query
    const authorItems: any[] = (data as any)?.OT_Author?.items ?? []
    const authorMap = new Map<string, string>()
    for (const a of authorItems) {
      const ak = a._metadata?.key as string | undefined
      if (ak && a.name) authorMap.set(ak, a.name as string)
    }

    // ── Site scoping ──────────────────────────────────────────────────────────
    // Content Graph indexes all site channels in a tenant. Without scoping,
    // the same post appears once per channel — each with a different key but
    // identical content (the cross-channel duplicate the user sees).
    // Mirror the same logic used in blogFeed.ts.
    if (siteBaseUrl) {
      const normalizedBase = siteBaseUrl.replace(/\/$/, '')
      items = items.filter(p => {
        const base       = p._metadata?.url?.base
        const defaultUrl = p._metadata?.url?.default
        if (typeof base === 'string' && base) {
          return base.replace(/\/$/, '') === normalizedBase
        }
        if (typeof defaultUrl === 'string' && defaultUrl) {
          return defaultUrl.startsWith(normalizedBase + '/') || defaultUrl === normalizedBase
        }
        return true // keep if URL info absent — over-include rather than drop
      })
    }

    // Key-based dedup as a final safety net (covers remaining locale/version duplicates).
    const seen = new Set<string>()
    const unique = items.filter(p => {
      const k = p._metadata?.key as string | undefined
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })

    return unique
      .filter(p => !excludeKey || p._metadata?.key !== excludeKey)
      .slice(0, 3)
      .map(p => {
        const authorKey = p.authorRef?.key as string | undefined
        const authorName = authorKey ? authorMap.get(authorKey) : undefined
        return {
          ...p,
          authorRef: authorName ? { name: authorName } : null,
        }
      })
  } catch {
    return []
  }
})
