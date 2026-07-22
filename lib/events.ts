import { cache } from 'react'
import { getClient } from '@/lib/optimizely'
import { isUpcoming } from '@/lib/eventFormat'

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * The flat shape consumed by OT_EventListingBlock (card / list / calendar views)
 * and by the event search results. Resolved from OT_EventPage by the queries
 * below; `summary` is the HTML-stripped opening of `description`, used for excerpts.
 */
export type EventCardData = {
  key:              string
  title:            string
  url:              string | null
  eventType?:       string
  startDate?:       string
  endDate?:         string
  locationType?:    string
  venueName?:       string
  city?:            string
  summary?:         string
  creditType?:      string
  creditHours?:     number
  imageUrl?:        string | null
  registrationUrl?: string
  restrictions?:    string | null
}

/** Full event content for the event page (components/pages/EventPage.tsx). */
export type EventPageContent = {
  _metadata: {
    key:       string
    published: string
    url:       { default: string | null; hierarchical?: string | null }
  }
  title:           string
  eventType?:      string
  description?:    { html?: string | null } | null
  featuredImage?:  { url?: { default?: string | null } | null } | null
  startDate?:      string | null
  endDate?:        string | null
  locationType?:   string | null
  venueName?:      string | null
  city?:           string | null
  creditType?:     string | null
  creditHours?:    number | null
  registrationUrl?: { default?: string | null } | null
  restrictions?:    string | null
  productId?:       string | null
  nonMemberPrice?:  string | null
  memberPrice?:     string | null
  speakers?:       Array<{
    name?:         string | null
    title?:        string | null
    organization?: string | null
    bio?:          string | null
    headshot?:     { url?: { default?: string | null } | null } | null
    profileUrl?:   { default?: string | null } | null
  }> | null
  agenda?:         Array<{
    time?:        string | null
    title?:       string | null
    description?: string | null
    speaker?:     string | null
  }> | null
  // SEO
  seoTitle?:        string | null
  seoDescription?:  string | null
  canonicalUrl?:    { default?: string | null } | null
  ogImage?:         { url?: { default?: string | null } | null } | null
  pageAnswer?:      string | null
  schemaType?:      string | null
  noIndex?:         boolean | null
  customSchemaJson?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined, max = 160): string {
  if (!html) return ''
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text
}

// ─── GraphQL queries ──────────────────────────────────────────────────────────────

// Listing query — fetches up to Optimizely Graph's hard per-query cap of 100
// (a higher `limit` is rejected with "Invalid 'limit' … expected: [0-100]",
// which would throw and surface as an empty listing) so the client can
// paginate the calendar across months without re-querying. Site scoping is
// applied in JS below.
const EVENTS_QUERY = `
  query GetEvents($locale: String!) {
    OT_EventPage(
      limit: 100,
      where: { _metadata: { locale: { eq: $locale }, status: { eq: "Published" } } }
    ) {
      items {
        _metadata { key published url { default base } }
        title
        eventType
        startDate
        endDate
        locationType
        venueName
        city
        creditType
        creditHours
        description { html }
        featuredImage { url { default } }
        registrationUrl { default }
      }
    }
  }
`

const EVENT_PAGE_QUERY = `
  query GetEventPage($key: String!, $locale: String) {
    OT_EventPage(
      where: { _metadata: { key: { eq: $key }, locale: { eq: $locale }, status: { eq: "Published" } } }
      limit: 1
    ) {
      items {
        _metadata { key locale published url { default } }
        title
        eventType
        description { html }
        startDate
        endDate
        locationType
        venueName
        city
        creditType
        creditHours
        featuredImage { url { default } }
        registrationUrl { default }
        restrictions
        productId
        nonMemberPrice
        memberPrice
        speakers {
          name
          title
          organization
          bio
          headshot { url { default } }
          profileUrl { default }
        }
        agenda {
          time
          title
          description
          speaker
        }
        seoTitle
        seoDescription
        canonicalUrl { default }
        ogImage { url { default } }
        pageAnswer
        schemaType
        noIndex
        customSchemaJson
      }
    }
  }
`

// ─── Shaping ─────────────────────────────────────────────────────────────────────

function toCardData(item: any): EventCardData {
  return {
    key:             item._metadata?.key,
    title:           item.title ?? '',
    url:             item._metadata?.url?.default ?? null,
    eventType:       item.eventType ?? undefined,
    startDate:       item.startDate ?? undefined,
    endDate:         item.endDate ?? undefined,
    locationType:    item.locationType ?? undefined,
    venueName:       item.venueName ?? undefined,
    city:            item.city ?? undefined,
    creditType:      item.creditType ?? undefined,
    creditHours:     typeof item.creditHours === 'number' ? item.creditHours : undefined,
    summary:         stripHtml(item.description?.html) || undefined,
    imageUrl:        item.featuredImage?.url?.default ?? null,
    registrationUrl: item.registrationUrl?.default ?? undefined,
    restrictions:    item.restrictions ?? null,
  }
}

// ─── Data access ──────────────────────────────────────────────────────────────────

/**
 * Fetches every published event for `locale`, deduplicated by content key and
 * scoped to the current site (Optimizely Graph indexes all site channels in a
 * tenant — mirrors the scoping in lib/blogFeed.ts). Sorted by start date ASC.
 *
 * React-cached so multiple Event Listing blocks on one page share a round-trip.
 */
const fetchEvents = cache(async function fetchEvents(
  locale: string,
  siteBaseUrl?: string | null,
): Promise<EventCardData[]> {
  try {
    const data = await getClient().request(EVENTS_QUERY, { locale })
    let items: any[] = (data as any)?.OT_EventPage?.items ?? []

    // Site scoping — prefer url.base, fall back to default-URL prefix match.
    if (siteBaseUrl) {
      const normalizedBase = siteBaseUrl.replace(/\/$/, '')
      items = items.filter(p => {
        const base       = p._metadata?.url?.base
        const defaultUrl = p._metadata?.url?.default
        if (typeof base === 'string' && base) {
          return base.replace(/\/$/, '') === normalizedBase
        }
        if (typeof defaultUrl === 'string' && defaultUrl) {
          return defaultUrl.startsWith(normalizedBase + '/') || defaultUrl === normalizedBase
        }
        return true
      })
    }

    // Dedup by key (Graph returns one row per locale variant).
    const seen = new Set<string>()
    const unique = items.filter(p => {
      const k = p._metadata?.key as string | undefined
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })

    return unique
      .map(toCardData)
      .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
  } catch {
    return []
  }
})

/** All published events regardless of date, sorted by start date ascending. */
export async function getAllEvents(
  limit?: number,
  locale = 'en',
  siteBaseUrl?: string | null,
): Promise<EventCardData[]> {
  const all = await fetchEvents(locale, siteBaseUrl)
  return typeof limit === 'number' ? all.slice(0, limit) : all
}

/** Published events whose start (or end) date is today or later, soonest first. */
export async function getUpcomingEvents(
  limit?: number,
  locale = 'en',
  siteBaseUrl?: string | null,
): Promise<EventCardData[]> {
  const all = await fetchEvents(locale, siteBaseUrl)
  const upcoming = all.filter(e => isUpcoming(e.startDate, e.endDate))
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming
}

/** Full event content for a single page, with English fallback (mirrors getBlogPage). */
export async function getEventPage(key: string, locale = 'en'): Promise<EventPageContent | null> {
  try {
    const data = await getClient().request(EVENT_PAGE_QUERY, { key, locale })
    let item = (data as any)?.OT_EventPage?.items?.[0] ?? null
    if (!item && locale !== 'en') {
      const fallback = await getClient().request(EVENT_PAGE_QUERY, { key, locale: 'en' })
      item = (fallback as any)?.OT_EventPage?.items?.[0] ?? null
    }
    return item ?? null
  } catch {
    return null
  }
}
