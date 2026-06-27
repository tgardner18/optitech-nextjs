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
  groupTag?:     string
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
  groupTag
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
// Group-tag filtering and the optional limit are applied in JS below so the
// directory's label-filter chips can be derived from exactly the loaded set.
const LOCATIONS_QUERY = `
  query GetLocations($locale: String!) {
    OT_LocationProfile(
      limit: 100,
      where: { _metadata: { locale: { eq: $locale } } }
    ) {
      items { ${LOCATION_FIELDS} }
    }
  }
`

// ─── Shaping ─────────────────────────────────────────────────────────────────────

function toLocationData(item: any): LocationData {
  return {
    key:           item._metadata?.key ?? '',
    locationName:  item.locationName ?? '',
    locationLabel: item.locationLabel ?? undefined,
    imageUrl:      item.image?.url?.default ?? undefined,
    address:       item.address ?? undefined,
    details:       item.details?.html ? { html: item.details.html } : undefined,
    groupTag:      item.groupTag ?? undefined,
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
 * Fetches location records for the directory listing. Filters by groupTag when
 * provided, dedups by key, sorts by name, and applies the optional limit last.
 * Returns the LocationData shape the listing consumes — WITHOUT coordinates;
 * the server wrapper geocodes addresses before rendering the map.
 *
 * React-cached so multiple listing blocks on one page share a round-trip.
 */
export const getAllLocations = cache(async function getAllLocations(
  options?: { groupTag?: string; limit?: number; locale?: string },
): Promise<LocationData[]> {
  const locale = options?.locale ?? 'en'
  try {
    const data = await getClient().request(LOCATIONS_QUERY, { locale })
    let items: any[] = (data as any)?.OT_LocationProfile?.items ?? []

    // Group-tag scope — restrict to one vertical when requested.
    if (options?.groupTag) {
      items = items.filter(p => (p.groupTag ?? '') === options.groupTag)
    }

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
      // Stable, scannable directory order.
      .sort((a, b) => a.locationName.localeCompare(b.locationName))

    return typeof options?.limit === 'number' && options.limit > 0
      ? mapped.slice(0, options.limit)
      : mapped
  } catch {
    return []
  }
})
