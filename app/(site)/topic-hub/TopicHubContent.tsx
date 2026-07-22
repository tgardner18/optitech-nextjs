'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Sparkles, Loader2,
  CalendarDays, Newspaper, FileText,
  MapPin, Video, ArrowRight,
} from 'lucide-react'
import type { SearchResult } from '@/lib/search'
import { eventTypeLabel } from '@/lib/eventFormat'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShortDate(iso?: string): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch { return null }
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
  const typeLabel   = result.eventType ? eventTypeLabel(result.eventType) : null
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
      <FileText
        size={18}
        className="flex-none text-brand mt-0.5"
        aria-hidden
      />
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
    <header className="flex items-center gap-sm mb-lg">
      <Icon size={20} className="text-brand flex-none" aria-hidden />
      <h2 className="text-headline leading-headline font-bold text-fg">{label}</h2>
    </header>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TopicHubContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const initialTopic = searchParams.get('topic') ?? ''

  const [inputValue,  setInputValue]  = useState(initialTopic)
  const [activeQuery, setActiveQuery] = useState(initialTopic)
  const [blogs,   setBlogs]   = useState<SearchResult[]>([])
  const [events,  setEvents]  = useState<SearchResult[]>([])
  const [pages,   setPages]   = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef    = useRef<HTMLInputElement>(null)

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setBlogs([]); setEvents([]); setPages([])
      setActiveQuery('')
      setLoading(false)
      return
    }
    setLoading(true)
    const base = `/api/search?semantic=true&limit=6&q=${encodeURIComponent(trimmed)}`
    try {
      const [b, e, p] = await Promise.all([
        fetch(`${base}&type=Blog`).then(r => r.json()).catch(() => []),
        fetch(`${base}&type=Event`).then(r => r.json()).catch(() => []),
        fetch(`${base}&type=Page`).then(r => r.json()).catch(() => []),
      ])
      setBlogs(Array.isArray(b) ? b : [])
      setEvents(Array.isArray(e) ? e : [])
      setPages(Array.isArray(p) ? p : [])
      setActiveQuery(trimmed)
    } catch {
      setBlogs([]); setEvents([]); setPages([])
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

  const hasResults = blogs.length > 0 || events.length > 0 || pages.length > 0
  const noResults  = !loading && activeQuery.length >= 2 && !hasResults

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-canvas border-b border-fg/8 px-md py-2xl lg:px-lg">
        <div className="mx-auto max-w-3xl">

          <div className="flex items-center gap-xs mb-md">
            <Sparkles size={16} className="text-brand" aria-hidden />
            <span className="text-label font-semibold uppercase tracking-label text-brand">
              AI-Powered Discovery
            </span>
          </div>

          <h1 className="text-display leading-display tracking-display font-extrabold text-fg mb-sm">
            Topic Hub
          </h1>
          <p className="text-title leading-title text-fg-muted mb-xl text-pretty">
            Explore everything we have on any subject. Powered by semantic AI: no exact keywords needed.
          </p>

          <form onSubmit={handleSubmit} role="search" aria-label="Topic search">
            <div className="relative">
              <Search
                size={18}
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
                className="w-full pl-[2.75rem] pr-[3rem] py-md bg-surface border border-fg/15 rounded-ot-control text-title text-fg placeholder:text-fg-muted/40 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 motion-safe:transition-all motion-safe:duration-200 appearance-none"
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

          {/* Suggested topics — shown only when input is empty */}
          {!inputValue && (
            <div className="mt-md flex flex-wrap gap-sm items-center">
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
        </div>
      </section>

      {/* ── Results area ── */}
      <div className="bg-canvas min-h-[50vh]">

        {/* Query label */}
        {activeQuery && (
          <div className="border-b border-fg/8 px-md lg:px-lg py-sm">
            <div className="mx-auto max-w-7xl">
              <p className="text-label text-fg-muted">
                Results for{' '}
                <span className="font-semibold text-fg">"{activeQuery}"</span>
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-md lg:px-lg py-xl space-y-2xl">

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
                  ? Array.from({ length: 3 }).map((_, i) => <BlogSkeleton key={i} />)
                  : blogs.map(r => <BlogCard key={r.id} result={r} />)
                }
              </div>
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

          {/* No results */}
          {noResults && (
            <div className="text-center py-2xl">
              <p className="text-title text-fg-muted">No results found for "{activeQuery}"</p>
              <p className="mt-xs text-body text-fg-muted/60">
                Try different phrasing or one of the suggested topics above.
              </p>
            </div>
          )}

          {/* Initial empty state */}
          {!inputValue && !loading && (
            <div className="py-2xl text-center">
              <Sparkles size={36} className="mx-auto mb-md text-brand/20" aria-hidden />
              <p className="text-title text-fg-muted">Enter a topic above to discover related content</p>
              <p className="mt-xs text-body text-fg-muted/50">
                Results are curated across events, research, and pages using semantic AI.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
