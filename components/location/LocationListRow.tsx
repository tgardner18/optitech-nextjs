import { MapPin, ChevronRight } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { detailsPreview } from '@/lib/locationFormat'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
}

// Compact directory row. A full-height square plate sits flush against the left
// edge and anchors the row; the name + soft label badge read as one unit, with
// the address and a short details line beneath. The whole row links to the
// location page when one exists. On hover the full border goes brand and a faint
// brand wash fills the row, the chevron sliding right — a strong reading anchor
// without a decorative side-stripe (banned by DESIGN.md).

export default function LocationListRow({ location, onSurface = false, density = 'comfortable' }: Props) {
  const l       = location
  const name    = l.locationName || 'Location'
  const details = detailsPreview(l.details, 120)
  const compact = density === 'compact'

  const rowBg = onSurface ? 'bg-canvas' : 'bg-surface'
  const textPad = compact ? 'py-sm pl-sm pr-sm' : 'py-md pl-md pr-md'

  const body = (
    <>
      {/* Square plate, flush left, borderless. A definite WIDTH (numeric scale,
          not a named token) keeps the square from collapsing in a flex row;
          aspect-square derives the height from it. */}
      <div className={`relative flex-none aspect-square overflow-hidden ${compact ? 'w-24' : 'w-32'}`}>
        <LocationPlate shape="fill" src={l.imageUrl} name={name} size="sm" />
      </div>

      <div className={`min-w-0 flex-1 self-center ${textPad}`}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold leading-tight text-fg">{name}</span>
          {l.locationLabel && <LocationLabelBadge label={l.locationLabel} tone="soft" />}
        </p>

        {l.address && (
          <p className="mt-1 flex items-start gap-1.5 text-pretty text-sm leading-snug text-fg-muted">
            <MapPin size={13} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
            <span>{l.address}</span>
          </p>
        )}

        {details && !compact && (
          <p className="mt-1 text-pretty text-xs leading-relaxed text-fg-muted/80 line-clamp-1">
            {details}
          </p>
        )}
      </div>

      {l.url && (
        <ChevronRight
          size={16}
          strokeWidth={2}
          aria-hidden
          className="mr-md flex-none self-center text-fg-muted motion-safe:transition-transform motion-safe:duration-150 group-hover:translate-x-1 group-hover:text-brand"
        />
      )}
    </>
  )

  const className =
    `group flex items-stretch overflow-hidden rounded-ot-surface ${rowBg} border border-fg/10 ` +
    'transition-[background-color,border-color] duration-150 ease-[var(--ot-ease-quick)] ' +
    'hover:border-brand/60 hover:bg-brand/4'

  return l.url ? (
    <a
      href={l.url}
      className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
      aria-label={`View ${name}`}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  )
}
