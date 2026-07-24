'use client'

import { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Search, Sparkles, Loader2, X,
  CalendarDays, Newspaper, FileText, BookOpen, Code2,
  MapPin, Video, ArrowRight, ArrowDownToLine,
  Users, Building2, Globe, Award, Layers,
  GraduationCap, Heart, Scale, BarChart3,
  Lightbulb, Folder, Tag, MessageSquare,
  Phone, Mail, ExternalLink,
} from 'lucide-react'
import type { SearchResult } from '@/lib/search'
import type { TopicHubBucket, TopicHubRecommendation } from '@/lib/topicHub'
import { eventTypeLabel } from '@/lib/eventFormat'

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
  return <Icon size={size} className="text-brand flex-none" aria-hidden />
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

// ─── Page / Experience card ─────────────────────────────────────────────────────

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

// ─── Practitioner card ──────────────────────────────────────────────────────────

function PractitionerCard({ result }: { result: SearchResult }) {
  const hasLink = !!result.url

  const inner = (
    <div className="flex items-start gap-md">
      {/* Headshot */}
      <div className="flex-none w-13 h-13 rounded-ot-surface overflow-hidden bg-surface border border-fg/10 shrink-0">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.title}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users size={20} className="text-fg-muted/25" aria-hidden />
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <p className="text-title leading-title font-semibold text-fg line-clamp-1 group-hover:text-brand motion-safe:transition-colors motion-safe:duration-150">
          {result.title}
        </p>
        {result.credentials && (
          <p className="mt-0.5 text-label text-fg-muted/70 font-medium">{result.credentials}</p>
        )}
        {result.practitionerTitle && (
          <p className="text-label text-fg-muted/50">{result.practitionerTitle}</p>
        )}
        {result.excerpt && !result.practitionerTitle && (
          <p className="mt-xs text-body-sm text-fg-muted line-clamp-2">{result.excerpt}</p>
        )}
      </div>

      {hasLink && (
        <ArrowRight
          size={14}
          className="flex-none text-fg-muted/25 group-hover:text-brand group-hover:translate-x-0.5 motion-safe:transition-all motion-safe:duration-150 mt-1 shrink-0"
          aria-hidden
        />
      )}
    </div>
  )

  if (!hasLink) {
    return (
      <div className="bg-surface border border-fg/8 rounded-ot-surface p-md">
        {inner}
      </div>
    )
  }

  return (
    <a
      href={result.url}
      className="group block bg-surface border border-fg/8 rounded-ot-surface p-md card-hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {inner}
    </a>
  )
}

// ─── Location card ─────────────────────────────────────────────────────────────
// Locations are informational — OT_LocationProfile has no page URL.

function LocationCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex items-start gap-md bg-surface border border-fg/8 rounded-ot-surface p-md">
      {/* Map thumbnail or pin icon */}
      <div className="flex-none w-13 h-13 rounded-ot-surface overflow-hidden bg-brand/6 border border-brand/12 shrink-0 flex items-center justify-center">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <MapPin size={20} className="text-brand/60" aria-hidden />
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-sm justify-between">
          <p className="text-title leading-title font-semibold text-fg line-clamp-1">
            {result.title}
          </p>
          {result.locationBadge && (
            <span className="flex-none text-[0.6rem] font-bold uppercase tracking-[0.12em] px-sm py-0.75 bg-brand/8 text-brand rounded-ot-control border border-brand/15 leading-none whitespace-nowrap">
              {result.locationBadge}
            </span>
          )}
        </div>
        {result.address && (
          <p className="mt-1 flex items-start gap-1.25 text-body-sm text-fg-muted/75">
            <MapPin size={12} className="flex-none mt-0.5 text-fg-muted/40" aria-hidden />
            {result.address}
          </p>
        )}
      </div>
    </div>
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
      <span
        aria-hidden
        className="flex-none inline-flex items-center px-sm py-1.25 bg-brand text-fg-on-brand text-[0.625rem] font-bold uppercase tracking-[0.14em] leading-none rounded-xs"
      >
        {ext}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-title font-semibold text-fg leading-snug line-clamp-1 capitalize group-hover:text-brand motion-safe:transition-colors motion-safe:duration-150">
          {doc.title}
        </p>
        {size && (
          <p className="text-label text-fg-muted/50 mt-0.5 tabular-nums">{size}</p>
        )}
      </div>
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
        <div className="h-2.5 bg-fg/8 rounded-full w-28" />
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-surface border border-fg/8 rounded-ot-surface p-md animate-pulse flex gap-md items-start">
      <div className="w-13 h-13 bg-fg/8 rounded-ot-surface flex-none" />
      <div className="flex-1 space-y-sm">
        <div className="h-4 bg-fg/8 rounded-full w-3/4" />
        <div className="h-3 bg-fg/8 rounded-full w-1/2" />
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

// ─── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ iconName, label }: { iconName: string | null; label: string }) {
  return (
    <header className="flex items-center gap-sm mb-lg pb-sm border-b border-fg/8">
      <BucketIcon name={iconName} size={16} />
      <h2 className="text-title leading-title font-semibold text-fg">{label}</h2>
    </header>
  )
}

// ─── Bucket result renderer ────────────────────────────────────────────────────

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
  const ct = bucket.sectionContentType

  const skeletonCount = ct === 'blogs' ? 6 : ct === 'events' ? 3 : 3

  const gridClass: Record<string, string> = {
    blogs:         'grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    events:        'grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    assets:        'flex flex-col gap-sm',
    experiences:   'grid gap-md grid-cols-1 sm:grid-cols-2',
    locations:     'grid gap-md grid-cols-1 sm:grid-cols-2',
    practitioners: 'grid gap-md grid-cols-1 sm:grid-cols-2',
  }

  const SkeletonComp = () => {
    if (ct === 'blogs') return <BlogSkeleton />
    if (ct === 'events') return <EventSkeleton />
    if (ct === 'assets') return <DocSkeleton />
    if (ct === 'locations' || ct === 'practitioners') return <CardSkeleton />
    return <PageSkeleton />
  }

  const isEmpty = ct === 'assets' ? docs.length === 0 : results.length === 0

  if (!loading && isEmpty) return null

  return (
    <section aria-label={bucket.sectionHeadline}>
      <SectionHeading iconName={bucket.sectionIcon} label={bucket.sectionHeadline || 'Results'} />

      <div className={gridClass[ct] ?? 'grid gap-md grid-cols-1 sm:grid-cols-2'}>
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonComp key={i} />)
          : ct === 'assets'
            ? docs.map(doc => <DocRow key={doc.id} doc={doc} />)
            : results.map(r => {
                if (ct === 'blogs')         return <BlogCard         key={r.id} result={r} />
                if (ct === 'events')        return <EventCard        key={r.id} result={r} />
                if (ct === 'practitioners') return <PractitionerCard key={r.id} result={r} />
                if (ct === 'locations')     return <LocationCard     key={r.id} result={r} />
                return                             <PageCard         key={r.id} result={r} />
              })
        }
      </div>
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
  const lastQueryRef = useRef<string>('')

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
      const data = await fetch(`/api/search?semantic=true&type=${typeParam}&limit=9&q=${qs}`)
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
        return `GET /api/search?semantic=true&type=${typeMap[ct] ?? 'Page'}&limit=9&q=${q}`
      }),
      ``,
      `# Content Graph strategy`,
      `ordering:  _ranking: SEMANTIC  _semanticWeight: 0.8`,
      `fulltext:  fuzzy: true, synonyms: ONE`,
      `scoping:   OT_ThemeManager.frontEndDomain`,
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const hasAnyResults = buckets.some(b =>
    b.sectionContentType === 'assets'
      ? bucketDocs.length > 0
      : (bucketResults[b.sectionContentType] ?? []).length > 0
  )
  const noResults = !loading && activeQuery.length >= 2 && !hasAnyResults

  return (
    <>
      {/* ── Query inspector flyout ── */}
      <AnimatePresence>
        {showDevPanel && (
          <>
            <motion.div
              key="th-query-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: dur(150) } }}
              exit={{ opacity: 0, transition: { duration: dur(120) } }}
              onClick={() => setShowDevPanel(false)}
              className="fixed inset-0 z-40 bg-canvas/50 backdrop-blur-[2px]"
              aria-hidden
            />
            <motion.div
              key="th-query-flyout"
              initial={{ x: '100%' }}
              animate={{ x: 0, transition: { duration: dur(320), ease: [0.16, 1, 0.3, 1] } }}
              exit={{ x: '100%', transition: { duration: dur(220), ease: [0.4, 0, 1, 1] } }}
              role="dialog"
              aria-label="Query inspector"
              className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
              style={{
                width: 'min(480px, calc(100vw - 48px))',
                background: 'oklch(0.085 0.008 240)',
                borderLeft: '1px solid oklch(1 0 0 / 0.09)',
                boxShadow: '-20px 0 80px oklch(0 0 0 / 0.50)',
                fontFamily: 'var(--font-geist-mono, monospace)',
              }}
            >
              <div
                className="flex items-center justify-between px-md py-sm shrink-0"
                style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}
              >
                <div className="flex items-center gap-xs">
                  <Code2 size={13} style={{ color: 'oklch(0.91 0.27 132)' }} aria-hidden />
                  <span className="text-[11px] uppercase tracking-[0.14em] font-bold select-none" style={{ color: 'oklch(0.72 0.18 132)' }}>
                    Query inspector
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDevPanel(false)}
                  aria-label="Close query inspector"
                  className="opacity-40 hover:opacity-90 transition-opacity duration-150 p-1 rounded"
                  style={{ color: 'oklch(0.72 0.01 250)' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <pre className="px-md py-lg text-[14px] leading-[1.9] whitespace-pre-wrap break-all" style={{ color: 'oklch(0.72 0.01 250)' }}>
                  {(() => {
                    const q = encodeURIComponent(activeQuery)
                    return (
                      <>
                        <span style={{ color: 'oklch(0.40 0.01 250)' }}>{'# API requests (parallel)\n'}</span>
                        {buckets.map((b, i) => {
                          const ct = b.sectionContentType
                          const typeMap: Record<string, string> = {
                            blogs: 'Blog', events: 'Event', experiences: 'Experience',
                            locations: 'Location', practitioners: 'Practitioner',
                          }
                          if (ct === 'assets') {
                            const fid = config.damFolderContainerId ? `&folderId=${config.damFolderContainerId}` : ''
                            return (
                              <span key={i}>
                                <span style={{ color: 'oklch(0.91 0.27 132)' }}>{'GET '}</span>
                                <span style={{ color: 'oklch(0.80 0.22 132)' }}>{`/api/search/docs?q=${q}${fid}\n`}</span>
                              </span>
                            )
                          }
                          return (
                            <span key={i}>
                              <span style={{ color: 'oklch(0.91 0.27 132)' }}>{'GET '}</span>
                              <span style={{ color: 'oklch(0.82 0.01 250)' }}>{`/api/search?semantic=true&type=${typeMap[ct] ?? 'Page'}&limit=9&q=${q}\n`}</span>
                            </span>
                          )
                        })}
                        {'\n'}
                        <span style={{ color: 'oklch(0.40 0.01 250)' }}>{'# Content Graph strategy\n'}</span>
                        <span style={{ color: 'oklch(0.55 0.01 250)' }}>{'ordering:  '}</span>
                        <span style={{ color: 'oklch(0.91 0.27 132)' }}>{'_ranking: SEMANTIC  _semanticWeight: 0.8\n'}</span>
                        <span style={{ color: 'oklch(0.55 0.01 250)' }}>{'fulltext:  '}</span>
                        <span style={{ color: 'oklch(0.78 0.01 250)' }}>{'fuzzy: true, synonyms: ONE\n'}</span>
                        <span style={{ color: 'oklch(0.55 0.01 250)' }}>{'scoping:   '}</span>
                        <span style={{ color: 'oklch(0.78 0.01 250)' }}>{'OT_ThemeManager.frontEndDomain'}</span>
                      </>
                    )
                  })()}
                </pre>
              </div>

              <div className="shrink-0 px-md py-sm flex items-center justify-end" style={{ borderTop: '1px solid oklch(1 0 0 / 0.08)' }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy query details"
                  className="text-[10px] uppercase tracking-widest font-bold px-md py-1.5 rounded-ot-control transition-all duration-150"
                  style={{
                    color:      copied ? 'oklch(0.91 0.27 132)' : 'oklch(0.55 0.01 250)',
                    background: copied ? 'oklch(0.91 0.27 132 / 0.12)' : 'oklch(1 0 0 / 0.05)',
                    border:     '1px solid oklch(1 0 0 / 0.08)',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

              {/* Title with configurable effect */}
              {headerEffect === 'depth3d' ? (
                <PrimaryTextDepth3D text={headerName} />
              ) : headerEffect === 'highlight' ? (
                <h1 className="text-display leading-none tracking-display font-extrabold">
                  <span className={effectClass}>{headerName}</span>
                </h1>
              ) : (
                <h1
                  className={['text-display leading-none tracking-display font-extrabold', effectClass].filter(Boolean).join(' ')}
                  data-text={headerEffect === 'glitch' ? headerName : undefined}
                  data-pause-offscreen={headerEffect === 'animatedGradient' || headerEffect === 'glitch' ? '' : undefined}
                >
                  {headerName}
                </h1>
              )}
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
                    <span className="font-semibold text-fg-muted">&ldquo;{activeQuery}&rdquo;</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDevPanel(v => !v)}
                    aria-label={showDevPanel ? 'Hide query inspector' : 'Show query inspector'}
                    aria-pressed={showDevPanel}
                    className={[
                      'flex items-center gap-1.25 px-sm h-7 rounded-ot-control transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1',
                      showDevPanel
                        ? 'text-brand bg-brand/12 ring-1 ring-brand/30'
                        : 'text-fg-muted/55 bg-fg/5 ring-1 ring-fg/12 hover:text-fg hover:ring-fg/25 hover:bg-fg/8',
                    ].join(' ')}
                  >
                    <Code2 size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Query</span>
                  </button>
                </div>
              )}

              {/* Recommendations */}
              {!inputValue && recommendations.length > 0 && (
                <div className="mt-sm flex flex-wrap gap-xs items-center">
                  <span className="text-label text-fg-muted/60 shrink-0">Try:</span>
                  {recommendations.map(rec => (
                    <button
                      key={rec.label}
                      type="button"
                      onClick={() => handleSuggest(rec.label)}
                      className="text-label text-fg-muted border border-fg/15 rounded-ot-control px-sm py-xs hover:border-brand hover:text-fg motion-safe:transition-all motion-safe:duration-150 cursor-pointer"
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <div className="bg-canvas min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-md lg:px-lg py-lg space-y-xl">

          {buckets.map(bucket => (
            <BucketResults
              key={bucket.sectionContentType}
              bucket={bucket}
              results={bucketResults[bucket.sectionContentType] ?? []}
              docs={bucket.sectionContentType === 'assets' ? bucketDocs : []}
              loading={loading}
            />
          ))}

          {/* No results */}
          {noResults && (
            <div className="text-center py-xl">
              <p className="text-title text-fg-muted">No results found for &ldquo;{activeQuery}&rdquo;</p>
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
                Results are curated across {buckets.length > 0 ? buckets.map(b => b.sectionHeadline || b.sectionContentType).join(', ') : 'events, research, and documents'} using semantic AI.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
