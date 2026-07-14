import { useId } from 'react'
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
  /** Preview-attribute factory from getPreviewUtils — only available in server context */
  pa?:           (prop: string) => Record<string, unknown>
}

// ─── Heading typography map ────────────────────────────────────────────────────

const HEADING_CLASS: Record<BlogFeedHeadingSize, string> = {
  display:  'text-display leading-display tracking-display font-extrabold',
  headline: 'text-headline leading-headline tracking-headline font-bold',
  title:    'text-title leading-title tracking-title font-semibold',
}

// ─── Background + theme map ────────────────────────────────────────────────────

const BG_CLASS: Record<BlogFeedColor, string> = {
  canvas:  'bg-canvas',
  surface: 'bg-surface',
  brand:   'bg-brand-fill',
}

// ─── BlogFeedBlock ─────────────────────────────────────────────────────────────

export default function BlogFeedBlock({
  heading,
  posts,
  topics,
  pageSize     = 9,
  topicFilter  = null,
  styleOptions = {},
  pa           = () => ({}),
}: BlogFeedBlockProps) {
  const {
    color       = 'canvas',
    columns     = 'col3',
    headingSize = 'headline',
    defaultView = 'grid',
  } = styleOptions

  const onBrand = color === 'brand'
  const id      = useId()
  // Strip React's colon characters so the id is a valid CSS/DOM selector
  const anchorId = `blog-feed-${id.replace(/:/g, '')}`

  const colCount: BlogFeedClientProps['columns'] = columns === 'col2' ? 2 : 3

  const headingTextClass = onBrand
    ? `${HEADING_CLASS[headingSize]} text-fg-on-brand`
    : `${HEADING_CLASS[headingSize]} text-fg`

  return (
    <section
      className={`${BG_CLASS[color]} px-md py-xl lg:px-lg`}
      {...(onBrand ? { 'data-theme': 'dark' } : {})}
    >
      <div className="mx-auto max-w-7xl">

        {/* Scroll anchor — page-change scrolls here so the heading stays visible */}
        <div id={anchorId} aria-hidden style={{ scrollMarginTop: '5rem' }} />

        {/* Heading — rendered server-side so it carries preview attributes + is SEO-indexable */}
        {heading && (
          <div className="mb-xl">
            <h2 className={headingTextClass} {...pa('heading')}>
              {heading}
            </h2>
          </div>
        )}

        {/* Interactive feed — client component handles view toggle, chips, pagination */}
        <BlogFeedClient
          posts={posts}
          topics={topics}
          pageSize={pageSize}
          topicFilter={topicFilter}
          columns={colCount}
          onBrand={onBrand}
          anchorId={anchorId}
          defaultView={defaultView}
        />

      </div>
    </section>
  )
}
