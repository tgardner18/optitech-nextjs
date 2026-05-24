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
    url: { default: string | null }
  }
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
  query GetBlogPage($key: String!) {
    OT_BlogPage(where: { _metadata: { key: { eq: $key } } }, limit: 1) {
      items {
        _metadata { key published url { default } }
        headline
        subHeadline
        topic
        blogStyle
        featuredImage { url { default } }
        featuredVideo { url { default } }
        body { html }
        authorRef { key }
        readTime
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
 * Latest posts query fetches blog page metadata plus a parallel OT_Author
 * lookup so we can resolve author names without a per-item round-trip.
 * The ContentReference.item approach is avoided for the same reason as above.
 */
const LATEST_POSTS_QUERY = `
  query GetLatestBlogPosts {
    OT_BlogPage(limit: 4) {
      items {
        _metadata { key published url { default } }
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

async function fetchAuthorByKey(key: string): Promise<AuthorData | null> {
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
    return null
  }
}

export async function getBlogPage(key: string): Promise<BlogPageContent | null> {
  try {
    const data = await getClient().request(BLOG_PAGE_QUERY, { key })
    const item = (data as any)?.OT_BlogPage?.items?.[0] ?? null
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
): Promise<BlogPostSummary[]> {
  try {
    const data = await getClient().request(LATEST_POSTS_QUERY, {})
    const items: any[] = (data as any)?.OT_BlogPage?.items ?? []

    // Build key → name map from the parallel OT_Author query
    const authorItems: any[] = (data as any)?.OT_Author?.items ?? []
    const authorMap = new Map<string, string>()
    for (const a of authorItems) {
      const ak = a._metadata?.key as string | undefined
      if (ak && a.name) authorMap.set(ak, a.name as string)
    }

    return items
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
