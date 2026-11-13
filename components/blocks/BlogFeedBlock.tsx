import { stableId } from '@/lib/stableId'
import BlogFeedClient, { type BlogFeedClientProps } from './BlogFeedClient'
import type { BlogFeedPost } from '@/lib/blogFeed'

// ─── Style option types ────────────────────────────────────────────────────────

export type BlogFeedColor       = 'canvas' | 'surface' | 'brand'
export type BlogFeedColumns     = 'col2' | 'col3'
export type BlogFeedHeadingSize = 'display' | 'headline' | 'title'

export type BlogFeedView = 'grid' | 'list'

export type BlogFeedStyleOptions = {
  color?:       BlogFeedColor
  columns?:     BlogFeedColumns
  headingSize?: BlogFeedHeadingSize
  defaultView?: BlogFeedView
}

export type BlogFeedBlockProps = {
  heading?:      string
  posts:         BlogFeedPost[]
  topics:        string[]
  pageSize?:     number
  /**
   * When set by the CMS editor, the feed is locked to this topic. Posts are
   * already filtered server-side; the topic chip UI is hidden in the client.
   */
  topicFilter?:  string | null
  styleOptions?: BlogFeedStyleOptions
  /** True for any CMS draft/preview render (Visual Builder, draft links) — hides the filter drawer. */
  isPreview?:    boolean
  /** Preview-attribute factory from getPreviewUtils — only available in server context */
  pa?:           (prop: string) => Record<string, unknown>
}

// ─── Heading typography map ────────────────────────────────────────────────────

const HEADING_CLASS: Record<BlogFeedHeadingSize, string> = {
  display:  'text-display leading-display tracking-display font-extrabold',
  headline: 'text-headline leading-headline tracking-headline font-bold',
  title:    'text-title leading-title tracking-title font-semibold',
}

// ─── BlogFeedBlock ─────────────────────────────────────────────────────────────

export default function BlogFeedBlock({
  heading,
  posts,
  topics,
  pageSize     = 9,
  topicFilter  = null,
  styleOptions = {},
  isPreview    = false,
  pa           = () => ({}),
}: BlogFeedBlockProps) {
  const {
    color       = 'canvas',
    columns     = 'col3',
    headingSize = 'headline',
    defaultView = 'grid',
  } = styleOptions

  const onBrand = color === 'brand'
  // Server component: a deterministic id (useId crashes server components in production here)
  const anchorId = stableId('blog-feed', `${heading ?? ''}|${topics.join(',')}|${topicFilter ?? ''}`)

  const colCount: BlogFeedClientProps['columns'] = columns === 'col2' ? 2 : 3

  return (
    <section
      data-block="blog-feed"
      data-color={color}
      data-columns={colCount}
      data-theme={onBrand ? 'dark' : undefined}
    >
      <div data-part="inner">

        {/* Scroll anchor — page-change scrolls here so the heading stays visible */}
        <div id={anchorId} aria-hidden style={{ scrollMarginTop: '5rem' }} />

        {/* Heading — rendered server-side so it carries preview attributes + is SEO-indexable */}
        {heading && (
          <h2 data-part="heading" className={HEADING_CLASS[headingSize]} {...pa('heading')}>
            {heading}
          </h2>
        )}

        {/* Interactive feed — client component handles view toggle, filters, pagination */}
        <BlogFeedClient
          posts={posts}
          topics={topics}
          pageSize={pageSize}
          topicFilter={topicFilter}
          columns={colCount}
          onBrand={onBrand}
          anchorId={anchorId}
          defaultView={defaultView}
          isPreview={isPreview}
        />

      </div>
    </section>
  )
}
