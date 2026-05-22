'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Search, X, Maximize2, Minimize2, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useSearch } from './SearchProvider'
import type { SearchResult } from '@/lib/search'

type DisplayMode = 'immersive' | 'compact'
type TypeFilter  = 'all' | 'Blog' | 'Page'

const DISPLAY_MODE_KEY  = 'ot-search-mode'
const SUGGESTED_QUERIES = ['Product', 'Technology', 'AI', 'Design', 'Platform']

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: 'all',  label: 'All'  },
  { value: 'Blog', label: 'Blog' },
  { value: 'Page', label: 'Page' },
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
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [focusedIdx,  setFocusedIdx]  = useState(-1)
  const [mounted,     setMounted]     = useState(false)

  const inputRef   = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => { setMounted(true) }, [])

  // Persist display mode preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISPLAY_MODE_KEY)
      if (saved === 'compact' || saved === 'immersive') setMode(saved)
    } catch {}
  }, [])

  // Focus input + reset state on open/close
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

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Re-focus input when display mode is toggled while panel is open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, closeSearch])

  const runSearch = useCallback(async (q: string, type: TypeFilter) => {
    if (q.trim().length < 2) { setResults([]); setHasSearched(false); return }
    setLoading(true)
    setHasSearched(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=${type}`)
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
    debounceRef.current = setTimeout(() => runSearch(value, typeFilter), 300)
  }

  const handleTypeFilter = (t: TypeFilter) => {
    if (t === typeFilter) return
    setTypeFilter(t)
    setTopicFilter(null)
    if (query.trim().length >= 2) runSearch(query, t)
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

  // Arrow-key navigation across input → result items
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

  // Derived state
  const availableTopics = Array.from(new Set(
    results.filter(r => r.type === 'Blog' && r.topic).map(r => r.topic!)
  ))
  const showTopics = (typeFilter === 'all' || typeFilter === 'Blog') && availableTopics.length > 0

  const filteredResults = topicFilter
    ? results.filter(r => r.type !== 'Blog' || r.topic === topicFilter)
    : results

  // Animation config — respects prefers-reduced-motion
  const dur = (ms: number) => prefersReducedMotion ? 0 : ms / 1000

  const panelVariants = {
    hidden:  { y: '-100%' },
    visible: { y: 0,       transition: { duration: dur(400), ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { y: '-100%', transition: { duration: dur(260), ease: [0.4, 0, 0.2, 1]  as const } },
  }

  const overlayVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur(220) } },
    exit:    { opacity: 0, transition: { duration: dur(160) } },
  }

  if (!mounted) return null

  // ─── Shared filter bar ─────────────────────────────────────────────────────

  function FilterBar({ onBrand }: { onBrand: boolean }) {
    const chipBase   = 'px-sm py-xs text-label uppercase tracking-label transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2'
    const chipActive = onBrand
      ? 'bg-fg-on-brand text-canvas focus-visible:outline-fg-on-brand'
      : 'bg-brand text-fg-on-brand focus-visible:outline-brand'
    const chipIdle = onBrand
      ? 'border border-fg-on-brand/30 text-fg-on-brand/70 hover:border-fg-on-brand/60 hover:text-fg-on-brand focus-visible:outline-fg-on-brand/60'
      : 'border border-fg/20 text-fg-muted hover:border-fg/40 hover:text-fg focus-visible:outline-brand'
    const topicActive = onBrand
      ? 'bg-fg-on-brand text-canvas focus-visible:outline-fg-on-brand'
      : 'bg-brand text-fg-on-brand focus-visible:outline-brand'
    const topicIdle = onBrand
      ? 'border border-fg-on-brand/20 text-fg-on-brand/55 hover:border-fg-on-brand/50 hover:text-fg-on-brand focus-visible:outline-fg-on-brand/50'
      : 'border border-fg/15 text-fg-muted/70 hover:border-fg/30 hover:text-fg focus-visible:outline-brand'

    return (
      <div className="flex flex-wrap items-center gap-xs">
        {TYPE_CHIPS.map(chip => (
          <button
            key={chip.value}
            type="button"
            onClick={() => handleTypeFilter(chip.value)}
            aria-pressed={typeFilter === chip.value}
            className={`${chipBase} ${typeFilter === chip.value ? chipActive : chipIdle}`}
          >
            {chip.label}
          </button>
        ))}

        {showTopics && (
          <>
            <span aria-hidden="true" className={`text-label ${onBrand ? 'text-fg-on-brand/25' : 'text-fg/20'} px-xs`}>|</span>
            {availableTopics.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setTopicFilter(topicFilter === topic ? null : topic)}
                aria-pressed={topicFilter === topic}
                className={`${chipBase} ${topicFilter === topic ? topicActive : topicIdle}`}
              >
                {topic}
              </button>
            ))}
          </>
        )}
      </div>
    )
  }

  // ─── Result item ───────────────────────────────────────────────────────────

  function ResultItem({ result, index, onBrand }: { result: SearchResult; index: number; onBrand: boolean }) {
    const date  = formatDate(result.published)
    const isFocused = focusedIdx === index

    if (onBrand) {
      return (
        <li key={result.id}>
          <button
            data-result-item
            tabIndex={isFocused ? 0 : -1}
            type="button"
            onClick={() => handleResultClick(result.url)}
            className={[
              'group w-full text-left px-0 py-sm border-t border-fg-on-brand/15',
              'flex items-start gap-sm',
              'hover:bg-brand-hover/25 focus-visible:outline-none focus-visible:bg-brand-hover/35',
              'transition-colors duration-100',
              isFocused ? 'bg-brand-hover/35' : '',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className="shrink-0 mt-[3px] text-fg-on-brand/35 group-hover:text-fg-on-brand/80 group-focus-visible:text-fg-on-brand/80 transition-colors duration-150 font-mono text-sm"
            >
              →
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-title font-semibold text-fg-on-brand leading-tight">
                {result.title}
              </span>
              <span className="flex items-center gap-xs mt-xs flex-wrap">
                <span className="text-label uppercase tracking-label text-fg-on-brand/55">{result.type}</span>
                {result.topic && (
                  <>
                    <span aria-hidden="true" className="text-fg-on-brand/25 text-label">·</span>
                    <span className="text-label uppercase tracking-label text-fg-on-brand/55">{result.topic}</span>
                  </>
                )}
                {date && (
                  <>
                    <span aria-hidden="true" className="text-fg-on-brand/25 text-label">—</span>
                    <span className="text-label text-fg-on-brand/40">{date}</span>
                  </>
                )}
              </span>
            </span>
          </button>
        </li>
      )
    }

    // Compact variant
    return (
      <li key={result.id}>
        <button
          data-result-item
          tabIndex={isFocused ? 0 : -1}
          type="button"
          onClick={() => handleResultClick(result.url)}
          className={[
            'group w-full text-left px-md py-sm border-b border-fg/5',
            'flex items-center gap-sm',
            'hover:bg-fg/5 focus-visible:outline-none focus-visible:bg-fg/5',
            'transition-colors duration-100',
            isFocused ? 'bg-fg/5' : '',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className="shrink-0 text-fg-muted/40 group-hover:text-brand group-focus-visible:text-brand transition-colors duration-150 font-mono text-xs"
          >
            →
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-fg truncate leading-snug">{result.title}</span>
          </span>
          <span className="flex items-center gap-xs shrink-0">
            <span className="text-label uppercase tracking-label text-fg-muted">{result.type}</span>
            {result.topic && (
              <span className="text-label text-fg-muted hidden sm:block">· {result.topic}</span>
            )}
            {date && (
              <span className="text-label text-fg-muted/50 hidden md:block">{date}</span>
            )}
          </span>
        </button>
      </li>
    )
  }

  // ─── Immersive panel content ───────────────────────────────────────────────

  function ImmersivePanel() {
    return (
      <div className="flex flex-col h-full overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-md pt-md lg:px-xl shrink-0">
          <span className="text-label uppercase tracking-label text-fg-on-brand/50 select-none">
            OptiTech
          </span>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Switch to compact mode"
              className="p-sm text-fg-on-brand/50 hover:text-fg-on-brand transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-fg-on-brand/60 focus-visible:outline-offset-2"
            >
              <Minimize2 size={15} />
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-sm text-fg-on-brand/50 hover:text-fg-on-brand transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-fg-on-brand/60 focus-visible:outline-offset-2"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* SEARCH hollow display text */}
        <div className="px-md lg:px-xl pt-xs pb-0 shrink-0 leading-none select-none" aria-hidden="true">
          <span
            className="font-syne"
            style={{
              fontSize:           'clamp(3rem, 10vw, 8rem)',
              fontWeight:         450,
              lineHeight:         0.88,
              letterSpacing:      '-0.04em',
              WebkitTextStroke:   '2px oklch(from var(--ot-fg-on-brand) l c h / 0.30)',
              color:              'transparent',
              display:            'block',
            }}
          >
            SEARCH
          </span>
        </div>

        {/* Search input — underline style on brand */}
        <div className="px-md lg:px-xl pt-md pb-0 shrink-0">
          <div className="relative flex items-center border-b-2 border-fg-on-brand/25 focus-within:border-fg-on-brand/70 transition-colors duration-200">
            <Search size={20} className="shrink-0 text-fg-on-brand/45 mr-sm" aria-hidden="true" />
            <input
              ref={inputRef}
              id="search-input"
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
                'flex-1 bg-transparent',
                'text-title font-normal text-fg-on-brand py-sm outline-none',
                'placeholder:text-fg-on-brand/35',
                '[&::-webkit-search-cancel-button]:hidden',
              ].join(' ')}
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                aria-label="Clear search"
                className="shrink-0 p-xs text-fg-on-brand/45 hover:text-fg-on-brand transition-colors duration-150"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-md lg:px-xl py-sm shrink-0">
          <button
            type="button"
            onClick={() => setFiltersOpen(v => !v)}
            aria-expanded={filtersOpen}
            className="flex items-center gap-xs text-label uppercase tracking-label text-fg-on-brand/50 hover:text-fg-on-brand/80 transition-colors mb-sm focus-visible:outline-2 focus-visible:outline-fg-on-brand/50 focus-visible:outline-offset-2"
          >
            <SlidersHorizontal size={11} aria-hidden="true" />
            Filters
            <ChevronDown
              size={11}
              aria-hidden="true"
              className={`transition-transform duration-200 ease-quick ${filtersOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {filtersOpen && FilterBar({ onBrand: true })}
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          id="search-results"
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="flex-1 overflow-y-auto px-md lg:px-xl pb-xl"
        >
          {/* Loading */}
          {loading && (
            <div className="py-md flex items-center gap-sm" aria-label="Searching">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block w-2 h-2 bg-fg-on-brand/50 motion-safe:animate-pulse"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          )}

          {/* Empty prompt */}
          {!loading && !hasSearched && (
            <div className="py-md">
              <p className="text-label uppercase tracking-label text-fg-on-brand/40 mb-sm">
                Suggested
              </p>
              <div className="flex flex-wrap gap-xs">
                {SUGGESTED_QUERIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleQueryChange(s)}
                    className="px-sm py-xs text-label uppercase tracking-label border border-fg-on-brand/20 text-fg-on-brand/45 hover:border-fg-on-brand/50 hover:text-fg-on-brand/80 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-fg-on-brand/50 focus-visible:outline-offset-2"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && filteredResults.length === 0 && (
            <div className="py-md">
              <p className="text-title font-semibold text-fg-on-brand/55">
                No results for{' '}
                <span className="text-fg-on-brand">"{query}"</span>
              </p>
              <p className="text-label uppercase tracking-label text-fg-on-brand/35 mt-xs">
                Try different keywords or remove filters
              </p>
            </div>
          )}

          {/* Results list */}
          {!loading && filteredResults.length > 0 && (
            <>
              <p className="text-label uppercase tracking-label text-fg-on-brand/45 pb-sm">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </p>
              <ul>
                {filteredResults.map((result, i) => ResultItem({ result, index: i, onBrand: true }))}
              </ul>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── Compact panel content ─────────────────────────────────────────────────

  function CompactPanel() {
    return (
      <div className="flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>

        {/* Input row */}
        <div className="flex items-center gap-sm px-md py-sm border-b border-fg/10 shrink-0">
          <Search size={15} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search OptiTech..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Search query"
            aria-controls="search-results"
            aria-autocomplete="list"
            className={[
              'flex-1 bg-transparent text-fg placeholder:text-fg-muted/60',
              'text-body outline-none leading-none py-[2px]',
              '[&::-webkit-search-cancel-button]:hidden',
            ].join(' ')}
          />
          <div className="flex items-center gap-xs shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                aria-label="Clear"
                className="p-xs text-fg-muted hover:text-fg transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Switch to immersive mode"
              className="p-xs text-fg-muted hover:text-fg transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-xs text-fg-muted hover:text-fg transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="px-md py-xs border-b border-fg/5 shrink-0">
          <div className="flex items-center gap-xs flex-wrap">
            <button
              type="button"
              onClick={() => setFiltersOpen(v => !v)}
              aria-expanded={filtersOpen}
              className="flex items-center gap-xs text-label uppercase tracking-label text-fg-muted/70 hover:text-fg-muted transition-colors mr-xs focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <SlidersHorizontal size={10} aria-hidden="true" />
              <ChevronDown
                size={10}
                aria-hidden="true"
                className={`transition-transform duration-200 ease-quick ${filtersOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {filtersOpen && FilterBar({ onBrand: false })}
          </div>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          id="search-results"
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="overflow-y-auto flex-1"
        >
          {/* Loading */}
          {loading && (
            <div className="px-md py-sm flex items-center gap-xs" aria-label="Searching">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 bg-brand/60 motion-safe:animate-pulse"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          )}

          {/* Empty prompt */}
          {!loading && !hasSearched && (
            <div className="px-md py-sm flex flex-wrap gap-xs items-center">
              <span className="text-label uppercase tracking-label text-fg-muted/50 mr-xs">Try:</span>
              {SUGGESTED_QUERIES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleQueryChange(s)}
                  className="px-sm py-[3px] text-label uppercase tracking-label border border-fg/10 text-fg-muted/60 hover:border-fg/30 hover:text-fg-muted transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && filteredResults.length === 0 && (
            <p className="px-md py-sm text-sm text-fg-muted">
              No results for <span className="text-fg">"{query}"</span>
            </p>
          )}

          {/* Results list */}
          {!loading && filteredResults.length > 0 && (
            <ul>
              {filteredResults.map((result, i) => ResultItem({ result, index: i, onBrand: false }))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  // ─── Portal output ─────────────────────────────────────────────────────────

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Compact backdrop — dims page behind the HUD panel */}
          {mode === 'compact' && (
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
              onClick={closeSearch}
              className="fixed inset-0 z-[48] bg-canvas/55"
            />
          )}

          {/* Search panel */}
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
                // Full-screen teal flood — above nav (z-60)
                ? 'fixed inset-0 z-[60] bg-brand flex flex-col'
                // HUD panel below nav — nav (z-50) visually covers the drop animation
                : 'fixed left-0 right-0 top-20 z-[49] bg-glass flex flex-col'
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
