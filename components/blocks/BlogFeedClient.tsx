'use client'

import { useState, useMemo, useCallback } from 'react'
import { LayoutGrid, List, ChevronRight } from 'lucide-react'
import type { BlogFeedPost } from '@/lib/blogFeed'
import Pagination from '@/components/ui/Pagination'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  news:       'News',
  insights:   'Insights',
  leadership: 'Leadership',
  stories:    'Stories',
  innovation: 'Innovation',
  culture:    'Culture',
  events:     'Events',
  resources:  'Resources',
}

function topicLabel(t: string): string {
  return TOPIC_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1)
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch { return '' }
}

// ─── BlogCard ─────────────────────────────────────────────────────────────────

function BlogCard({ post, onBrand }: { post: BlogFeedPost; onBrand: boolean }) {
  const imageUrl  = post.featuredImage?.url?.default
  const postUrl   = post._metadata?.url?.default ?? '#'
  const published = post._metadata?.published
  const topic     = post.topic
  const author    = post.authorRef?.name

  return (
    <a
      href={postUrl}
      className={`group block card-hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        onBrand ? 'bg-fg/8 border border-fg-on-brand/15' : 'bg-canvas border border-fg/8'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={post.headline}
            loading="lazy"
            className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand/25 to-canvas" />
        )}
      </div>

      {/* Body */}
      <div className="px-md pt-md pb-lg">
        {topic && (
          <div className="mb-sm flex items-center gap-xs">
            <span className="block w-1.5 h-1.5 bg-accent flex-none" aria-hidden />
            <span className={`text-label uppercase tracking-label font-semibold ${
              onBrand ? 'text-fg-on-brand/80' : 'text-accent'
            }`}>
              {topicLabel(topic)}
            </span>
          </div>
        )}
        <h3 className={`text-title leading-title font-semibold text-balance line-clamp-3 ${
          onBrand ? 'text-fg-on-brand' : 'text-fg'
        }`}>
          {post.headline}
        </h3>
        <div className={`mt-sm flex flex-wrap items-center gap-x-sm gap-y-xs text-label ${
          onBrand ? 'text-fg-on-brand/60' : 'text-fg-muted'
        }`}>
          {author && <span>{author}</span>}
          {author && published && <span aria-hidden>·</span>}
          {published && <time dateTime={published}>{formatDate(published)}</time>}
          {post.readTime && <><span aria-hidden>·</span><span>{post.readTime}</span></>}
        </div>
      </div>
    </a>
  )
}

// ─── BlogListRow ──────────────────────────────────────────────────────────────

function BlogListRow({ post, onBrand }: { post: BlogFeedPost; onBrand: boolean }) {
  const imageUrl  = post.featuredImage?.url?.default
  const postUrl   = post._metadata?.url?.default ?? '#'
  const published = post._metadata?.published
  const topic     = post.topic
  const author    = post.authorRef?.name

  const borderClass   = onBrand ? 'border-fg-on-brand/15'  : 'border-fg/8'
  const topicClass    = onBrand ? 'text-fg-on-brand/70'    : 'text-accent'
  const headlineClass = onBrand ? 'text-fg-on-brand'       : 'text-fg'
  const metaClass     = onBrand ? 'text-fg-on-brand/55'    : 'text-fg-muted'
  const arrowClass    = onBrand ? 'text-fg-on-brand/40 group-hover:text-fg-on-brand' : 'text-fg-muted/40 group-hover:text-brand'

  return (
    <a
      href={postUrl}
      className={`group flex items-center gap-md py-md border-b last:border-b-0 ${borderClass}
        transition-colors duration-150 ease-quick
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
    >
      {/* Thumbnail — only rendered when a featured image is set */}
      {imageUrl && (
        <div className="shrink-0 w-20 h-14 sm:w-28 sm:h-18 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      )}

      {/* Topic column — desktop only */}
      <div className="hidden sm:flex items-center gap-xs w-32.5 shrink-0">
        {topic ? (
          <>
            <span className="block w-1.5 h-1.5 bg-accent flex-none" aria-hidden />
            <span className={`text-label uppercase tracking-label font-semibold truncate ${topicClass}`}>
              {topicLabel(topic)}
            </span>
          </>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile-only topic tag */}
        {topic && (
          <div className="sm:hidden flex items-center gap-xs mb-xs">
            <span className="block w-1.5 h-1.5 bg-accent flex-none" aria-hidden />
            <span className={`text-label uppercase tracking-label font-semibold ${topicClass}`}>
              {topicLabel(topic)}
            </span>
          </div>
        )}
        <h3 className={`text-title leading-title font-semibold text-balance group-hover:underline decoration-fg/20 underline-offset-2 ${headlineClass}`}>
          {post.headline}
        </h3>
        <div className={`mt-xs flex flex-wrap items-center gap-x-sm gap-y-xs text-label ${metaClass}`}>
          {author && <span>{author}</span>}
          {author && published && <span aria-hidden>·</span>}
          {published && <time dateTime={published}>{formatDate(published)}</time>}
          {post.readTime && <><span aria-hidden>·</span><span>{post.readTime}</span></>}
        </div>
      </div>

      {/* Arrow */}
      <div className={`hidden sm:flex items-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${arrowClass}`}>
        <ChevronRight size={18} strokeWidth={1.75} />
      </div>
    </a>
  )
}

// ─── TopicChip ────────────────────────────────────────────────────────────────

function TopicChip({
  label,
  active,
  onBrand,
  onClick,
}: {
  label:   string
  active:  boolean
  onBrand: boolean
  onClick: () => void
}) {
  const base = 'text-label uppercase tracking-label font-semibold px-sm py-[5px] border transition-colors duration-150 ease-quick cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

  const variant = active
    ? (onBrand
        ? 'bg-fg/25 border-fg-on-brand/50 text-fg-on-brand'
        : 'bg-brand border-transparent text-fg-on-brand')
    : (onBrand
        ? 'bg-fg/8 border-fg-on-brand/20 text-fg-on-brand/65 hover:bg-fg/15 hover:text-fg-on-brand'
        : 'bg-transparent border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg')

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${base} ${variant}`}
    >
      {label}
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onBrand, filtered }: { onBrand: boolean; filtered: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-2xl gap-md ${
      onBrand ? 'text-fg-on-brand/55' : 'text-fg-muted'
    }`}>
      <div className={`w-12 h-12 border-2 flex items-center justify-center ${
        onBrand ? 'border-fg-on-brand/20' : 'border-fg/12'
      }`}>
        <List size={20} strokeWidth={1.5} />
      </div>
      <p className="text-body">
        {filtered ? 'No posts match this topic.' : 'No posts found.'}
      </p>
    </div>
  )
}

// ─── BlogFeedClient ───────────────────────────────────────────────────────────

export type BlogFeedClientProps = {
  posts:    BlogFeedPost[]
  topics:   string[]
  /** Max posts per paginated page — defaults to 9 */
  pageSize: number
  /**
   * When the CMS editor has locked the feed to a single topic, this prop
   * carries that value. Posts are already filtered server-side; this flag
   * suppresses the topic chip UI so visitors cannot override the editor's intent.
   */
  topicFilter?: string | null
  /** Grid column count in card view: 2 or 3 */
  columns:  2 | 3
  /** True when the parent section has brand background (adjusts chip/text colours) */
  onBrand:  boolean
  /** ID of the anchor element above the feed for scroll-on-page-change */
  anchorId: string
}

type View = 'grid' | 'list'

export default function BlogFeedClient({
  posts,
  topics,
  pageSize,
  topicFilter = null,
  columns,
  onBrand,
  anchorId,
}: BlogFeedClientProps) {
  const [view,        setView]   = useState<View>('grid')
  const [activeTopic, setTopic]  = useState<string | null>(null)
  const [page,        setPage]   = useState(1)
  const prefersReducedMotion     = usePrefersReducedMotion()

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => activeTopic ? posts.filter(p => p.topic === activeTopic) : posts,
    [posts, activeTopic],
  )

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pagePosts  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const changeTopic = useCallback((t: string | null) => {
    setTopic(t)
    setPage(1)
  }, [])

  const changePage = useCallback((p: number) => {
    setPage(p)
    // Scroll to the feed heading anchor — honour prefers-reduced-motion (the CSS
    // animations are motion-safe gated; this JS-driven scroll must be too).
    document.getElementById(anchorId)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' })
  }, [anchorId, prefersReducedMotion])

  // ── Styles ─────────────────────────────────────────────────────────────────
  const gridClass = columns === 2
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-lg'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg'

  const toggleBase = `inline-flex items-center justify-center w-11 h-11 transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 ${onBrand ? 'focus-visible:outline-fg-on-brand' : 'focus-visible:outline-brand'}`

  const toggleActive   = onBrand ? 'text-fg-on-brand' : 'text-brand'
  const toggleInactive = onBrand ? 'text-fg-on-brand/40 hover:text-fg-on-brand/70' : 'text-fg-muted/50 hover:text-fg-muted'

  const dividerClass = onBrand ? 'border-fg-on-brand/12' : 'border-fg/8'

  return (
    <div>
      {/* ── Controls bar ────────────────────────────────────────────────────── */}
      <div className={`flex flex-wrap items-center justify-between gap-sm pb-lg mb-lg border-b ${dividerClass}`}>

        {/* Topic filter chips — hidden when the CMS has locked the feed to a single topic */}
        {!topicFilter && (
          <div className="flex flex-wrap items-center gap-xs" role="group" aria-label="Filter by topic">
            <TopicChip
              label="All"
              active={activeTopic === null}
              onBrand={onBrand}
              onClick={() => changeTopic(null)}
            />
            {topics.map(t => (
              <TopicChip
                key={t}
                label={topicLabel(t)}
                active={activeTopic === t}
                onBrand={onBrand}
                onClick={() => changeTopic(activeTopic === t ? null : t)}
              />
            ))}
          </div>
        )}
        {/* When topic-locked: show the active topic as a static label */}
        {topicFilter && (
          <p className={`text-label tracking-label uppercase font-semibold ${onBrand ? 'text-fg-on-brand/60' : 'text-fg-muted'}`}>
            {topicLabel(topicFilter)}
          </p>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-0.5" role="group" aria-label="View mode">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`${toggleBase} ${view === 'grid' ? toggleActive : toggleInactive}`}
          >
            <LayoutGrid size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`${toggleBase} ${view === 'list' ? toggleActive : toggleInactive}`}
          >
            <List size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* ── Posts ───────────────────────────────────────────────────────────── */}
      {pagePosts.length === 0 ? (
        <EmptyState onBrand={onBrand} filtered={activeTopic !== null} />
      ) : view === 'grid' ? (
        <div className={gridClass}>
          {pagePosts.map(post => (
            <BlogCard key={post._metadata.key} post={post} onBrand={onBrand} />
          ))}
        </div>
      ) : (
        <div>
          {pagePosts.map(post => (
            <BlogListRow key={post._metadata.key} post={post} onBrand={onBrand} />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={pageSize}
        countLabel="posts"
        onBrand={onBrand}
        onChange={changePage}
      />
    </div>
  )
}
