import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_BlogFeedBlock as OT_BlogFeedBlockContentType } from '@/cms/content-types/OT_BlogFeedBlock'
import { getRequestLocale, getRequestBaseUrl } from '@/lib/optimizely'
import { getBlogFeedPosts }  from '@/lib/blogFeed'
import BlogFeedBlock         from '@/components/blocks/BlogFeedBlock'
import type { BlogFeedColor, BlogFeedColumns, BlogFeedHeadingSize } from '@/components/blocks/BlogFeedBlock'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  content:          ContentProps<typeof OT_BlogFeedBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// ─── OT_BlogFeedBlock adapter ─────────────────────────────────────────────────
//
// Async server component — fetches blog posts at render time using the current
// locale (set by middleware → getRequestLocale) so the feed is always in sync
// with the active language without any client round-trips.
//
// The article root's hierarchical URL is read directly from the content
// reference metadata returned by the SDK (the _IContent fragment includes
// url.hierarchical), which avoids an extra Graph query to resolve the root.

export default async function OT_BlogFeedBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  // ── Locale + site base URL ────────────────────────────────────────────────
  // getRequestLocale reads the x-locale header set by middleware; falls back
  // to the default locale when called outside a request context (e.g. build).
  // getRequestBaseUrl provides the current site's origin for scoping the feed
  // to only this site's blog posts (Content Graph is shared across all sites).
  const locale      = await getRequestLocale()
  const siteBaseUrl = await getRequestBaseUrl()

  // ── Article root ──────────────────────────────────────────────────────────
  // The SDK's generated fragment includes _metadata.url.hierarchical for
  // contentReference fields, so we can read it directly from content.articleRoot.
  const articleRootPath: string | null =
    content.articleRoot?.url?.hierarchical ?? null

  // ── Page size ─────────────────────────────────────────────────────────────
  const rawPageSize = content.pageSize ?? 0
  const pageSize    = Number.isInteger(rawPageSize) && rawPageSize >= 1
    ? Math.min(rawPageSize, 24)
    : 9

  // ── Topic filter ─────────────────────────────────────────────────────────
  // When the editor chooses a topic in the CMS, the feed is locked to that
  // topic at render time. Null means "no filter — show all topics".
  const topicFilter: string | null =
    typeof content.topicFilter === 'string' && content.topicFilter
      ? content.topicFilter
      : null

  // ── Fetch posts ───────────────────────────────────────────────────────────
  // React cache() dedups this call if multiple Blog Feed blocks appear on the
  // same page with the same locale + root + filter combination.
  // When an explicit article root path is set, the path filter is the scope —
  // bypass site-URL scoping so cross-site article folders work correctly.
  const effectiveSiteBase = articleRootPath ? null : (siteBaseUrl || null)
  const { posts, topics } = await getBlogFeedPosts(locale, articleRootPath, effectiveSiteBase, topicFilter)

  // ── Display settings ──────────────────────────────────────────────────────
  const color       = String(displaySettings.color       ?? 'canvas')  as BlogFeedColor
  const columns     = String(displaySettings.columns     ?? 'col3')    as BlogFeedColumns
  const headingSize = String(displaySettings.headingSize ?? 'headline') as BlogFeedHeadingSize

  // ── Heading — localised field ─────────────────────────────────────────────
  // The heading property has isLocalized: true. The SDK resolves the correct
  // locale variant and exposes it as a plain string on content.heading.
  const heading = content.heading ?? undefined

  return (
    <div {...pa(content.__composition)} className="w-full">
      <BlogFeedBlock
        heading={heading}
        posts={posts}
        topics={topics}
        pageSize={pageSize}
        topicFilter={topicFilter}
        styleOptions={{ color, columns, headingSize }}
        pa={pa}
      />
    </div>
  )
}
