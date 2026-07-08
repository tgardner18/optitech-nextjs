import { MapPin } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  active: boolean
  /** Selecting flies the map to this location and opens its popup. */
  onSelect: () => void
  onHover?: () => void
  /** Non-map locations (no coordinates) render disabled-but-visible in the rail. */
  mappable: boolean
}

// One row in the map view's synchronized location rail. A selection button (no
// nested links — page navigation lives in the map popup's View action), so the
// markup stays valid and the whole surface is one large target. Active state
// brings the full border to brand with a faint brand wash, matching the row
// hover language. Non-mappable locations (failed geocoding) show a muted "Not on
// map" note and don't act as map controls.

export default function LocationRailCard({ location, active, onSelect, onHover, mappable }: Props) {
  const l    = location
  const name = l.locationName || 'Location'

  return (
    <button
      type="button"
      onClick={mappable ? onSelect : undefined}
      onMouseEnter={mappable ? onHover : undefined}
      onFocus={mappable ? onHover : undefined}
      aria-pressed={mappable ? active : undefined}
      aria-disabled={!mappable}
      className={
        'group flex w-full items-stretch overflow-hidden rounded-ot-surface border text-left ' +
        'transition-[background-color,border-color] duration-150 ease-[var(--ot-ease-quick)] ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
        (active
          ? 'border-brand bg-brand/[0.07]'
          : 'border-fg/10 bg-surface ' +
            (mappable ? 'hover:border-brand/50 hover:bg-brand/[0.04] cursor-pointer' : 'cursor-default opacity-70'))
      }
    >
      <div className="relative flex-none aspect-square w-20 overflow-hidden">
        <LocationPlate shape="fill" src={l.imageUrl} name={name} size="sm" />
      </div>

      <span className="min-w-0 flex-1 self-center px-sm py-sm">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold leading-tight text-fg">{name}</span>
          {l.locationLabel && <LocationLabelBadge label={l.locationLabel} tone="soft" />}
        </span>

        {l.address && (
          <span className="mt-1 flex items-start gap-1.5 text-xs leading-snug text-fg-muted">
            <MapPin size={12} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
            <span className="line-clamp-2">{l.address}</span>
          </span>
        )}

        {!mappable && (
          <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-label text-fg-muted/60">
            Not on map
          </span>
        )}
      </span>
    </button>
  )
}
