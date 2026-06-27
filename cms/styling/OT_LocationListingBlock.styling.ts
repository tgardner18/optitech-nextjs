export type LocationListingView    = 'map' | 'grid' | 'list'
export type LocationListingColor   = 'canvas' | 'surface'
export type LocationListingColumns = 2 | 3 | 4
export type LocationListingMapHeight = 'standard' | 'tall'
export type LocationListingDensity = 'comfortable' | 'compact'

export type LocationListingStyleOptions = {
  defaultView:     LocationListingView
  showViewToggle:  boolean
  mapHeight:       LocationListingMapHeight
  color:           LocationListingColor
  columns:         LocationListingColumns
  showSearch:      boolean
  showLabelFilter: boolean
  density:         LocationListingDensity
}

// Display-template select editors return strings; boolean toggles arrive as the
// literal strings 'true' / 'false', and `columns` as the choice keys
// 'col2' | 'col3' | 'col4' (CMS requires choice keys ≥2 chars). This helper
// casts the raw bag to the typed option set and applies defaults — keeping those
// concerns out of the pure React components.
export function getLocationListingStyles(
  s: Record<string, string | boolean>,
): LocationListingStyleOptions {
  const bool = (v: string | boolean | undefined, fallback: boolean) =>
    v === undefined ? fallback : v === true || v === 'true'

  const colMap: Record<string, LocationListingColumns> = { col2: 2, col3: 3, col4: 4 }
  const columns = colMap[String(s.columns)] ?? 3

  return {
    defaultView:     (s.defaultView ?? 'map')     as LocationListingView,
    showViewToggle:  bool(s.showViewToggle, true),
    mapHeight:       (s.mapHeight ?? 'standard')  as LocationListingMapHeight,
    color:           (s.color ?? 'canvas')        as LocationListingColor,
    columns,
    showSearch:      bool(s.showSearch, true),
    showLabelFilter: bool(s.showLabelFilter, true),
    density:         (s.density ?? 'comfortable') as LocationListingDensity,
  }
}
