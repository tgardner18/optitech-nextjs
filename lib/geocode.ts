// ─── Address geocoding (Mapbox Geocoding API) ──────────────────────────────────
//
// Converts an OT_LocationProfile's free-text `address` into map coordinates.
// Called server-side from the Location Listing server wrapper, concurrently
// across all loaded locations via Promise.all.
//
// Caching: the fetch uses Next.js ISR with a 24-hour revalidate window, so the
// same address is geocoded at most once per day across the whole deployment —
// addresses rarely move, and the Mapbox free tier is rate-limited.
//
// Failure policy: NEVER throws. Returns null on missing token, no results,
// non-OK response, or any network/parse error, logging a console.warn. Callers
// drop null-coordinate locations from the map only — those locations still
// appear in the grid and list views.

const GEOCODE_REVALIDATE_SECONDS = 86_400 // 24h

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lon: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const trimmed = address?.trim()

  if (!token) {
    console.warn('[geocode] NEXT_PUBLIC_MAPBOX_TOKEN is not set — skipping geocoding.')
    return null
  }
  if (!trimmed) return null

  const encoded = encodeURIComponent(trimmed)
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?access_token=${token}&limit=1`

  try {
    const res = await fetch(url, { next: { revalidate: GEOCODE_REVALIDATE_SECONDS } })
    if (!res.ok) {
      console.warn(`[geocode] "${trimmed}" → HTTP ${res.status}`)
      return null
    }
    const data = await res.json()
    // response.features[0].center is [lon, lat].
    const center = data?.features?.[0]?.center
    if (!Array.isArray(center) || center.length < 2) {
      console.warn(`[geocode] "${trimmed}" → no results`)
      return null
    }
    const [lon, lat] = center
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      console.warn(`[geocode] "${trimmed}" → malformed center ${JSON.stringify(center)}`)
      return null
    }
    return { lat, lon }
  } catch (err) {
    console.warn(`[geocode] "${trimmed}" → ${err instanceof Error ? err.message : 'error'}`)
    return null
  }
}
