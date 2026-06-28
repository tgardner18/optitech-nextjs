import { MapPin } from 'lucide-react'
import { locationInitials } from '@/lib/locationFormat'

// Image surface shared by the location card (landscape plate), list row + rail
// (square thumbnail), and map popup. Renders the location image when present,
// otherwise a designed branded-abstract plate: a brand-derived radial gradient +
// a faint grain field + a MapPin glyph over the location's initials. The gradient
// uses OKLCH relative-color syntax off --ot-brand, so it recalibrates under a CMS
// theme override like every other token. No hooks — safe in server and client trees.

type Props = {
  src?:      string
  name:      string
  alt?:      string
  /** 'fill' → absolute inset image filling an aspect-ratio'd parent. */
  shape:     'fill'
  /** Extra classes on the wrapper (e.g. sizing for the thumbnail). */
  className?: string
  /** Slow zoom-in on parent .group hover (card only). */
  hoverZoom?: boolean
  /** Scales the fallback glyph for small thumbnails. */
  size?:     'sm' | 'md'
}

// SVG feTurbulence grain, desaturated, tiled — matches the card/portrait noise
// field so every branded surface shares one grain character. mix-blend-overlay
// keeps it from darkening or lightening the gradient beneath.
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")"

// Atmospheric brand surface for the no-image state — light-shifted highlight at
// upper-left falling to a deeper brand at the lower-right.
const GRADIENT =
  'radial-gradient(ellipse at 38% 32%, ' +
  'oklch(from var(--ot-brand) calc(l + 0.12) c h) 0%, ' +
  'var(--ot-brand) 42%, ' +
  'oklch(from var(--ot-brand) calc(l - 0.1) c h) 100%)'

export default function LocationPlate({
  src,
  name,
  alt,
  className = '',
  hoverZoom = false,
  size = 'md',
}: Props) {
  const initials = locationInitials(name)
  const isSm = size === 'sm'

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden @container ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? (name ? `${name}` : 'Location')}
          loading="lazy"
          className={
            'absolute inset-0 h-full w-full object-cover' +
            (hoverZoom
              ? ' motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[var(--ot-ease-kinetic)] group-hover:scale-[1.04]'
              : '')
          }
        />
      ) : (
        <div aria-hidden className="absolute inset-0" style={{ background: GRADIENT }}>
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12]"
            style={{ backgroundImage: NOISE_BG }}
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ color: 'oklch(from var(--ot-fg-on-brand) l c h / 0.92)' }}
          >
            <MapPin
              size={isSm ? 18 : 34}
              strokeWidth={1.5}
              aria-hidden
              style={{ color: 'oklch(from var(--ot-fg-on-brand) l c h / 0.85)' }}
            />
            {!isSm && initials && (
              <span className="text-[clamp(1rem,5cqw,1.6rem)] font-extrabold leading-none tracking-[-0.03em]">
                {initials}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
