'use client'

import { useId, useState, type CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

export const TRUST_RAIL_MIN_LOGOS = 3
export const TRUST_RAIL_MAX_LOGOS = 12

/** Logo height in px per size setting */
const LOGO_HEIGHT: Record<string, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
}

/** Gap between logos in the marquee track (px) per size */
const MARQUEE_GAP: Record<string, number> = {
  xs: 40,
  sm: 48,
  md: 72,
  lg: 96,
  xl: 120,
}

/** Scroll duration in seconds per logo slot — slower = more time to read each logo */
const DURATION_PER_LOGO = 5

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogoItem = {
  /** Resolved image URL */
  imageUrl: string
  /** Accessible label — company name */
  altText?: string
  /** Optional clickable link */
  url?: string
}

export type TrustRailStyleOptions = {
  motion?:     'scroll' | 'fade' | 'static'
  /**
   * auto  — forces a theme-matched silhouette: white on dark grounds
   *         (the default site theme, and any brand fill regardless of the
   *         page's theme), grey/black on light grounds. Recommended default.
   * color — each logo's own hues, undimmed. Only reads well on a white or
   *         very light background; auto-forced back to `auto` on `brand`.
   */
  treatment?:  'auto' | 'mono' | 'color'
  background?: 'canvas' | 'surface' | 'brand'
  size?:       'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Vertical height of the strip */
  density?:    'compact' | 'comfortable' | 'spacious'
  /** Frosted glass overlay on the rail — lifts it off the background */
  glass?:      boolean
}

export type TrustRailProps = {
  headline?:     string
  logos:         LogoItem[]
  styleOptions?: TrustRailStyleOptions
}

// ─── Logo item ────────────────────────────────────────────────────────────────

function Logo({ logo, focusable = true }: { logo: LogoItem; focusable?: boolean }) {
  const img = (
    <img
      data-part="mark"
      src={logo.imageUrl}
      alt={logo.url && focusable ? '' : (logo.altText ?? '')}
      draggable={false}
    />
  )
  if (logo.url && focusable) {
    return (
      <a data-part="logo" href={logo.url} target="_blank" rel="noopener noreferrer">
        {img}
        <span className="sr-only">{logo.altText ?? 'Partner logo'} (opens in a new tab)</span>
      </a>
    )
  }
  return <span data-part="logo">{img}</span>
}

// ─── Empty state (< MIN_LOGOS) ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-md py-xl border border-dashed border-fg/15"
      role="status"
      aria-label="Insufficient logos"
    >
      <div className="flex items-center gap-xl">
        {[1, 0.6, 0.35].map((op, i) => (
          <div key={i} className="h-7 bg-fg/8" style={{ width: `${60 + i * 20}px`, opacity: op }} aria-hidden />
        ))}
      </div>
      <p className="text-label uppercase tracking-label text-fg-muted font-semibold text-center">
        Add at least {TRUST_RAIL_MIN_LOGOS} logos to activate this block
      </p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrustRail({ headline, logos, styleOptions = {} }: TrustRailProps) {
  const {
    motion     = 'scroll',
    treatment  = 'auto',
    background = 'canvas',
    size       = 'md',
    density    = 'compact',
    glass      = false,
  } = styleOptions

  const headId  = useId().replace(/:/g, '')
  const [paused, setPaused] = useState(false)

  const onBrand  = background === 'brand'
  const capped   = logos.slice(0, TRUST_RAIL_MAX_LOGOS)
  const tooFew   = capped.length < TRUST_RAIL_MIN_LOGOS
  const duration = capped.length * DURATION_PER_LOGO

  // Enough copies to keep ~16 logo instances in the track, so the -100%/copies
  // loop point never shows as a seam.
  const trackCopies = Math.max(2, Math.ceil(16 / (capped.length || 1)))

  // The refreshed CSS sizes logos from clamp() (the Medium default). Other sizes
  // set the logo height and gap directly.
  const sizeVars: CSSProperties | undefined = size === 'md' ? undefined : ({
    '--tr-h':   `${LOGO_HEIGHT[size] ?? 40}px`,
    '--tr-gap': `${MARQUEE_GAP[size] ?? 72}px`,
  } as CSSProperties)

  return (
    <section
      data-block="trust-rail"
      data-color={background}
      data-motion={motion}
      data-treatment={onBrand ? 'auto' : treatment}
      data-density={density}
      data-glass={glass ? '' : undefined}
      data-paused={paused ? '' : undefined}
      data-theme={onBrand ? 'dark' : undefined}
      style={sizeVars}
      aria-labelledby={headline ? headId : undefined}
      aria-label={headline ? undefined : 'Trusted partners and customers'}
    >
      {headline && <p data-part="headline" id={headId}>{headline}</p>}

      <div data-part="rail">
        {tooFew ? (
          <div className="px-md"><EmptyState /></div>
        ) : motion === 'scroll' ? (
          <>
            <div data-part="viewport">
              <div
                data-part="track"
                style={{ '--copies': trackCopies, '--dur': `${duration}s` } as CSSProperties}
              >
                {Array.from({ length: trackCopies }, (_, copy) => (
                  // Only the first set is real: focusable, announced. The copies
                  // that make the loop seamless are hidden and inert.
                  <ul
                    key={copy}
                    data-part="set"
                    role="list"
                    aria-hidden={copy > 0 || undefined}
                    {...(copy > 0 ? { inert: true } : {})}
                  >
                    {capped.map((logo, i) => (
                      <li key={i}><Logo logo={logo} focusable={copy === 0} /></li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
            <button type="button" data-part="toggle" aria-pressed={paused} onClick={() => setPaused(p => !p)}>
              {paused ? <Play aria-hidden fill="currentColor" strokeWidth={0} /> : <Pause aria-hidden fill="currentColor" strokeWidth={0} />}
              <span className="sr-only">{paused ? 'Play' : 'Pause'} logo scroll</span>
            </button>
          </>
        ) : (
          <ul data-part="grid" role="list">
            {capped.map((logo, i) => (
              <li key={i} style={{ '--i': i } as CSSProperties}><Logo logo={logo} /></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
