import { getClient } from '@/lib/optimizely'
import { ALLOWED_QUERY_KEYS } from './contentTypes'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageUsage = {
  pageKey:     string
  displayName: string
  url:         string | null
  baseUrl:     string | null
  locale:      string | null
  status:      string | null
  published:   string | null
  count:       number
}

export type ComponentUsageResult = {
  pages: PageUsage[]
  total: number
}

export type CalendarItem = {
  key:         string
  displayName: string
  url:         string | null
  baseUrl:     string | null
  locale:      string | null
  status:      string | null
  published:   string | null
  type:        string
}

// ─── Composition traversal ────────────────────────────────────────────────────

// Counts occurrences of a content type key at any depth of a VB composition.
// CompositionComponentNode.type is the block's content type key (e.g. "OT_HeroBlock").
function countTypeInNodes(nodes: unknown[], targetType: string): number {
  let count = 0
  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (n.__typename === 'CompositionComponentNode' && n.type === targetType) count++
    if (Array.isArray(n.nodes)) for (const child of n.nodes) visit(child)
  }
  for (const node of nodes) visit(node)
  return count
}

// ─── Component usage — experience/composition scan ────────────────────────────

// 4 levels of nesting covers Section > Row > Column > Component
const COMPOSITION_NODES_FRAGMENT = `
  nodes {
    __typename key type
    ... on CompositionComponentNode { component { _metadata { key displayName } } }
    ... on CompositionStructureNode {
      nodes {
        __typename key type
        ... on CompositionComponentNode { component { _metadata { key displayName } } }
        ... on CompositionStructureNode {
          nodes {
            __typename key type
            ... on CompositionComponentNode { component { _metadata { key displayName } } }
            ... on CompositionStructureNode {
              nodes {
                __typename key type
                ... on CompositionComponentNode { component { _metadata { key displayName } } }
              }
            }
          }
        }
      }
    }
  }
`

const COMPOSITION_QUERY = `
  query GetAllCompositions($cursor: String) {
    _Experience(limit: 100, cursor: $cursor) {
      cursor
      total(all: true)
      items {
        _metadata {
          key
          displayName
          locale
          url { base default }
          status
          published
        }
        ... on BlankExperience {
          composition { ${COMPOSITION_NODES_FRAGMENT} }
        }
      }
    }
  }
`

// For page-type content (OT_BlogPage, BlankExperience itself used as a page list),
// query instances directly rather than scanning compositions.
const PAGE_TYPE_QUERY = (typeKey: string) => `
  query GetPageTypeInstances($cursor: String) {
    ${typeKey}(limit: 100, cursor: $cursor) {
      cursor
      total(all: true)
      items {
        _metadata {
          key
          displayName
          locale
          url { base default }
          status
          published
        }
      }
    }
  }
`

// Page-type keys are queried directly, not through composition scanning.
const PAGE_TYPE_KEYS = new Set(['BlankExperience', 'OT_BlogPage'])

export async function getComponentInstances(
  contentTypeKey: string,
): Promise<ComponentUsageResult> {
  if (!ALLOWED_QUERY_KEYS.has(contentTypeKey)) {
    throw new Error(`Disallowed content type: ${contentTypeKey}`)
  }

  // ── Page types: query the type directly ──
  if (PAGE_TYPE_KEYS.has(contentTypeKey)) {
    return getPageTypeInstances(contentTypeKey)
  }

  // ── Block types: scan VB compositions ──
  return getBlockTypeUsage(contentTypeKey)
}

async function getPageTypeInstances(typeKey: string): Promise<ComponentUsageResult> {
  const pages: PageUsage[] = []
  const seen = new Set<string>()
  let cursor: string | null = null

  try {
    do {
      const query  = PAGE_TYPE_QUERY(typeKey)
      const data   = await getClient().request(query, { cursor }) as Record<string, unknown>
      const result = data[typeKey] as { cursor: string | null; items: Record<string, unknown>[] } | undefined
      if (!result) break
      const items  = result.items ?? []
      if (items.length === 0) break   // Graph may return a non-null cursor on the last page
      cursor = result.cursor ?? null

      for (const item of items) {
        const meta = (item._metadata ?? {}) as Record<string, unknown>
        const key  = String(meta.key ?? '')
        if (!key || seen.has(key)) continue
        seen.add(key)

        const url = (meta.url ?? {}) as Record<string, unknown>
        pages.push({
          pageKey:     key,
          displayName: String(meta.displayName ?? ''),
          url:         (url.default   as string | null) ?? null,
          baseUrl:     (url.base      as string | null) ?? null,
          locale:      (meta.locale   as string | null) ?? null,
          status:      (meta.status   as string | null) ?? null,
          published:   (meta.published as string | null) ?? null,
          count: 1,
        })
      }
    } while (cursor)
  } catch { /* return partial */ }

  return { pages, total: pages.length }
}

async function getBlockTypeUsage(contentTypeKey: string): Promise<ComponentUsageResult> {
  const pages: PageUsage[] = []
  const seen = new Set<string>()
  let cursor: string | null = null

  try {
    do {
      const data       = await getClient().request(COMPOSITION_QUERY, { cursor }) as Record<string, unknown>
      const experience = data._Experience as { cursor: string | null; items: Record<string, unknown>[] } | undefined
      if (!experience) break
      const items = experience.items ?? []
      if (items.length === 0) break   // Guard against non-null cursor on last page
      cursor = experience.cursor ?? null

      for (const item of items) {
        const meta = (item._metadata ?? {}) as Record<string, unknown>
        const key  = String(meta.key ?? '')
        if (!key || seen.has(key)) continue
        seen.add(key)

        const url         = (meta.url ?? {}) as Record<string, unknown>
        const composition = (item as Record<string, unknown>).composition as Record<string, unknown> | undefined
        const nodes       = Array.isArray(composition?.nodes) ? (composition!.nodes as unknown[]) : []
        const count       = countTypeInNodes(nodes, contentTypeKey)
        if (count === 0) continue

        pages.push({
          pageKey:     key,
          displayName: String(meta.displayName ?? ''),
          url:         (url.default    as string | null) ?? null,
          baseUrl:     (url.base       as string | null) ?? null,
          locale:      (meta.locale    as string | null) ?? null,
          status:      (meta.status    as string | null) ?? null,
          published:   (meta.published as string | null) ?? null,
          count,
        })
      }
    } while (cursor)
  } catch { /* return partial */ }

  pages.sort((a, b) => b.count - a.count)

  return {
    pages,
    total: pages.reduce((sum, p) => sum + p.count, 0),
  }
}

// ─── Content calendar ─────────────────────────────────────────────────────────

// Queries _Page (covers BlankExperience + OT_BlogPage + any other _Page types).
// Uses cursor pagination to retrieve all items.
const CALENDAR_QUERY = `
  query GetCalendarPages($cursor: String) {
    _Page(limit: 100, cursor: $cursor, orderBy: { _metadata: { published: ASC } }) {
      cursor
      total(all: true)
      items {
        _metadata {
          key
          displayName
          url { base default }
          locale
          status
          published
          types
        }
      }
    }
  }
`

function itemType(types: string[]): string {
  if (types.includes('OT_BlogPage'))    return 'blog'
  if (types.includes('BlankExperience')) return 'experience'
  return 'page'
}

export async function getCalendarItems(): Promise<CalendarItem[]> {
  const all: CalendarItem[] = []
  const seen = new Set<string>()
  let cursor: string | null = null

  try {
    do {
      const data   = await getClient().request(CALENDAR_QUERY, { cursor }) as Record<string, unknown>
      const result = data._Page as { cursor: string | null; items: Record<string, unknown>[] } | undefined
      if (!result) break
      const items  = result.items ?? []
      if (items.length === 0) break   // Guard against non-null cursor on last page
      cursor = result.cursor ?? null

      for (const item of items) {
        const meta  = (item._metadata ?? {}) as Record<string, unknown>
        const key   = String(meta.key ?? '')
        if (!key || seen.has(key)) continue
        seen.add(key)

        const url   = (meta.url ?? {}) as Record<string, unknown>
        const types = Array.isArray(meta.types) ? (meta.types as string[]) : []

        all.push({
          key,
          displayName: String(meta.displayName ?? ''),
          url:         (url.default    as string | null) ?? null,
          baseUrl:     (url.base       as string | null) ?? null,
          locale:      (meta.locale    as string | null) ?? null,
          status:      (meta.status    as string | null) ?? null,
          published:   (meta.published as string | null) ?? null,
          type:        itemType(types),
        })
      }
    } while (cursor)
  } catch { /* return partial */ }

  return all.filter(i => Boolean(i.published))
}

// ─── Recent content (dashboard) ──────────────────────────────────────────────

export async function getRecentContent(limit = 8): Promise<CalendarItem[]> {
  const all = await getCalendarItems()
  return all
    .filter(i => i.status === 'Published' || i.status === 'Previous' || i.status === 'Scheduled')
    .sort((a, b) => new Date(b.published!).getTime() - new Date(a.published!).getTime())
    .slice(0, limit)
}
