import type { LocationData } from '@/lib/locations'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  /** 1-based number, matching the pin on the map. */
  number: number
  active: boolean
  /** Selecting flies the map to this location and opens its popup. Click or Enter only: hovering never moves the map. */
  onSelect: () => void
  /** Locations with no coordinates stay in the rail but can't be selected on the map. */
  mappable: boolean
}

export default function LocationRailCard({ location: l, number, active, onSelect, mappable }: Props) {
  return (
    <button type="button" data-part="rail-item" onClick={mappable ? onSelect : undefined} aria-pressed={mappable ? active : undefined} aria-disabled={!mappable || undefined}>
      <span data-part="num" aria-hidden="true">{number}</span>
      <span data-part="rail-text">
        <span data-part="name">{l.locationName || 'Location'}</span>
        {l.address && <span data-part="addr">{l.address}</span>}
        {!mappable && <span data-part="addr">Not on the map</span>}
      </span>
      {l.locationLabel && <LocationLabelBadge label={l.locationLabel} />}
    </button>
  )
}
