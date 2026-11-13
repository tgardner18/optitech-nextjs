'use client'

import { useState, useMemo, useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { LayoutGrid, List, ChevronRight, ChevronLeft, ExternalLink, Tag, SlidersHorizontal, X } from 'lucide-react'
import type { BlogFeedPost } from '@/lib/blogFeed'
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

// ─── Cross-domain detection ────────────────────────────────────────────────────

function isExternalUrl(url: string, mounted: boolean): boolean {
  if (!mounted || !url.startsWith('http')) return false
  try { return new URL(url).origin !== window.location.origin }
  catch { return false }
}

const noopSubscribe = () => () => {}
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia('(min-width: 640px)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
// One card for both views; blog-feed.css lays it out as a stacked card (grid)
// or a row (list), keyed on data-view on the section.

function PostCard({ post, view, mounted }: { post: BlogFeedPost; view: View; mounted: boolean }) {
  const imageUrl  = post.featuredImage?.url?.default
  const postUrl   = post._metadata?.url?.default ?? '#'
  const published = post._metadata?.published
  const topic     = post.topic
  const author    = post.authorRef?.name
  const external  = isExternalUrl(postUrl, mounted)

  return (
    <li data-part="post">
      <a
        href={postUrl}
        data-part="card"
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        <div data-part="media" data-empty={imageUrl ? undefined : ''}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={view === 'grid' ? post.headline : ''} loading="lazy" />
          )}
        </div>
        <div data-part="body">
          {topic && <span data-part="topic">{topicLabel(topic)}</span>}
          <h3 data-part="title">{post.headline}</h3>
          <div data-part="meta">
            {author && <span data-part="monogram" aria-hidden="true">{initials(author)}</span>}
            <span data-part="who">
              {author && <span data-part="author">{author}</span>}
              {published && <time dateTime={published}>{formatDate(published)}</time>}
            </span>
            {post.readTime && <span data-part="read">{post.readTime}</span>}
          </div>
        </div>
        <span data-part="go" aria-hidden="true">
          {external ? <ExternalLink strokeWidth={1.75} /> : <ChevronRight strokeWidth={1.75} />}
        </span>
      </a>
    </li>
  )
}

// ─── Filter drawer ────────────────────────────────────────────────────────────
// Portalled to <body>, so it carries its own tokens (see blog-feed.css). Same
// mechanics as the shared FilterDrawer: Escape closes, body scroll locks while
// open, focus moves in and returns to the trigger.

function FeedDrawer({
  id, open, onClose, topics, active, onSelect, onClear, triggerRef,
}: {
  id: string
  open: boolean
  onClose: () => void
  topics: string[]
  active: string | null
  onSelect: (t: string) => void
  onClear: () => void
  triggerRef: React.RefObject<HTMLElement | null>
}) {
  const mounted = useHydrated()
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia('(min-width: 640px)').matches, () => true)
  const side = wide ? 'side' : 'top'
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      trigger?.focus()
    }
  }, [open, onClose, triggerRef])

  if (!mounted) return null

  return createPortal(
    <div data-part="feed-drawer" data-sheet={side} aria-hidden={!open}>
      <div data-part="scrim" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} id={id} data-part="sheet" role="dialog" aria-modal="true" aria-label="Refine" tabIndex={-1}>
        <div data-part="sheet-head">
          <h2 data-part="sheet-title"><SlidersHorizontal strokeWidth={2} aria-hidden="true" />Refine</h2>
          <button type="button" data-part="close" onClick={onClose} aria-label="Close filters">
            <X strokeWidth={1.75} />
          </button>
        </div>
        <div data-part="sheet-body">
          <h3 data-part="group-title"><Tag strokeWidth={2} aria-hidden="true" />Topic</h3>
          <div data-part="chips" role="group" aria-label="Filter by topic">
            {topics.map(t => (
              <button key={t} type="button" data-part="chip" aria-pressed={active === t} onClick={() => onSelect(t)}>
                {topicLabel(t)}
              </button>
            ))}
          </div>
        </div>
        <div data-part="sheet-foot">
          <button type="button" data-part="clear" onClick={onClear} disabled={!active}>Clear filters</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Pager ────────────────────────────────────────────────────────────────────

function Pager({ page, totalPages, total, pageSize, onChange }: {
  page: number; totalPages: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)
  const set = new Set<number>([1, totalPages])
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) set.add(i)
  const list = [...set].sort((a, b) => a - b)
  return (
    <nav data-part="pager" aria-label="Pagination">
      <p data-part="count" aria-live="polite" aria-atomic="true">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> posts
      </p>
      <div data-part="pages">
        <button type="button" data-part="page" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft strokeWidth={2} />
        </button>
        {list.map((p, i) => (
          <span key={p} style={{ display: 'contents' }}>
            {i > 0 && p - list[i - 1] > 1 && <span data-part="gap">…</span>}
            <button type="button" data-part="page" aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
              {p}
            </button>
          </span>
        ))}
        <button type="button" data-part="page" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight strokeWidth={2} />
        </button>
      </div>
    </nav>
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
  columns:     2 | 3
  /** True when the parent section has brand background (adjusts chip/text colours) */
  onBrand:     boolean
  /** ID of the anchor element above the feed for scroll-on-page-change */
  anchorId:    string
  /** Initial view mode — set by the CMS editor; visitor can still toggle */
  defaultView?: 'grid' | 'list'
  /** True for any CMS draft/preview render — hides the filter trigger + drawer. */
  isPreview?:   boolean
}

type View = 'grid' | 'list'

export default function BlogFeedClient({
  posts,
  topics,
  pageSize,
  topicFilter = null,
  columns,
  anchorId,
  defaultView = 'grid',
  isPreview   = false,
}: BlogFeedClientProps) {
  const [view,        setView]   = useState<View>(defaultView)
  const [activeTopic, setTopic]  = useState<string | null>(null)
  const [page,        setPage]   = useState(1)
  const mounted = useHydrated()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const prefersReducedMotion      = usePrefersReducedMotion()
  const filterTriggerRef = useRef<HTMLButtonElement>(null)
  const filterPanelId    = useId()

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

  const activeCount = activeTopic ? 1 : 0
  const showFilters = !topicFilter && !isPreview

  return (
    <div data-part="feed" data-view={view} data-columns={columns}>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div data-part="toolbar">
        {/* Hidden when the CMS locked the feed to one topic, and in CMS preview renders */}
        {showFilters && (
          <button
            ref={filterTriggerRef}
            type="button"
            data-part="filter"
            onClick={() => setFiltersOpen(v => !v)}
            aria-expanded={filtersOpen}
            aria-controls={filterPanelId}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal aria-hidden="true" />
            <span>Filters</span>
            {activeCount > 0 && <span data-part="badge" aria-hidden="true">{activeCount}</span>}
            <span data-part="filter-note">
              {activeCount > 0 ? `${activeCount} filter applied` : 'Add filters to narrow down results.'}
            </span>
          </button>
        )}
        {topicFilter && <p data-part="topic-label">{topicLabel(topicFilter)}</p>}

        <div data-part="views" role="group" aria-label="View mode">
          <button type="button" data-part="view" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            <LayoutGrid />
          </button>
          <button type="button" data-part="view" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List />
          </button>
        </div>
      </div>

      {showFilters && (
        <FeedDrawer
          id={filterPanelId}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          topics={topics}
          active={activeTopic}
          onSelect={t => changeTopic(activeTopic === t ? null : t)}
          onClear={() => changeTopic(null)}
          triggerRef={filterTriggerRef}
        />
      )}

      {/* ── Posts ───────────────────────────────────────────────────────────── */}
      {/* Keyed on the active topic so a filter change fades the swapped-in set in. */}
      <div key={activeTopic ?? 'all'} className="animate-filter-swap">
        {pagePosts.length === 0 ? (
          <div data-part="empty">
            <span><List size={20} strokeWidth={1.5} aria-hidden="true" /></span>
            <p>{activeTopic !== null ? 'No posts match this topic.' : 'No posts found.'}</p>
          </div>
        ) : (
          <ul data-part="posts">
            {pagePosts.map(post => (
              <PostCard key={post._metadata.key} post={post} view={view} mounted={mounted} />
            ))}
          </ul>
        )}
      </div>

      <Pager page={safePage} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onChange={changePage} />
    </div>
  )
}
