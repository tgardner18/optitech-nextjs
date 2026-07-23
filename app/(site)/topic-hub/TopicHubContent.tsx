'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Sparkles, Loader2,
  CalendarDays, Newspaper, FileText, BookOpen, Code2,
  MapPin, Video, ArrowRight, ArrowDownToLine,
} from 'lucide-react'
import type { SearchResult } from '@/lib/search'
import { eventTypeLabel } from '@/lib/eventFormat'

// ─── Types ────────────────────────────────────────────────────────────────────

type DocResult = {
  id:        string
  title:     string
  url:       string
  extension: string | null
  fileSize:  number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShortDate(iso?: string): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch { return null }
}

function formatDocFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Blog card ─────────────────────────────────────────────────────────────────

function BlogCard({ result }: { result: SearchResult }) {
  return (
    <a
      href={result.url}
      className="group block bg-surface border border-fg/8 rounded-ot-surface overflow-hidden card-hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="aspect-video overflow-hidden">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.title}
            loading="lazy"
            className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand/20 to-canvas" />
        )}
      </div>
      <div className="px-md pt-md pb-lg">
        {result.topic && (
          <div className="mb-sm flex items-center gap-xs">
            <span className="block w-1.5 h-1.5 bg-accent flex-none" aria-hidden />
            <span className="text-label uppercase tracking-label font-semibold text-accent">
              {result.topic.charAt(0).toUpperCase() + result.topic.slice(1)}
            </span>
          </div>
        )}
        <h3 className="text-title leading-title font-semibold text-fg text-balance line-clamp-2">
          {result.title}
        </h3>
        {result.excerpt && (
          <p className="mt-xs text-body-sm text-fg-muted line-clamp-2 text-pretty">{result.excerpt}</p>
        )}
        {result.published && (
          <p className="mt-sm text-label text-fg-muted">{formatShortDate(result.published)}</p>
        )}
      </div>
    </a>
  )
}

// ─── Event card ────────────────────────────────────────────────────────────────

function EventCard({ result }: { result: SearchResult }) {
  const typeLabel    = result.eventType ? eventTypeLabel(result.eventType) : null
  const LocationIcon = result.locationType === 'virtual' ? Video : MapPin
  let month = '', day = ''
  if (result.startDate) {
    try {
      const d = new Date(result.startDate)
      month = d.toLocaleDateString('en-US', { month: 'short' })
      day   = String(d.getDate())
    } catch {}
  }

  return (
    <a
      href={result.url}
      className="group flex gap-md bg-surface border border-fg/8 rounded-ot-surface p-md card-hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {month && (
        <div className="flex-none w-11 text-center pt-px">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-fg-muted leading-none">{month}</p>
          <p className="text-title font-extrabold tabular-nums leading-tight text-brand mt-0.5">{day}</p>
        </div>
      )}
      <div className="min-w-0 flex-1">
        {typeLabel && (
          <span className="inline-flex items-center rounded-ot-control bg-brand text-fg-on-brand px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] leading-none mb-xs">
            {typeLabel}
          </span>
        )}
        <h3 className="text-title leading-title font-semibold text-fg line-clamp-2">{result.title}</h3>
        <div className="mt-xs flex flex-wrap gap-x-sm gap-y-xs text-label text-fg-muted">
          {result.locationLabel && (
            <span className="flex items-center gap-xs min-w-0">
              <LocationIcon size={12} strokeWidth={2} className="flex-none" aria-hidden />
              <span className="truncate">{result.locationLabel}</span>
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

// ─── Page card ─────────────────────────────────────────────────────────────────

function PageCard({ result }: { result: SearchResult }) {
  return (
    <a
      href={result.url}
      className="group flex items-start gap-md bg-surface border border-fg/8 rounded-ot-surface p-md card-hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <FileText size={18} className="flex-none text-brand mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1">
        <h3 className="text-title leading-title font-semibold text-fg group-hover:text-brand motion-safe:transition-colors motion-safe:duration-150">
          {result.title}
        </h3>
        {result.excerpt && (
          <p className="mt-xs text-body-sm text-fg-muted line-clamp-2 text-pretty">{result.excerpt}</p>
        )}
      </div>
      <ArrowRight
        size={15}
        className="flex-none text-fg-muted/30 group-hover:text-brand group-hover:translate-x-0.5 motion-safe:transition-all motion-safe:duration-150 mt-1"
        aria-hidden
      />
    </a>
  )
}

// ─── Doc row ───────────────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: DocResult }) {
  const ext  = (doc.extension ?? 'pdf').toUpperCase()
  const size = doc.fileSize ? formatDocFileSize(doc.fileSize) : null

  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-lg px-lg py-5.5 bg-surface border border-fg/8 rounded-ot-surface hover:border-brand/25 hover:bg-brand/2.5 motion-safe:transition-all motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {/* File type badge */}
      <span
        aria-hidden
        className="flex-none inline-flex items-center px-sm py-1.25 bg-brand text-fg-on-brand text-[0.625rem] font-bold uppercase tracking-[0.14em] leading-none rounded-xs"
      >
        {ext}
      </span>

      {/* Title + size */}
      <div className="flex-1 min-w-0">
        <p className="text-title font-semibold text-fg leading-snug line-clamp-1 capitalize group-hover:text-brand motion-safe:transition-colors motion-safe:duration-150">
          {doc.title}
        </p>
        {size && (
          <p className="text-label text-fg-muted/50 mt-0.5 tabular-nums">{size}</p>
        )}
      </div>

      {/* Download CTA */}
      <span className="flex-none flex items-center gap-xs text-label font-semibold uppercase tracking-label text-fg-muted group-hover:text-brand motion-safe:transition-colors motion-safe:duration-150">
        <ArrowDownToLine
          size={14}
          className="motion-safe:group-hover:translate-y-0.5 motion-safe:transition-transform motion-safe:duration-150"
          aria-hidden
        />
        Download
      </span>
    </a>
  )
}

// ─── Skeletons ──────────────────────────────────────────────────────────────────

function BlogSkeleton() {
  return (
    <div className="bg-surface border border-fg/8 rounded-ot-surface overflow-hidden animate-pulse">
      <div className="aspect-video bg-fg/8" />
      <div className="px-md pt-md pb-lg space-y-sm">
        <div className="h-2.5 bg-fg/8 rounded-full w-14" />
        <div className="h-4 bg-fg/8 rounded-full w-full" />
        <div className="h-4 bg-fg/8 rounded-full w-4/5" />
        <div className="h-2.5 bg-fg/8 rounded-full w-24" />
      </div>
    </div>
  )
}

function EventSkeleton() {
  return (
    <div className="bg-surface border border-fg/8 rounded-ot-surface p-md animate-pulse flex gap-md">
      <div className="w-11 flex-none space-y-1">
        <div className="h-2 bg-fg/8 rounded-full w-full" />
        <div className="h-5 bg-fg/8 rounded-full w-full" />
      </div>
      <div className="flex-1 space-y-sm">
        <div className="h-2.5 bg-fg/8 rounded-full w-16" />
        <div className="h-4 bg-fg/8 rounded-full w-full" />
        <div className="h-4 bg-fg/8 rounded-full w-3/4" />
        <div className="h-2.5 bg-fg/8 rounded-full w-28" />
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="bg-surface border border-fg/8 rounded-ot-surface p-md animate-pulse flex gap-md items-start">
      <div className="w-4 h-4 bg-fg/8 rounded flex-none mt-0.5" />
      <div className="flex-1 space-y-sm">
        <div className="h-4 bg-fg/8 rounded-full w-full" />
        <div className="h-3 bg-fg/8 rounded-full w-2/3" />
      </div>
    </div>
  )
}

function DocSkeleton() {
  return (
    <div className="flex items-center gap-lg px-lg py-5.5 bg-surface border border-fg/8 rounded-ot-surface animate-pulse">
      <div className="w-9 h-5 bg-fg/8 rounded-xs flex-none" />
      <div className="flex-1 space-y-xs">
        <div className="h-4 bg-fg/8 rounded-full w-3/5" />
        <div className="h-2.5 bg-fg/8 rounded-full w-12" />
      </div>
      <div className="w-20 h-3 bg-fg/8 rounded-full flex-none" />
    </div>
  )
}

// ─── Suggested topics ──────────────────────────────────────────────────────────

const SUGGESTED_TOPICS = [
  'AI in banking',
  'fraud prevention',
  'compliance and regulation',
  'community development lending',
  'deposit growth strategies',
  'member financial literacy',
]

// ─── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return (
    <header className="flex items-center gap-sm mb-lg pb-sm border-b border-fg/8">
      <Icon size={16} className="text-brand flex-none" aria-hidden />
      <h2 className="text-title leading-title font-semibold text-fg">{label}</h2>
    </header>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TopicHubContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const initialTopic = searchParams.get('topic') ?? ''

  const [inputValue,   setInputValue]   = useState(initialTopic)
  const [activeQuery,  setActiveQuery]  = useState(initialTopic)
  const [blogs,        setBlogs]        = useState<SearchResult[]>([])
  const [events,       setEvents]       = useState<SearchResult[]>([])
  const [pages,        setPages]        = useState<SearchResult[]>([])
  const [docs,         setDocs]         = useState<DocResult[]>([])
  const [loading,      setLoading]      = useState(false)
  const [showAllBlogs, setShowAllBlogs] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)
  const [copied,       setCopied]       = useState(false)

  const debounceRef   = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef      = useRef<HTMLInputElement>(null)
  const lastQueryRef  = useRef<string>('')

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setBlogs([]); setEvents([]); setPages([]); setDocs([])
      setActiveQuery('')
      setLoading(false)
      return
    }
    setLoading(true)
    setShowAllBlogs(false)
    const qs = encodeURIComponent(trimmed)
    lastQueryRef.current = trimmed
    try {
      const [b, e, p, d] = await Promise.all([
        fetch(`/api/search?semantic=true&limit=9&type=Blog&q=${qs}`).then(r => r.json()).catch(() => []),
        fetch(`/api/search?semantic=true&limit=6&type=Event&q=${qs}`).then(r => r.json()).catch(() => []),
        fetch(`/api/search?semantic=true&limit=6&type=Page&q=${qs}`).then(r => r.json()).catch(() => []),
        fetch(`/api/search/docs?q=${qs}`).then(r => r.json()).catch(() => []),
      ])
      setBlogs(Array.isArray(b) ? b : [])
      setEvents(Array.isArray(e) ? e : [])
      setPages(Array.isArray(p) ? p : [])
      setDocs(Array.isArray(d) ? d : [])
      setActiveQuery(trimmed)
    } catch {
      setBlogs([]); setEvents([]); setPages([]); setDocs([])
    }
    setLoading(false)
  }, [])

  // Run on mount if there's an initial topic in the URL
  useEffect(() => {
    if (initialTopic) runSearch(initialTopic)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set('topic', value.trim())
      router.replace(`/topic-hub${params.size ? `?${params}` : ''}`, { scroll: false })
      runSearch(value)
    }, 450)
  }

  function handleSuggest(t: string) {
    setInputValue(t)
    clearTimeout(debounceRef.current)
    const params = new URLSearchParams()
    params.set('topic', t)
    router.replace(`/topic-hub?${params}`, { scroll: false })
    runSearch(t)
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    const params = new URLSearchParams()
    if (inputValue.trim()) params.set('topic', inputValue.trim())
    router.replace(`/topic-hub${params.size ? `?${params}` : ''}`, { scroll: false })
    runSearch(inputValue)
  }

  function handleCopy() {
    const q = encodeURIComponent(lastQueryRef.current)
    const snippet = [
      `# Topic Hub — last search: "${lastQueryRef.current}"`,
      ``,
      `# API requests (parallel)`,
      `GET /api/search?semantic=true&type=Blog&limit=9&q=${q}`,
      `GET /api/search?semantic=true&type=Event&limit=6&q=${q}`,
      `GET /api/search?semantic=true&type=Page&limit=6&q=${q}`,
      `GET /api/search/docs?q=${q}`,
      ``,
      `# Content Graph strategy`,
      `ordering:  _ranking: SEMANTIC  _semanticWeight: 0.8`,
      `fulltext:  fuzzy: true, synonyms: ONE`,
      `documents: cmp_Asset (ABA folder) → _AssetItem CDN batch`,
      `scoping:   OT_ThemeManager.frontEndDomain`,
    ].join('\n')
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const hasResults = blogs.length > 0 || events.length > 0 || pages.length > 0 || docs.length > 0
  const noResults  = !loading && activeQuery.length >= 2 && !hasResults

  const q = encodeURIComponent(lastQueryRef.current || activeQuery)

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-canvas border-b border-fg/8 px-md lg:px-lg py-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-md lg:gap-xl">

            {/* Brand stamp */}
            <div className="flex-none lg:w-56 xl:w-64">
              <div className="flex items-center gap-xs mb-xs">
                <Sparkles size={13} className="text-brand" aria-hidden />
                <span className="text-label font-semibold uppercase tracking-label text-brand">
                  AI-Powered Discovery
                </span>
              </div>
              <h1
                className="text-display leading-none tracking-display font-extrabold"
                style={{ WebkitTextStroke: '2px var(--color-brand)', color: 'transparent' }}
              >
                Topic Hub
              </h1>
            </div>

            {/* Search column */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit} role="search" aria-label="Topic search">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-md top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={inputValue}
                    onChange={handleInput}
                    placeholder="Enter a topic, question, or phrase…"
                    aria-label="Topic or phrase"
                    autoFocus
                    className="w-full pl-10 pr-12 py-md bg-surface border border-fg/15 rounded-ot-control text-body text-fg placeholder:text-fg-muted/40 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 motion-safe:transition-all motion-safe:duration-200 appearance-none"
                  />
                  {loading && (
                    <Loader2
                      size={16}
                      className="absolute right-md top-1/2 -translate-y-1/2 text-brand animate-spin"
                      aria-label="Loading…"
                    />
                  )}
                </div>
              </form>

              {/* Query confirmation + dev panel toggle */}
              {activeQuery && !loading && (
                <div className="mt-xs flex items-center gap-sm">
                  <p className="text-label text-fg-muted/70 flex-1">
                    Showing results for{' '}
                    <span className="font-semibold text-fg-muted">"{activeQuery}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDevPanel(v => !v)}
                    aria-label="Toggle query inspector"
                    aria-pressed={showDevPanel}
                    title="Query inspector"
                    className={[
                      'flex items-center justify-center w-6 h-6 rounded transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                      showDevPanel
                        ? 'text-brand bg-brand/10'
                        : 'text-fg-muted/30 hover:text-fg-muted hover:bg-fg/5',
                    ].join(' ')}
                  >
                    <Code2 size={13} />
                  </button>
                </div>
              )}

              {/* Suggested topics */}
              {!inputValue && (
                <div className="mt-sm flex flex-wrap gap-xs items-center">
                  <span className="text-label text-fg-muted/60 shrink-0">Try:</span>
                  {SUGGESTED_TOPICS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleSuggest(t)}
                      className="text-label text-fg-muted border border-fg/15 rounded-ot-control px-sm py-xs hover:border-brand hover:text-fg motion-safe:transition-all motion-safe:duration-150 cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Query inspector panel ── */}
              {showDevPanel && activeQuery && (
                <div
                  className="mt-sm overflow-hidden rounded-ot-surface border"
                  style={{
                    background: 'oklch(0.11 0.01 250)',
                    borderColor: 'oklch(1 0 0 / 0.10)',
                    boxShadow: '0 8px 32px oklch(0 0 0 / 0.40)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center justify-between px-md py-2.5 border-b"
                    style={{ borderColor: 'oklch(1 0 0 / 0.08)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Code2 size={13} style={{ color: 'oklch(0.72 0.14 175)' }} aria-hidden />
                      <span
                        className="text-[10px] uppercase tracking-[0.12em] font-bold select-none"
                        style={{ color: 'oklch(0.72 0.14 175)' }}
                      >
                        Query inspector
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-[10px] uppercase tracking-[0.08em] font-bold px-sm py-1 rounded transition-colors duration-150"
                      style={{
                        color:      copied ? 'oklch(0.72 0.14 175)' : 'oklch(0.55 0.01 250)',
                        background: copied ? 'oklch(0.72 0.14 175 / 0.12)' : 'transparent',
                      }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Panel body */}
                  <pre
                    className="px-md py-md text-[11px] leading-relaxed overflow-x-auto whitespace-pre"
                    style={{ color: 'oklch(0.72 0.01 250)' }}
                  >
                    <span style={{ color: 'oklch(0.55 0.01 250)' }}>{'# API requests (parallel)\n'}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'GET '}</span>
                    <span style={{ color: 'oklch(0.82 0.01 250)' }}>{`/api/search?semantic=true&type=Blog&limit=9&q=${q}\n`}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'GET '}</span>
                    <span style={{ color: 'oklch(0.82 0.01 250)' }}>{`/api/search?semantic=true&type=Event&limit=6&q=${q}\n`}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'GET '}</span>
                    <span style={{ color: 'oklch(0.82 0.01 250)' }}>{`/api/search?semantic=true&type=Page&limit=6&q=${q}\n`}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'GET '}</span>
                    <span style={{ color: 'oklch(0.82 0.14 310)' }}>{`/api/search/docs?q=${q}\n`}</span>
                    {'\n'}
                    <span style={{ color: 'oklch(0.55 0.01 250)' }}>{'# Content Graph strategy\n'}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'ordering:  '}</span>
                    <span style={{ color: 'oklch(0.82 0.18 310)' }}>{'_ranking: SEMANTIC  _semanticWeight: 0.8\n'}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'fulltext:  '}</span>
                    <span style={{ color: 'oklch(0.72 0.01 250)' }}>{'fuzzy: true, synonyms: ONE\n'}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'documents: '}</span>
                    <span style={{ color: 'oklch(0.72 0.01 250)' }}>{'cmp_Asset (ABA folder) → _AssetItem CDN batch\n'}</span>
                    <span style={{ color: 'oklch(0.65 0.01 250)' }}>{'scoping:   '}</span>
                    <span style={{ color: 'oklch(0.72 0.01 250)' }}>{'OT_ThemeManager.frontEndDomain'}</span>
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <div className="bg-canvas min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-md lg:px-lg py-lg space-y-xl">

          {/* Events & Training */}
          {(loading || events.length > 0) && (
            <section aria-label="Events and Training">
              <SectionHeading icon={CalendarDays} label="Events & Training" />
              <div className="grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <EventSkeleton key={i} />)
                  : events.map(r => <EventCard key={r.id} result={r} />)
                }
              </div>
            </section>
          )}

          {/* News & Research */}
          {(loading || blogs.length > 0) && (
            <section aria-label="News and Research">
              <SectionHeading icon={Newspaper} label="News & Research" />
              <div className="grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
                  : blogs.slice(0, showAllBlogs ? 9 : 6).map(r => <BlogCard key={r.id} result={r} />)
                }
              </div>
              {!loading && blogs.length > 6 && !showAllBlogs && (
                <div className="mt-lg flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllBlogs(true)}
                    className="inline-flex items-center gap-sm px-lg py-sm border border-fg/20 rounded-ot-control text-body font-semibold text-fg-muted hover:border-brand hover:text-brand motion-safe:transition-all motion-safe:duration-150 cursor-pointer"
                  >
                    View more
                    <span className="text-label text-fg-muted/60">+{blogs.length - 6}</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Pages & Resources */}
          {(loading || pages.length > 0) && (
            <section aria-label="Pages and Resources">
              <SectionHeading icon={FileText} label="Pages & Resources" />
              <div className="grid gap-md grid-cols-1 sm:grid-cols-2">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => <PageSkeleton key={i} />)
                  : pages.map(r => <PageCard key={r.id} result={r} />)
                }
              </div>
            </section>
          )}

          {/* Recommended Documents */}
          {(loading || docs.length > 0) && (
            <section aria-label="Recommended Documents">
              <SectionHeading icon={BookOpen} label="Recommended Documents" />
              <div className="flex flex-col gap-sm">
                {loading
                  ? <DocSkeleton />
                  : docs.map(doc => <DocRow key={doc.id} doc={doc} />)
                }
              </div>
            </section>
          )}

          {/* No results */}
          {noResults && (
            <div className="text-center py-xl">
              <p className="text-title text-fg-muted">No results found for "{activeQuery}"</p>
              <p className="mt-xs text-body text-fg-muted/60">
                Try different phrasing or one of the suggested topics above.
              </p>
            </div>
          )}

          {/* Initial empty state */}
          {!inputValue && !loading && (
            <div className="py-xl text-center">
              <Sparkles size={32} className="mx-auto mb-md text-brand/20" aria-hidden />
              <p className="text-title text-fg-muted">Enter a topic above to discover related content</p>
              <p className="mt-xs text-body text-fg-muted/50">
                Results are curated across events, research, pages, and documents using semantic AI.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
