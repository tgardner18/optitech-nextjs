'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Search, X, Maximize2, Minimize2,
  FileText, Newspaper, LayoutGrid, Sparkles, Hash, List, SlidersHorizontal,
  CalendarDays, MapPin, Video, ExternalLink,
} from 'lucide-react'
import { useSearch } from './SearchProvider'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { SearchResult } from '@/lib/search'
import { formatEventDate, eventTypeLabel } from '@/lib/eventFormat'

type DisplayMode = 'immersive' | 'compact'
type TypeFilter  = 'all' | 'Blog' | 'Page' | 'Event'
type ViewMode    = 'list' | 'card'

const DISPLAY_MODE_KEY = 'ot-search-mode'

const TYPE_FILTERS: { value: TypeFilter; label: string; Icon: typeof LayoutGrid }[] = [
  { value: 'all',   label: 'All',    Icon: LayoutGrid   },
  { value: 'Blog',  label: 'Blog',   Icon: Newspaper    },
  { value: 'Page',  label: 'Page',   Icon: FileText     },
  { value: 'Event', label: 'Events', Icon: CalendarDays },
]

function isCrossOriginUrl(url: string): boolean {
  if (!url.startsWith('http')) return false
  try { return new URL(url).origin !== window.location.origin }
  catch { return false }
}

function getHostLabel(url: string): string | null {
  try { return new URL(url).hostname }
  catch { return null }
}

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
  const { t } = useTranslation()

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
  const [flashFilter, setFlashFilter] = useState<TypeFilter | null>(null)
  const [viewMode,    setViewMode]    = useState<ViewMode>('list')

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
      const tid = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(tid)
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
      const tid = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(tid)
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

  const handleTypeFilter = (f: TypeFilter) => {
    if (f === typeFilter) return
    setTypeFilter(f)
    setTopicFilter(null)
    setFlashFilter(f)
    setTimeout(() => setFlashFilter(null), 350)
    if (query.trim().length >= 2) runSearch(query, f, semantic)
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

  const handleResultClick = useCallback((result: SearchResult) => {
    if (result._track) {
      // Fire-and-forget beacon — keepalive ensures it survives the navigation.
      // mode: no-cors because the tracking endpoint is cross-origin and needs no response.
      fetch(result._track, { method: 'GET', mode: 'no-cors', keepalive: true }).catch(() => {})
    }
    // Cross-site results (absolute URLs to a different origin) open in a new tab
    // so the user stays on the current site. Next.js router.push treats an external
    // absolute URL as a same-app route, stripping the domain.
    if (isCrossOriginUrl(result.url)) {
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(result.url)
    }
    closeSearch()
  }, [router, closeSearch])

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
  const eventCount = results.filter(r => r.type === 'Event').length
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

  // ─── Type filter pills ─────────────────────────────────────────────────────
  // Rounded pill selectors — filled active state, neutral inactive.
  // Both modes share the same component; compact adjusts size.

  function TypeFilterPills({ compact: isCompact }: { compact: boolean }) {
    const countFor = (f: TypeFilter) => {
      if (f === 'all')   return allCount
      if (f === 'Blog')  return blogCount
      if (f === 'Event') return eventCount
      return pageCount
    }

    return (
      <div
        className={`flex items-center flex-wrap ${isCompact ? 'gap-[5px]' : 'gap-xs'}`}
        role="group"
        aria-label={t('search.contentTypeFilter')}
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
              animate={isNew && !prefersReducedMotion ? { scale: [1, 0.92, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
              className={[
                'flex items-center gap-[5px] rounded-full transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
                isCompact
                  ? 'px-[10px] py-[5px] text-[10px]'
                  : 'px-[14px] py-[8px] text-[12px]',
                isActive
                  ? 'bg-brand text-fg-on-brand shadow-[0_2px_10px_var(--ot-bloom-brand-faint)]'
                  : 'border border-fg/18 text-fg-muted hover:border-brand/40 hover:text-fg hover:bg-brand/5',
              ].join(' ')}
            >
              <f.Icon size={isCompact ? 10 : 12} className="shrink-0" />
              <span className="font-semibold uppercase tracking-[0.07em]">{f.label}</span>
              {hasSearched && count > 0 && (
                <span className={[
                  'font-bold tabular-nums',
                  isCompact ? 'text-[9px]' : 'text-[10px]',
                  isActive ? 'text-fg-on-brand/80' : 'text-fg-muted/40',
                ].join(' ')}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Semantic / AI toggle */}
        <motion.button
          type="button"
          onClick={handleSemanticToggle}
          aria-pressed={semantic}
          whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
          title={semantic ? t('search.semanticOn') : t('search.semanticOff')}
          className={[
            'flex items-center gap-[5px] rounded-full transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
            isCompact ? 'px-[10px] py-[5px] text-[10px]' : 'px-[14px] py-[8px] text-[12px]',
            semantic
              ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
              : 'bg-fg/7 text-fg-muted/50 hover:bg-fg/12 hover:text-fg',
          ].join(' ')}
        >
          <Sparkles size={isCompact ? 10 : 12} className="shrink-0" />
          <span className="font-semibold uppercase tracking-[0.07em]">AI</span>
        </motion.button>
      </div>
    )
  }

  // ─── Topic chips ───────────────────────────────────────────────────────────

  function TopicChips({ compact: isCompact }: { compact: boolean }) {
    if (!showTopics) return null
    return (
      <div className={`flex flex-wrap items-center gap-xs ${isCompact ? '' : 'mt-xs'}`}>
        <span className="flex items-center gap-[4px] text-[10px] uppercase tracking-[0.11em] font-bold text-fg-muted/50 shrink-0 mr-[2px] select-none">
          <Hash size={10} aria-hidden />
          {!isCompact && 'Topics'}
        </span>
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
                isCompact ? 'px-[9px] py-[4px] text-[10px]' : 'px-sm py-[5px] text-[11px]',
                'uppercase tracking-[0.08em] font-semibold rounded-full transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
                isActive
                  ? 'bg-brand/15 ring-1 ring-brand/30 text-brand'
                  : 'border border-fg/15 text-fg-muted/75 hover:border-fg/30 hover:text-fg-muted hover:bg-fg/8',
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
            {t('search.clearFilter')}
          </button>
        )}
      </div>
    )
  }


  // ─── Loading dots ──────────────────────────────────────────────────────────

  function LoadingDots() {
    return (
      <div className="flex items-center gap-xs py-lg" aria-label={t('search.searching')}>
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

  // ─── Result item — list row ────────────────────────────────────────────────

  function ResultItem({ result, index, compact: isCompact }: {
    result:  SearchResult
    index:   number
    compact: boolean
  }) {
    const isEvent      = result.type === 'Event'
    const eventDate    = isEvent ? formatEventDate(result.startDate, result.endDate) : null
    const date         = isEvent ? eventDate : formatDate(result.published)
    const isFocused    = focusedIdx === index
    const hasThumbnail = !!result.imageUrl
    const crossOrigin  = mounted && isCrossOriginUrl(result.url)
    const hostLabel    = crossOrigin ? getHostLabel(result.url) : null

    const thumbSize = isCompact ? 'w-[48px] h-[48px]' : 'w-[68px] h-[68px]'

    return (
      <li key={result.id}>
        <button
          data-result-item
          tabIndex={isFocused ? 0 : -1}
          type="button"
          onClick={() => handleResultClick(result)}
          className={[
            'group w-full text-left flex items-start gap-md rounded-ot-surface',
            isCompact ? 'px-md py-[12px]' : 'py-[18px]',
            'border-b border-fg/8 last:border-0',
            'hover:bg-brand/5 focus-visible:outline-none focus-visible:bg-brand/5',
            'transition-colors duration-100',
            isFocused ? 'bg-brand/5' : '',
          ].join(' ')}
        >
          {/* Thumbnail */}
          <div className={`shrink-0 ${thumbSize} overflow-hidden rounded-ot-surface bg-surface/60 flex items-center justify-center mt-0.75`}>
            {hasThumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl!}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : isEvent ? (
              <CalendarDays size={isCompact ? 15 : 18} className="text-accent/40" />
            ) : result.type === 'Blog' ? (
              <Newspaper size={isCompact ? 15 : 18} className="text-fg-muted/25" />
            ) : (
              <FileText  size={isCompact ? 15 : 18} className="text-fg-muted/25" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[6px] flex-wrap mb-[5px]">
              <span className={`text-[10px] uppercase tracking-[0.1em] font-bold ${isEvent ? 'text-accent' : result.type === 'Blog' ? 'text-brand' : 'text-fg-muted/60'}`}>
                {result.type}
              </span>
              {isEvent && result.eventType && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-fg-muted/55">
                    {eventTypeLabel(result.eventType)}
                  </span>
                </>
              )}
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
                  <span className={`text-[10px] ${isEvent ? 'text-fg-muted font-semibold inline-flex items-center gap-0.75' : 'text-fg-muted/40'}`}>
                    {isEvent && <CalendarDays size={11} strokeWidth={2} aria-hidden />}
                    {date}
                  </span>
                </>
              )}
              {hostLabel && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="inline-flex items-center gap-0.75 text-[10px] font-semibold text-fg-muted/50">
                    <ExternalLink size={9} aria-hidden />
                    {hostLabel}
                  </span>
                </>
              )}
            </div>

            <p className={[
              'font-semibold text-fg leading-snug line-clamp-2',
              'group-hover:text-brand group-focus-visible:text-brand transition-colors duration-150',
              isCompact ? 'text-[14px]' : 'text-[19px]',
            ].join(' ')}>
              {result.title}
            </p>

            {isEvent && result.locationLabel && (
              <p className={`mt-[4px] inline-flex items-center gap-[5px] font-medium text-fg-muted ${isCompact ? 'text-[12px]' : 'text-[13px]'}`}>
                {result.locationType === 'virtual'
                  ? <Video size={13} strokeWidth={2} className="text-fg-muted/70 shrink-0" aria-hidden />
                  : <MapPin size={13} strokeWidth={2} className="text-fg-muted/70 shrink-0" aria-hidden />}
                {result.locationLabel}
              </p>
            )}

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

  // ─── Result card — card grid view (immersive only) ─────────────────────────

  function ResultCard({ result, index }: { result: SearchResult; index: number }) {
    const isEvent    = result.type === 'Event'
    const date       = isEvent ? formatEventDate(result.startDate, result.endDate) : formatDate(result.published)
    const isFocused  = focusedIdx === index
    const crossOrigin = mounted && isCrossOriginUrl(result.url)
    const hostLabel   = crossOrigin ? getHostLabel(result.url) : null

    return (
      <li>
        <button
          data-result-item
          tabIndex={isFocused ? 0 : -1}
          type="button"
          onClick={() => handleResultClick(result)}
          className={[
            'group w-full text-left overflow-hidden rounded-ot-surface',
            'border border-fg/8',
            'hover:border-brand/30 hover:shadow-[0_4px_24px_var(--ot-bloom-brand-faint)]',
            'focus-visible:outline-none focus-visible:border-brand/40',
            'transition-all duration-200',
            isFocused ? 'border-brand/30 shadow-[0_4px_24px_var(--ot-bloom-brand-faint)]' : '',
          ].join(' ')}
        >
          {/* Thumbnail */}
          <div className="aspect-video w-full overflow-hidden bg-surface/60 flex items-center justify-center">
            {result.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isEvent
                  ? <CalendarDays size={28} className="text-accent/25" />
                  : result.type === 'Blog'
                    ? <Newspaper size={28} className="text-fg-muted/18" />
                    : <FileText  size={28} className="text-fg-muted/18" />}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-md pt-md pb-lg">
            <div className="flex items-center gap-[6px] flex-wrap mb-[6px]">
              <span className={`text-[10px] uppercase tracking-[0.1em] font-bold ${isEvent ? 'text-accent' : result.type === 'Blog' ? 'text-brand' : 'text-fg-muted/60'}`}>
                {result.type}
              </span>
              {isEvent && result.eventType && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-fg-muted/55">
                    {eventTypeLabel(result.eventType)}
                  </span>
                </>
              )}
              {result.topic && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-fg-muted/55">
                    {result.topic}
                  </span>
                </>
              )}
              {hostLabel && (
                <>
                  <span className="text-fg/15">·</span>
                  <span className="inline-flex items-center gap-0.75 text-[10px] font-semibold text-fg-muted/50">
                    <ExternalLink size={9} aria-hidden />
                    {hostLabel}
                  </span>
                </>
              )}
            </div>
            <p className={[
              'font-semibold text-fg leading-snug line-clamp-3 text-[17px]',
              'group-hover:text-brand group-focus-visible:text-brand transition-colors duration-150',
            ].join(' ')}>
              {result.title}
            </p>
            {/* Event date + location carry as much weight as the title */}
            {isEvent && (date || result.locationLabel) && (
              <div className="mt-sm flex flex-col gap-[3px]">
                {date && (
                  <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-fg-muted">
                    <CalendarDays size={13} strokeWidth={2} className="text-brand shrink-0" aria-hidden />
                    {date}
                  </span>
                )}
                {result.locationLabel && (
                  <span className="inline-flex items-center gap-[5px] text-[12px] text-fg-muted">
                    {result.locationType === 'virtual'
                      ? <Video size={13} strokeWidth={2} className="text-fg-muted/70 shrink-0" aria-hidden />
                      : <MapPin size={13} strokeWidth={2} className="text-fg-muted/70 shrink-0" aria-hidden />}
                    {result.locationLabel}
                  </span>
                )}
              </div>
            )}
            {result.excerpt && (
              <p className="text-fg-muted text-[13px] leading-relaxed mt-[6px] line-clamp-2">
                {result.excerpt}
              </p>
            )}
            {!isEvent && date && <p className="text-[10px] text-fg-muted/40 mt-sm">{date}</p>}
          </div>
        </button>
      </li>
    )
  }

  // ─── Immersive panel ───────────────────────────────────────────────────────

  function ImmersivePanel() {
    const resultCount = filteredResults.length
    const countLabel  = resultCount !== 1
      ? t('search.results', { count: String(resultCount) })
      : t('search.result')

    return (
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          background: [
            'radial-gradient(ellipse 145% 58% at 50% -4%, oklch(from var(--ot-brand) l c h / 0.38) 0%, transparent 66%)',
            'var(--ot-canvas)',
          ].join(', '),
        }}
      >

        {/* Top bar — controls only, no search wordmark */}
        <div className="flex items-center justify-end px-md lg:px-2xl py-2.5 shrink-0 gap-xs">
          <button
            type="button"
            onClick={toggleMode}
            aria-label={t('search.compact')}
            className="flex items-center gap-1.25 px-sm h-9 rounded-ot-control bg-brand text-fg-on-brand hover:opacity-90 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            <Minimize2 size={16} />
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold hidden sm:inline">Compact</span>
          </button>
          <button
            type="button"
            onClick={closeSearch}
            aria-label={t('search.close')}
            className="flex items-center justify-center w-9 h-9 text-fg-muted/60 hover:text-fg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={resultsRef as React.RefObject<HTMLDivElement>}
          id="search-results"
          role="region"
          aria-label={t('search.searchResults')}
          aria-live="polite"
          className="flex-1 overflow-y-auto"
        >
          <div className="px-md lg:px-2xl xl:px-[8vw] pt-lg pb-2xl">

            {/* /SEARCH wordmark */}
            <div className="mb-lg select-none" aria-hidden>
              <span
                className="font-display block leading-none"
                style={{
                  fontSize:              'clamp(4rem, 9vw, 9rem)',
                  letterSpacing:         '-0.045em',
                  fontVariationSettings: "'wght' 500",
                }}
              >
                <span className="text-brand">/</span><span className="text-fg">SEARCH</span>
              </span>
            </div>

            {/* Search input */}
            <label htmlFor="search-input-immersive" className="sr-only">{t('search.inputLabel')}</label>
            <div className="relative flex items-center border-b-2 border-fg/15 focus-within:border-brand transition-colors duration-200 mb-lg">
              <Search size={18} className="shrink-0 text-fg-muted/40 mr-sm" aria-hidden />
              <input
                ref={inputRef}
                id="search-input-immersive"
                type="search"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('search.placeholder')}
                autoComplete="off"
                spellCheck={false}
                aria-label={t('search.inputLabel')}
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
                  aria-label={t('search.clearFilter')}
                  className="shrink-0 p-xs text-fg-muted/40 hover:text-fg transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter section */}
            <div className="mb-md">
              <div className="flex items-center gap-[5px] mb-[10px]">
                <SlidersHorizontal size={11} className="text-fg-muted/50" strokeWidth={2} aria-hidden />
                <span className="text-[10px] uppercase tracking-[0.13em] font-bold text-fg-muted/50 select-none">
                  Refine by
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-sm justify-between">
                {TypeFilterPills({ compact: false })}

              {/* List / card view toggle */}
              <div className="flex items-center gap-[2px] ml-auto" role="group" aria-label="View mode">
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={[
                    'p-[7px] rounded-full transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1',
                    viewMode === 'list'
                      ? 'text-brand bg-brand/10'
                      : 'text-fg-muted/40 hover:text-fg-muted hover:bg-fg/6',
                  ].join(' ')}
                >
                  <List size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label="Card view"
                  aria-pressed={viewMode === 'card'}
                  onClick={() => setViewMode('card')}
                  className={[
                    'p-[7px] rounded-full transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1',
                    viewMode === 'card'
                      ? 'text-brand bg-brand/10'
                      : 'text-fg-muted/40 hover:text-fg-muted hover:bg-fg/6',
                  ].join(' ')}
                >
                  <LayoutGrid size={16} strokeWidth={1.75} />
                </button>
              </div>
              </div>
            </div>

            {/* Topic chips */}
            {showTopics && (
              <div className="mb-md">
                {TopicChips({ compact: false })}
              </div>
            )}


            {/* Loading */}
            {loading && LoadingDots()}

            {/* No results */}
            {!loading && hasSearched && filteredResults.length === 0 && (
              <div className="py-md">
                <p className="text-[1.25rem] font-semibold text-fg/60">
                  {t('search.noResults', { query })}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-fg-muted/35 mt-xs">
                  {t('search.noResultsHint')}
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && filteredResults.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-[0.1em] text-fg-muted/35 mb-md">
                  {countLabel}
                  {semantic && (
                    <span className="ml-sm text-accent/70"> · {t('search.aiRanked')}</span>
                  )}
                </p>
                {viewMode === 'list' ? (
                  <ul>
                    {filteredResults.map((result, i) =>
                      ResultItem({ result, index: i, compact: false })
                    )}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                    {filteredResults.map((result, i) =>
                      ResultCard({ result, index: i })
                    )}
                  </ul>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    )
  }

  // ─── Compact HUD panel ─────────────────────────────────────────────────────

  function CompactPanel() {
    return (
      <div
        className="flex flex-col overflow-hidden border-b border-fg/8 shadow-[0_12px_48px_oklch(0%_0_0_/_0.28)]"
        style={{
          maxHeight: '70vh',
          background: 'radial-gradient(ellipse at 88% 0%, oklch(from var(--ot-brand) l c h / 0.16) 0%, transparent 52%), var(--ot-surface)',
        }}
      >

        {/* Header row — brand bar indicator replaces hollow wordmark */}
        <div className="flex items-center justify-between px-md pt-[14px] pb-[10px] border-b border-fg/8 shrink-0">
          <div className="flex items-center gap-[8px]" aria-hidden>
            <span className="block w-[3px] h-[16px] bg-brand rounded-full" />
            <span className="text-[11px] uppercase tracking-[0.13em] font-bold text-fg-muted/45 select-none">
              SEARCH
            </span>
          </div>
          <div className="flex items-center gap-[2px]">
            <button
              type="button"
              onClick={toggleMode}
              aria-label={t('search.expand')}
              className="p-[7px] text-fg-muted/45 hover:text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label={t('search.close')}
              className="p-[7px] text-fg-muted/45 hover:text-fg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Input area — visually boxed so it reads as a text field, not a label row */}
        <div className="px-md pt-[8px] pb-[10px] border-b border-fg/8 shrink-0">
          <label htmlFor="search-input-compact" className="sr-only">{t('search.inputLabel')}</label>
          <div className="flex items-center gap-[8px] rounded-ot-control border border-fg/18 bg-fg/5 focus-within:border-brand/55 focus-within:bg-brand/5 px-2.5 py-2.25 transition-colors duration-150">
            <Search size={14} className="shrink-0 text-fg-muted/45" aria-hidden />
            <input
              ref={inputRef}
              id="search-input-compact"
              type="search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholderCompact')}
              autoComplete="off"
              spellCheck={false}
              aria-label={t('search.inputLabel')}
              aria-controls="search-results-compact"
              aria-autocomplete="list"
              className={[
                'flex-1 bg-transparent text-fg placeholder:text-fg-muted/35',
                'text-[14px] font-medium outline-none leading-none',
                '[&::-webkit-search-cancel-button]:hidden',
              ].join(' ')}
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                aria-label={t('search.clearFilter')}
                className="shrink-0 p-[3px] text-fg-muted/40 hover:text-fg transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Filter row — compact pills */}
        <div className="px-md py-[9px] border-b border-fg/8 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-[5px] min-w-max">
            {TypeFilterPills({ compact: true })}
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
          aria-label={t('search.searchResults')}
          aria-live="polite"
          className="overflow-y-auto flex-1"
        >
          {loading && (
            <div className="px-md">
              {LoadingDots()}
            </div>
          )}


          {!loading && hasSearched && filteredResults.length === 0 && (
            <p className="px-md py-md text-[14px] font-medium text-fg-muted/60">
              {t('search.noResults', { query })}
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
            aria-label={t('search.siteSearch')}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={
              mode === 'immersive'
                ? 'fixed inset-0 z-[60] bg-canvas flex flex-col'
                : 'search-compact-panel fixed left-0 right-0 top-20 z-[49] flex flex-col'
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
