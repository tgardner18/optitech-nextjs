'use client'

import { useId, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, Map as MapIcon, LayoutGrid, List, MapPinned, SlidersHorizontal } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { deriveLabelOptions, hasCoordinates } from '@/lib/locationFormat'
import type { LocationListingStyleOptions, LocationListingView } from '@/cms/styling/OT_LocationListingBlock.styling'
import LocationCard from '@/components/location/LocationCard'
import LocationListRow from '@/components/location/LocationListRow'
import LocationRailCard from '@/components/location/LocationRailCard'
import LocationDetailsModal from '@/components/location/LocationDetailsModal'

// Mapbox GL needs a browser: never server-render it. The skeleton fills the map column's height (--map-h) so
// swapping in the real map causes no layout shift.
const LocationMap = dynamic(() => import('@/components/location/LocationMap'), {
  ssr: false,
  loading: () => <div data-part="map" style={{ height: 'var(--map-h)', display: 'grid', placeItems: 'center' }}><span style={{ fontSize: '.875rem', opacity: .6 }}>Loading map…</span></div>,
})

type Props = {
  locations:    LocationData[]
  styleOptions: LocationListingStyleOptions
  mapboxToken:  string
  emptyMessage: string
  /** True for any CMS draft/preview render: hides the label filter. */
  isPreview?:   boolean
}

const MAP_HEIGHTS = { standard: 480, tall: 640 } as const
const VIEWS: { view: LocationListingView; label: string; Icon: typeof MapIcon }[] = [
  { view: 'map', label: 'Map', Icon: MapIcon },
  { view: 'grid', label: 'Grid', Icon: LayoutGrid },
  { view: 'list', label: 'List', Icon: List },
]

export default function LocationListingClient({ locations, styleOptions, mapboxToken, emptyMessage, isPreview = false }: Props) {
  const { defaultView, showViewToggle, mapHeight, columns, showSearch, showLabelFilter, density } = styleOptions
  const [view, setView] = useState<LocationListingView>(defaultView)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [details, setDetails] = useState<LocationData | null>(null)
  const searchId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const mapPx = MAP_HEIGHTS[mapHeight]

  const labelOptions = useMemo(() => deriveLabelOptions(locations), [locations])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase(), lab = label?.toLowerCase() ?? null
    return locations.filter(l => {
      if (lab && (l.locationLabel ?? '').toLowerCase() !== lab) return false
      if (q && ![l.locationName, l.locationLabel, l.address].filter(Boolean).join(' ').toLowerCase().includes(q)) return false
      return true
    })
  }, [locations, query, label])
  // A selection the search or filter has removed reads as null until it reappears.
  const sel = selectedKey && results.some(l => l.key === selectedKey) ? selectedKey : null

  const filtersActive = !!query || label !== null
  const clearAll = () => { setQuery(''); setLabel(null) }
  // The label filter is a live-front-end feature: hidden in CMS preview/edit renders.
  const showChips = showLabelFilter && labelOptions.length > 0 && !isPreview
  const mappableCount = useMemo(() => results.filter(hasCoordinates).length, [results])
  const n = results.length

  return (
    <>
      {(showSearch || showViewToggle) && (
        <div data-part="tools">
          {showSearch && (
            <div data-part="search">
              <label htmlFor={searchId}>Search locations</label>
              <div data-part="search-box">
                <Search aria-hidden strokeWidth={2} />
                <input ref={searchRef} id={searchId} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, type, or address" autoComplete="off" />
                {query && <button type="button" data-part="clear-q" onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="Clear search"><X aria-hidden strokeWidth={2} /></button>}
              </div>
            </div>
          )}
          {showViewToggle && (
            <div data-part="views" role="group" aria-label="Layout">
              {VIEWS.map(({ view: v, label: l, Icon }) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}><Icon aria-hidden strokeWidth={2} /><span>{l}</span></button>
              ))}
            </div>
          )}
        </div>
      )}

      {(showChips || showSearch) && (
        <div data-part="filters">
          {showChips ? (
            <div data-part="chips" role="radiogroup" aria-label="Filter by type">
              {[null, ...labelOptions].map(v => (
                <button key={v ?? 'all'} type="button" role="radio" aria-checked={label === v} onClick={() => setLabel(v)}>{v ?? 'All'}</button>
              ))}
            </div>
          ) : <span />}
          <p data-part="count" aria-live="polite">
            <b>{n}</b> {n === 1 ? 'location' : 'locations'}
            {filtersActive && <> &middot; <button type="button" onClick={clearAll}>Clear</button></>}
          </p>
        </div>
      )}

      {n === 0 ? (
        <div data-part="empty">
          <span data-part="empty-icon" aria-hidden="true">{filtersActive ? <SlidersHorizontal strokeWidth={1.75} /> : <MapPinned strokeWidth={1.75} />}</span>
          <p data-part="empty-title">{filtersActive ? `No locations match “${query || label}”` : emptyMessage}</p>
          {filtersActive && (<><p data-part="empty-text">Try a different name, type, or address.</p><button type="button" data-part="more" onClick={clearAll}>Clear search and filters</button></>)}
        </div>
      ) : view === 'map' ? (
        <div data-part="mapview" style={{ ['--map-h' as string]: `${mapPx}px` }}>
          <ol data-part="rail" role="list">
            {results.map((l, k) => (
              <li key={l.key}>
                <LocationRailCard location={l} number={k + 1} active={sel === l.key} mappable={hasCoordinates(l)} onSelect={() => setSelectedKey(l.key)} />
              </li>
            ))}
          </ol>
          <div data-part="map-col">
            {mapboxToken ? (
              <LocationMap locations={results} selectedKey={sel} onSelectKey={setSelectedKey} onViewDetails={setDetails} token={mapboxToken} mapHeight={mapPx} />
            ) : (
              <div data-part="map" style={{ height: mapPx, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
                <div><MapPinned aria-hidden strokeWidth={1.5} style={{ margin: '0 auto .5rem', width: 26, height: 26, opacity: .6 }} /><p data-part="name">Map unavailable</p><p data-part="empty-text">Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map. The list and grid views work without it.</p></div>
              </div>
            )}
            {mapboxToken && mappableCount < n && <p data-part="map-note">{n - mappableCount} of {n} not shown on the map (no resolvable address).</p>}
          </div>
        </div>
      ) : view === 'list' ? (
        <ul data-part="list" role="list">
          {results.map(l => <li key={l.key}><LocationListRow location={l} density={density} onOpenDetails={setDetails} /></li>)}
        </ul>
      ) : (
        <ul data-part="grid" role="list" style={{ ['--cols' as string]: columns }}>
          {results.map(l => <li key={l.key}><LocationCard location={l} density={density} onOpenDetails={setDetails} /></li>)}
        </ul>
      )}

      <LocationDetailsModal location={details} onClose={() => setDetails(null)} />
    </>
  )
}
