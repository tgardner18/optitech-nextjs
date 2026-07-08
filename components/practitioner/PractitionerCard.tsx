import type { PractitionerCardData } from '@/lib/practitioners'
import {
  practitionerInitials,
  practitionerName,
  primaryArea,
  bioPreview,
} from '@/lib/practitionerFormat'
import PractitionerPortrait from './PractitionerPortrait'

type Props = {
  practitioner: PractitionerCardData
  /** True when the surrounding section uses the `surface` ground. Kept for API
   *  parity with the row; the portrait card carries its own dark context. */
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
  /** Optional contextual badge from OT_PractitionerPage ("Accepting New
   *  Patients", "Board Certified", …). Not present in the listing context. */
  profileLabel?: string
}

// Portrait-first directory card. The headshot (or its branded-abstract fallback)
// IS the card face — a fixed 3:4 plate. A canvas-tinted frosted footer holds the
// name as the dominant typographic unit; on hover the footer slides up to reveal
// a bio excerpt. The whole card links to the profile page when one exists.
//
// `data-theme="dark"` pins the footer's frost + text tokens to their dark
// (light-text) values regardless of the page theme — the scrim sits over a photo,
// not over the page ground, so it must stay dark in light mode too. This mirrors
// the CardBlock background-image treatment. Purely presentational, no hooks.

export default function PractitionerCard({ practitioner, density = 'comfortable', profileLabel }: Props) {
  const p        = practitioner
  const name     = practitionerName(p, false)
  const initials = practitionerInitials(p)
  const primary  = primaryArea(p.practiceAreas)
  const bio      = bioPreview(p.bio, 160)
  const compact  = density === 'compact'

  // Footer slide distance ≈ the bio block height, so only the bio is clipped
  // below the card edge at rest. Tuned to the line-clamped bio measure.
  const revealClass = compact
    ? 'motion-safe:translate-y-[3rem]'
    : 'motion-safe:translate-y-[3.5rem]'

  const body = (
    <>
      <PractitionerPortrait
        shape="fill"
        src={p.headshotUrl}
        initials={initials}
        alt={name ? `Portrait of ${name}` : 'Practitioner portrait'}
      />

      {/* Top wash — keeps a top-corner badge legible over a bright photo and
          gives the plate an editorial vignette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4"
        style={{ background: 'linear-gradient(to bottom, oklch(from var(--ot-canvas) l c h / 0.45), transparent)' }}
      />

      {profileLabel && (
        <span
          className="absolute left-0 top-4 z-20 px-2 py-0.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.08em]"
          style={{ background: 'var(--ot-accent)', color: 'var(--ot-fg-on-accent)' }}
        >
          {profileLabel}
        </span>
      )}

      {/* ── Glass footer ── slides up on hover to reveal the bio (transform +
          opacity only; no layout animation; clipped by the card's overflow). */}
      <div
        className={
          'absolute inset-x-0 bottom-0 z-10 ' +
          revealClass +
          ' motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ot-ease-kinetic)] motion-safe:group-hover:translate-y-0'
        }
      >
        <div aria-hidden className="card-bg-frost absolute inset-0" />
        <div className={`relative flex flex-col ${compact ? 'gap-0.5 p-sm' : 'gap-1 p-md'}`}>
          <h3
            className={`text-balance font-extrabold leading-[1.1] tracking-[-0.02em] text-fg ${compact ? 'text-[1.15rem]' : 'text-[1.3rem]'}`}
          >
            {name || 'Practitioner'}
            {p.credentials && (
              <span className="text-[0.9em] font-semibold text-fg/70">, {p.credentials}</span>
            )}
          </h3>

          {p.title && (
            <p className={`text-pretty font-semibold leading-snug text-fg ${compact ? 'text-sm' : 'text-[0.95rem]'}`}>
              {p.title}
            </p>
          )}

          {primary?.areaName && (
            <p
              className="text-label font-semibold uppercase tracking-label"
              style={{ color: 'var(--ot-accent)' }}
            >
              {primary.areaName}
            </p>
          )}

          {bio && (
            <p className="mt-1.5 text-pretty text-xs leading-relaxed text-fg/75 line-clamp-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {bio}
            </p>
          )}
        </div>
      </div>
    </>
  )

  const className =
    'practitioner-card group relative block aspect-3/4 w-full overflow-hidden rounded-ot-surface bg-surface ' +
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand'

  return p.url ? (
    <a
      href={p.url}
      data-theme="dark"
      className={`${className} focus:outline-none`}
      aria-label={`View profile: ${name}`}
    >
      {body}
    </a>
  ) : (
    <div data-theme="dark" className={className}>
      {body}
    </div>
  )
}
