import { Phone, Mail, ChevronRight } from 'lucide-react'
import type { PractitionerCardData } from '@/lib/practitioners'
import {
  practitionerInitials,
  practitionerName,
  primaryArea,
} from '@/lib/practitionerFormat'
import PractitionerPortrait from './PractitionerPortrait'

type Props = {
  practitioner: PractitionerCardData
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
}

// Compact directory row. A full-height square portrait sits flush against the
// left edge (no ring, no border, no inset) and anchors the row; name +
// credentials read as one typographic unit, with title · primary-area beneath
// and optional inline contact. The whole row links to the profile page. On
// hover the full border goes brand and a faint brand wash fills the row, with
// the chevron sliding right — a strong left-to-right reading anchor without a
// decorative side-stripe (banned by DESIGN.md).

export default function PractitionerListRow({ practitioner, onSurface = false, density = 'comfortable' }: Props) {
  const p        = practitioner
  const name     = practitionerName(p, false)
  const initials = practitionerInitials(p)
  const primary  = primaryArea(p.practiceAreas)

  const rowBg = onSurface ? 'bg-canvas' : 'bg-surface'
  // Text column padding only — the portrait is flush to the row's left/top/bottom.
  const textPad = density === 'compact' ? 'py-sm pl-sm pr-sm' : 'py-md pl-md pr-md'

  const body = (
    <>
      {/* Square portrait, flush to the left edge, borderless. The width is
          definite (numeric scale, not a named token) and aspect-square derives
          the height from it — a flex item can't derive width from a stretched
          height, so a definite WIDTH is what keeps the square from collapsing.
          At this size the portrait drives the row height, so it fills edge to
          edge; the text column centers beside it. Bigger than the old thumb. */}
      <div className={`relative flex-none aspect-square overflow-hidden ${density === 'compact' ? 'w-24' : 'w-32'}`}>
        <PractitionerPortrait
          shape="fill"
          src={p.headshotUrl}
          initials={initials}
          alt={name ? `Portrait of ${name}` : 'Profile portrait'}
        />
      </div>

      <div className={`min-w-0 flex-1 self-center ${textPad}`}>
        {/* Name + credentials — one typographic unit */}
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-bold leading-tight text-fg">{name || 'Profile'}</span>
          {p.credentials && (
            <span className="text-sm font-medium text-fg-muted">{p.credentials}</span>
          )}
        </p>

        {/* Title — emphasized role statement */}
        {p.title && (
          <p className="mt-0.5 text-pretty text-sm font-semibold leading-snug text-fg">{p.title}</p>
        )}

        {/* Primary area · facility — secondary */}
        {primary?.areaName && (
          <p className="mt-0.5 text-sm leading-snug text-fg-muted">
            {primary.areaName}
            {primary.facility && (
              <>
                <span className="mx-1.5 text-fg-muted/40" aria-hidden>·</span>
                {primary.facility}
              </>
            )}
          </p>
        )}

        {/* Inline contact */}
        {(p.phone || p.email) && (
          <p className="mt-xs flex flex-wrap gap-x-md gap-y-1 text-xs text-fg-muted/80">
            {p.phone && (
              <span className="inline-flex items-center gap-xs">
                <Phone size={10} strokeWidth={2} className="text-brand" aria-hidden />
                {p.phone}
              </span>
            )}
            {p.email && (
              <span className="inline-flex min-w-0 items-center gap-xs">
                <Mail size={10} strokeWidth={2} className="flex-none text-brand" aria-hidden />
                <span className="truncate">{p.email}</span>
              </span>
            )}
          </p>
        )}
      </div>

      {p.url && (
        <ChevronRight
          size={16}
          strokeWidth={2}
          aria-hidden
          className="flex-none self-center text-fg-muted motion-safe:transition-transform motion-safe:duration-150 group-hover:translate-x-1 group-hover:text-brand"
        />
      )}
    </>
  )

  // Full border (not a side-stripe) shifts to brand on hover, with a faint brand
  // wash. 150ms quick ease. items-stretch lets the portrait fill the row height;
  // overflow-hidden clips the flush square to the bordered edge.
  const className =
    `group flex items-stretch overflow-hidden rounded-ot-surface ${rowBg} border border-fg/10 ` +
    'transition-[background-color,border-color] duration-150 ease-(--ot-ease-quick) ' +
    'hover:border-brand/60 hover:bg-brand/4'

  return p.url ? (
    <a
      href={p.url}
      className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
      aria-label={`View profile: ${name}`}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  )
}
