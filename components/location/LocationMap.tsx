'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, ArrowUpRight, X } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { hasCoordinates } from '@/lib/locationFormat'
import LocationLabelBadge from './LocationLabelBadge'
import LocationPlate from './LocationPlate'

type MappableLocation = LocationData & { coordinates: { lat: number; lon: number } }

type Props = {
  /** Already filtered to mappable locations by the caller, but re-guarded here. */
  locations:   LocationData[]
  selectedKey: string | null
  onSelectKey: (key: string | null) => void
  token:       string
  mapHeight:   number
}

const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11'
// Continental-US default when there is nothing to frame.
const DEFAULT_VIEW = { longitude: -98.5, latitude: 39.8, zoom: 2.6 }

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ─── Beacon marker ──────────────────────────────────────────────────────────────
// A brand-filled disc with an fg-on-brand core and a chromatic brand-bloom halo.
// The active marker grows, gains an accent ring, and a motion-safe pulse. Not a
// skeuomorphic pin — consistent with the system's sharp, token-derived identity.

function Beacon({ active }: { active: boolean }) {
  return (
    <span className="location-beacon" data-active={active || undefined} aria-hidden>
      {active && <span className="location-beacon__pulse" />}
      <span className="location-beacon__dot" />
    </span>
  )
}

export default function LocationMap({ locations, selectedKey, onSelectKey, token, mapHeight }: Props) {
  const mapRef = useRef<MapRef | null>(null)

  const mappable = useMemo<MappableLocation[]>(
    () => locations.filter(hasCoordinates) as MappableLocation[],
    [locations],
  )

  const selected = useMemo(
    () => mappable.find(l => l.key === selectedKey) ?? null,
    [mappable, selectedKey],
  )

  // Frame all markers. 0 → default view; 1 → center at zoom 14; >1 → fit bounds.
  const fitToMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map || mappable.length === 0) return
    const reduce = prefersReducedMotion()

    if (mappable.length === 1) {
      const { lat, lon } = mappable[0].coordinates
      map.easeTo({ center: [lon, lat], zoom: 14, duration: reduce ? 0 : 800 })
      return
    }

    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity
    for (const l of mappable) {
      const { lat, lon } = l.coordinates
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon)
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat)
    }
    map.fitBounds(
      [[minLon, minLat], [maxLon, maxLat]],
      { padding: { top: 64, bottom: 64, left: 64, right: 64 }, maxZoom: 14, duration: reduce ? 0 : 800 },
    )
  }, [mappable])

  // Refit whenever the mappable set changes (search / filter / initial load),
  // unless a specific location is selected (that drives its own fly-to below).
  const mappableKeys = mappable.map(l => l.key).join('|')
  useEffect(() => {
    if (!selectedKey) fitToMarkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappableKeys])

  // Fly to the selected location.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    const { lat, lon } = selected.coordinates
    map.flyTo({
      center: [lon, lat],
      zoom: Math.max(map.getZoom(), 12),
      duration: prefersReducedMotion() ? 0 : 900,
      essential: true,
    })
  }, [selected])

  const initialViewState = useMemo(() => {
    if (mappable.length === 1) {
      const { lat, lon } = mappable[0].coordinates
      return { longitude: lon, latitude: lat, zoom: 12 }
    }
    if (mappable.length > 1) {
      // A reasonable opening frame; onLoad fitToMarkers tightens it precisely.
      const lons = mappable.map(l => l.coordinates.lon)
      const lats = mappable.map(l => l.coordinates.lat)
      return {
        longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
        latitude:  (Math.min(...lats) + Math.max(...lats)) / 2,
        zoom: 3.4,
      }
    }
    return DEFAULT_VIEW
  }, [mappable])

  return (
    <div className="relative w-full overflow-hidden border border-fg/10" style={{ height: mapHeight }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle={DARK_STYLE}
        initialViewState={initialViewState}
        onLoad={fitToMarkers}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="top-right" showCompass={false} />

        {mappable.map(l => {
          const active = l.key === selectedKey
          return (
            <Marker
              key={l.key}
              longitude={l.coordinates.lon}
              latitude={l.coordinates.lat}
              anchor="center"
              style={{ zIndex: active ? 2 : 1 }}
              onClick={e => {
                // Keep the map's own click handlers from also firing.
                e.originalEvent.stopPropagation()
                onSelectKey(l.key)
              }}
            >
              <button
                type="button"
                className="block cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={`${l.locationName || 'Location'}${l.locationLabel ? ` — ${l.locationLabel}` : ''}`}
                aria-pressed={active}
              >
                <Beacon active={active} />
              </button>
            </Marker>
          )
        })}

        {selected && (
          <Popup
            longitude={selected.coordinates.lon}
            latitude={selected.coordinates.lat}
            anchor="bottom"
            offset={22}
            closeButton={false}
            closeOnClick={false}
            className="location-popup"
            maxWidth="280px"
            onClose={() => onSelectKey(null)}
          >
            <article className="relative w-[252px]">
              <button
                type="button"
                onClick={() => onSelectKey(null)}
                aria-label="Close"
                className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center bg-canvas/70 text-fg-muted backdrop-blur-sm transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X size={15} strokeWidth={2} aria-hidden />
              </button>

              {/* Shared plate: image or the same designed brand fallback used on the
                  cards, rail, and rows, so every no-image surface reads identically. */}
              <div className="relative aspect-[16/9] w-full bg-canvas">
                <LocationPlate shape="fill" src={selected.imageUrl} name={selected.locationName || 'Location'} />
              </div>

              <div className="flex flex-col gap-1.5 p-3">
                {selected.locationLabel && (
                  <span><LocationLabelBadge label={selected.locationLabel} tone="soft" /></span>
                )}
                <h3 className="text-balance text-[0.95rem] font-bold leading-tight text-fg">
                  {selected.locationName || 'Location'}
                </h3>
                {selected.address && (
                  <p className="flex items-start gap-1.5 text-xs leading-snug text-fg-muted">
                    <MapPin size={12} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
                    <span>{selected.address}</span>
                  </p>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    className="mt-1 inline-flex items-center gap-1 text-label font-semibold uppercase tracking-label text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    View details
                    <ArrowUpRight size={13} strokeWidth={2.5} aria-hidden />
                  </a>
                )}
              </div>
            </article>
          </Popup>
        )}
      </Map>
    </div>
  )
}
