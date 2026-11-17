import { getClient, getRequestBaseUrl, getRequestDomain, getRequestLocale, getSiteSettings } from '@/lib/optimizely'

/**
 * CMS taxonomy (categories) term map.
 *
 * Facts established by the pilot (Nov 2026):
 *  - Graph stores a tag on content as `cms://taxonomy/categories/{key}` under `_itemMetadata.categories`.
 *  - A term's key is its name with underscores. The first term created with a name keeps the short key; a later
 *    duplicate gets its parent's key as a prefix (Pilot_Two_Pilot_Child). So keys depend on creation order and must
 *    never be hardcoded: always resolve through this map.
 *  - Hierarchy lives only in `parent`; the tag on content carries no path.
 *  - `_TaxonomyTerm` returns one row per locale plus an empty-locale row, so rows are grouped by key.
 */

const URI_PREFIX = 'cms://taxonomy/categories/'
const TTL_MS = 5 * 60 * 1000
const PAGE = 100

type TermRow = { key: string; displayName: string; parent: string | null; usage: string; locale: string }

type Term = {
  key: string
  parent: string | null
  usage: 'Public' | 'Internal'
  /** display name by locale ('' is the language-neutral row) */
  names: Record<string, string>
}

export type CategoryPathStep = { key: string; name: string }

export type ResolvedCategory = {
  key: string
  /** Display name of the leaf, in the requested locale where translated. */
  name: string
  /** Root-first path including the leaf itself. */
  path: CategoryPathStep[]
  /** URL-safe slug for the Topic Hub query string (lowercase, hyphenated). */
  slug: string
  /** Name of the top-level category this one sits under (Topic, Audience, Theme, Format...). */
  group: string
  /** Published pages tagged with it, site-wide. Undefined when counts are unavailable. */
  count?: number
}

export const categoryKeyFromUri = (uri: string) => (uri.startsWith(URI_PREFIX) ? uri.slice(URI_PREFIX.length) : uri)
export const categoryUriFromKey = (key: string) => (key.startsWith(URI_PREFIX) ? key : URI_PREFIX + key)

export const slugify = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Counts use the same scope as the Topic Hub results (this site's published pages, in this locale), so the number on a
// marker is always the number of results the visitor then sees.
const COUNTS_QUERY = `
  query GetCategoryCounts($locale: String!, $base: String!) {
    _Content(
      where: { _metadata: { locale: { eq: $locale }, status: { eq: "Published" }, url: { base: { eq: $base } }, types: { in: ["_Page"] } } }
      limit: 0
    ) { facets { _itemMetadata { categories { name count } } } }
  }
`
const countCache = new Map<string, { at: number; counts: Map<string, number> }>()

/** Pages tagged per category key on the current site (one facet query, cached per site and locale). Failures return an empty map. */
export async function getCategoryCounts(locale = 'en'): Promise<Map<string, number>> {
  const base = await getRequestBaseUrl()
  const id = `${base}|${locale}`
  const hit = countCache.get(id)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.counts
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await getClient().request(COUNTS_QUERY, { locale, base })
    const rows: { name: string; count: number }[] = data?._Content?.facets?._itemMetadata?.categories ?? []
    const counts = new Map(rows.map((r) => [categoryKeyFromUri(r.name), r.count]))
    countCache.set(id, { at: Date.now(), counts })
    return counts
  } catch {
    return new Map()
  }
}

const HUB_URL_QUERY = `
  query GetTopicHubUrl($key: String!) {
    _Content(where: { _metadata: { key: { eq: $key }, status: { eq: "Published" } } }, limit: 1) {
      items { _metadata { url { default } } }
    }
  }
`
const hubUrls = new Map<string, { at: number; url: string | null }>()

/**
 * URL of the Topic Hub the site has chosen in Theme Manager ("Topic Hub Page"), or null when none is set
 * (categories then render as plain labels). The editor creates the hub page first, then selects it there.
 */
export async function getTopicHubUrl(): Promise<string | null> {
  try {
    const settings = await getSiteSettings(await getRequestDomain(), await getRequestLocale())
    const key: string | undefined = settings?.topicHubRef?.key
    if (!key) return null
    const hit = hubUrls.get(key)
    if (hit && Date.now() - hit.at < TTL_MS) return hit.url
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await getClient().request(HUB_URL_QUERY, { key })
    const url: string | null = data?._Content?.items?.[0]?._metadata?.url?.default ?? null
    hubUrls.set(key, { at: Date.now(), url })
    return url
  } catch {
    return null
  }
}

/** Adds page counts to resolved categories (a category with no other tagged page keeps count 1 = this page only). */
export async function withCounts(cats: ResolvedCategory[], locale = 'en'): Promise<ResolvedCategory[]> {
  if (!cats.length) return cats
  const counts = await getCategoryCounts(locale)
  return cats.map((c) => ({ ...c, count: counts.get(c.key) }))
}

const TERMS_QUERY = `
  query GetTaxonomyTerms($skip: Int!, $limit: Int!) {
    _TaxonomyTerm(skip: $skip, limit: $limit) {
      total
      items { _metadata { key displayName parent usage locale } }
    }
  }
`

let cache: { at: number; terms: Map<string, Term> } | null = null
let inflight: Promise<Map<string, Term>> | null = null

async function loadTerms(): Promise<Map<string, Term>> {
  const terms = new Map<string, Term>()
  let skip = 0
  let total = Infinity
  while (skip < total) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await getClient().request(TERMS_QUERY, { skip, limit: PAGE })
    const page = data?._TaxonomyTerm
    const items: { _metadata: TermRow }[] = page?.items ?? []
    total = page?.total ?? 0
    if (!items.length) break
    for (const { _metadata: m } of items) {
      if (!m?.key) continue
      const t = terms.get(m.key) ?? { key: m.key, parent: m.parent ?? null, usage: 'Public' as const, names: {} }
      if (m.usage === 'Internal') t.usage = 'Internal'
      if (m.parent) t.parent = m.parent
      t.names[m.locale ?? ''] = m.displayName ?? ''
      terms.set(m.key, t)
    }
    skip += PAGE
  }
  return terms
}

/** All terms, cached for a few minutes per server instance. Failures return an empty map (never throws). */
export async function getTermMap(): Promise<Map<string, Term>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.terms
  inflight ??= loadTerms()
    .then((terms) => {
      cache = { at: Date.now(), terms }
      return terms
    })
    .catch(() => cache?.terms ?? new Map<string, Term>())
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** Untranslated labels come back as "-" or empty in non-master languages; fall back to English, then the key. */
function nameFor(term: Term, locale: string): string {
  const usable = (n?: string) => (n && n.trim() && n.trim() !== '–' && n.trim() !== '-' ? n.trim() : null)
  return (
    usable(term.names[locale]) ??
    usable(term.names['en']) ??
    usable(term.names['']) ??
    term.key.replace(/_/g, ' ')
  )
}

/**
 * Turns the raw tags on a content item (full `cms://` URIs or short keys) into display-ready categories.
 * Internal-usage terms (and anything beneath an Internal ancestor) are dropped, so editor-only tags never reach visitors.
 * Unknown keys are skipped.
 */
export async function resolveCategories(
  tags: readonly string[] | null | undefined,
  locale = 'en',
): Promise<ResolvedCategory[]> {
  if (!tags?.length) return []
  const terms = await getTermMap()
  const out: ResolvedCategory[] = []
  const seen = new Set<string>()

  for (const tag of tags) {
    const key = categoryKeyFromUri(tag)
    if (seen.has(key)) continue
    seen.add(key)

    const path: CategoryPathStep[] = []
    let internal = false
    let cursor: Term | undefined = terms.get(key)
    if (!cursor) continue
    // bounded walk: guards against a cyclic parent chain
    for (let i = 0; cursor && i < 12; i++) {
      if (cursor.usage === 'Internal') internal = true
      path.unshift({ key: cursor.key, name: nameFor(cursor, locale) })
      cursor = cursor.parent ? terms.get(cursor.parent) : undefined
    }
    if (internal) continue
    const name = path[path.length - 1].name
    out.push({ key, name, path, slug: slugify(name), group: path[0].name })
  }
  return out
}

export type TopicOption = { key: string; slug: string; name: string; count: number }
export type TopicGroup = { key: string; name: string; topics: TopicOption[] }

/**
 * Browse structure for the Topic Hub: each top-level public category becomes a group, and every tagged term beneath it
 * (any depth) is a selectable topic with its page count. Terms nobody uses are left out. Same-named terms in a group
 * (Option A repeats across verticals) are merged and their counts added, so a name is one topic.
 */
export async function getTopicGroups(locale = 'en'): Promise<TopicGroup[]> {
  const [terms, counts] = await Promise.all([getTermMap(), getCategoryCounts(locale)])
  const groups = new Map<string, TopicGroup>()
  for (const term of terms.values()) {
    const n = counts.get(term.key) ?? 0
    if (!term.parent || n < 1) continue
    // walk to the root, dropping Internal branches
    let root: Term = term
    let internal = term.usage === 'Internal'
    for (let i = 0; root.parent && i < 12; i++) {
      const up = terms.get(root.parent)
      if (!up) break
      if (up.usage === 'Internal') internal = true
      root = up
    }
    if (internal || root.key === term.key) continue
    const g = groups.get(root.key) ?? { key: root.key, name: nameFor(root, locale), topics: [] }
    const name = nameFor(term, locale)
    const slug = slugify(name)
    const hit = g.topics.find((t) => t.slug === slug)
    if (hit) hit.count += n
    else g.topics.push({ key: term.key, slug, name, count: n })
    groups.set(root.key, g)
  }
  return [...groups.values()]
    .map((g) => ({ ...g, topics: g.topics.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Every term key whose display name slugifies to one of these slugs (same name = same topic, across verticals). */
export async function keysForSlugs(slugs: string[], locale = 'en'): Promise<Record<string, string[]>> {
  const terms = await getTermMap()
  const out: Record<string, string[]> = Object.fromEntries(slugs.map((s) => [s, []]))
  for (const term of terms.values()) {
    if (term.usage === 'Internal') continue
    const slug = slugify(nameFor(term, locale))
    if (slug in out) out[slug].push(term.key)
  }
  return out
}
