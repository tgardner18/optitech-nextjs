'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

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
  treatment?:  'auto' | 'color'
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

// ─── CSS var for background edge masks ───────────────────────────────────────

const BG_TOKEN: Record<string, string> = {
  canvas:  'var(--ot-canvas)',
  surface: 'var(--ot-surface)',
  brand:   'var(--ot-brand)',
}

// ─── Logo item ────────────────────────────────────────────────────────────────

type LogoImgProps = {
  logo:       LogoItem
  height:     number
  treatment:  TrustRailStyleOptions['treatment']
  onBrand:    boolean
  style?:     React.CSSProperties
  /** Suppresses the hover/spotlight choreography — used in duplicated marquee track copy */
  noHover?:   boolean
  /** aria-hidden — used in marquee duplicate */
  ariaHidden?: boolean
}

function LogoImg({
  logo, height, treatment, onBrand, style, noHover, ariaHidden,
}: LogoImgProps) {
  // A saturated brand fill always wins — full color never reads well
  // against a committed brand ground, so `brand` forces the same
  // theme-matched silhouette as `auto` regardless of the chosen treatment.
  const effectiveTreatment = onBrand ? 'auto' : treatment

  const img = (
    <img
      src={logo.imageUrl}
      alt={ariaHidden ? '' : (logo.altText ?? '')}
      aria-hidden={ariaHidden}
      draggable={false}
      style={{ height, width: 'auto', maxWidth: `${height * 5}px` }}
      className={cn(
        'object-contain select-none flex-none',
        effectiveTreatment === 'auto' ? 'trust-rail-logo-auto' : 'trust-rail-logo-color',
      )}
    />
  )

  // The `trust-rail-logo` class is what makes an item hoverable/dimmable
  // (see globals.css) — omitted on the duplicate marquee copy so it stays
  // visually inert, matching the seamless-loop copy's decorative role.
  const wrapperClass = cn('shrink-0 flex items-center', !noHover && 'group trust-rail-logo')

  if (logo.url && !ariaHidden) {
    return (
      <a
        href={logo.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          wrapperClass,
          'focus-visible:outline-none focus-visible:ring-2',
          onBrand ? 'focus-visible:ring-fg-on-brand' : 'focus-visible:ring-brand',
        )}
        style={style}
        aria-label={logo.altText ?? 'Partner logo'}
      >
        {img}
      </a>
    )
  }

  return (
    <span className={wrapperClass} style={style} aria-hidden={ariaHidden}>
      {img}
    </span>
  )
}

// ─── Empty state (< MIN_LOGOS) ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-md py-xl border border-dashed border-fg/15"
      role="status"
      aria-label="Insufficient logos"
    >
      {/* Skeleton logo placeholders */}
      <div className="flex items-center gap-xl">
        {[1, 0.6, 0.35].map((op, i) => (
          <div
            key={i}
            className="h-7 bg-fg/8"
            style={{ width: `${60 + i * 20}px`, opacity: op }}
            aria-hidden
          />
        ))}
      </div>
      <p className="text-label uppercase tracking-label text-fg-muted/40 font-semibold text-center">
        Add at least {TRUST_RAIL_MIN_LOGOS} logos to activate this block
      </p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrustRail({
  headline,
  logos,
  styleOptions = {},
}: TrustRailProps) {
  const {
    motion     = 'scroll',
    treatment  = 'auto',
    background = 'canvas',
    size       = 'md',
    density    = 'compact',
    glass      = false,
  } = styleOptions

  const onBrand  = background === 'brand'
  const logoH    = LOGO_HEIGHT[size]    ?? 40
  const railGap  = MARQUEE_GAP[size]   ?? 72
  const capped   = logos.slice(0, TRUST_RAIL_MAX_LOGOS)
  const tooFew   = capped.length < TRUST_RAIL_MIN_LOGOS
  const bgToken  = BG_TOKEN[background] ?? 'var(--ot-canvas)'
  const duration = capped.length * DURATION_PER_LOGO

  // Repeating the logo set just twice only reads as truly infinite if that
  // one set is already wider than the viewport — with few logos (as low as
  // TRUST_RAIL_MIN_LOGOS) on a wide screen, two copies can run out before the
  // loop resets, showing a blank gap that looks like "reaching the end."
  // Rendering enough copies to keep ~16 logo instances on screen guarantees
  // the track always over-fills any realistic viewport, so the -100%/copies
  // loop point never becomes visible as a seam.
  const trackCopies = Math.max(2, Math.ceil(16 / (capped.length || 1)))

  // ── Reduced-motion detection + fade observer ────────────────────────────
  const containerRef               = useRef<HTMLDivElement>(null)
  const [fadeTriggered, setFade]   = useState(false)
  const prefersReducedMotion       = usePrefersReducedMotion()

  useEffect(() => {
    if (motion === 'scroll' || motion === 'static') return
    // Fade mode: show immediately if reduced motion, else observe
    if (prefersReducedMotion) { setFade(true); return }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFade(true); obs.disconnect() } },
      { threshold: 0.12 },
    )
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [motion, prefersReducedMotion])

  // ── Density → vertical padding ────────────────────────────────────────
  const railPy =
    density === 'spacious'    ? 'py-xl'  :
    density === 'comfortable' ? 'py-lg'  : 'py-sm'

  const headlinePb =
    density === 'spacious'    ? 'pb-lg'  :
    density === 'comfortable' ? 'pb-md'  : 'pb-sm'

  const headlinePt =
    density === 'spacious'    ? 'pt-xl'  :
    density === 'comfortable' ? 'pt-lg'  : 'pt-md'

  // ── Section wrapper classes ─────────────────────────────────────────────
  // brand uses the radial-gradient fill (bg-brand-fill), not the flat bg-brand
  // — every other block in the system pairs "brand" with the fill, and a flat
  // fill leaves the glass panel with nothing to blur (see .bg-glass docblock).
  const sectionBg =
    background === 'brand'   ? 'bg-brand-fill' :
    background === 'surface' ? 'bg-surface'    : 'bg-canvas'

  // Glass: frame padding is tighter so the glass panel peeks inside
  const outerFramePy = glass
    ? (density === 'spacious' ? 'py-md' : density === 'comfortable' ? 'py-sm' : 'py-xs')
    : undefined

  return (
    <section
      className={cn('border-t border-b border-fg/8', sectionBg)}
      data-theme={onBrand ? 'dark' : undefined}
      aria-label={headline ?? 'Trusted partners and customers'}
    >

      {/* ── Headline ────────────────────────────────────────────────────── */}
      {headline && (
        <div className={cn('text-center px-md', headlinePt, headlinePb)}>
          <p className={cn(
            'text-label uppercase tracking-label font-semibold',
            onBrand ? 'text-fg-on-brand/55' : 'text-fg-muted/55',
          )}>
            {headline}
          </p>
        </div>
      )}

      {/* ── Rail body ───────────────────────────────────────────────────── */}
      <div className={cn(glass && outerFramePy, glass && 'px-md lg:px-xl')}>
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-hidden',
            glass ? 'bg-glass' : undefined,
            !headline ? railPy : undefined,
            headline  ? cn(railPy, 'pt-0') : undefined,
          )}
        >
        {tooFew ? (

          // ── Empty state ─────────────────────────────────────────────────
          <div className="px-md">
            <EmptyState />
          </div>

        ) : motion === 'scroll' ? (

          // ── Scroll marquee ───────────────────────────────────────────────
          <>
            {/* Left edge fade */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 lg:w-28"
              style={{ background: `linear-gradient(to right, ${bgToken}, transparent)` }}
            />
            {/* Right edge fade */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 lg:w-28"
              style={{ background: `linear-gradient(to left, ${bgToken}, transparent)` }}
            />

            {/* Scrolling track — logos repeated `trackCopies` times for a seam
                that never becomes visible (see trackCopies comment above).
                Uses the .animate-trust-rail-scroll class (not an inline animation)
                so the offscreen-pause rule — a stylesheet declaration — can
                override its play-state; an inline `animation` shorthand would win
                on specificity and never pause. The class is already gated by
                @media (prefers-reduced-motion: no-preference); we also drop the
                class under reduced motion to mirror the prior inline gating.
                `trust-rail-track` scopes the :has()-driven hover/dim choreography
                (see globals.css) to this row. */}
            <div
              className={cn('flex items-center trust-rail-track', !prefersReducedMotion && 'animate-trust-rail-scroll')}
              data-pause-offscreen
              style={{
                gap: `${railGap}px`,
                // paddingRight = railGap ensures translateX(-100%/trackCopies)
                // lands exactly at the seam between copies — no jitter on reset,
                // regardless of how many copies are rendered.
                paddingRight: `${railGap}px`,
                // Feeds .animate-trust-rail-scroll's animation-duration and
                // -distance (the keyframe travels -100%/--trust-rail-copies).
                ['--trust-rail-duration']: `${duration}s`,
                ['--trust-rail-copies']: trackCopies,
              } as CSSProperties}
              // Entire track is decorative; screen readers get the list below
              aria-hidden
            >
              {/* Only the first copy (i < capped.length) is hoverable — every
                  repeat after it is inert, so the spotlight/dim choreography
                  never looks asymmetric across copies. */}
              {Array.from({ length: trackCopies }, () => capped).flat().map((logo, i) => (
                <LogoImg
                  key={i}
                  logo={logo}
                  height={logoH}
                  treatment={treatment}
                  onBrand={onBrand}
                  ariaHidden
                  noHover={i >= capped.length}
                />
              ))}
            </div>

            {/* Accessible logo list — visually hidden */}
            <ul className="sr-only" role="list">
              {capped.map((logo, i) => (
                <li key={i}>
                  {logo.url
                    ? <a href={logo.url} target="_blank" rel="noopener noreferrer">{logo.altText ?? 'Partner logo'}</a>
                    : (logo.altText ?? 'Partner logo')
                  }
                </li>
              ))}
            </ul>
          </>

        ) : motion === 'fade' ? (

          // ── Staggered fade-in ────────────────────────────────────────────
          <ul
            className="flex flex-wrap justify-center items-center px-md trust-rail-track"
            style={{ gap: `${railGap}px` }}
            role="list"
          >
            {capped.map((logo, i) => (
              <li key={i} className="flex items-center justify-center">
                <LogoImg
                  logo={logo}
                  height={logoH}
                  treatment={treatment}
                  onBrand={onBrand}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : {
                          opacity:    fadeTriggered ? 1 : 0,
                          transform:  fadeTriggered ? 'none' : 'translateY(0.5rem)',
                          transition: fadeTriggered
                            ? [
                                `opacity 0.5s var(--ot-ease-kinetic) ${i * 75}ms`,
                                `transform 0.5s var(--ot-ease-kinetic) ${i * 75}ms`,
                              ].join(', ')
                            : 'none',
                        }
                  }
                />
              </li>
            ))}
          </ul>

        ) : (

          // ── Static grid ──────────────────────────────────────────────────
          <ul
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 items-center justify-items-center px-md trust-rail-track"
            style={{ gap: `${railGap * 0.75}px` }}
            role="list"
          >
            {capped.map((logo, i) => (
              <li key={i} className="flex items-center justify-center">
                <LogoImg
                  logo={logo}
                  height={logoH}
                  treatment={treatment}
                  onBrand={onBrand}
                />
              </li>
            ))}
          </ul>

        )}
        </div>
      </div>
    </section>
  )
}
