'use client'

import { useState, useEffect, useRef, useCallback, startTransition, useId } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Search, Sparkles, Loader2, X,
  CalendarDays, Newspaper, FileText, BookOpen, Code2,
  MapPin, Video, ArrowRight, ArrowDownToLine, ChevronDown,
  Users, Building2, Globe, Award, Layers,
  GraduationCap, Heart, Scale, BarChart3,
  Lightbulb, Folder, Tag, MessageSquare,
} from 'lucide-react'
import type { SearchResult } from '@/lib/search'
import type { TopicHubBucket, TopicHubRecommendation } from '@/lib/topicHub'
import { eventTypeLabel } from '@/lib/eventFormat'
import LocationPlate from '@/components/location/LocationPlate'
import LocationLabelBadge from '@/components/location/LocationLabelBadge'

const PrimaryTextDepth3D = dynamic(
  () => import('@/components/blocks/PrimaryTextDepth3D.client'),
  { ssr: false },
)

// ─── Types ────────────────────────────────────────────────────────────────────

type DocResult = {
  id:        string
  title:     string
  url:       string
  extension: string | null
  fileSize:  number | null
}

export type TopicHubConfig = {
  headerName:            string | null
  headerEffect:          string | null
  siteDomain:            string | null
  damFolderContainerId:  string | null
  searchRecommendations: TopicHubRecommendation[]
  contentBuckets:        TopicHubBucket[]
}

// ─── Icon resolver ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, typeof CalendarDays> = {
  CalendarDays,  Newspaper,  FileText,  BookOpen,
  Users,  MapPin,  Building2,  Video,  Globe,
  Award,  Layers,  Sparkles,  GraduationCap,
  Heart,  Scale,  BarChart3,  Lightbulb,
  Folder,  Tag,  MessageSquare,
}

function BucketIcon({ name, size = 16 }: { name: string | null; size?: number }) {
  const Icon = (name && ICON_MAP[name]) ? ICON_MAP[name] : Layers
  return <Icon size={size} strokeWidth={2} aria-hidden />
}

// ─── Header effect system ──────────────────────────────────────────────────────

const EFFECT_CLASS: Record<string, string> = {
  none:             '',
  gradient:         'ot-fx-gradient',
  animatedGradient: 'ot-depth-liquid',
  depth3d:          'ot-depth-extrude',
  glitch:           'ot-fx-chromatic',
  outline:          'ot-depth-outline',
  neon:             'ot-fx-neon',
  highlight:        'ot-fx-highlight',
  glow:             'ot-fx-glow',
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

const DOC_TYPE: Record<string, string> = {
  pdf: 'PDF document', doc: 'Word document', docx: 'Word document',
  xls: 'Excel spreadsheet', xlsx: 'Excel spreadsheet',
  ppt: 'PowerPoint presentation', pptx: 'PowerPoint presentation', txt: 'Text file',
}

// The effects topic-hub.css draws itself (with mode-aware inks). Every other effect keeps its global class.
const SCOPED_EFFECTS = new Set(['none', 'outline', 'gradient', 'highlight'])

function formatDocFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Cards (styled by topic-hub.css) ──────────────────────────────────────────

function BlogCard({ result }: { result: SearchResult }) {
  return (
    <a href={result.url} data-part="card" data-kind="blog">
      <span data-part="media">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.imageUrl} alt="" loading="lazy" />
        ) : (
          <span data-part="media-fill" aria-hidden="true"><Newspaper size={28} strokeWidth={1.5} /></span>
        )}
      </span>
      <span data-part="card-body">
        {result.topic && <span data-part="eyebrow">{result.topic.charAt(0).toUpperCase() + result.topic.slice(1)}</span>}
        <span data-part="card-title">{result.title}</span>
        {result.excerpt && <span data-part="excerpt">{result.excerpt}</span>}
        {result.published && <span data-part="meta">{formatShortDate(result.published)}</span>}
      </span>
    </a>
  )
}

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
    <a href={result.url} data-part="card" data-kind="event">
      {month && (
        <span data-part="datetile" aria-hidden="true"><span>{month}</span><b>{day}</b></span>
      )}
      <span data-part="card-body">
        {typeLabel && <span data-part="type-chip">{typeLabel}</span>}
        <span data-part="card-title">{result.title}</span>
        {(result.locationLabel || month) && (
          <span data-part="meta">
            {result.locationLabel && <LocationIcon size={14} strokeWidth={2} aria-hidden />}
            {month && <span className="sr-only">{month} {day}, </span>}
            {result.locationLabel}
          </span>
        )}
      </span>
    </a>
  )
}

function PageCard({ result }: { result: SearchResult }) {
  return (
    <a href={result.url} data-part="card" data-kind="page">
      <span data-part="icon-tile" aria-hidden="true"><FileText size={18} strokeWidth={2} /></span>
      <span data-part="card-body">
        <span data-part="card-title">{result.title}</span>
        {result.excerpt && <span data-part="excerpt">{result.excerpt}</span>}
      </span>
      <span data-part="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
    </a>
  )
}

function PractitionerCard({ result }: { result: SearchResult }) {
  const body = (
    <>
      <span data-part="headshot">
        {result.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.imageUrl} alt="" loading="lazy" />
        )}
      </span>
      <span data-part="card-body">
        <span data-part="card-title">{result.title}</span>
        {result.practitionerTitle && <span data-part="role">{result.practitionerTitle}</span>}
        {result.credentials && <span data-part="meta">{result.credentials}</span>}
        {result.excerpt && !result.practitionerTitle && <span data-part="excerpt">{result.excerpt}</span>}
      </span>
      {result.url && <span data-part="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>}
    </>
  )
  return result.url
    ? <a href={result.url} data-part="card" data-kind="person">{body}</a>
    : <div data-part="card" data-kind="person">{body}</div>
}

// Locations are informational (OT_LocationProfile has no page URL), so the card is not a link.
function LocationCard({ result }: { result: SearchResult }) {
  return (
    <div data-part="card" data-kind="location">
      <span data-part="media">
        <LocationPlate shape="fill" src={result.imageUrl} name={result.title} alt="" />
        {result.locationBadge && <LocationLabelBadge label={result.locationBadge} />}
      </span>
      <span data-part="card-body">
        <span data-part="card-title">{result.title}</span>
        {result.address && (
          <span data-part="meta"><MapPin size={14} strokeWidth={2} aria-hidden />{result.address}</span>
        )}
        {result.excerpt && <span data-part="excerpt">{result.excerpt}</span>}
      </span>
    </div>
  )
}

// Document row: the editor's casing is kept, the name wraps to two lines, the type is stated in words,
// and the download control says it opens a new tab.
function DocRow({ doc }: { doc: DocResult }) {
  const ext   = (doc.extension ?? 'file').toLowerCase()
  const size  = doc.fileSize ? formatDocFileSize(doc.fileSize) : null
  const type  = DOC_TYPE[ext] ?? `${ext.toUpperCase()} file`
  const title = doc.title.replace(/\.[a-z0-9]{2,5}$/i, '')

  return (
    <a href={doc.url} target="_blank" rel="noopener noreferrer" data-part="card" data-kind="doc">
      <span data-part="filetile" aria-hidden="true"><FileText size={20} strokeWidth={1.75} /><b>{ext.toUpperCase()}</b></span>
      <span data-part="card-body">
        <span data-part="card-title">{title}</span>
        <span data-part="meta">{type}{size && <><span aria-hidden="true">·</span>{size}</>}</span>
      </span>
      <span data-part="dl">
        <ArrowDownToLine size={16} strokeWidth={2} aria-hidden />
        <span data-part="dl-t">Download</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ kind }: { kind: string }) {
  return <li data-part="sk" data-kind={kind} aria-hidden="true"><span /><span><i /><i /><i /></span></li>
}

// ─── Bucket result renderer ────────────────────────────────────────────────────

const BUCKET_INITIAL = 6
const BUCKET_PAGE    = 6

function BucketResults({
  bucket,
  results,
  docs,
  loading,
}: {
  bucket:  TopicHubBucket
  results: SearchResult[]
  docs:    DocResult[]
  loading: boolean
}) {
  const ct           = bucket.sectionContentType
  const prefersRM    = useReducedMotion()
  const listId       = useId()
  const [visibleCount, setVisibleCount] = useState(BUCKET_INITIAL)

  // Reset pagination when a new query delivers a fresh result set.
  useEffect(() => { setVisibleCount(BUCKET_INITIAL) }, [results, docs])

  const skeletonCount = ct === 'blogs' ? 3 : 2

  const allItems  = ct === 'assets' ? docs : results
  const isEmpty   = allItems.length === 0
  const visible   = allItems.slice(0, visibleCount)
  const hasMore   = !loading && allItems.length > visibleCount

  if (!loading && isEmpty) return null

  function renderCard(item: SearchResult | DocResult, index: number) {
    const isNew    = index >= BUCKET_INITIAL && index < visibleCount
    const delay    = isNew ? (index - (visibleCount - BUCKET_PAGE)) * 0.04 : 0

    const cardVariants = {
      hidden: { opacity: 0, y: prefersRM ? 0 : 10 },
      show:   {
        opacity: 1, y: 0,
        transition: { duration: prefersRM ? 0 : 0.22, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      },
    }

    const inner = ct === 'assets'
      ? <DocRow  doc={item as DocResult} />
      : ct === 'blogs'         ? <BlogCard         result={item as SearchResult} />
      : ct === 'events'        ? <EventCard        result={item as SearchResult} />
      : ct === 'practitioners' ? <PractitionerCard result={item as SearchResult} />
      : ct === 'locations'     ? <LocationCard     result={item as SearchResult} />
      :                          <PageCard         result={item as SearchResult} />

    return (
      <motion.li
        key={(item as SearchResult).id ?? (item as DocResult).id}
        layout={false}
        variants={cardVariants}
        initial="hidden"
        animate="show"
      >
        {inner}
      </motion.li>
    )
  }

  return (
    <section data-part="bucket" data-ct={ct} id={`th-${ct}`} aria-labelledby={`${listId}-h`}>
      <header data-part="bucket-head">
        <span data-part="bucket-ic" aria-hidden="true"><BucketIcon name={bucket.sectionIcon} size={16} /></span>
        <h2 id={`${listId}-h`}>{bucket.sectionHeadline || 'Results'}</h2>
        {!loading && <span data-part="count">{allItems.length}</span>}
      </header>

      <ul id={listId} data-part="grid" data-ct={ct}>
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => <Skeleton key={i} kind={ct} />)
          : (visible as Array<SearchResult | DocResult>).map((item, i) => renderCard(item, i))
        }
      </ul>

      {hasMore && (
        <button type="button" data-part="more" onClick={() => setVisibleCount(c => c + BUCKET_PAGE)} aria-controls={listId}>
          <ChevronDown size={16} aria-hidden />
          {`Show ${Math.min(BUCKET_PAGE, allItems.length - visibleCount)} more`}
          <span data-part="more-n">of {allItems.length - visibleCount} remaining</span>
        </button>
      )}
    </section>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TopicHubPage({ config }: { config: TopicHubConfig }) {
  const router               = useRouter()
  const searchParams         = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const dur = (ms: number) => prefersReducedMotion ? 0 : ms / 1000

  const initialTopic = searchParams.get('topic') ?? ''

  const headerName   = config.headerName   || 'Topic Hub'
  const headerEffect = config.headerEffect || 'outline'
  const effectClass  = EFFECT_CLASS[headerEffect] ?? ''
  const recommendations = config.searchRecommendations.slice(0, 5)
  const buckets         = config.contentBuckets

  const [inputValue,    setInputValue]    = useState(initialTopic)
  const [activeQuery,   setActiveQuery]   = useState(initialTopic)
  const [loading,       setLoading]       = useState(false)
  const [showDevPanel,  setShowDevPanel]  = useState(false)
  const [copied,        setCopied]        = useState(false)

  // Per-bucket result state — keyed by sectionContentType
  const [bucketResults, setBucketResults] = useState<Record<string, SearchResult[]>>({})
  const [bucketDocs,    setBucketDocs]    = useState<DocResult[]>([])

  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef     = useRef<HTMLInputElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const lastQueryRef = useRef<string>('')
  const searchId     = useId()

  // The Highlight marker draws once when the page loads.
  useEffect(() => {
    if (headerEffect !== 'highlight') return
    const tid = setTimeout(() => titleRef.current?.setAttribute('data-in', ''), 150)
    return () => clearTimeout(tid)
  }, [headerEffect])

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setBucketResults({})
      setBucketDocs([])
      setActiveQuery('')
      setLoading(false)
      return
    }

    setLoading(true)
    lastQueryRef.current = trimmed
    const qs = encodeURIComponent(trimmed)

    const fetchers = buckets.map(async bucket => {
      const ct = bucket.sectionContentType
      if (ct === 'assets') {
        const folderId = config.damFolderContainerId
          ? `&folderId=${encodeURIComponent(config.damFolderContainerId)}`
          : ''
        const data = await fetch(`/api/search/docs?q=${qs}${folderId}`)
          .then(r => r.json()).catch(() => [])
        return { ct, results: [], docs: Array.isArray(data) ? data : [] }
      }

      const typeMap: Record<string, string> = {
        blogs:         'Blog',
        events:        'Event',
        experiences:   'Experience',
        locations:     'Location',
        practitioners: 'Practitioner',
      }
      const typeParam = typeMap[ct] ?? 'Page'
      const domainSuffix = config.siteDomain ? `&domain=${encodeURIComponent(config.siteDomain)}` : ''
      const data = await fetch(`/api/search?semantic=true&type=${typeParam}&limit=12&q=${qs}${domainSuffix}`)
        .then(r => r.json()).catch(() => [])
      return { ct, results: Array.isArray(data) ? data : [], docs: [] }
    })

    try {
      const all = await Promise.all(fetchers)
      const newResults: Record<string, SearchResult[]> = {}
      let newDocs: DocResult[] = []
      for (const { ct, results, docs } of all) {
        if (ct === 'assets') { newDocs = docs }
        else newResults[ct] = results
      }
      setBucketResults(newResults)
      setBucketDocs(newDocs)
      setActiveQuery(trimmed)
    } catch {
      setBucketResults({})
      setBucketDocs([])
    }
    setLoading(false)
  }, [buckets, config.damFolderContainerId])

  useEffect(() => {
    if (initialTopic) startTransition(() => { runSearch(initialTopic) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set('topic', value.trim())
      router.replace(`?${params}`, { scroll: false })
      runSearch(value)
    }, 450)
  }

  function handleSuggest(label: string) {
    setInputValue(label)
    clearTimeout(debounceRef.current)
    const params = new URLSearchParams()
    params.set('topic', label)
    router.replace(`?${params}`, { scroll: false })
    runSearch(label)
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    const params = new URLSearchParams()
    if (inputValue.trim()) params.set('topic', inputValue.trim())
    router.replace(`?${params}`, { scroll: false })
    runSearch(inputValue)
  }

  function handleClear() {
    setInputValue('')
    clearTimeout(debounceRef.current)
    router.replace('?', { scroll: false })
    runSearch('')
    inputRef.current?.focus()
  }

  function handleCopy() {
    const q = encodeURIComponent(lastQueryRef.current)
    const lines = [
      `# Topic Hub — last search: "${lastQueryRef.current}"`,
      ``,
      `# API requests (parallel)`,
      ...buckets.map(b => {
        const ct = b.sectionContentType
        if (ct === 'assets') {
          const fid = config.damFolderContainerId ? `&folderId=${config.damFolderContainerId}` : ''
          return `GET /api/search/docs?q=${q}${fid}`
        }
        const typeMap: Record<string, string> = {
          blogs: 'Blog', events: 'Event', experiences: 'Experience',
          locations: 'Location', practitioners: 'Practitioner',
        }
        const dom = config.siteDomain ? `&domain=${config.siteDomain}` : ''
        return `GET /api/search?semantic=true&type=${typeMap[ct] ?? 'Page'}&limit=12&q=${q}${dom}`
      }),
      ``,
      `# Content Graph strategy`,
      `ordering:  _ranking: SEMANTIC  _semanticWeight: 0.8`,
      `fulltext:  fuzzy: true, synonyms: ONE`,
      `scoping:   ${config.siteDomain ? `domain=${config.siteDomain}` : 'OT_ThemeManager.frontEndDomain (host fallback)'}`,
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const countFor = (b: TopicHubBucket) =>
    b.sectionContentType === 'assets' ? bucketDocs.length : (bucketResults[b.sectionContentType] ?? []).length
  const present      = buckets.filter(b => countFor(b) > 0)
  const totalResults = present.reduce((n, b) => n + countFor(b), 0)
  const hasAnyResults = present.length > 0
  const searched = activeQuery.length >= 2
  const noResults = !loading && searched && !hasAnyResults
  const scoped = SCOPED_EFFECTS.has(headerEffect)

  const queryUrls = (q: string) => buckets.map(b => {
    const ct = b.sectionContentType
    const typeMap: Record<string, string> = {
      blogs: 'Blog', events: 'Event', experiences: 'Experience',
      locations: 'Location', practitioners: 'Practitioner',
    }
    if (ct === 'assets') {
      const fid = config.damFolderContainerId ? `&folderId=${config.damFolderContainerId}` : ''
      return `/api/search/docs?q=${q}${fid}`
    }
    const dom = config.siteDomain ? `&domain=${config.siteDomain}` : ''
    return `/api/search?semantic=true&type=${typeMap[ct] ?? 'Page'}&limit=12&q=${q}${dom}`
  })

  return (
    <div data-block="topic-hub">
      {/* ── Query inspector flyout ── */}
      <AnimatePresence>
        {showDevPanel && (
          <>
            <motion.div
              key="th-query-backdrop"
              data-part="insp-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: dur(150) } }}
              exit={{ opacity: 0, transition: { duration: dur(120) } }}
              onClick={() => setShowDevPanel(false)}
              aria-hidden
            />
            <motion.aside
              key="th-query-flyout"
              data-part="inspector"
              initial={{ x: '100%' }}
              animate={{ x: 0, transition: { duration: dur(320), ease: [0.16, 1, 0.3, 1] } }}
              exit={{ x: '100%', transition: { duration: dur(220), ease: [0.4, 0, 1, 1] } }}
              role="dialog"
              aria-labelledby="th-insp-h"
            >
              <div data-part="insp-head">
                <h2 id="th-insp-h"><Code2 size={14} aria-hidden />Query inspector</h2>
                <button type="button" data-part="icon-btn" onClick={() => setShowDevPanel(false)} aria-label="Close query inspector">
                  <X size={16} aria-hidden />
                </button>
              </div>
              <pre data-part="insp-code">
                <span data-c="comment">{'# API requests (parallel)\n'}</span>
                {queryUrls(encodeURIComponent(activeQuery)).map((u, i) => (
                  <span key={i}><span data-c="verb">{'GET '}</span><span data-c="val">{u + '\n'}</span></span>
                ))}
                {'\n'}
                <span data-c="comment">{'# Content Graph strategy\n'}</span>
                <span data-c="key">{'ordering:  '}</span><span data-c="verb">{'_ranking: SEMANTIC  _semanticWeight: 0.8\n'}</span>
                <span data-c="key">{'fulltext:  '}</span><span data-c="val">{'fuzzy: true, synonyms: ONE\n'}</span>
                <span data-c="key">{'scoping:   '}</span>
                <span data-c="val">{config.siteDomain ? `domain=${config.siteDomain}` : 'OT_ThemeManager.frontEndDomain (host fallback)'}</span>
              </pre>
              <div data-part="insp-foot">
                <button type="button" data-part="insp-copy" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
                <span role="status" className="sr-only">{copied ? 'Query details copied' : ''}</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero: stacked, so any header name fits ── */}
      <section data-part="hero">
        <div data-part="hero-in">
          <p data-part="kicker"><Sparkles size={14} aria-hidden />AI-Powered Discovery</p>

          {headerEffect === 'depth3d' ? (
            <h1 data-part="title"><PrimaryTextDepth3D text={headerName} /></h1>
          ) : (
            <h1
              ref={titleRef}
              data-part="title"
              data-effect={scoped ? headerEffect : undefined}
              data-animate={headerEffect === 'highlight' ? '' : undefined}
              className={scoped ? undefined : effectClass || undefined}
              data-text={headerEffect === 'glitch' ? headerName : undefined}
              data-pause-offscreen={headerEffect === 'animatedGradient' || headerEffect === 'glitch' ? '' : undefined}
            >
              {headerEffect === 'highlight'
                ? <span data-part="mark-line"><span data-part="mark-text">{headerName}</span></span>
                : headerName}
            </h1>
          )}

          <form data-part="search" onSubmit={handleSubmit} role="search" aria-label="Topic search">
            <label htmlFor={searchId} className="sr-only">Topic or phrase</label>
            <span data-part="field">
              <Search size={20} strokeWidth={2} data-part="field-ic" aria-hidden />
              <input
                ref={inputRef}
                id={searchId}
                type="search"
                value={inputValue}
                onChange={handleInput}
                placeholder="Enter a topic, question, or phrase"
                autoComplete="off"
              />
              {loading ? (
                <span data-part="spin" aria-hidden="true"><Loader2 size={18} strokeWidth={2} /></span>
              ) : inputValue ? (
                <button type="button" data-part="icon-btn" onClick={handleClear} aria-label="Clear search">
                  <X size={18} strokeWidth={2} aria-hidden />
                </button>
              ) : null}
            </span>
          </form>

          {/* Suggestions stay visible after a search; the active topic is pressed. */}
          {recommendations.length > 0 && (
            <div data-part="recs" role="group" aria-label="Suggested topics">
              <span data-part="recs-k">Try</span>
              {recommendations.map(rec => (
                <button
                  key={rec.label}
                  type="button"
                  data-part="chip-btn"
                  aria-pressed={activeQuery.toLowerCase() === rec.label.toLowerCase()}
                  onClick={() => handleSuggest(rec.label)}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      <div data-part="results">
        <div data-part="results-in">
          <div data-part="summary">
            <p data-part="status" role="status">
              {loading
                ? `Searching for “${inputValue.trim()}”…`
                : searched && hasAnyResults
                  ? <><b>{totalResults} results</b> for “{activeQuery}” across {present.length} {present.length === 1 ? 'section' : 'sections'}</>
                  : ''}
            </p>
            {searched && !loading && hasAnyResults && (
              <>
                <nav data-part="jump" aria-label="Jump to a section">
                  {present.map(b => (
                    <a key={b.sectionContentType} href={`#th-${b.sectionContentType}`} data-part="jump-link">
                      {b.sectionHeadline || b.sectionContentType}<span>{countFor(b)}</span>
                    </a>
                  ))}
                </nav>
                <button type="button" data-part="tool" onClick={() => setShowDevPanel(v => !v)} aria-pressed={showDevPanel}>
                  <Code2 size={14} aria-hidden />Query
                </button>
              </>
            )}
          </div>

          {buckets.map(bucket => (
            <BucketResults
              key={bucket.sectionContentType}
              bucket={bucket}
              results={bucketResults[bucket.sectionContentType] ?? []}
              docs={bucket.sectionContentType === 'assets' ? bucketDocs : []}
              loading={loading}
            />
          ))}

          {noResults && (
            <div data-part="empty">
              <span data-part="empty-ic" aria-hidden="true"><Search size={26} strokeWidth={1.75} /></span>
              <p data-part="empty-t">No results for “{activeQuery}”</p>
              <p data-part="empty-d">Try different phrasing, or pick one of the suggested topics above.</p>
            </div>
          )}

          {!inputValue && !loading && (
            <div data-part="empty">
              <span data-part="empty-ic" aria-hidden="true"><Sparkles size={26} strokeWidth={1.75} /></span>
              <p data-part="empty-t">Enter a topic to discover related content</p>
              <p data-part="empty-d">
                Results come from {buckets.length > 0 ? buckets.map(b => b.sectionHeadline || b.sectionContentType).join(', ') : 'events, research, and documents'}, ranked by semantic AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
