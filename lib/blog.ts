import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuthorData = {
  name:     string
  role?:    string
  photo?:   { url: { default: string | null } }
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
        authorRef {
          item {
            ... on OT_Author {
              name
              role
              photo { url { default } }
              linkedIn { default }
              twitter  { default }
            }
          }
        }
        readTime
      }
    }
  }
`

const LATEST_POSTS_QUERY = `
  query GetLatestBlogPosts {
    OT_BlogPage(limit: 4) {
      items {
        _metadata { key published url { default } }
        headline
        topic
        featuredImage { url { default } }
        authorRef {
          item {
            ... on OT_Author {
              name
            }
          }
        }
        readTime
      }
    }
  }
`

// ─── Data access ────────────────────────────────────────────────────────────────

export async function getBlogPage(key: string): Promise<BlogPageContent | null> {
  try {
    const data = await getClient().request(BLOG_PAGE_QUERY, { key })
    const item = (data as any)?.OT_BlogPage?.items?.[0] ?? null
    if (!item) return null

    // authorRef is a ContentReference — actual author data lives in .item
    const authorItem = item.authorRef?.item ?? null
    const authorRef = authorItem && Object.keys(authorItem).length > 0
      ? {
          name:     authorItem.name ?? '',
          role:     authorItem.role ?? undefined,
          photo:    authorItem.photo ?? undefined,
          linkedIn: authorItem.linkedIn?.default ?? null,
          twitter:  authorItem.twitter?.default  ?? null,
        }
      : null

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
    return items
      .filter(p => !excludeKey || p._metadata?.key !== excludeKey)
      .slice(0, 3)
      .map(p => {
        const authorItem = p.authorRef?.item ?? null
        return {
          ...p,
          // authorRef is a ContentReference — name lives in .item
          authorRef: authorItem && Object.keys(authorItem).length > 0
            ? { name: authorItem.name ?? '' }
            : null,
        }
      })
  } catch {
    return []
  }
})
