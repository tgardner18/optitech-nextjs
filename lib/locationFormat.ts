import type { LocationData } from '@/lib/locations'

// Pure presentation helpers shared by the location map, rail, cards, rows, and
// directory client. No CMS-SDK imports — safe to use in client components.

/**
 * Compact initials/glyph seed for the no-image fallback plate. Takes the first
 * letters of the first two significant words of the location name, uppercased.
 * "Memorial Medical Center" → "MM", "Boston Headquarters" → "BH".
 */
export function locationInitials(name: string | undefined): string {
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(w => /[a-z0-9]/i.test(w))
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Strips HTML, collapses whitespace, truncates at a word boundary with an ellipsis. */
export function detailsPreview(details: { html: string } | undefined, max = 160): string {
  const html = details?.html
  if (!html) return ''
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…'
}

/**
 * Derives the single-select label-filter options from the loaded set — never a
 * fixed list. De-duplicated case-insensitively, sorted, with the first-seen
 * casing preserved as the display value. The "All" pseudo-option is added by the
 * client, not here.
 */
export function deriveLabelOptions(locations: Pick<LocationData, 'locationLabel'>[]): string[] {
  const byKey = new Map<string, string>() // lowercased → display
  for (const l of locations) {
    const v = l.locationLabel?.trim()
    if (!v) continue
    const k = v.toLowerCase()
    if (!byKey.has(k)) byKey.set(k, v)
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b))
}

/** True only when a location carries usable map coordinates. */
export function hasCoordinates(
  l: Pick<LocationData, 'coordinates'>,
): l is { coordinates: { lat: number; lon: number } } {
  return (
    !!l.coordinates &&
    typeof l.coordinates.lat === 'number' &&
    typeof l.coordinates.lon === 'number'
  )
}
