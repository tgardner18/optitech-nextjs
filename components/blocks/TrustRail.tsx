'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

// ─── Constants ────────────────────────────────────────────────────────────────

export const TRUST_RAIL_MIN_LOGOS = 3
export const TRUST_RAIL_MAX_LOGOS = 12

/** Logo height in px per size setting */
const LOGO_HEIGHT: Record<string, number> = {
  sm: 28,
  md: 40,
  lg: 56,
}

/** Gap between logos in the marquee track (px) per size */
const MARQUEE_GAP: Record<string, number> = {
  sm: 48,
  md: 72,
  lg: 96,
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
  treatment?:  'mono' | 'color'
  background?: 'canvas' | 'surface' | 'brand'
  size?:       'sm' | 'md' | 'lg'
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
  /** Suppresses hover effect — used in duplicated marquee track copy */
  noHover?:   boolean
  /** aria-hidden — used in marquee duplicate */
  ariaHidden?: boolean
}

function LogoImg({
  logo, height, treatment, onBrand, style, noHover, ariaHidden,
}: LogoImgProps) {
  // On-brand surface: all logos → white silhouette at 75% opacity
  // Mono treatment: grayscale + 40% opacity, hover → full color/opacity
  // Color treatment: full color, no filter
  const filterClass = onBrand
    ? 'brightness-0 invert opacity-75'
    : treatment === 'mono'
      ? cn('grayscale opacity-40', !noHover && 'group-hover:grayscale-0 group-hover:opacity-100')
      : ''

  const img = (
    <img
      src={logo.imageUrl}
      alt={ariaHidden ? '' : (logo.altText ?? '')}
      aria-hidden={ariaHidden}
      draggable={false}
      style={{
        height,
        width: 'auto',
        maxWidth: `${height * 5}px`,
        transition: !onBrand && treatment === 'mono' && !noHover
          ? 'filter 280ms var(--ot-ease-quick), opacity 280ms var(--ot-ease-quick)'
          : undefined,
      }}
      className={cn(
        'object-contain select-none flex-none',
        filterClass,
      )}
    />
  )

  if (logo.url && !ariaHidden) {
    return (
      <a
        href={logo.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2',
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
    <span
      className="group shrink-0 flex items-center"
      style={style}
      aria-hidden={ariaHidden}
    >
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
    treatment  = 'mono',
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
  const sectionBg =
    background === 'brand'   ? 'bg-brand'   :
    background === 'surface' ? 'bg-surface' : 'bg-canvas'

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
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 lg:w-28"
              style={{ background: `linear-gradient(to right, ${bgToken}, transparent)` }}
            />
            {/* Right edge fade */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 lg:w-28"
              style={{ background: `linear-gradient(to left, ${bgToken}, transparent)` }}
            />

            {/* Scrolling track — logos doubled for seamless loop.
                Uses the .animate-trust-rail-scroll class (not an inline animation)
                so the offscreen-pause rule — a stylesheet declaration — can
                override its play-state; an inline `animation` shorthand would win
                on specificity and never pause. The class is already gated by
                @media (prefers-reduced-motion: no-preference); we also drop the
                class under reduced motion to mirror the prior inline gating. */}
            <div
              className={cn('flex items-center', !prefersReducedMotion && 'animate-trust-rail-scroll')}
              data-pause-offscreen
              style={{
                gap: `${railGap}px`,
                // paddingRight = railGap ensures translateX(-50%) lands exactly
                // at the seam between the two copies — no jitter on loop reset.
                paddingRight: `${railGap}px`,
                // Feeds .animate-trust-rail-scroll's animation-duration.
                ['--trust-rail-duration']: `${duration}s`,
              } as CSSProperties}
              // Entire track is decorative; screen readers get the list below
              aria-hidden
            >
              {[...capped, ...capped].map((logo, i) => (
                <LogoImg
                  key={i}
                  logo={logo}
                  height={logoH}
                  treatment={treatment}
                  onBrand={onBrand}
                  ariaHidden
                  noHover
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
            className="flex flex-wrap justify-center items-center px-md"
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
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 items-center justify-items-center px-md"
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
