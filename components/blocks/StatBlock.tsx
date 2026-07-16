'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ICON_REGISTRY, type LucideIcon } from '@/components/icons/iconRegistry'

// ─── Icon lookup ──────────────────────────────────────────────────────────────
// Delegates to the shared registry (camelCase keys).
// Legacy kebab-case and title-case aliases kept for backward compat.

const ICONS: Record<string, LucideIcon> = {
  ...ICON_REGISTRY,
  'trending-up':  ICON_REGISTRY['trendingUp'],
  'bar-chart':    ICON_REGISTRY['barChart'],
  'check-circle': ICON_REGISTRY['checkCircle'],
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
  /** Wraps the stat row in a frosted glass panel layered over the background color */
  glass?:     boolean
  showIcons?: boolean
  animate?:   boolean
}

// ─── Value parser ─────────────────────────────────────────────────────────────

type Parsed = { prefix: string; number: number; suffix: string; decimals: number }

function parseValue(raw: string): Parsed {
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
      brand:   'bg-brand-fill',
      canvas:  'bg-canvas',
      surface: 'bg-surface',
    },
    columns: {
      2: 'py-md lg:py-lg',
      3: 'py-md lg:py-lg',
      4: 'py-sm lg:py-md',
    },
  },
  defaultVariants: { color: 'brand', columns: 3 },
})

const gridCva = cva('grid', {
  variants: {
    columns: {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
    },
  },
  defaultVariants: { columns: 3 },
})

/**
 * Number typography scales per column count.
 * Light weight (300) at display scale — editorial inversion: large but delicate.
 * The weight contrast between the gossamer number and the bold uppercase label
 * is the visual moment. Slightly tighter tracking than the system default keeps
 * the numerals crisp rather than floaty at low weight.
 */
const valueCva = cva('font-light leading-none tabular-nums', {
  variants: {
    color: {
      brand:   'text-fg-on-brand',
      canvas:  'text-fg',
      surface: 'text-fg',
    },
    columns: {
      2: 'text-[clamp(4rem,9vw,7.5rem)] tracking-[-0.035em]',
      3: 'text-display tracking-[-0.035em]',
      4: 'text-[clamp(2.5rem,5.5vw,4.75rem)] tracking-[-0.035em]',
    },
  },
  defaultVariants: { color: 'brand', columns: 3 },
})

const labelCva = cva('text-label tracking-label uppercase font-semibold', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/85',
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
    },
  },
  defaultVariants: { color: 'brand' },
})

/** Block header eyebrow — small uppercase tag above the heading */
const eyebrowCva = cva('text-label tracking-label uppercase font-semibold', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/85',
      canvas:  'text-brand',
      surface: 'text-brand',
    },
  },
  defaultVariants: { color: 'brand' },
})

/** Block header heading — editorial headline above the stat row */
const headingCva = cva('text-headline font-bold tracking-headline leading-headline text-balance', {
  variants: {
    color: {
      brand:   'text-fg-on-brand',
      canvas:  'text-fg',
      surface: 'text-fg',
    },
  },
  defaultVariants: { color: 'brand' },
})

// Context opacities sit at the AA floor, not below it — /70 on brand and full
// fg-muted on light grounds keep the supporting line legible in every theme.
const contextCva = cva('text-label font-normal', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/70',
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
    },
  },
  defaultVariants: { color: 'brand' },
})

/** Icon badge — sits left of the label+context column in the 2-col sub-layout. */
const iconBadgeCva = cva('shrink-0', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/70',
      canvas:  'text-brand/80',
      surface: 'text-brand/80',
    },
  },
  defaultVariants: { color: 'brand' },
})

// ─── Animation constants ──────────────────────────────────────────────────────

const ENTER_MS      = 600   // column entrance duration
const STAGGER_MS    = 110   // per-column stagger
const COUNT_LAG     = 150   // ms after entry before count-up begins
const COUNT_MS      = 1400  // count-up duration
const COUNT_STAGGER = 110   // per-column count-up start offset — matches entrance stagger

// ─── Component ────────────────────────────────────────────────────────────────

export type StatBlockProps = {
  eyebrow?:      string
  heading?:      string
  stats:         StatItem[]
  styleOptions?: StatBlockStyleOptions
}

export default function StatBlock({
  eyebrow,
  heading,
  stats,
  styleOptions = {},
}: StatBlockProps) {
  const {
    columns   = 3,
    color     = 'brand',
    glass     = false,
    showIcons = false,
    animate   = true,
  } = styleOptions

  const ref    = useRef<HTMLElement>(null)
  const parsed = stats.map(s => parseValue(s.value))

  // shouldAnim: true once we confirm client + motion pref + animate prop
  const [shouldAnim, setShouldAnim] = useState(false)
  // entered: true when block crosses into viewport
  const [entered,    setEntered]    = useState(false)
  // countOn: true after COUNT_LAG following entry
  const [countOn,    setCountOn]    = useState(false)
  // per-column count progress, 0→1 driven by RAF (starts at 1 = SSR final-value
  // safe). Columns start COUNT_STAGGER apart so the counts land left-to-right,
  // completing the choreography the entrance stagger begins.
  const [colProgress, setColProgress] = useState<number[]>(() => stats.map(() => 1))
  // per-column completion pulse — briefly true, triggers .animate-stat-pulse
  const [colPulse,    setColPulse]    = useState<boolean[]>(() => stats.map(() => false))

  const prefersReducedMotion = usePrefersReducedMotion()

  // ── Step 1: mount — check motion pref, optionally arm observer ───────────
  useEffect(() => {
    const willAnimate = animate && !prefersReducedMotion

    setShouldAnim(willAnimate)

    if (!willAnimate) {
      setEntered(true)
      return
    }

    setColProgress(prev => prev.map(() => 0))

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
  }, [animate, prefersReducedMotion])

  // ── Step 2: after entry, schedule the count-up start ─────────────────────
  useEffect(() => {
    if (!entered || !shouldAnim) return
    const t = setTimeout(() => setCountOn(true), COUNT_LAG)
    return () => clearTimeout(t)
  }, [entered, shouldAnim])

  // ── Step 3: RAF count-up loop — one loop drives every column, each offset
  // by COUNT_STAGGER so completions land left-to-right ──────────────────────
  const colCount = stats.length
  useEffect(() => {
    if (!countOn) return
    const start   = performance.now()
    const total   = COUNT_MS + (colCount - 1) * COUNT_STAGGER
    const settled = Array.from({ length: colCount }, () => false)
    const timers: ReturnType<typeof setTimeout>[] = []
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      setColProgress(Array.from({ length: colCount }, (_, i) => {
        const t = Math.min(Math.max((elapsed - i * COUNT_STAGGER) / COUNT_MS, 0), 1)
        return easeOutQuart(t)
      }))
      for (let i = 0; i < colCount; i++) {
        if (!settled[i] && elapsed >= i * COUNT_STAGGER + COUNT_MS) {
          settled[i] = true
          setColPulse(prev => prev.map((v, j) => (j === i ? true : v)))
          timers.push(setTimeout(() => {
            setColPulse(prev => prev.map((v, j) => (j === i ? false : v)))
          }, 280))
        }
      }
      if (elapsed < total) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [countOn, colCount])

  const displayFor = (p: Parsed, i: number) =>
    shouldAnim && !countOn ? 0 : p.number * (colProgress[i] ?? 1)

  const mobileBorderClass = color === 'brand' ? 'border-fg-on-brand/15' : 'border-fg/10'
  const dividerBgClass    = color === 'brand' ? 'bg-fg-on-brand/15'     : 'bg-fg/10'

  // Extra bottom room so the stats don't sit flush against the section's
  // bottom edge — pairs with the header's mb above the grid for balance.
  const outerClass = cn(sectionCva({ color, columns }), 'pb-lg lg:pb-xl')

  // Glass: each stat is its own frosted card separated by a gap (the section
  // color shows through the gaps). Non-glass: a single continuous row with
  // hairline dividers between items.
  const grid = (
    <ul className={cn(gridCva({ columns }), glass && 'gap-sm md:gap-md')} role="list">
      {stats.map((stat, i) => {
        const p         = parsed[i]
        const staggerMs = i * STAGGER_MS

        // ── Column entrance (opacity + translateY) ────────────────────────
        const itemStyle: React.CSSProperties = shouldAnim
          ? {
              opacity:    entered ? 1 : 0,
              transform:  entered ? 'none' : 'translateY(1.25rem)',
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
              /* dur-exempt: 0.75s — divider scaleY draw; nearest token slow(600ms) Δ150ms, would change feel */
              transition:      `transform 0.75s var(--ot-ease-kinetic) ${staggerMs + 320}ms`,
            }
          : {}

        // ── Label + context slide up ──────────────────────────────────────
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

        // ── Hairline rule draws in from the left (scaleX) ─────────────────
        const ruleStyle: React.CSSProperties = shouldAnim
          ? {
              transform:       entered ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition:      `transform 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
            }
          : {}

        // (watermark icon removed — icons now render inline with the label)

        const Icon = stat.icon ? ICONS[stat.icon] : null
        const disp = displayFor(p, i)

        return (
          <li
            key={i}
            className={cn(
              'relative overflow-hidden flex flex-col',
              glass
                // Frosted card: symmetric padding, no dividers — gaps separate them.
                ? 'bg-glass p-md md:p-lg'
                : [
                    'py-md md:py-lg px-md md:pl-xl md:pr-0',
                    // Mobile horizontal separator — 4-col uses 2×2 grid so suppress
                    // the border on the 2nd item (it shares a row with item 1).
                    columns === 4
                      ? `border-t ${mobileBorderClass} first:border-t-0 [&:nth-child(2)]:border-t-0 md:border-t-0`
                      : `border-t ${mobileBorderClass} first:border-t-0 md:border-t-0`,
                  ],
            )}
            style={itemStyle}
          >
            {/* ── Vertical column divider — desktop, continuous row only ───
             * columns=3 renders grid-cols-1 sm:grid-cols-2 lg:grid-cols-3, so
             * between md (divider turns on) and lg (3rd column appears) the
             * grid is still 2-up. Item index 2 is a row-start in that 2-up
             * layout, so its divider must wait for lg — otherwise it draws a
             * stray rule to the left of an item that isn't sharing a row. */}
            {!glass && i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-md bottom-md w-px',
                  columns === 3 && i === 2 ? 'hidden lg:block' : 'hidden md:block',
                  dividerBgClass,
                )}
                style={dividerStyle}
              />
            )}

            {/* ── Value (count-up) ──────────────────────────────────────── */}
            <p
              className={cn(
                valueCva({ color, columns }),
                colPulse[i] && shouldAnim && 'animate-stat-pulse',
              )}
              aria-hidden="true"
            >
              {p.prefix && <span className="stat-affix mr-[0.05em]">{p.prefix}</span>}
              {fmtNumber(disp, p.decimals)}
              {p.suffix && <span className="stat-affix ml-[0.05em]">{p.suffix}</span>}
            </p>
            <span className="sr-only">{stat.value}</span>

            {/* ── Hairline separator — architectural rule between value and label group */}
            <span
              aria-hidden="true"
              className={cn(
                'block h-px w-8 mt-sm shrink-0',
                color === 'brand' ? 'bg-fg-on-brand/20' : 'bg-brand/25',
              )}
              style={ruleStyle}
            />

            {/* ── Label + context — icon left / text right when icon is on ── */}
            <div
              className={cn('mt-sm flex items-center', showIcons && Icon ? 'gap-sm' : '')}
              style={labelStyle}
            >
              {showIcons && Icon && (
                <Icon
                  aria-hidden="true"
                  className={iconBadgeCva({ color })}
                  size={34}
                  strokeWidth={1.5}
                />
              )}
              <div className="flex flex-col gap-xs">
                <p className={labelCva({ color })}>{stat.label}</p>
                {stat.context && (
                  <p className={contextCva({ color })}>{stat.context}</p>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )

  // brand fill is always dark; glass overlay is always dark — assert dark theme
  // so nested tokens (text-fg, text-fg-muted) resolve correctly on any site theme.
  const isDarkSurface = color === 'brand' || glass

  const header = (eyebrow || heading) ? (
    <header className="flex flex-col gap-xs mb-lg lg:mb-xl max-w-screen-md">
      {eyebrow && <p className={eyebrowCva({ color })}>{eyebrow}</p>}
      {heading && <h2 className={headingCva({ color })}>{heading}</h2>}
    </header>
  ) : null

  return (
    <section
      ref={ref}
      className={outerClass}
      data-theme={isDarkSurface ? 'dark' : undefined}
      aria-label="Key metrics"
    >
      {/* Section color bleeds full width; content is capped so whitespace at
          the margins reads as composed rather than stretched on wide screens. */}
      <div className="max-w-[80rem] mx-auto">
        {header}
        {grid}
      </div>
    </section>
  )
}
