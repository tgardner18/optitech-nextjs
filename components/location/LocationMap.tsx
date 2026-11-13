'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ChevronLeft, ExternalLink, MapPin, X } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { directionsUrl, hasCoordinates } from '@/lib/locationFormat'
import LocationLabelBadge from './LocationLabelBadge'

type MappableLocation = LocationData & { coordinates: { lat: number; lon: number } }

type Props = {
  /** Already filtered by the caller; re-guarded here. The pin number is the location's position in this list (matches the rail). */
  locations:     LocationData[]
  selectedKey:   string | null
  onSelectKey:   (key: string | null) => void
  onViewDetails: (location: LocationData) => void
  token:         string
  mapHeight:     number
}

const DARK_STYLE  = 'mapbox://styles/mapbox/dark-v11'
const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11'
// Continental-US default when there is nothing to frame.
const DEFAULT_VIEW = { longitude: -98.5, latitude: 39.8, zoom: 2.6 }
// Pins closer than this on screen merge into one numbered cluster.
const CLUSTER_PX = 34

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The page's own light/dark mode, read from the nearest [data-theme] (or the root) and kept in step when it flips. */
function useIsDark(ref: React.RefObject<HTMLElement | null>) {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    const read = () => {
      const el = ref.current?.closest<HTMLElement>('[data-theme]') ?? document.documentElement
      const t = el.dataset.theme ?? document.documentElement.dataset.theme
      setDark(t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'], subtree: true })
    return () => mo.disconnect()
  }, [ref])
  return dark
}

export default function LocationMap({ locations, selectedKey, onSelectKey, onViewDetails, token, mapHeight }: Props) {
  const mapRef = useRef<MapRef | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const dark = useIsDark(wrapRef)
  const [zoomedFor, setZoomedFor] = useState<string | null>(null) // the pin set a cluster zoom applied to
  // A fresh projector after every map move, so the clusters re-group from event handlers (never by reading the map ref during render).
  const [project, setProject] = useState<((lon: number, lat: number) => { x: number; y: number }) | null>(null)
  const syncProjector = useCallback(() => { const m = mapRef.current; if (m) setProject(() => (lon: number, lat: number) => m.project([lon, lat])) }, [])

  const numbered = useMemo(() => locations.map((l, i) => ({ l, n: i + 1 })).filter(o => hasCoordinates(o.l)) as { l: MappableLocation; n: number }[], [locations])
  const mappable = useMemo(() => numbered.map(o => o.l), [numbered])
  const selected = useMemo(() => mappable.find(l => l.key === selectedKey) ?? null, [mappable, selectedKey])

  const fit = useCallback((list: MappableLocation[]) => {
    const map = mapRef.current
    if (!map || list.length === 0) return
    const dur = reduce() ? 0 : 800
    if (list.length === 1) { map.easeTo({ center: [list[0].coordinates.lon, list[0].coordinates.lat], zoom: 14, duration: dur }); return }
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity
    for (const l of list) {
      const { lat, lon } = l.coordinates
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat)
    }
    map.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: { top: 64, bottom: 64, left: 64, right: 64 }, maxZoom: 14, duration: dur })
  }, [])

  const keys = mappable.map(l => l.key).join('|')
  const zoomedToCluster = zoomedFor === keys
  const fitAll = useCallback(() => { setZoomedFor(null); fit(mappable) }, [fit, mappable])

  // Refit whenever the mappable set changes (search / filter / initial load), unless a location is selected.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!selectedKey) fit(mappable) }, [keys])

  // Fly to the selected location.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    map.flyTo({ center: [selected.coordinates.lon, selected.coordinates.lat], zoom: Math.max(map.getZoom(), 12), duration: reduce() ? 0 : 900, essential: true })
  }, [selected])

  const initialViewState = useMemo(() => {
    if (mappable.length === 1) return { longitude: mappable[0].coordinates.lon, latitude: mappable[0].coordinates.lat, zoom: 12 }
    if (mappable.length > 1) {
      const lons = mappable.map(l => l.coordinates.lon), lats = mappable.map(l => l.coordinates.lat)
      return { longitude: (Math.min(...lons) + Math.max(...lons)) / 2, latitude: (Math.min(...lats) + Math.max(...lats)) / 2, zoom: 3.4 }
    }
    return DEFAULT_VIEW
  }, [mappable])

  // Group pins that overlap on screen into numbered clusters. Recomputed after every map move.
  const groups = useMemo(() => {
    const out: { x: number; y: number; items: { l: MappableLocation; n: number }[] }[] = []
    for (const o of numbered) {
      const p = project ? project(o.l.coordinates.lon, o.l.coordinates.lat) : { x: 0, y: 0 }
      const g = project ? out.find(c => Math.hypot(c.x - p.x, c.y - p.y) < CLUSTER_PX) : undefined
      if (g) g.items.push(o); else out.push({ x: p.x, y: p.y, items: [o] })
    }
    return out
  }, [numbered, project])

  const zoomTo = (items: { l: MappableLocation }[]) => { setZoomedFor(keys); fit(items.map(i => i.l)) }
  const offset = { top: [0, 8], 'top-left': [0, 8], 'top-right': [0, 8], bottom: [0, -44], 'bottom-left': [0, -44], 'bottom-right': [0, -44], left: [16, -20], right: [-16, -20], center: [0, 0] } as never

  return (
    <div ref={wrapRef} data-part="map" data-map-theme={dark ? 'dark' : 'light'} style={{ height: mapHeight }} role="region" aria-label={`Map of ${mappable.length} locations`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle={dark ? DARK_STYLE : LIGHT_STYLE}
        initialViewState={initialViewState}
        onLoad={() => { fitAll(); syncProjector() }}
        onMoveEnd={syncProjector}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="top-right" showCompass={false} />

        {groups.map(g => g.items.length === 1 ? (() => {
          const { l, n } = g.items[0], active = l.key === selectedKey
          return (
            <Marker key={l.key} longitude={l.coordinates.lon} latitude={l.coordinates.lat} anchor="bottom" style={{ zIndex: active ? 2 : 1 }}
              onClick={e => { e.originalEvent.stopPropagation(); onSelectKey(l.key) }}>
              <button type="button" data-part="pin" aria-pressed={active} aria-label={`${n}. ${l.locationName || 'Location'}${l.locationLabel ? `, ${l.locationLabel}` : ''}`}>
                <span aria-hidden="true">{n}</span>
              </button>
            </Marker>
          )
        })() : (
          <Marker key={g.items.map(i => i.l.key).join('+')} longitude={g.items[0].l.coordinates.lon} latitude={g.items[0].l.coordinates.lat} anchor="center" style={{ zIndex: 1 }}
            onClick={e => { e.originalEvent.stopPropagation(); zoomTo(g.items) }}>
            <button type="button" data-part="cluster" aria-label={`${g.items.length} locations: ${g.items.map(i => i.l.locationName).join(', ')}. Zoom in`}>
              <span aria-hidden="true">{g.items.map(i => i.n).join(' · ')}</span>
            </button>
          </Marker>
        ))}

        {selected && (
          <Popup longitude={selected.coordinates.lon} latitude={selected.coordinates.lat} offset={offset} closeButton={false} closeOnClick={false} className="location-popup" maxWidth="320px" onClose={() => onSelectKey(null)}>
            <div data-part="pop" role="group" aria-label={selected.locationName}>
              <p data-part="pop-head">
                {selected.locationLabel ? <LocationLabelBadge label={selected.locationLabel} /> : <span />}
                <button type="button" data-part="pop-x" onClick={() => onSelectKey(null)} aria-label="Close"><X aria-hidden strokeWidth={2} /></button>
              </p>
              <p data-part="name">{selected.locationName || 'Location'}</p>
              {selected.address && <p data-part="addr"><MapPin aria-hidden strokeWidth={2} /><span>{selected.address}</span></p>}
              <p data-part="actions">
                {selected.details?.html && <button type="button" data-part="more" onClick={() => onViewDetails(selected)}>Details</button>}
                {directionsUrl(selected) && (
                  <a href={directionsUrl(selected)!} target="_blank" rel="noopener noreferrer" data-part="dir">
                    Directions<ExternalLink aria-hidden strokeWidth={2} />
                    <span className="sr-only"> to {selected.locationName} (opens Google Maps in a new tab)</span>
                  </a>
                )}
              </p>
            </div>
          </Popup>
        )}
      </Map>
      {zoomedToCluster && (
        <button type="button" data-part="show-all" onClick={fitAll}><ChevronLeft aria-hidden strokeWidth={2} />Show all locations</button>
      )}
    </div>
  )
}
