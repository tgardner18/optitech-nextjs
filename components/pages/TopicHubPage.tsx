'use client'

import { useState, useEffect, useRef, useCallback, startTransition, useId, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Search, Sparkles, Loader2, X, Newspaper, FileText, Code2,
  MapPin, Video, ArrowRight, ArrowDownToLine, ChevronDown, LayoutGrid, ArrowLeft,
} from 'lucide-react'
import type { SearchResult } from '@/lib/search'
import type { TopicHubBucket, TopicHubRecommendation } from '@/lib/topicHub'
import { eventTypeLabel } from '@/lib/eventFormat'
import LocationPlate from '@/components/location/LocationPlate'
import LocationLabelBadge from '@/components/location/LocationLabelBadge'
import CodeView from '@/components/taxonomy/CodeView'
import { t } from '@/lib/i18n/t'
import { trackTopicSelect } from '@/components/taxonomy/track'
import {
  TopicPanel, CardTags, Names, useTaggedPages, fromTagged, poolFor, score, topicsOf, bucketIcon, defaultBucketName, type Match, type HubItem,
} from '@/components/taxonomy/TopicBrowser'

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

function BlogCard({ result, sel }: { result: HubItem; sel: string[] }) {
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
        <CardTags item={result} sel={sel} />
      </span>
    </a>
  )
}

function EventCard({ result, sel }: { result: HubItem; sel: string[] }) {
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
        <CardTags item={result} sel={sel} />
      </span>
    </a>
  )
}

function PageCard({ result, sel }: { result: HubItem; sel: string[] }) {
  return (
    <a href={result.url} data-part="card" data-kind="page">
      <span data-part="icon-tile" aria-hidden="true"><FileText size={18} strokeWidth={2} /></span>
      <span data-part="card-body">
        <span data-part="card-title">{result.title}</span>
        {result.excerpt && <span data-part="excerpt">{result.excerpt}</span>}
        <CardTags item={result} sel={sel} />
      </span>
      <span data-part="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
    </a>
  )
}

function PractitionerCard({ result, sel }: { result: HubItem; sel: string[] }) {
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
        <CardTags item={result} sel={sel} />
      </span>
      {result.url && <span data-part="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>}
    </>
  )
  return result.url
    ? <a href={result.url} data-part="card" data-kind="person">{body}</a>
    : <div data-part="card" data-kind="person">{body}</div>
}

// Locations are informational (OT_LocationProfile has no page URL), so the card is not a link.
function LocationCard({ result }: { result: HubItem }) {
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
function DocRow({ doc: item }: { doc: HubItem }) {
  const doc   = { title: item.title, url: item.url, extension: item.doc?.extension ?? null, fileSize: item.doc?.fileSize ?? null }
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

// ─── Result section (one per content bucket) ───────────────────────────────────

const SECTION_PAGE = 6

type SectionDef = { id: string; label: string; Icon: ReturnType<typeof bucketIcon> }

function Section({ def, items, sel, focus }: { def: SectionDef; items: HubItem[]; sel: string[]; focus: boolean }) {
  const ct        = def.id
  const prefersRM = useReducedMotion()
  const listId    = useId()
  // how many cards are showing; starts over whenever the result set changes (derived, so no effect is needed)
  const start = focus ? SECTION_PAGE * 2 : SECTION_PAGE
  const sig   = `${items.length}:${items[0]?.id ?? ''}:${focus}`
  const [more, setMore] = useState<{ sig: string; n: number }>({ sig, n: start })
  const n       = more.sig === sig ? more.n : start
  const visible = items.slice(0, n)
  const hasMore = items.length > n

  function renderCard(item: HubItem, index: number) {
    const isNew = index >= n - SECTION_PAGE && index >= start
    const cardVariants = {
      hidden: { opacity: 0, y: prefersRM ? 0 : 10 },
      show:   {
        opacity: 1, y: 0,
        transition: { duration: prefersRM ? 0 : 0.22, delay: isNew ? (index - (n - SECTION_PAGE)) * 0.04 : 0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      },
    }
    const inner = ct === 'assets'      ? <DocRow doc={item} />
      : ct === 'blogs'                 ? <BlogCard result={item} sel={sel} />
      : ct === 'events'                ? <EventCard result={item} sel={sel} />
      : ct === 'practitioners' && (item.practitionerTitle || item.credentials || item.imageUrl) ? <PractitionerCard result={item} sel={sel} />
      : ct === 'locations'             ? <LocationCard result={item} />
      :                                  <PageCard result={item} sel={sel} />
    return (
      <motion.li key={item.id} layout={false} variants={cardVariants} initial="hidden" animate="show">
        {inner}
      </motion.li>
    )
  }

  return (
    <section data-part="bucket" data-ct={ct} id={`th-${ct}`} aria-labelledby={`${listId}-h`}>
      <header data-part="bucket-head">
        <span data-part="bucket-ic" aria-hidden="true"><def.Icon size={16} strokeWidth={2} /></span>
        <h2 id={`${listId}-h`}>{def.label}</h2>
        <span data-part="count">{items.length}</span>
      </header>
      <ul id={listId} data-part="grid" data-ct={ct}>{visible.map(renderCard)}</ul>
      {hasMore && (
        <button type="button" data-part="more" onClick={() => setMore({ sig, n: n + SECTION_PAGE })} aria-controls={listId}>
          <ChevronDown size={16} aria-hidden />
          {`Show ${Math.min(SECTION_PAGE, items.length - n)} more`}
          <span data-part="more-n">of {items.length - n} remaining</span>
        </button>
      )}
    </section>
  )
}

function SectionSkeleton({ def }: { def: SectionDef }) {
  return (
    <section data-part="bucket" data-ct={def.id} aria-hidden="true">
      <header data-part="bucket-head">
        <span data-part="bucket-ic"><def.Icon size={16} strokeWidth={2} /></span>
        <h2>{def.label}</h2>
      </header>
      <ul data-part="grid" data-ct={def.id}>
        {Array.from({ length: def.id === 'blogs' ? 3 : 2 }).map((_, i) => <Skeleton key={i} kind={def.id} />)}
      </ul>
    </section>
  )
}

const TAXONOMY_KINDS = ['blogs', 'events', 'experiences', 'practitioners'] as const
const TYPE_PARAM: Record<string, string> = {
  blogs: 'Blog', events: 'Event', experiences: 'Experience', locations: 'Location', practitioners: 'Practitioner',
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TopicHubPage({ config, locale = 'en' }: { config: TopicHubConfig; locale?: string }) {
  const router               = useRouter()
  const searchParams         = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const dur = (ms: number) => prefersReducedMotion ? 0 : ms / 1000

  const initialTopic = searchParams.get('topic') ?? ''

  // Category browsing (CMS taxonomy): ?topics=a,b&match=any|all&from=<page key>, kept in the URL so it is shareable
  const [topics, setTopics] = useState<string[]>(() => (searchParams.get('topics') ?? '').split(',').map(x => x.trim()).filter(Boolean))
  const [match, setMatch]   = useState<Match>(searchParams.get('match') === 'all' ? 'all' : 'any')
  const [fromKey, setFromKey] = useState<string | null>(searchParams.get('from'))
  const [touched, setTouched] = useState(searchParams.has('match'))  // the reader chose Any/All themselves
  const [panelOpen, setPanelOpen] = useState(true)
  const [typeTab, setTypeTab] = useState('all')
  const { pages: tagged, graphql: taggedGraphql } = useTaggedPages()
  const topicMode  = topics.length > 0
  const topicsRef  = useRef({ topics, match, fromKey })
  useEffect(() => { topicsRef.current = { topics, match, fromKey } }, [topics, match, fromKey])

  // The panel starts open; if the reader folds it, it stays folded for the visit.
  useEffect(() => {
    try { if (sessionStorage.getItem('th-panel') === 'closed') startTransition(() => setPanelOpen(false)) } catch { /* private mode */ }
  }, [])
  function changePanel(v: boolean) {
    setPanelOpen(v)
    try { sessionStorage.setItem('th-panel', v ? 'open' : 'closed') } catch { /* ignore */ }
  }

  function urlFor(text: string, next?: Partial<{ topics: string[]; match: 'any' | 'all'; fromKey: string | null }>) {
    const cur = { ...topicsRef.current, ...next }
    const params = new URLSearchParams()
    if (text.trim()) params.set('topic', text.trim())
    if (cur.topics.length) params.set('topics', cur.topics.join(','))
    if (cur.topics.length > 1 && cur.match === 'all') params.set('match', 'all')
    if (cur.fromKey && cur.topics.length) params.set('from', cur.fromKey)
    return `?${params}`
  }
  function setSelection(nextTopics: string[], nextMatch: Match = match, nextFrom = fromKey) {
    setTopics(nextTopics); setMatch(nextMatch); setFromKey(nextTopics.length ? nextFrom : null)
    router.replace(urlFor(inputValueRef.current, { topics: nextTopics, match: nextMatch, fromKey: nextTopics.length ? nextFrom : null }), { scroll: false })
  }
  function toggleTopic(slug: string) {
    if (topics.includes(slug)) {
      const next = topics.filter(x => x !== slug)
      if (!next.length) { setTouched(false); setSelection(next, 'any') } else setSelection(next)
      return
    }
    // tell ODP which topic the reader chose (adding only; removing a topic is not an interest signal)
    const cat = tagged?.flatMap(p => p.categories).find(c => c.slug === slug)
    trackTopicSelect({ slug, group: cat?.group }, 'hub')
    // a manual second pick narrows (All) until the reader chooses; arriving from an article starts on Any
    const m: Match = !fromKey && !touched && topics.length === 1 ? 'all' : match
    setSelection([...topics, slug], m)
  }
  function chooseMatch(m: Match) { setTouched(true); setSelection(topics, m) }
  function clearTopics() { setTouched(false); setSelection([], 'any') }

  const headerName   = config.headerName   || 'Topic Hub'
  const headerEffect = config.headerEffect || 'outline'
  const effectClass  = EFFECT_CLASS[headerEffect] ?? ''
  const recommendations = config.searchRecommendations.slice(0, 5)

  // The editor's content buckets decide the sections (order, headline, icon). Any taggable kind of page the site actually
  // has tagged but no bucket covers is searched too, after them under a default label, so nothing tagged is hidden.
  const taggedKinds = useMemo(() => new Set((tagged ?? []).map(p => p.kind)), [tagged])
  const buckets = useMemo(() => {
    const have = new Set(config.contentBuckets.map(b => b.sectionContentType as string))
    const extra = TAXONOMY_KINDS.filter(k => !have.has(k) && taggedKinds.has(k))
      .map(k => ({ sectionHeadline: '', sectionIcon: null, sectionContentType: k }))
    return [...config.contentBuckets, ...extra] as TopicHubBucket[]
  }, [config.contentBuckets, taggedKinds])
  const bucketSig = buckets.map(b => b.sectionContentType).join(',')
  const sectionDefs: SectionDef[] = useMemo(() => buckets
    .filter((b, i, all) => all.findIndex(x => x.sectionContentType === b.sectionContentType) === i)
    .map(b => ({
      id:    b.sectionContentType,
      label: b.sectionHeadline || (b.sectionContentType === 'assets' ? 'Documents' : b.sectionContentType === 'locations' ? 'Locations' : defaultBucketName(b.sectionContentType, locale)),
      Icon:  bucketIcon(b.sectionIcon, b.sectionContentType),
    })), [buckets, locale])

  const [inputValue,    setInputValue]    = useState(initialTopic)
  const inputValueRef = useRef(initialTopic)
  useEffect(() => { inputValueRef.current = inputValue }, [inputValue])
  const topicState = { sel: topics, match, from: fromKey }
  const [activeQuery,   setActiveQuery]   = useState(initialTopic)
  const [loading,       setLoading]       = useState(false)
  const [showDevPanel,  setShowDevPanel]  = useState(false)
  const [copied,        setCopied]        = useState(false)

  // Keyword hits from every content bucket (documents and locations included); joined to their categories below
  const [hits, setHits] = useState<HubItem[]>([])

  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef     = useRef<HTMLInputElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
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
      setHits([])
      setActiveQuery('')
      setLoading(false)
      return
    }

    setLoading(true)
    const qs = encodeURIComponent(trimmed)

    const fetchers = buckets.map(async (bucket): Promise<HubItem[]> => {
      const ct = bucket.sectionContentType
      if (ct === 'assets') {
        const folderId = config.damFolderContainerId
          ? `&folderId=${encodeURIComponent(config.damFolderContainerId)}`
          : ''
        const data = await fetch(`/api/search/docs?q=${qs}${folderId}`)
          .then(r => r.json()).catch(() => [])
        return (Array.isArray(data) ? data as DocResult[] : []).map(d => ({
          id: d.id, key: d.id, kind: 'assets', categories: [], title: d.title, url: d.url, type: 'Page' as const,
          doc: { extension: d.extension, fileSize: d.fileSize },
        }))
      }
      const typeParam = TYPE_PARAM[ct] ?? 'Page'
      const domainSuffix = config.siteDomain ? `&domain=${encodeURIComponent(config.siteDomain)}` : ''
      const data = await fetch(`/api/search?semantic=true&type=${typeParam}&limit=12&q=${qs}${domainSuffix}`)
        .then(r => r.json()).catch(() => [])
      return (Array.isArray(data) ? data as SearchResult[] : []).map(r => ({ ...r, key: r.id, kind: ct, categories: [] }))
    })

    try {
      const all = (await Promise.all(fetchers)).flat()
      const seen = new Set<string>()
      setHits(all.filter(h => (seen.has(h.id) ? false : (seen.add(h.id), true))))
      setActiveQuery(trimmed)
    } catch {
      setHits([])
    }
    setLoading(false)
  }, [buckets, config.damFolderContainerId, config.siteDomain])

  // Runs for the keyword in the URL on load, and again if the bucket list grows once the tagged pages arrive
  useEffect(() => {
    if (inputValueRef.current.trim().length >= 2) startTransition(() => { runSearch(inputValueRef.current) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketSig])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.replace(urlFor(value), { scroll: false })
      runSearch(value)
    }, 450)
  }

  function handleSuggest(label: string) {
    setInputValue(label)
    clearTimeout(debounceRef.current)
    router.replace(urlFor(label), { scroll: false })
    runSearch(label)
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    router.replace(urlFor(inputValue), { scroll: false })
    runSearch(inputValue)
  }

  function handleClear() {
    setInputValue('')
    clearTimeout(debounceRef.current)
    router.replace(urlFor(''), { scroll: false })
    runSearch('')
    inputRef.current?.focus()
  }

  // ── One result pipeline ──────────────────────────────────────────────────────
  // With a keyword, the scope is that keyword's hits (each joined to its categories); otherwise every tagged page.
  // Topics then refine whichever scope it is, and the Topics panel counts from the same scope.
  const searched = activeQuery.length >= 2
  const taggedItems = useMemo(() => (tagged ?? []).map(fromTagged), [tagged])
  const catsByKey = useMemo(() => new Map((tagged ?? []).map(p => [p.key, p.categories])), [tagged])
  const hitItems = useMemo(() => hits.map(h => ({ ...h, categories: catsByKey.get(h.id) ?? [] })), [hits, catsByKey])
  const scope = searched ? hitItems : taggedItems
  const byCommon = topics.length > 1 && match === 'any'
  const pool = useMemo(() => {
    const list = poolFor(scope, topicState)
    if (searched) return list // Graph's relevance order
    return list.slice().sort((a, b) => {
      if (byCommon) { const d = score(b, topics) - score(a, topics); if (d) return d }
      return (b.published ?? '') > (a.published ?? '') ? 1 : (b.published ?? '') < (a.published ?? '') ? -1 : 0
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, topics, match, fromKey, searched, byCommon])

  const sections = sectionDefs.map(d => ({ def: d, items: pool.filter(i => i.kind === d.id) }))
  const present = sections.filter(x => x.items.length)
  const tab = present.length > 1 && present.some(x => x.def.id === typeTab) ? typeTab : 'all'
  const browsing = !searched && !topicMode
  const topicList = useMemo(() => topicsOf(tagged ?? []), [tagged])

  // What was asked of Graph and what the browser does next (for the Query inspector)
  function inspectorLines(): string[] {
    const urls = (() => {
      const q = encodeURIComponent(activeQuery)
      return buckets.map(b => {
        const ct = b.sectionContentType
        if (ct === 'assets') return `/api/search/docs?q=${q}${config.damFolderContainerId ? `&folderId=${config.damFolderContainerId}` : ''}`
        return `/api/search?semantic=true&type=${TYPE_PARAM[ct] ?? 'Page'}&limit=12&q=${q}${config.siteDomain ? `&domain=${config.siteDomain}` : ''}`
      })
    })()
    return [
      '# Topic Hub: one result list for keywords and categories',
      '',
      '# 1. Tagged pages (one request to Optimizely Graph per page load)',
      'GET /api/topics?view=all',
      '',
      taggedGraphql?.query ?? '(loading)',
      '',
      JSON.stringify(taggedGraphql?.variables ?? {}, null, 2),
      '',
      ...(searched ? [
        '# 2. Keyword "' + activeQuery + '" (parallel Graph requests, one per content bucket)',
        ...urls.map(u => 'GET ' + u),
        '',
        'ordering:  _ranking: SEMANTIC  _semanticWeight: 0.3 to 0.8',
        'fulltext:  fuzzy: true, synonyms: ONE',
        'scoping:   ' + (config.siteDomain ? 'domain=' + config.siteDomain : 'OT_ThemeManager.frontEndDomain (host fallback)'),
        '',
      ] : []),
      '# Then, in the browser (no further requests)',
      searched ? 'scope:         the keyword hits, each joined to its tagged page by key for its categories' : 'scope:         every tagged page',
      `scope size:    ${scope.length}`,
      `topics:        ${topics.length ? topics.join(', ') : '(none)'}`,
      `match:         ${topics.length > 1 ? match : 'n/a'}`,
      `from article:  ${fromKey ?? '(none)'}`,
      `results:       ${pool.length}`,
      '',
      '# Topic counts, filtering and ordering are computed from the scope above,',
      '# so a count on a topic always equals the results you get.',
    ]
  }

  function handleCopy() {
    navigator.clipboard.writeText(inspectorLines().join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const scoped = SCOPED_EFFECTS.has(headerEffect)
  const strict = topics.length > 1 && match === 'all'
  const n = pool.length
  const kw = inputValue.trim()

  let status: React.ReactNode
  if (loading) status = `Searching for “${kw}”…`
  else if (browsing) status = <><b>{t(locale, 'hub.latest')}</b>{t(locale, 'hub.latestRest')}</>
  else {
    status = (
      <>
        <b>{t(locale, n === 1 ? 'hub.resultCount' : 'hub.resultsCount', { count: n })}</b>
        {searched && <> {t(locale, 'hub.for')} “{activeQuery}”</>}
        {topicMode && (fromKey && match === 'any' && topics.length > 1
          ? t(locale, 'hub.sharesTopic')
          : <>{t(locale, 'hub.tagged')}<Names slugs={topics} all={topicList} joiner={t(locale, match === 'all' ? 'hub.and' : 'hub.or')} /></>)}
        {n > 0 ? t(locale, searched ? 'hub.byRelevance' : byCommon ? 'hub.byCommon' : 'hub.newest') : '.'}
      </>
    )
  }

  return (
    <div data-block="topic-hub" data-mode={topicMode || inputValue.trim() ? 'results' : 'browse'}>
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
              <CodeView lines={inspectorLines()} label="Query details" />
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
          <div data-part="hero-main">
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
                placeholder={t(locale, topicMode ? 'hub.searchWithin' : 'hub.searchPlaceholder')}
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

          <aside data-part="graph-card" aria-label={t(locale, 'hub.aboutThisPage')}>
            <p data-part="graph-k">{t(locale, 'hub.graphTitle')}</p>
            <p data-part="graph-d">{t(locale, 'hub.graphBlurb')}</p>
            <button type="button" data-part="graph-btn" onClick={() => setShowDevPanel(v => !v)} aria-pressed={showDevPanel}>
              <Code2 size={16} aria-hidden />
              {t(locale, showDevPanel ? 'hub.graphHide' : 'hub.graphView')}
            </button>
          </aside>
        </div>
      </section>

      {/* ── Results: topics refine whatever the keyword (or the whole site) returned ── */}
      <div data-part="results">
        <div data-part="results-in">
          {tagged && tagged.length > 0 && (
            <TopicPanel pages={tagged} pool={scope} st={topicState} open={panelOpen} onOpen={changePanel}
              onToggle={toggleTopic} onMatch={chooseMatch} onClear={clearTopics} locale={locale} />
          )}

          <section data-part="tp-results" aria-label={t(locale, 'hub.results')}>
            {fromKey && topicMode && <p data-part="tp-from"><ArrowLeft aria-hidden="true" />{t(locale, 'hub.fromArticle')}</p>}
            <p data-part="tp-status" role="status">{status}</p>

            {!loading && present.length > 1 && (
              <div data-part="tp-tabs" role="group" aria-label={t(locale, 'hub.contentType')}>
                <button type="button" aria-pressed={tab === 'all'} onClick={() => setTypeTab('all')}><LayoutGrid aria-hidden="true" />{t(locale, 'hub.allTypes')} <span>{n}</span></button>
                {present.map(x => (
                  <button key={x.def.id} type="button" aria-pressed={tab === x.def.id} onClick={() => setTypeTab(x.def.id)}><x.def.Icon aria-hidden="true" />{x.def.label} <span>{x.items.length}</span></button>
                ))}
              </div>
            )}

            {loading && !hits.length ? (
              sectionDefs.map(d => <SectionSkeleton key={d.id} def={d} />)
            ) : n === 0 ? (
              searched || topicMode ? (
                <div data-part="tp-empty">
                  <p><b>{searched && !topicMode ? `No results for “${activeQuery}”` : t(locale, 'hub.emptyTitle')}</b></p>
                  <p>{searched && !topicMode ? 'Try different phrasing, or pick one of the suggested topics above.' : t(locale, strict ? 'hub.emptyStrict' : 'hub.emptyTry')}</p>
                  {topicMode && (strict
                    ? <button type="button" data-part="tp-link" onClick={() => chooseMatch('any')}>{t(locale, 'hub.matchAnyTopic')}</button>
                    : <button type="button" data-part="tp-link" onClick={clearTopics}>{t(locale, 'hub.clear')}</button>)}
                </div>
              ) : !tagged ? null : (
                <div data-part="empty">
                  <span data-part="empty-ic" aria-hidden="true"><Sparkles size={26} strokeWidth={1.75} /></span>
                  <p data-part="empty-t">Enter a topic to discover related content</p>
                  <p data-part="empty-d">Results come from {buckets.length > 0 ? buckets.map(b => b.sectionHeadline || b.sectionContentType).join(', ') : 'events, research, and documents'}, ranked by semantic AI.</p>
                </div>
              )
            ) : (
              <div data-part="sections">
                {present.filter(x => tab === 'all' || x.def.id === tab).map(x => (
                  <Section key={x.def.id} def={x.def} items={x.items} sel={topics} focus={tab !== 'all'} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
