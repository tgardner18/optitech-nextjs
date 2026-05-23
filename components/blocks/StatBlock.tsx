'use client'

import { useEffect, useRef, useState } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ICON_REGISTRY, type LucideIcon } from '@/components/icons/iconRegistry'

// ─── Icon lookup ──────────────────────────────────────────────────────────────
// Delegates to the shared registry (camelCase keys).
// Legacy kebab-case aliases kept for backward compat with showcase / old content.

const ICONS: Record<string, LucideIcon> = {
  ...ICON_REGISTRY,
  // Legacy kebab-case aliases
  'trending-up':  ICON_REGISTRY['trendingUp'],
  'bar-chart':    ICON_REGISTRY['barChart'],
  'check-circle': ICON_REGISTRY['checkCircle'],
  // Title-case aliases from an earlier EnumValues attempt
  'Zap':          ICON_REGISTRY['zap'],
  'Shield':       ICON_REGISTRY['shield'],
  'Users':        ICON_REGISTRY['users'],
  'Trending Up':  ICON_REGISTRY['trendingUp'],
  'Clock':        ICON_REGISTRY['clock'],
  'Award':        ICON_REGISTRY['award'],
  'Bar Chart':    ICON_REGISTRY['barChart'],
  'Globe':        ICON_REGISTRY['globe'],
  'Sparkles':     ICON_REGISTRY['sparkles'],
  'Check Circle': ICON_REGISTRY['checkCircle'],
}

export type StatIconKey = keyof typeof ICONS

// ─── Public types ─────────────────────────────────────────────────────────────

export type StatItem = {
  /** Display value — prefix + number + suffix e.g. "40%", "2M+", "$4.2B", "99.99%" */
  value:    string
  /** Short metric label e.g. "Faster deployment" */
  label:    string
  /** Optional supporting context e.g. "vs. industry average" */
  context?: string
  /** Optional icon key — any string; unknown keys silently render nothing */
  icon?:    string
}

export type StatBlockStyleOptions = {
  columns?:   2 | 3 | 4
  color?:     'brand' | 'canvas' | 'surface'
  showIcons?: boolean
  animate?:   boolean
}

// ─── Value parser ─────────────────────────────────────────────────────────────

type Parsed = { prefix: string; number: number; suffix: string; decimals: number }

function parseValue(raw: string): Parsed {
  // Capture: optional non-digit prefix · digits with optional decimal · remaining suffix
  const m = raw.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return { prefix: '', number: 0, suffix: raw, decimals: 0 }
  const dec = m[2].includes('.') ? m[2].split('.')[1].length : 0
  return { prefix: m[1], number: parseFloat(m[2]), suffix: m[3], decimals: dec }
}

function fmtNumber(n: number, decimals: number): string {
  return n.toFixed(decimals)
}

// ─── Easing ───────────────────────────────────────────────────────────────────

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
}

// ─── CVA variants ─────────────────────────────────────────────────────────────

const sectionCva = cva('px-md lg:px-lg', {
  variants: {
    color: {
      brand:   'bg-brand',
      canvas:  'bg-canvas',
      surface: 'bg-surface',
    },
    columns: {
      2: 'py-xl lg:py-2xl',
      3: 'py-xl',
      4: 'py-lg lg:py-xl',
    },
  },
  defaultVariants: { color: 'brand', columns: 3 },
})

const gridCva = cva('grid', {
  variants: {
    columns: {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-4',
    },
  },
  defaultVariants: { columns: 3 },
})

/**
 * Number typography scales per column count.
 * 2–3 columns: full display scale (3–6rem) — heroic presence.
 * 4 columns: intermediate scale (2–3.75rem) — still prominent, fits four-up.
 */
const valueCva = cva('font-extrabold leading-none tabular-nums', {
  variants: {
    color: {
      brand:   'text-fg-on-brand',
      canvas:  'text-fg',
      surface: 'text-fg',
    },
    columns: {
      2: 'text-display tracking-display',
      3: 'text-display tracking-display',
      4: 'text-[clamp(2rem,4.5vw,3.75rem)] tracking-[-0.025em]',
    },
  },
  defaultVariants: { color: 'brand', columns: 3 },
})

const labelCva = cva('text-label tracking-label uppercase font-semibold', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/70',
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
    },
  },
  defaultVariants: { color: 'brand' },
})

const contextCva = cva('text-label font-normal', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/45',
      canvas:  'text-fg-muted/60',
      surface: 'text-fg-muted/60',
    },
  },
  defaultVariants: { color: 'brand' },
})

const iconCva = cva('', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/55',
      canvas:  'text-brand',
      surface: 'text-brand',
    },
  },
  defaultVariants: { color: 'brand' },
})

// ─── Animation constants ──────────────────────────────────────────────────────

const ENTER_MS   = 600   // column entrance duration
const STAGGER_MS = 110   // per-column stagger
const COUNT_LAG  = 150   // ms after first column starts before count-up begins
const COUNT_MS   = 1400  // count-up duration

// ─── Component ────────────────────────────────────────────────────────────────

export type StatBlockProps = {
  stats:         StatItem[]
  styleOptions?: StatBlockStyleOptions
}

export default function StatBlock({
  stats,
  styleOptions = {},
}: StatBlockProps) {
  const {
    columns   = 3,
    color     = 'brand',
    showIcons = false,
    animate   = true,
  } = styleOptions

  const ref        = useRef<HTMLElement>(null)
  const parsed     = stats.map(s => parseValue(s.value))

  // shouldAnim: true once we confirm client + motion pref + animate prop
  const [shouldAnim, setShouldAnim] = useState(false)
  // entered: true when block crosses into viewport
  const [entered,    setEntered]    = useState(false)
  // countOn: true after the brief COUNT_LAG following entry
  const [countOn,    setCountOn]    = useState(false)
  // progress: 0→1 driven by RAF (starts at 1 = SSR final-value safe)
  const [progress,   setProgress]   = useState(1)
  // pulsing: briefly true when count completes, triggers .animate-stat-pulse
  const [pulsing,    setPulsing]    = useState(false)

  // ── Step 1: mount — check motion pref, optionally arm observer ───────────
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const willAnimate   = animate && !reducedMotion

    setShouldAnim(willAnimate)

    if (!willAnimate) {
      setEntered(true)
      // progress stays at 1 — final values shown immediately
      return
    }

    // Reset number display to zero now that we're client-side
    setProgress(0)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate])

  // ── Step 2: after entry, schedule the count-up start ─────────────────────
  useEffect(() => {
    if (!entered || !shouldAnim) return
    const t = setTimeout(() => setCountOn(true), COUNT_LAG)
    return () => clearTimeout(t)
  }, [entered, shouldAnim])

  // ── Step 3: RAF count-up loop ─────────────────────────────────────────────
  useEffect(() => {
    if (!countOn) return
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const t       = Math.min(elapsed / COUNT_MS, 1)
      setProgress(easeOutQuart(t))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        // Count complete — fire the pulse, then clear it
        setPulsing(true)
        setTimeout(() => setPulsing(false), 280)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [countOn])

  // ── Derived display value ─────────────────────────────────────────────────
  // Before countOn: show 0 (column is still fading in so it's nearly invisible).
  // After countOn starts: animate from 0 to target.
  // No animation: always show final value via progress=1.
  const displayFor = (p: Parsed) =>
    shouldAnim && !countOn ? 0 : p.number * progress

  // ── Color-dependent class fragments ──────────────────────────────────────
  const mobileBorderClass = color === 'brand'
    ? 'border-fg-on-brand/15'
    : 'border-fg/10'

  const dividerBgClass = color === 'brand'
    ? 'bg-fg-on-brand/15'
    : 'bg-fg/10'

  return (
    <section
      ref={ref}
      className={sectionCva({ color, columns })}
      aria-label="Key metrics"
    >
      <ul className={gridCva({ columns })} role="list">
        {stats.map((stat, i) => {
          const p          = parsed[i]
          const staggerMs  = i * STAGGER_MS

          // ── Column entrance (opacity + translateY, CSS transition) ────────
          const itemStyle: React.CSSProperties = shouldAnim
            ? {
                opacity:   entered ? 1 : 0,
                transform: entered ? 'none' : 'translateY(1.25rem)',
                transition: entered
                  ? [
                      `opacity ${ENTER_MS}ms var(--ot-ease-kinetic) ${staggerMs}ms`,
                      `transform ${ENTER_MS}ms var(--ot-ease-kinetic) ${staggerMs}ms`,
                    ].join(', ')
                  : 'none',
              }
            : {}

          // ── Vertical divider draw-in (scaleY from top) ────────────────────
          const dividerStyle: React.CSSProperties = shouldAnim
            ? {
                transform:       entered ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top center',
                transition:      `transform 0.75s var(--ot-ease-kinetic) ${staggerMs + 320}ms`,
              }
            : {}

          // ── Icon fade-in (slightly ahead of count-up) ─────────────────────
          const iconStyle: React.CSSProperties = shouldAnim
            ? {
                opacity:    entered ? 1 : 0,
                transition: `opacity 0.55s var(--ot-ease-kinetic) ${staggerMs + 80}ms`,
              }
            : {}

          // ── Label + context slide up (after count-up lag) ─────────────────
          const labelStyle: React.CSSProperties = shouldAnim
            ? {
                opacity:    entered ? 1 : 0,
                transform:  entered ? 'none' : 'translateY(0.4rem)',
                transition: [
                  `opacity 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
                  `transform 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
                ].join(', '),
              }
            : {}

          const Icon = stat.icon ? ICONS[stat.icon] : null
          const disp = displayFor(p)

          return (
            <li
              key={i}
              className={cn(
                'relative flex flex-col py-lg md:py-xl',
                'px-md md:pl-xl md:pr-0',
                // Mobile horizontal separator — hidden once grid goes multi-column
                `border-t ${mobileBorderClass} first:border-t-0 md:border-t-0`,
              )}
              style={itemStyle}
            >
              {/* ── Vertical column divider — desktop, not on first item ─── */}
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-lg bottom-lg hidden md:block w-px',
                    dividerBgClass,
                  )}
                  style={dividerStyle}
                />
              )}

              {/* ── Icon (optional) ───────────────────────────────────────── */}
              {showIcons && Icon && (
                <span
                  aria-hidden="true"
                  className={cn('mb-sm block', iconCva({ color }))}
                  style={iconStyle}
                >
                  <Icon size={28} strokeWidth={1.5} />
                </span>
              )}

              {/* ── Value (count-up number) ───────────────────────────────── */}
              {/*
                aria-hidden: the live counting number is hidden from AT.
                The sr-only span below provides the final static value.
              */}
              <p
                className={cn(
                  valueCva({ color, columns }),
                  pulsing && shouldAnim && 'animate-stat-pulse',
                )}
                aria-hidden="true"
              >
                {p.prefix}{fmtNumber(disp, p.decimals)}{p.suffix}
              </p>
              <span className="sr-only">{stat.value}</span>

              {/* ── Label ────────────────────────────────────────────────── */}
              <p
                className={cn(labelCva({ color }), 'mt-xs')}
                style={labelStyle}
              >
                {stat.label}
              </p>

              {/* ── Context (optional) ────────────────────────────────────── */}
              {stat.context && (
                <p
                  className={cn(contextCva({ color }), 'mt-xs')}
                  style={labelStyle}
                >
                  {stat.context}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
