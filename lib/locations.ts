import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * The flat shape consumed by the location directory (map / rail / cards / rows /
 * search / filter). Resolved from OT_LocationProfile by the queries below.
 *
 * `details` keeps its `{ html }` shape: the popup and cards strip the HTML to a
 * short preview; a future detail surface could render it in full.
 *
 * `coordinates` is NOT populated by these queries — OT_LocationProfile stores a
 * free-text address, not lat/lon. The server wrapper geocodes each address via
 * lib/geocode.ts and attaches coordinates before handing data to the client.
 * The showcase, by contrast, supplies pre-resolved coordinates directly.
 *
 * `url` is optional — OT_LocationProfile is a shared component with no public
 * URL of its own. It is left blank unless a future location-page type maps to
 * it (mirroring how lib/practitioners.ts resolves profile-page URLs).
 */
export type LocationData = {
  key:           string
  locationName:  string
  locationLabel?: string
  imageUrl?:     string
  address?:      string
  details?:      { html: string }
  url:           string
  coordinates?:  { lat: number; lon: number }
}

// ─── GraphQL queries ──────────────────────────────────────────────────────────

// Shared selection of the location record's fields. OT_LocationProfile is a
// `_component`; querying it by its root type returns the structured fields
// directly.
const LOCATION_FIELDS = `
  _metadata { key locale url { default } }
  locationName
  locationLabel
  image { url { default } }
  address
  details { html }
`

const LOCATION_QUERY = `
  query GetLocation($key: String!, $locale: String) {
    OT_LocationProfile(
      where: { _metadata: { key: { eq: $key }, locale: { eq: $locale } } }
      limit: 1
    ) {
      items { ${LOCATION_FIELDS} }
    }
  }
`

// Listing query — fetches up to Optimizely Graph's hard per-query cap of 100.
// When siteKey is provided, the Graph WHERE clause filters by the queryable
// siteKey field so only locations belonging to this site are returned.
function buildLocationsQuery(withSiteKey: boolean): string {
  const skVar    = withSiteKey ? ', $siteKey: String' : ''
  const skFilter = withSiteKey ? '\n      siteKey: { eq: $siteKey }' : ''
  return `
    query GetLocations($locale: String!${skVar}) {
      OT_LocationProfile(
        limit: 100,
        where: { _metadata: { locale: { eq: $locale } }${skFilter} }
      ) {
        items { ${LOCATION_FIELDS} }
      }
    }
  `
}

// ─── Shaping ─────────────────────────────────────────────────────────────────────

function toLocationData(item: any): LocationData {
  return {
    key:           item._metadata?.key ?? '',
    locationName:  item.locationName ?? '',
    locationLabel: item.locationLabel ?? undefined,
    imageUrl:      item.image?.url?.default ?? undefined,
    address:       item.address ?? undefined,
    details:       item.details?.html ? { html: item.details.html } : undefined,
    url:           item._metadata?.url?.default ?? '',
  }
}

// ─── Data access ──────────────────────────────────────────────────────────────────

/**
 * Fetches a single OT_LocationProfile by content key, with English fallback.
 * React-cached so callers in the same request share one round-trip. Does NOT
 * geocode — callers that need coordinates geocode the returned `address`.
 */
export const getLocation = cache(async function getLocation(
  key: string,
  locale = 'en',
): Promise<LocationData | null> {
  try {
    const data = await getClient().request(LOCATION_QUERY, { key, locale })
    let item = (data as any)?.OT_LocationProfile?.items?.[0] ?? null
    if (!item && locale !== 'en') {
      const fallback = await getClient().request(LOCATION_QUERY, { key, locale: 'en' })
      item = (fallback as any)?.OT_LocationProfile?.items?.[0] ?? null
    }
    if (!item) return null
    return toLocationData(item)
  } catch {
    return null
  }
})

/**
 * Fetches location records for the directory listing. When siteKey is provided
 * the Graph WHERE clause restricts results to profiles whose siteKey field
 * matches — isolating one site on a shared CMS instance. Dedups by key, sorts
 * by name, and applies the optional limit last.
 *
 * React-cached so multiple listing blocks on one page share a round-trip.
 */
export const getAllLocations = cache(async function getAllLocations(
  options?: { siteKey?: string; limit?: number; locale?: string },
): Promise<LocationData[]> {
  const locale  = options?.locale ?? 'en'
  const siteKey = options?.siteKey
  const query   = buildLocationsQuery(!!siteKey)
  const vars    = { locale, ...(siteKey ? { siteKey } : {}) }
  try {
    const data  = await getClient().request(query, vars)
    const items: any[] = (data as any)?.OT_LocationProfile?.items ?? []

    // Dedup by key (Graph returns one row per locale variant).
    const seen = new Set<string>()
    const unique = items.filter(p => {
      const k = p._metadata?.key as string | undefined
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })

    const mapped = unique
      .map(toLocationData)
      .sort((a, b) => a.locationName.localeCompare(b.locationName))

    return typeof options?.limit === 'number' && options.limit > 0
      ? mapped.slice(0, options.limit)
      : mapped
  } catch {
    return []
  }
})
