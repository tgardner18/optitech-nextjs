import { MapPin } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { detailsPreview } from '@/lib/locationFormat'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  density?: 'comfortable' | 'compact'
}

// Image-first directory card. A landscape plate (4:3) carries the location
// image or its branded fallback; an accent label badge pins to the top-left and
// a canvas-tinted frosted footer holds the name as the dominant unit. On hover
// the footer slides up to reveal the address + a details excerpt. The whole card
// links to the location's page when one exists.
//
// data-theme="dark" pins the footer frost + text tokens to their dark values
// regardless of page theme — the scrim sits over a photo, not the page ground,
// so it must stay dark in light mode too (mirrors the CardBlock bg treatment).

export default function LocationCard({ location, density = 'comfortable' }: Props) {
  const l       = location
  const name    = l.locationName || 'Location'
  const details = detailsPreview(l.details, 150)
  const compact = density === 'compact'

  // Footer slide distance ≈ the revealed block height, so only address + details
  // are clipped below the card edge at rest.
  const revealClass = compact
    ? 'motion-safe:translate-y-[2.75rem]'
    : 'motion-safe:translate-y-[3.25rem]'

  const body = (
    <>
      <LocationPlate shape="fill" src={l.imageUrl} name={name} hoverZoom />

      {/* Top wash — keeps the label badge legible over a bright photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4"
        style={{ background: 'linear-gradient(to bottom, oklch(from var(--ot-canvas) l c h / 0.45), transparent)' }}
      />

      {l.locationLabel && (
        <div className="absolute left-0 top-4 z-20">
          <LocationLabelBadge label={l.locationLabel} />
        </div>
      )}

      {/* ── Glass footer ── slides up on hover to reveal address + details
          (transform + opacity only; no layout animation; clipped by overflow). */}
      <div
        className={
          'absolute inset-x-0 bottom-0 z-10 ' +
          revealClass +
          ' motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-(--ot-ease-kinetic) motion-safe:group-hover:translate-y-0'
        }
      >
        <div aria-hidden className="card-bg-frost absolute inset-0" />
        <div className={`relative flex flex-col ${compact ? 'gap-0.5 p-sm' : 'gap-1 p-md'}`}>
          <h3
            className={`text-balance font-extrabold leading-[1.12] tracking-[-0.02em] text-fg ${compact ? 'text-[1.1rem]' : 'text-[1.25rem]'}`}
          >
            {name}
          </h3>

          {l.address && (
            <p className="flex items-start gap-1.5 text-pretty text-xs leading-snug text-fg/80">
              <MapPin size={13} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
              <span className="line-clamp-2">{l.address}</span>
            </p>
          )}

          {details && (
            <p className="mt-1 text-pretty text-xs leading-relaxed text-fg/70 line-clamp-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {details}
            </p>
          )}
        </div>
      </div>
    </>
  )

  const className =
    'location-card group relative block aspect-4/3 w-full overflow-hidden rounded-ot-surface bg-surface ' +
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand'

  return l.url ? (
    <a
      href={l.url}
      data-theme="dark"
      className={`${className} focus:outline-none`}
      aria-label={`View ${name}`}
    >
      {body}
    </a>
  ) : (
    <div data-theme="dark" className={className}>
      {body}
    </div>
  )
}
