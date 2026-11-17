'use client'

import { useEffect, useId, useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Search, X, Maximize2, Minimize2, Check, ChevronDown,
  FileText, Newspaper, LayoutGrid, Sparkles, List, SlidersHorizontal, Tag,
  CalendarDays, MapPin, Video, ExternalLink, Code2, ShoppingBag, ArrowRight,
} from 'lucide-react'
import { useSearch } from './SearchProvider'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useCommerce } from '@/components/commerce/CommerceProvider'
import { trackSearch } from '@/lib/commerce/track'
import type { SearchResult, AutocompleteSuggestion, AutocompleteType } from '@/lib/search'
import { formatEventDate, eventTypeLabel } from '@/lib/eventFormat'
import Button from '@/components/ui/Button'

type DisplayMode = 'immersive' | 'compact'
type TypeFilter  = 'all' | 'Product' | 'Blog' | 'Page' | 'Event'
type ViewMode    = 'list' | 'card'

const DISPLAY_MODE_KEY = 'ot-search-mode'

const TYPE_FILTERS: { value: TypeFilter; label: string; Icon: typeof LayoutGrid }[] = [
  { value: 'all',   label: 'All',    Icon: LayoutGrid   },
  { value: 'Product', label: 'Products', Icon: ShoppingBag },
  { value: 'Blog',  label: 'Blog',   Icon: Newspaper    },
  { value: 'Page',  label: 'Page',   Icon: FileText     },
  { value: 'Event', label: 'Events', Icon: CalendarDays },
]

// Suggestion group order + icon/label, reusing the same vocabulary as
// TYPE_FILTERS above so the typeahead groups read identically to the filter drawer.
const SUGGESTION_GROUP_ORDER: AutocompleteType[] = ['Product', 'Blog', 'Event', 'Page']
const SUGGESTION_GROUP_META: Record<AutocompleteType, { label: string; Icon: typeof LayoutGrid }> = {
  Product: { label: 'Products', Icon: ShoppingBag  },
  Blog:    { label: 'Blog',     Icon: Newspaper    },
  Event:   { label: 'Events',   Icon: CalendarDays },
  Page:    { label: 'Pages',    Icon: FileText     },
}

function groupSuggestions(items: AutocompleteSuggestion[]) {
  const buckets = new Map<AutocompleteType, AutocompleteSuggestion[]>()
  for (const item of items) {
    if (!buckets.has(item.type)) buckets.set(item.type, [])
    buckets.get(item.type)!.push(item)
  }
  return SUGGESTION_GROUP_ORDER
    .filter(type => buckets.has(type))
    .map(type => ({ type, items: buckets.get(type)! }))
}

// Bolds every case-insensitive occurrence of `query` within `text` — the
// typed term stands out inside each suggestion, not just at the start of it.
function highlightMatch(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )
}

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
  const { t, locale } = useTranslation()
  // Storefront sites (inside CommerceProvider) also search products and report
  // search events; every other site keeps its existing behaviour.
  const { enabled: storefront } = useCommerce()
  const searchTrackRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [mode,        setMode]        = useState<DisplayMode>('immersive')
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<SearchResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all')
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  // CMS categories: slugs the reader picked, and every tagged page's categories by page key (loaded once a search runs)
  const [catFilter, setCatFilter] = useState<string[]>([])
  const [catMap, setCatMap] = useState<Record<string, { slug: string; name: string; group: string }[]> | null>(null)
  const [mounted,     setMounted]     = useState(false)
  const [semantic,        setSemantic]        = useState(false)
  const [viewMode,        setViewMode]        = useState<ViewMode>('list')
  const [suggestions,     setSuggestions]     = useState<AutocompleteSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSugIdx,   setFocusedSugIdx]   = useState(-1)
  const [showDevPanel,    setShowDevPanel]    = useState(false)
  const [queryCopied,     setQueryCopied]     = useState(false)
  const [filtersOpen,     setFiltersOpen]     = useState(false)
  const [counts,          setCounts]          = useState<Partial<Record<TypeFilter, number>> | null>(null)

  const inputRef           = useRef<HTMLInputElement>(null)
  const resultsRef         = useRef<HTMLElement>(null)
  const debounceRef        = useRef<ReturnType<typeof setTimeout>>(undefined)
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSearchUrlRef   = useRef<string>('')
  const filterTriggerRef   = useRef<HTMLButtonElement>(null)
  const drawerRef          = useRef<HTMLDivElement>(null)
  const displayRef         = useRef<HTMLParagraphElement>(null)
  const filterPanelId      = useId()
  const listboxId          = useId()

  useEffect(() => { setMounted(true) }, [])
  // The filter drawer belongs to the search overlay — closing search should
  // never leave it silently open for next time.
  useEffect(() => { if (!isOpen) setFiltersOpen(false) }, [isOpen])

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
      setHasSearched(false)
      setTypeFilter('all')
      setTopicFilter(null)
      setCatFilter([])
      setSuggestions([])
      setShowSuggestions(false)
      setFocusedSugIdx(-1)
      setShowDevPanel(false)
      setCounts(null)
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (filtersOpen) setFiltersOpen(false)
      else closeSearch()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, closeSearch, filtersOpen])

  // Suggestions dropdown: dismiss on any click outside it, not just on input
  // blur. Blur alone missed the case where focus had already moved onto a
  // suggestion row (arrow-key navigation, or just clicking one of the rows
  // without selecting it) — nothing was listening for that row losing focus,
  // so the panel could outlive the input's own blur handler entirely.
  useEffect(() => {
    if (!showSuggestions) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      // The reopen chevron sits beside the input, not inside it — exempt the
      // whole input row (not just the bare <input>) so clicking that button
      // doesn't register as an "outside" click and immediately undo itself.
      if (target instanceof Element && target.closest('[data-search-input-row]')) return
      if (target instanceof Element && target.closest('[data-suggestions-list]')) return
      setShowSuggestions(false)
      setFocusedSugIdx(-1)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showSuggestions])

  // Suggestions stay open until the visitor closes them (Escape, a pick, blur, or the close
  // button): an auto-close timer cut the list off mid-choice for slow readers and keyboard users.

  // The /SEARCH highlight draws once each time the full view opens (or is switched to).
  useEffect(() => {
    if (!isOpen || mode !== 'immersive') return
    const tid = setTimeout(() => displayRef.current?.setAttribute('data-in', ''), 150)
    return () => clearTimeout(tid)
  }, [isOpen, mode])

  // Move focus into the Refine drawer when it opens; give it back to its trigger when it closes.
  const drawerWasOpen = useRef(false)
  useEffect(() => {
    if (filtersOpen) {
      drawerWasOpen.current = true
      const raf = requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('button')?.focus())
      return () => cancelAnimationFrame(raf)
    }
    if (drawerWasOpen.current) { drawerWasOpen.current = false; filterTriggerRef.current?.focus() }
  }, [filtersOpen])

  const runSearch = useCallback(async (q: string, type: TypeFilter, useSemanticSearch: boolean) => {
    if (q.trim().length < 2) { setResults([]); setHasSearched(false); setCounts(null); return }
    setLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: q.trim(), type, locale })
      if (useSemanticSearch) params.set('semantic', 'true')
      const fetchUrl = `/api/search?${params}`
      lastSearchUrlRef.current = fetchUrl
      const res  = await fetch(fetchUrl)
      const data: SearchResult[] = await res.json()
      setResults(data)
      // Per-type counts for the filter chips: the typed response only holds one type, so an
      // unfiltered pass supplies the rest.
      const tally = (rows: SearchResult[]) => ({
        all: rows.length,
        Product: rows.filter(r => r.type === 'Product').length,
        Blog:    rows.filter(r => r.type === 'Blog').length,
        Page:    rows.filter(r => r.type === 'Page').length,
        Event:   rows.filter(r => r.type === 'Event').length,
      })
      if (type === 'all') setCounts(tally(data))
      else {
        const p2 = new URLSearchParams({ q: q.trim(), type: 'all', locale })
        fetch(`/api/search?${p2}`).then(r => r.json()).then((all: SearchResult[]) => setCounts(tally(all))).catch(() => {})
      }
      if (storefront && type === 'all') {
        // Report the query once the shopper pauses, not on every keystroke.
        clearTimeout(searchTrackRef.current)
        searchTrackRef.current = setTimeout(() => trackSearch(q, data.length), 1200)
      }
    } catch {
      setResults([])
      setCounts(null)
    } finally {
      setLoading(false)
    }
  }, [locale, storefront])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setTopicFilter(null)
      setCatFilter([])
    setFocusedSugIdx(-1)

    clearTimeout(suggestDebounceRef.current)
    if (value.trim().length >= 2) {
      suggestDebounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(value.trim())}&locale=${locale}`)
          const data: AutocompleteSuggestion[] = await res.json()
          setSuggestions(data)
          setShowSuggestions(data.length > 0)
        } catch {}
      }, 150)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runSearch(value, typeFilter, semantic)
    }, 350)
  }

  // Each suggestion is a specific content item (not just a query string), so
  // selecting one navigates straight there rather than re-running a text
  // search — mirrors handleResultClick's cross-origin handling below.
  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    setSuggestions([])
    setShowSuggestions(false)
    setFocusedSugIdx(-1)
    clearTimeout(debounceRef.current)
    clearTimeout(suggestDebounceRef.current)
    if (isCrossOriginUrl(suggestion.url)) {
      window.open(suggestion.url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(suggestion.url)
    }
    closeSearch()
  }

  // "View all <type>" — keeps the current query, scopes the real results to
  // this type, and drops the typeahead in favor of the full results list.
  const handleViewAllType = (type: AutocompleteType) => {
    setSuggestions([])
    setShowSuggestions(false)
    setFocusedSugIdx(-1)
    handleTypeFilter(type)
  }

  const handleTypeFilter = (f: TypeFilter) => {
    if (f === typeFilter) return
    setTypeFilter(f)
    setTopicFilter(null)
      setCatFilter([])
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

  // Results are real links, so middle-click / modifier-click / open-in-new-tab behave natively.
  // Only a plain click also closes the search overlay.
  const handleResultClick = useCallback((e: React.MouseEvent, result: SearchResult) => {
    if (result._track) {
      // Fire-and-forget beacon — keepalive ensures it survives the navigation.
      fetch(result._track, { method: 'GET', mode: 'no-cors', keepalive: true }).catch(() => {})
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    closeSearch()
  }, [closeSearch])


  useEffect(() => {
    if (!hasSearched || catMap) return
    let live = true
    fetch('/api/topics?view=all').then(r => r.json()).then(d => {
      if (!live) return
      const m: Record<string, { slug: string; name: string; group: string }[]> = {}
      for (const p of d.pages ?? []) m[p.key] = p.categories
      setCatMap(m)
    }).catch(() => {})
    return () => { live = false }
  }, [hasSearched, catMap])

  // Category refiners: the categories carried by the current results, by group, with how many results each would keep
  const catGroups = (() => {
    const by = new Map<string, Map<string, { slug: string; name: string; n: number }>>()
    for (const r of results) for (const c of catMap?.[r.id] ?? []) {
      const g = by.get(c.group) ?? new Map(); by.set(c.group, g)
      const cur = g.get(c.slug); if (cur) cur.n++; else g.set(c.slug, { slug: c.slug, name: c.name, n: 1 })
    }
    return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, m]) => ({ name, topics: [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)) }))
  })()
  const toggleCat = (slug: string) => setCatFilter(cur => cur.includes(slug) ? cur.filter(x => x !== slug) : [...cur, slug])

  const availableTopics = Array.from(new Set(
    results.filter(r => r.type === 'Blog' && r.topic).map(r => r.topic!)
  ))
  const showTopics = (typeFilter === 'all' || typeFilter === 'Blog') && availableTopics.length > 0

  const byTopic = topicFilter
    ? results.filter(r => r.type !== 'Blog' || r.topic === topicFilter)
    : results
  // within a category group any picked topic matches; across groups every group with a pick must match
  const filteredResults = catFilter.length
    ? byTopic.filter(r => {
        const cats = catMap?.[r.id] ?? []
        return catGroups.every(g => {
          const picked = g.topics.filter(x => catFilter.includes(x.slug))
          return !picked.length || cats.some(c => c.group === g.name && picked.some(x => x.slug === c.slug))
        })
      })
    : byTopic

  const dur = (ms: number) => prefersReducedMotion ? 0 : ms / 1000

  const panelVariants = {
    hidden:  { y: '-100%' },
    visible: { y: 0,       transition: { duration: dur(380), ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { y: '-100%', transition: { duration: dur(240), ease: [0.4, 0, 0.2, 1]  as const } },
  }

  const fadeVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur(200) } },
    exit:    { opacity: 0, transition: { duration: dur(240) } },
  }

  // Refine badge: topic and AI mode (type lives in the one-tap chips).
  const refineCount = (topicFilter ? 1 : 0) + catFilter.length + (semantic ? 1 : 0)
  const anyFilter   = refineCount + (typeFilter !== 'all' ? 1 : 0) > 0

  function clearAllFilters() {
    if (typeFilter !== 'all') handleTypeFilter('all')
    setTopicFilter(null)
      setCatFilter([])
    if (semantic) handleSemanticToggle()
  }

  const chipTypes = TYPE_FILTERS.filter(f => storefront || f.value !== 'Product')

  // ─── Suggestions (one combobox listbox, grouped) ───────────────────────────

  type SugOption = { kind: 'go'; item: AutocompleteSuggestion } | { kind: 'all'; type: AutocompleteType }
  const sugGroups  = groupSuggestions(suggestions)
  const sugOptions: SugOption[] = sugGroups.flatMap(g => [
    ...g.items.map(item => ({ kind: 'go' as const, item })),
    ...(typeFilter !== g.type ? [{ kind: 'all' as const, type: g.type }] : []),
  ])
  const listOpen = showSuggestions && sugOptions.length > 0

  const pickOption = (o: SugOption) => (o.kind === 'go' ? handleSuggestionSelect(o.item) : handleViewAllType(o.type))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (listOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedSugIdx(Math.min(focusedSugIdx + 1, sugOptions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedSugIdx(Math.max(focusedSugIdx - 1, -1))
        return
      }
      if (e.key === 'Enter' && focusedSugIdx >= 0) {
        e.preventDefault()
        pickOption(sugOptions[focusedSugIdx])
        return
      }
      if (e.key === 'Escape') {
        // Dismiss suggestions only: keep the typed query (type=search clears on Escape) and
        // stop the document-level Escape from closing search.
        e.preventDefault()
        e.nativeEvent.stopImmediatePropagation()
        setShowSuggestions(false)
        setFocusedSugIdx(-1)
        return
      }
    }
    if (e.key === 'ArrowDown') {
      const first = resultsRef.current?.querySelector<HTMLElement>('[data-part="result"]')
      if (first) { e.preventDefault(); first.focus() }
      else if (suggestions.length > 0) { e.preventDefault(); setShowSuggestions(true); setFocusedSugIdx(0) }
    }
  }

  // Arrow keys also walk the result links; Up from the first returns to the field.
  const handleResultsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const items = Array.from(resultsRef.current?.querySelectorAll<HTMLElement>('[data-part="result"]') ?? [])
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    if (e.key === 'ArrowDown') items[Math.min(i + 1, items.length - 1)]?.focus()
    else if (i === 0) inputRef.current?.focus()
    else items[i - 1]?.focus()
  }

  // ─── Pieces shared by both views ───────────────────────────────────────────

  function Field({ compact: isCompact }: { compact: boolean }) {
    const id = isCompact ? 'search-input-compact' : 'search-input-immersive'
    return (
      <div data-part="field-wrap">
        <div data-part="field" data-search-input-row>
          <Search size={isCompact ? 16 : 22} strokeWidth={2} data-part="field-ic" aria-hidden />
          <input
            ref={inputRef}
            id={id}
            data-part="input"
            type="search"
            role="combobox"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => { if (!document.activeElement?.closest('[data-suggestions-list]')) { setShowSuggestions(false); setFocusedSugIdx(-1) } }, 200)}
            placeholder={t(isCompact ? 'search.placeholderCompact' : 'search.placeholder')}
            autoComplete="off"
            spellCheck={false}
            aria-label={t('search.inputLabel')}
            aria-autocomplete="list"
            aria-expanded={listOpen}
            aria-controls={listboxId}
            aria-activedescendant={listOpen && focusedSugIdx >= 0 ? `${listboxId}-opt-${focusedSugIdx}` : undefined}
          />
          {suggestions.length > 0 && (
            <button
              type="button"
              data-part="icon-btn"
              data-size="sm"
              onClick={() => { setShowSuggestions(v => !v); setFocusedSugIdx(-1) }}
              aria-label={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
              aria-expanded={showSuggestions}
            >
              <ChevronDown size={16} strokeWidth={2} data-open={showSuggestions} aria-hidden />
            </button>
          )}
          {query && (
            <button
              type="button"
              data-part="icon-btn"
              data-size="sm"
              onClick={() => { handleQueryChange(''); inputRef.current?.focus() }}
              aria-label={t('search.clearFilter')}
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          )}
        </div>
        {SuggestionList({ compact: isCompact })}
      </div>
    )
  }

  function SuggestionList({ compact: isCompact }: { compact: boolean }) {
    let flat = -1
    return (
      <AnimatePresence>
        {listOpen && (
          <motion.div
            key="suggestions-panel"
            data-part="suggest"
            data-suggestions-list
            data-compact={isCompact || undefined}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: dur(100) } }}
            transition={{ duration: dur(180), ease: [0.16, 1, 0.3, 1] }}
          >
            <div data-part="suggest-head">
              <span data-part="suggest-k"><Sparkles size={13} aria-hidden />{t('search.suggestions')}</span>
              <button
                type="button"
                data-part="icon-btn"
                data-size="sm"
                onMouseDown={e => { e.preventDefault(); setShowSuggestions(false); setFocusedSugIdx(-1) }}
                onClick={() => { setShowSuggestions(false); setFocusedSugIdx(-1) }}
                aria-label="Hide suggestions"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <div role="listbox" id={listboxId} aria-label="Suggested results" data-part="listbox">
              {sugGroups.map(group => {
                const { label: groupLabel, Icon: GroupIcon } = SUGGESTION_GROUP_META[group.type]
                const gid = `${listboxId}-g-${group.type}`
                return (
                  <div key={group.type} role="group" aria-labelledby={gid}>
                    <div data-part="sg-head" id={gid}><GroupIcon size={13} aria-hidden />{groupLabel}<span data-part="sg-n">{group.items.length}</span></div>
                    {group.items.map(item => {
                      flat += 1
                      const i = flat
                      return (
                        <div
                          key={`${group.type}-${item.label}`}
                          role="option"
                          id={`${listboxId}-opt-${i}`}
                          aria-selected={focusedSugIdx === i}
                          data-part="option"
                          onMouseDown={e => { e.preventDefault(); handleSuggestionSelect(item) }}
                        >
                          <Search size={14} strokeWidth={2} data-part="opt-ic" aria-hidden />
                          <span data-part="opt-t">{highlightMatch(item.label, query)}</span>
                          <span data-part="opt-type">{item.type}</span>
                        </div>
                      )
                    })}
                    {typeFilter !== group.type && (() => {
                      flat += 1
                      const i = flat
                      return (
                        <div
                          role="option"
                          id={`${listboxId}-opt-${i}`}
                          aria-selected={focusedSugIdx === i}
                          data-part="option"
                          data-kind="all"
                          onMouseDown={e => { e.preventDefault(); handleViewAllType(group.type) }}
                        >
                          {t('search.viewAll', { type: groupLabel.toLowerCase() })}<ArrowRight size={14} aria-hidden />
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // One-tap type chips with counts. The Refine drawer keeps topic and AI mode.
  function Chips() {
    return (
      <div data-part="types" role="group" aria-label={t('search.contentTypeFilter')}>
        {chipTypes.map(f => {
          const c = hasSearched ? counts?.[f.value] : undefined
          return (
            <button
              key={f.value}
              type="button"
              data-part="chip"
              aria-pressed={typeFilter === f.value}
              data-zero={c === 0 && f.value !== 'all' ? '' : undefined}
              onClick={() => handleTypeFilter(f.value)}
            >
              {f.label}
              {c !== undefined && <span data-part="chip-n">{c}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  function RefineButton() {
    return (
      <button
        ref={filterTriggerRef}
        type="button"
        data-part="filters"
        aria-expanded={filtersOpen}
        aria-haspopup="dialog"
        aria-controls={filterPanelId}
        onClick={() => setFiltersOpen(v => !v)}
      >
        <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
        <span>{t('search.refine')}</span>
        {refineCount > 0 && <span data-part="filters-n" aria-label={`${refineCount} applied`}>{refineCount}</span>}
      </button>
    )
  }

  function Status({ count }: { count: number }) {
    const countLabel = count !== 1 ? t('search.results', { count: String(count) }) : t('search.result')
    return (
      <p data-part="status" role="status">
        <b>{countLabel}</b> {t('search.forQuery', { query: query.trim() })}
        {semantic && <span data-part="ai"><Sparkles size={12} aria-hidden />{t('search.aiRanked')}</span>}
      </p>
    )
  }

  function ResultsBody({ compact: isCompact }: { compact: boolean }) {
    if (loading) {
      return (
        <>
          <p data-part="status" role="status" className="sr-only">{t('search.searching')}</p>
          <ul data-part="skeleton" aria-hidden>
            {[0, 1, 2].map(i => (
              <li key={i}><span data-part="sk-thumb" /><span data-part="sk-lines"><span /><span /><span /></span></li>
            ))}
          </ul>
        </>
      )
    }
    if (hasSearched && filteredResults.length === 0) {
      return (
        <div data-part="empty" role="status">
          <p data-part="empty-t">{t('search.noResults', { query })}</p>
          <p data-part="empty-d">{t('search.noResultsHint')}</p>
          {anyFilter && <button type="button" data-part="text-btn" onClick={clearAllFilters}>{t('search.clearFilters')}</button>}
        </div>
      )
    }
    if (filteredResults.length === 0) return <p data-part="status" role="status" className="sr-only" />
    return (
      <div ref={resultsRef as React.RefObject<HTMLDivElement>} onKeyDown={handleResultsKeyDown}>
        <Status count={filteredResults.length} />
        <ul data-part="results" data-view={isCompact ? 'list' : viewMode}>
          {filteredResults.map(r => ResultItem({ result: r, compact: isCompact }))}
        </ul>
      </div>
    )
  }

  // ─── Result row / card — a real link ───────────────────────────────────────

  function ResultItem({ result, compact: isCompact }: { result: SearchResult; compact: boolean }) {
    const isEvent   = result.type === 'Event'
    const date      = isEvent ? formatEventDate(result.startDate, result.endDate) : formatDate(result.published)
    const external  = isCrossOriginUrl(result.url)
    const hostLabel = external ? getHostLabel(result.url) : null
    const Wrapper: React.ElementType = external ? 'a' : Link
    const linkProps = external ? { href: result.url, target: '_blank', rel: 'noopener noreferrer' } : { href: result.url }
    const TypeIcon = isEvent ? CalendarDays : result.type === 'Product' ? ShoppingBag : result.type === 'Blog' ? Newspaper : FileText

    return (
      <li key={result.id}>
        <Wrapper {...linkProps} data-part="result" onClick={(e: React.MouseEvent) => handleResultClick(e, result)}>
          <span data-part="thumb" data-type={result.type}>
            {result.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.imageUrl} alt="" loading="lazy" />
            ) : (
              <TypeIcon size={20} strokeWidth={1.75} aria-hidden />
            )}
          </span>
          <span data-part="body">
            <span data-part="meta">
              <span data-part="type" data-type={result.type}>{result.type}</span>
              {isEvent && result.eventType && <span>{eventTypeLabel(result.eventType)}</span>}
              {result.topic && <span>{result.topic}</span>}
              {date && <span>{isEvent && <CalendarDays strokeWidth={2} aria-hidden />}{date}</span>}
              {hostLabel && <span><ExternalLink aria-hidden />{hostLabel}</span>}
            </span>
            <span data-part="title">{result.title}</span>
            {result.price && <span data-part="price">{result.price}</span>}
            {isEvent && result.locationLabel && (
              <span data-part="where">
                {result.locationType === 'virtual' ? <Video size={14} strokeWidth={2} aria-hidden /> : <MapPin size={14} strokeWidth={2} aria-hidden />}
                {result.locationLabel}
              </span>
            )}
            {result.excerpt && <span data-part="excerpt">{result.excerpt}</span>}
          </span>
          {!isCompact && <span data-part="go" aria-hidden><ArrowRight size={18} strokeWidth={2} /></span>}
        </Wrapper>
      </li>
    )
  }

  // ─── Refine drawer: topic + AI semantic mode ───────────────────────────────

  function RefineDrawer() {
    const tabTrap = (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const f = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href]') ?? [])
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    return (
      <>
        <motion.div
          key="drawer-scrim"
          data-part="drawer-scrim"
          aria-hidden
          onClick={() => setFiltersOpen(false)}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: dur(180) }}
        />
        <motion.div
          key="drawer"
          ref={drawerRef}
          id={filterPanelId}
          data-part="drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${filterPanelId}-h`}
          onKeyDown={tabTrap}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: dur(220), ease: [0.16, 1, 0.3, 1] }}
        >
          <div data-part="drawer-head">
            <h2 id={`${filterPanelId}-h`}><SlidersHorizontal size={18} strokeWidth={2} aria-hidden />{t('search.refine')}</h2>
            <button type="button" data-part="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} strokeWidth={2} aria-hidden /></button>
          </div>
          <div data-part="drawer-body">
            <fieldset data-part="fs">
              <legend><Sparkles size={16} strokeWidth={2} aria-hidden />Search mode</legend>
              <div data-part="switch-row">
                <span><b>{t('search.semanticTitle')}</b><span>{t('search.semanticHint')}</span></span>
                <button type="button" role="switch" aria-checked={semantic} aria-label={t('search.semanticTitle')} data-part="switch" onClick={handleSemanticToggle}>
                  <span data-part="knob">{semantic && <Check size={11} strokeWidth={3} aria-hidden />}</span>
                </button>
              </div>
            </fieldset>
            {catGroups.map(g => (
              <fieldset key={g.name} data-part="fs">
                <legend><Tag size={16} strokeWidth={2} aria-hidden />{g.name}</legend>
                <div data-part="pills">
                  {g.topics.map(tp => (
                    <button key={tp.slug} type="button" data-part="chip" aria-pressed={catFilter.includes(tp.slug)} onClick={() => toggleCat(tp.slug)}>{tp.name} <span data-part="chip-n">{tp.n}</span></button>
                  ))}
                </div>
              </fieldset>
            ))}
            {showTopics && (
              <fieldset data-part="fs">
                <legend><Tag size={16} strokeWidth={2} aria-hidden />Blog topic</legend>
                <div data-part="pills">
                  {availableTopics.map(topic => (
                    <button key={topic} type="button" data-part="chip" aria-pressed={topicFilter === topic} onClick={() => setTopicFilter(topicFilter === topic ? null : topic)}>{topic}</button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
          <div data-part="drawer-foot">
            <button type="button" data-part="text-btn" aria-disabled={!anyFilter || undefined} onClick={() => { if (anyFilter) clearAllFilters() }}>{t('search.clearFilters')}</button>
            <Button variant="brand" size="sm" onClick={() => setFiltersOpen(false)}>{t('search.showResults')}</Button>
          </div>
        </motion.div>
      </>
    )
  }

  // ─── Developer query flyout ────────────────────────────────────────────────

  function DevQueryPanel() {
    const url = lastSearchUrlRef.current
    const snippet = [
      '# API request',
      `GET ${url || '/api/search?q=<query>&type=all'}`,
      '',
      '# Graph strategy',
      `ordering:  ${semantic ? '_ranking: SEMANTIC  _semanticWeight: 0.8' : '_ranking: RELEVANCE'}`,
      `fulltext:  ${semantic ? 'match: $query' : 'match: $query, fuzzy: true, synonyms: ONE'}`,
      'pinning:   phrase-based (blogs, events, pages)',
      'scoping:   OT_ThemeManager.frontEndDomain',
    ].join('\n')

    const handleCopy = () => {
      navigator.clipboard.writeText(snippet).then(() => {
        setQueryCopied(true)
        setTimeout(() => setQueryCopied(false), 1800)
      })
    }

    return (
      <motion.aside
        key="dev-flyout"
        data-part="inspector"
        aria-labelledby="search-inspector-h"
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: { duration: dur(320), ease: [0.16, 1, 0.3, 1] } }}
        exit={{ x: '100%', transition: { duration: dur(220), ease: [0.4, 0, 1, 1] } }}
      >
        <div data-part="insp-head">
          <h2 id="search-inspector-h"><Code2 size={14} aria-hidden />Query inspector</h2>
          <button type="button" data-part="icon-btn" data-size="sm" onClick={() => setShowDevPanel(false)} aria-label="Close query inspector"><X size={16} aria-hidden /></button>
        </div>
        <pre data-part="insp-code">
          <span data-c="comment"># API request{'\n'}</span>
          <span data-c="verb">GET </span>
          <span data-c="val">{url || '/api/search?q=<query>&type=all'}</span>
          {'\n\n'}
          <span data-c="comment"># Graph strategy{'\n'}</span>
          <span data-c="key">ordering:  </span>
          <span data-c={semantic ? 'verb' : 'val'}>{semantic ? '_ranking: SEMANTIC  _semanticWeight: 0.8' : '_ranking: RELEVANCE'}</span>
          {'\n'}
          <span data-c="key">fulltext:  </span>
          <span data-c="val">{semantic ? 'match: $query' : 'match: $query, fuzzy: true, synonyms: ONE'}</span>
          {'\n'}
          <span data-c="key">pinning:   </span>
          <span data-c="val">phrase-based (blogs, events, pages)</span>
          {'\n'}
          <span data-c="key">scoping:   </span>
          <span data-c="val">OT_ThemeManager.frontEndDomain</span>
        </pre>
        <div data-part="insp-foot">
          <button type="button" data-part="insp-copy" onClick={handleCopy}>{queryCopied ? 'Copied' : 'Copy'}</button>
          <span role="status" className="sr-only">{queryCopied ? 'Query details copied' : ''}</span>
        </div>
      </motion.aside>
    )
  }

  // ─── Full view ─────────────────────────────────────────────────────────────

  function ImmersivePanel() {
    return (
      <>
        <div data-part="bar">
          <button type="button" data-part="tool" data-tool="query" onClick={() => setShowDevPanel(v => !v)} aria-pressed={showDevPanel}>
            <Code2 size={16} aria-hidden /><span>Query</span>
          </button>
          <button type="button" data-part="tool" data-tool="compact" onClick={toggleMode} aria-label={t('search.compact')}>
            <Minimize2 size={16} aria-hidden /><span>Compact</span>
          </button>
          <button type="button" data-part="icon-btn" onClick={closeSearch} aria-label={t('search.close')}>
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div data-part="scroll" id="search-results" aria-label={t('search.searchResults')}>
          <div data-part="inner">
            {/* /SEARCH wordmark: the Highlight marker, drawn once when search opens */}
            <p ref={displayRef} data-part="display" aria-hidden data-animate>
              <span data-part="slash">/</span>
              <span data-part="mark-line"><span data-part="mark-text">SEARCH</span></span>
            </p>

            <label htmlFor="search-input-immersive" className="sr-only">{t('search.inputLabel')}</label>
            {Field({ compact: false })}

            <div data-part="tools">
              {Chips()}
              <div data-part="tools-end">
                {RefineButton()}
                <div data-part="viewtoggle" role="group" aria-label="View mode">
                  <button type="button" data-part="icon-btn" aria-label="List view" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}><List size={18} strokeWidth={1.75} aria-hidden /></button>
                  <button type="button" data-part="icon-btn" aria-label="Card view" aria-pressed={viewMode === 'card'} onClick={() => setViewMode('card')}><LayoutGrid size={18} strokeWidth={1.75} aria-hidden /></button>
                </div>
              </div>
            </div>

            {ResultsBody({ compact: false })}
          </div>
        </div>

        <AnimatePresence>{showDevPanel && DevQueryPanel()}</AnimatePresence>
      </>
    )
  }

  // ─── Compact panel (under the site header) ─────────────────────────────────

  function CompactPanel() {
    return (
      <>
        <div data-part="panel-head">
          <span data-part="panel-k">Search</span>
          <div data-part="panel-act">
            <button type="button" data-part="icon-btn" onClick={toggleMode} aria-label={t('search.expand')}><Maximize2 size={16} aria-hidden /></button>
            <button type="button" data-part="icon-btn" onClick={closeSearch} aria-label={t('search.close')}><X size={18} aria-hidden /></button>
          </div>
        </div>
        <div data-part="panel-field">
          <label htmlFor="search-input-compact" className="sr-only">{t('search.inputLabel')}</label>
          {Field({ compact: true })}
        </div>
        <div data-part="panel-tools">
          {Chips()}
          {RefineButton()}
        </div>
        <div data-part="panel-results" id="search-results-compact" aria-label={t('search.searchResults')}>
          {ResultsBody({ compact: true })}
        </div>
      </>
    )
  }

  // ─── Portal ────────────────────────────────────────────────────────────────

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && mode === 'immersive' && (
        <motion.div
          key="immersive"
          data-search
          data-mode="immersive"
          role="dialog"
          aria-modal="true"
          aria-label={t('search.siteSearch')}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {ImmersivePanel()}
          <AnimatePresence>{filtersOpen && RefineDrawer()}</AnimatePresence>
        </motion.div>
      )}
      {isOpen && mode === 'compact' && (
        <motion.div
          key="compact"
          data-search
          data-mode="compact"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div data-part="scrim" aria-hidden onClick={closeSearch} />
          <motion.div
            data-part="panel"
            className="search-compact-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t('search.siteSearch')}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {CompactPanel()}
          </motion.div>
          <AnimatePresence>{filtersOpen && RefineDrawer()}</AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
