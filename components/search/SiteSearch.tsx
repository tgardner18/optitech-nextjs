'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Search, X, Maximize2, Minimize2,
  FileText, Newspaper, LayoutGrid, Sparkles, Hash,
} from 'lucide-react'
import { useSearch } from './SearchProvider'
import type { SearchResult } from '@/lib/search'

type DisplayMode = 'immersive' | 'compact'
type TypeFilter  = 'all' | 'Blog' | 'Page'

const DISPLAY_MODE_KEY  = 'ot-search-mode'
const SUGGESTED_QUERIES = ['Platform', 'Engineering', 'AI', 'Product', 'Innovation']

const TYPE_FILTERS: { value: TypeFilter; label: string; Icon: typeof LayoutGrid }[] = [
  { value: 'all',  label: 'All',  Icon: LayoutGrid },
  { value: 'Blog', label: 'Blog', Icon: Newspaper  },
  { value: 'Page', label: 'Page', Icon: FileText   },
]

function formatDate(iso?: string): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch { return null }
}

export default function SiteSearch() {
  const { isOpen, closeSearch } = useSearch()
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  const [mode,        setMode]        = useState<DisplayMode>('immersive')
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<SearchResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all')
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [focusedIdx,  setFocusedIdx]  = useState(-1)
  const [mounted,     setMounted]     = useState(false)
  const [semantic,    setSemantic]    = useState(false)
  // Used to trigger a brief scale-bounce animation on the newly active filter
  const [flashFilter, setFlashFilter] = useState<TypeFilter | null>(null)

  const inputRef    = useRef<HTMLInputElement>(null)
  const resultsRef  = useRef<HTMLElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISPLAY_MODE_KEY)
      if (saved === 'compact' || saved === 'immersive') setMode(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    } else {
      setQuery('')
      setResults([])
      setFocusedIdx(-1)
      setHasSearched(false)
      setTypeFilter('all')
      setTopicFilter(null)
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, closeSearch])

  const runSearch = useCallback(async (q: string, type: TypeFilter, useSemanticSearch: boolean) => {
    if (q.trim().length < 2) { setResults([]); setHasSearched(false); return }
    setLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: q.trim(), type })
      if (useSemanticSearch) params.set('semantic', 'true')
      const res  = await fetch(`/api/search?${params}`)
      const data: SearchResult[] = await res.json()
      setResults(data)
      setFocusedIdx(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setTopicFilter(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value, typeFilter, semantic), 300)
  }

  const handleTypeFilter = (t: TypeFilter) => {
    if (t === typeFilter) return
    setTypeFilter(t)
    setTopicFilter(null)
    setFlashFilter(t)
    setTimeout(() => setFlashFilter(null), 350)
    if (query.trim().length >= 2) runSearch(query, t, semantic)
  }

  const handleSemanticToggle = () => {
    const next = !semantic
    setSemantic(next)
    if (query.trim().length >= 2) runSearch(query, typeFilter, next)
  }

  const toggleMode = () => {
    setMode(prev => {
      const next: DisplayMode = prev === 'immersive' ? 'compact' : 'immersive'
      try { localStorage.setItem(DISPLAY_MODE_KEY, next) } catch {}
      return next
    })
  }

  const handleResultClick = (url: string) => {
    router.push(url)
    closeSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = resultsRef.current?.querySelectorAll<HTMLElement>('[data-result-item]')
    if (!items?.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(focusedIdx + 1, items.length - 1)
      setFocusedIdx(next)
      items[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (focusedIdx <= 0) {
        setFocusedIdx(-1)
        inputRef.current?.focus()
      } else {
        const prev = focusedIdx - 1
        setFocusedIdx(prev)
        items[prev]?.focus()
      }
    }
  }

  const blogCount  = results.filter(r => r.type === 'Blog').length
  const pageCount  = results.filter(r => r.type === 'Page').length
  const allCount   = results.length

  const availableTopics = Array.from(new Set(
    results.filter(r => r.type === 'Blog' && r.topic).map(r => r.topic!)
  ))
  const showTopics = (typeFilter === 'all' || typeFilter === 'Blog') && availableTopics.length > 0

  const filteredResults = topicFilter
    ? results.filter(r => r.type !== 'Blog' || r.topic === topicFilter)
    : results

  const dur = (ms: number) => prefersReducedMotion ? 0 : ms / 1000

  const panelVariants = {
    hidden:  { y: '-100%' },
    visible: { y: 0,       transition: { duration: dur(380), ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { y: '-100%', transition: { duration: dur(240), ease: [0.4, 0, 0.2, 1]  as const } },
  }

  const overlayVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur(200) } },
    exit:    { opacity: 0, transition: { duration: dur(150) } },
  }

  // ─── Type filter buttons with icon + label + count ─────────────────────────
  // whileTap gives immediate tactile feedback. flashFilter drives a brief
  // scale-pulse animation the moment a new filter becomes active.

  function TypeFilterButtons({ compact: isCompact }: { compact: boolean }) {
    const countFor = (f: TypeFilter) => {
      if (f === 'all')  return allCount
      if (f === 'Blog') return blogCount
      return pageCount
    }

    return (
      <div
        className={`flex items-center ${isCompact ? 'gap-[6px]' : 'gap-sm'}`}
        role="group"
        aria-label="Content type filter"
      >
        {TYPE_FILTERS.map(f => {
          const isActive = typeFilter === f.value
          const count    = countFor(f.value)
          const isNew    = flashFilter === f.value

          return (
            <motion.button
              key={f.value}
              type="button"
              onClick={() => handleTypeFilter(f.value)}
              aria-pressed={isActive}
              // Brief scale-bounce when this filter just became active
              animate={isNew && !prefersReducedMotion ? { scale: [1, 0.92, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.93 }}
              className={[
                'flex items-center gap-[5px] border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
                isCompact ? 'px-sm py-[7px] text-[11px]' : 'px-md py-[10px] text-[12px]',
                isActive
                  ? 'border-brand/70 bg-brand/10 text-brand shadow-[0_0_0_1px_var(--ot-bloom-brand-border)]'
                  : 'border-fg/12 bg-transparent text-fg-muted/55 hover:border-fg/28 hover:text-fg-muted hover:bg-fg/4',
              ].join(' ')}
            >
              <f.Icon size={isCompact ? 11 : 12} className="shrink-0" />
              <span className="uppercase tracking-[0.08em] font-semibold">{f.label}</span>
              {hasSearched && (
                <span className={`font-bold tabular-nums ${isActive ? 'text-brand' : 'text-fg-muted/35'}`}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Semantic / AI search toggle */}
        <motion.button
          type="button"
          onClick={handleSemanticToggle}
          aria-pressed={semantic}
          whileTap={prefersReducedMotion ? {} : { scale: 0.93 }}
          title={semantic ? 'Semantic search on' : 'Enable semantic (AI) search'}
          className={[
            'flex items-center gap-[5px] border transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
            isCompact ? 'px-sm py-[7px] text-[11px]' : 'px-md py-[10px] text-[12px]',
            semantic
              ? 'border-accent/60 bg-accent/8 text-accent'
              : 'border-fg/12 bg-transparent text-fg-muted/40 hover:border-fg/28 hover:text-fg-muted hover:bg-fg/4',
          ].join(' ')}
        >
          <Sparkles size={isCompact ? 11 : 12} className="shrink-0" />
          <span className="uppercase tracking-[0.08em] font-semibold">AI</span>
        </motion.button>
      </div>
    )
  }

  // ─── Topic chips ───────────────────────────────────────────────────────────

  function TopicChips({ compact: isCompact }: { compact: boolean }) {
    if (!showTopics) return null
    return (
      <div className={`flex flex-wrap items-center gap-xs ${isCompact ? '' : 'mt-xs'}`}>
        <Hash size={10} className="text-fg-muted/30 shrink-0" aria-hidden />
        {availableTopics.map(topic => {
          const isActive = topicFilter === topic
          return (
            <motion.button
              key={topic}
              type="button"
              onClick={() => setTopicFilter(isActive ? null : topic)}
              aria-pressed={isActive}
              whileTap={prefersReducedMotion ? {} : { scale: 0.93 }}
              className={[
                isCompact ? 'px-xs py-[4px] text-[10px]' : 'px-sm py-[5px] text-[11px]',
                'uppercase tracking-[0.08em] font-semibold border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
                isActive
                  ? 'border-brand/50 bg-brand/10 text-brand'
                  : 'border-fg/10 text-fg-muted/45 hover:border-fg/25 hover:text-fg-muted',
              ].join(' ')}
            >
              {topic}
            </motion.button>
          )
        })}
        {topicFilter && (
          <button
            type="button"
            onClick={() => setTopicFilter(null)}
            className="text-[10px] text-fg-muted/30 hover:text-fg-muted transition-colors ml-xs focus-visible:outline-none"
          >
            clear
          </button>
        )}
      </div>
    )
  }

  // ─── Suggested queries ─────────────────────────────────────────────────────

  function SuggestedQueries() {
    return (
      <div className="py-md">
        <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-fg-muted/35 mb-sm">
          Try searching
        </p>
        <div className="flex flex-wrap gap-xs items-center">
          {SUGGESTED_QUERIES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleQueryChange(s)}
              className={[
                'px-sm py-[6px] text-[12px]',
                'uppercase tracking-[0.08em] font-medium',
                'border border-fg/8 text-fg-muted/45',
                'hover:border-brand/35 hover:text-brand/70',
                'transition-all duration-150 focus-visible:outline-none',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Loading dots ──────────────────────────────────────────────────────────

  function LoadingDots() {
    return (
      <div className="flex items-center gap-xs py-lg" aria-label="Searching">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block w-[5px] h-[5px] bg-brand/50 motion-safe:animate-pulse"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    )
  }

  // ─── Result item ───────────────────────────────────────────────────────────

  function ResultItem({ result, index, compact: isCompact }: {
    result:  SearchResult
    index:   number
    compact: boolean
  }) {
    const date         = formatDate(result.published)
    const isFocused    = focusedIdx === index
    const hasThumbnail = !!result.imageUrl

    const thumbSize = isCompact ? 'w-[48px] h-[48px]' : 'w-[68px] h-[68px]'

    return (
      <li key={result.id}>
        <button
          data-result-item
          tabIndex={isFocused ? 0 : -1}
          type="button"
          onClick={() => handleResultClick(result.url)}
          className={[
            'group w-full text-left flex items-start gap-md',
            isCompact ? 'px-md py-[12px]' : 'py-[18px]',
            'border-b border-fg/8 last:border-0',
            'hover:bg-brand/5 focus-visible:outline-none focus-visible:bg-brand/5',
            'transition-colors duration-100',
            isFocused ? 'bg-brand/5' : '',
          ].join(' ')}
        >
          {/* Thumbnail */}
          <div className={`shrink-0 ${thumbSize} overflow-hidden bg-surface/60 flex items-center justify-center mt-[3px]`}>
            {hasThumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl!}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : result.type === 'Blog' ? (
              <Newspaper size={isCompact ? 15 : 18} className="text-fg-muted/25" />
            ) : (
              <FileText  size={isCompact ? 15 : 18} className="text-fg-muted/25" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-[6px] flex-wrap mb-[5px]">
              <span className={`text-[10px] uppercase tracking-[0.1em] font-bold ${result.type === 'Blog' ? 'text-brand' : 'text-fg-muted/60'}`}>
                {result.type}
              </span>
              {result.topic && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-fg-muted/55">
                    {result.topic}
                  </span>
                </>
              )}
              {date && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="text-[10px] text-fg-muted/40">{date}</span>
                </>
              )}
            </div>

            {/* Title */}
            <p className={[
              'font-semibold text-fg leading-snug line-clamp-2',
              'group-hover:text-brand group-focus-visible:text-brand transition-colors duration-150',
              isCompact ? 'text-[14px]' : 'text-[19px]',
            ].join(' ')}>
              {result.title}
            </p>

            {/* Excerpt */}
            {result.excerpt && (
              <p className={`text-fg-muted leading-relaxed mt-[4px] line-clamp-2 ${isCompact ? 'text-[12px]' : 'text-[14px]'}`}>
                {result.excerpt}
              </p>
            )}
          </div>

          {/* Arrow (immersive only) */}
          {!isCompact && (
            <span
              aria-hidden
              className="shrink-0 self-center text-fg/15 group-hover:text-brand group-focus-visible:text-brand transition-colors text-base"
            >
              →
            </span>
          )}
        </button>
      </li>
    )
  }

  // ─── Immersive panel — single-column, centered ────────────────────────────
  // Full-screen, bg-canvas. Centered max-width column for all content.
  // SEARCH wordmark uses .display-gradient-brand for display-scale impact.

  function ImmersivePanel() {
    return (
      <div className="flex flex-col h-full overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-md lg:px-2xl py-2.5 border-b border-fg/8 shrink-0">
          <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-fg-muted/35 select-none">
            OptiTech Search
          </span>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Switch to compact mode"
              className="flex items-center gap-1.25 px-sm py-1.75 border border-fg/15 text-fg-muted hover:text-fg hover:border-fg/35 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <Minimize2 size={16} />
              <span className="text-[10px] uppercase tracking-[0.08em] font-semibold hidden sm:inline">Compact</span>
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="flex items-center justify-center w-9 h-9 border border-fg/15 text-fg-muted hover:text-fg hover:border-fg/35 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body — single centered column */}
        <div
          ref={resultsRef as React.RefObject<HTMLDivElement>}
          id="search-results"
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="flex-1 overflow-y-auto"
        >
          <div className="px-md lg:px-2xl xl:px-[8vw] pt-lg pb-2xl">

            {/* SEARCH display wordmark — hollow Syne with brand glow for legibility */}
            <div className="mb-lg select-none" aria-hidden>
              <span
                className="syne-hollow font-syne font-black block leading-none"
                style={{
                  fontSize:              'clamp(4rem, 10vw, 10rem)',
                  letterSpacing:         '-0.04em',
                  fontVariationSettings: "'wght' 900",
                  WebkitTextStroke:      '3px var(--ot-brand)',
                  filter:               'drop-shadow(0 0 32px oklch(from var(--ot-brand) l c h / 0.50))',
                }}
              >
                SEARCH
              </span>
            </div>

            {/* Search input */}
            <label htmlFor="search-input-immersive" className="sr-only">Search query</label>
            <div className="relative flex items-center border-b-2 border-fg/15 focus-within:border-brand transition-colors duration-200 mb-lg">
              <Search size={18} className="shrink-0 text-fg-muted/40 mr-sm" aria-hidden />
              <input
                ref={inputRef}
                id="search-input-immersive"
                type="search"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you looking for?"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search query"
                aria-controls="search-results"
                aria-autocomplete="list"
                className={[
                  'flex-1 bg-transparent text-fg py-sm outline-none',
                  'text-[1.1rem] font-medium placeholder:text-fg-muted/30',
                  '[&::-webkit-search-cancel-button]:hidden',
                ].join(' ')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  aria-label="Clear search"
                  className="shrink-0 p-xs text-fg-muted/40 hover:text-fg transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center flex-wrap gap-sm mb-md">
              {TypeFilterButtons({ compact: false })}
            </div>

            {/* Topic chips */}
            {showTopics && (
              <div className="mb-md">
                {TopicChips({ compact: false })}
              </div>
            )}

            {/* Empty / no-query state */}
            {!hasSearched && !query && SuggestedQueries()}

            {/* Loading */}
            {loading && LoadingDots()}

            {/* No results */}
            {!loading && hasSearched && filteredResults.length === 0 && (
              <div className="py-md">
                <p className="text-[1.25rem] font-semibold text-fg/60">
                  No results for{' '}
                  <span className="text-fg">"{query}"</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-fg-muted/35 mt-xs">
                  Try a different keyword or clear filters
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && filteredResults.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-[0.1em] text-fg-muted/35 mb-md">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                  {semantic && (
                    <span className="ml-sm text-accent/70"> · AI ranked</span>
                  )}
                </p>
                <ul>
                  {filteredResults.map((result, i) =>
                    ResultItem({ result, index: i, compact: false })
                  )}
                </ul>
              </>
            )}

          </div>
        </div>
      </div>
    )
  }

  // ─── Compact HUD panel ─────────────────────────────────────────────────────
  // Sits below the sticky nav. Background: bg-surface + a radial teal bloom
  // from the top-right corner, giving it a distinct identity from the page
  // canvas. Hollow Syne wordmark header for variable-font character.

  function CompactPanel() {
    return (
      <div
        className="flex flex-col overflow-hidden border-b border-fg/8 shadow-[0_12px_48px_oklch(0%_0_0_/_0.28)]"
        style={{
          maxHeight: '70vh',
          background: 'radial-gradient(ellipse at 88% 0%, oklch(from var(--ot-brand) l c h / 0.16) 0%, transparent 52%), var(--ot-surface)',
        }}
      >

        {/* Header row: hollow Syne wordmark + controls */}
        <div className="flex items-center justify-between px-md pt-[14px] pb-[10px] border-b border-fg/8 shrink-0">
          <span
            className="syne-hollow font-syne font-black select-none leading-none"
            aria-hidden
            style={{
              fontSize:              '1.625rem',
              letterSpacing:         '-0.03em',
              fontVariationSettings: "'wght' 500",
            }}
          >
            SEARCH
          </span>
          <div className="flex items-center gap-[2px]">
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Switch to full search"
              className="p-[7px] text-fg-muted/45 hover:text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-[7px] text-fg-muted/45 hover:text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-sm px-md py-[10px] border-b border-fg/8 shrink-0">
          <Search size={14} className="shrink-0 text-fg-muted/50" aria-hidden />
          <label htmlFor="search-input-compact" className="sr-only">Search query</label>
          <input
            ref={inputRef}
            id="search-input-compact"
            type="search"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search OptiTech..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Search query"
            aria-controls="search-results-compact"
            aria-autocomplete="list"
            className={[
              'flex-1 bg-transparent text-fg placeholder:text-fg-muted/40',
              'text-[15px] font-medium outline-none leading-none py-[2px]',
              '[&::-webkit-search-cancel-button]:hidden',
            ].join(' ')}
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              aria-label="Clear"
              className="shrink-0 p-[5px] text-fg-muted/45 hover:text-fg transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="px-md py-[9px] border-b border-fg/8 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-[6px] min-w-max">
            {TypeFilterButtons({ compact: true })}
          </div>
        </div>

        {/* Topic chips */}
        {showTopics && (
          <div className="px-md py-[8px] border-b border-fg/8 shrink-0">
            {TopicChips({ compact: true })}
          </div>
        )}

        {/* Results */}
        <div
          id="search-results-compact"
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="overflow-y-auto flex-1"
        >
          {loading && (
            <div className="px-md">
              {LoadingDots()}
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="px-md py-sm">
              <div className="flex flex-wrap gap-xs">
                {SUGGESTED_QUERIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleQueryChange(s)}
                    className="px-sm py-[5px] text-[11px] uppercase tracking-[0.08em] font-medium border border-fg/8 text-fg-muted/45 hover:border-brand/35 hover:text-brand/70 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && hasSearched && filteredResults.length === 0 && (
            <p className="px-md py-md text-[14px] font-medium text-fg-muted/60">
              No results for{' '}
              <span className="text-fg font-semibold">"{query}"</span>
            </p>
          )}

          {!loading && filteredResults.length > 0 && (
            <div ref={resultsRef as React.RefObject<HTMLDivElement>}>
              <ul>
                {filteredResults.map((result, i) =>
                  ResultItem({ result, index: i, compact: true })
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Portal ────────────────────────────────────────────────────────────────

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for compact mode */}
          {mode === 'compact' && (
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden
              onClick={closeSearch}
              className="fixed inset-0 z-[48] bg-canvas/65 backdrop-blur-[2px]"
            />
          )}

          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={
              mode === 'immersive'
                ? 'fixed inset-0 z-[60] bg-canvas flex flex-col'
                : 'fixed left-0 right-0 top-20 z-[49] flex flex-col'
            }
          >
            {mode === 'immersive' ? ImmersivePanel() : CompactPanel()}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
