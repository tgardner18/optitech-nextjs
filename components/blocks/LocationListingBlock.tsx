import LocationListingClient from './LocationListingBlock.client'
import { geocodeAddress } from '@/lib/geocode'
import { hasCoordinates } from '@/lib/locationFormat'
import { stableId } from '@/lib/stableId'
import type { LocationData } from '@/lib/locations'
import type { LocationListingStyleOptions } from '@/cms/styling/OT_LocationListingBlock.styling'

export type LocationListingBlockProps = {
  heading?:      string
  subtext?:      string
  locations:     LocationData[]
  emptyMessage?: string
  styleOptions:  LocationListingStyleOptions
  /** True for any CMS draft/preview render (Visual Builder, draft links) — hides the filter drawer. */
  isPreview?:    boolean
  /** Preview-attribute factory from getPreviewUtils — server context only. */
  pa?:           (prop: string) => Record<string, unknown>
}

// Server wrapper (no 'use client'): renders the heading/subtext server-side so
// they carry preview attributes and are SEO-indexable, geocodes any locations
// that arrive WITHOUT coordinates, then hands the data + style options to the
// client component (which owns view, search, and filter state).
//
// Geocoding runs here, concurrently via Promise.all, but ONLY for locations
// lacking coordinates. The CMS adapter passes records straight from the Graph
// (no coordinates) so they geocode here; the showcase passes static fixtures
// that already carry pre-resolved coordinates, so they geocode NOTHING and make
// zero Mapbox API calls. Geocoding never throws — a location whose address fails
// keeps its undefined coordinates and is simply omitted from the map view (it
// still appears in the grid and list).

async function geocodeMissing(locations: LocationData[]): Promise<LocationData[]> {
  return Promise.all(
    locations.map(async (l) => {
      if (hasCoordinates(l) || !l.address?.trim()) return l
      const coordinates = await geocodeAddress(l.address)
      return coordinates ? { ...l, coordinates } : l
    }),
  )
}

export default async function LocationListingBlock({
  heading,
  subtext,
  locations,
  emptyMessage,
  styleOptions,
  isPreview = false,
  pa = () => ({}),
}: LocationListingBlockProps) {
  const geocoded  = await geocodeMissing(locations)
  const token     = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
  const hid       = stableId('loc-h', heading ?? '')

  return (
    <section data-block="locations" data-color={styleOptions.color} data-density={styleOptions.density} aria-labelledby={heading ? hid : undefined} aria-label={heading ? undefined : 'Locations'}>
      <div data-part="inner">
        {heading && <h2 data-part="title" id={hid} {...pa('heading')}>{heading}</h2>}
        {subtext && <p data-part="subtext" {...pa('subtext')}>{subtext}</p>}
        <LocationListingClient
          locations={geocoded}
          styleOptions={styleOptions}
          mapboxToken={token}
          emptyMessage={emptyMessage?.trim() || 'No locations found.'}
          isPreview={isPreview}
        />
      </div>
    </section>
  )
}
