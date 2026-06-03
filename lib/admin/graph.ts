import { getClient } from '@/lib/optimizely'
import { ALLOWED_QUERY_KEYS } from './contentTypes'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentInstance = {
  key:         string
  displayName: string
  url: {
    default:      string | null
    hierarchical: string | null
    base:         string | null
  }
  locale:    string | null
  status:    string | null
  published: string | null
}

export type ComponentUsageResult = {
  instances: ContentInstance[]
  total:     number
}

export type CalendarItem = {
  key:         string
  displayName: string
  url:         string | null
  locale:      string | null
  status:      string | null
  published:   string | null
  type:        string
}

// ─── Component usage ──────────────────────────────────────────────────────────

function mapInstance(item: Record<string, unknown>): ContentInstance {
  const meta = (item._metadata ?? {}) as Record<string, unknown>
  const url  = (meta.url ?? {}) as Record<string, unknown>
  return {
    key:         String(meta.key         ?? ''),
    displayName: String(meta.displayName ?? ''),
    url: {
      default:      (url.default      as string | null) ?? null,
      hierarchical: (url.hierarchical as string | null) ?? null,
      base:         (url.base         as string | null) ?? null,
    },
    locale:    (meta.locale    as string | null) ?? null,
    status:    (meta.status    as string | null) ?? null,
    published: (meta.published as string | null) ?? null,
  }
}

export async function getComponentInstances(
  contentTypeKey: string,
): Promise<ComponentUsageResult> {
  if (!ALLOWED_QUERY_KEYS.has(contentTypeKey)) {
    throw new Error(`Disallowed content type: ${contentTypeKey}`)
  }

  const query = `
    query GetComponentInstances {
      ${contentTypeKey}(limit: 1000, orderBy: { _metadata: { published: DESC } }) {
        items {
          _metadata {
            key
            displayName
            url { default hierarchical base }
            locale
            status
            published
          }
        }
        total
      }
    }
  `

  try {
    const data   = await getClient().request(query, {})
    const result = (data as Record<string, unknown>)[contentTypeKey] as
      | { items: Record<string, unknown>[]; total: number }
      | undefined

    return {
      instances: (result?.items ?? []).map(mapInstance),
      total:     result?.total ?? 0,
    }
  } catch {
    return { instances: [], total: 0 }
  }
}

// ─── Content calendar ─────────────────────────────────────────────────────────

const CALENDAR_QUERY = `
  query GetCalendarContent {
    BlankExperience(limit: 200, orderBy: { _metadata: { published: ASC } }) {
      items {
        _metadata {
          key
          displayName
          url { default }
          locale
          status
          published
          types
        }
      }
    }
    OT_BlogPage(limit: 100, orderBy: { _metadata: { published: ASC } }) {
      items {
        _metadata {
          key
          displayName
          url { default }
          locale
          status
          published
          types
        }
      }
    }
  }
`

function mapCalendarItem(
  item: Record<string, unknown>,
  type: string,
): CalendarItem {
  const meta = (item._metadata ?? {}) as Record<string, unknown>
  const url  = (meta.url ?? {}) as Record<string, unknown>
  return {
    key:         String(meta.key         ?? ''),
    displayName: String(meta.displayName ?? ''),
    url:         (url.default as string | null) ?? null,
    locale:      (meta.locale    as string | null) ?? null,
    status:      (meta.status    as string | null) ?? null,
    published:   (meta.published as string | null) ?? null,
    type,
  }
}

export async function getCalendarItems(): Promise<CalendarItem[]> {
  try {
    const data = await getClient().request(CALENDAR_QUERY, {}) as Record<string, unknown>

    const experiences: CalendarItem[] = (
      ((data.BlankExperience as { items?: Record<string, unknown>[] } | undefined)?.items) ?? []
    ).map(item => mapCalendarItem(item, 'experience'))

    const blogPosts: CalendarItem[] = (
      ((data.OT_BlogPage as { items?: Record<string, unknown>[] } | undefined)?.items) ?? []
    ).map(item => mapCalendarItem(item, 'blog'))

    // Merge and sort by published date ascending
    const all = [...experiences, ...blogPosts].filter(i => Boolean(i.published))
    all.sort((a, b) =>
      new Date(a.published!).getTime() - new Date(b.published!).getTime()
    )

    return all
  } catch {
    return []
  }
}

// ─── Recent content (dashboard home) ─────────────────────────────────────────

export async function getRecentContent(limit = 8): Promise<CalendarItem[]> {
  const all = await getCalendarItems()
  // Most recently published first
  return [...all].reverse().slice(0, limit)
}
