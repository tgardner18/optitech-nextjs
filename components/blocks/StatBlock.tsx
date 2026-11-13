'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import StatTile, { type StatItem, type StatEffect } from './StatTile'

export type { StatItem, StatEffect }

export type StatBlockStyleOptions = {
  columns?:      2 | 3 | 4
  color?:        'brand' | 'canvas' | 'surface'
  /** Wraps the stat row in a frosted glass panel layered over the background color */
  glass?:        boolean
  showIcons?:    boolean
  /** 'inline' (default) — icon left of the label row. 'above' — icon centered above the numeral. */
  iconPlacement?: 'inline' | 'above'
  animate?:      boolean
}

// Visual styling lives in stat.css (imported from app/globals.css). This component only sets
// data attributes and markup.

// ─── Animation constants ──────────────────────────────────────────────────────

const STAGGER_MS = 110   // per-column stagger, shared with the row's entrance trigger

// ─── Component ────────────────────────────────────────────────────────────────

export type StatBlockProps = {
  eyebrow?:      string
  heading?:      string
  stats:         StatItem[]
  styleOptions?: StatBlockStyleOptions
  /** Numeral visual effect — sourced from the CMS content property, not display settings. */
  effect?:       StatEffect
}

export default function StatBlock({
  eyebrow,
  heading,
  stats,
  styleOptions = {},
  effect = 'none',
}: StatBlockProps) {
  const {
    columns       = 3,
    color         = 'brand',
    glass         = false,
    showIcons     = false,
    iconPlacement = 'inline',
    animate       = true,
  } = styleOptions

  const ref = useRef<HTMLElement>(null)

  // shouldAnim: true once we confirm client + motion pref + animate prop
  const [shouldAnim, setShouldAnim] = useState(false)
  // entered: true when the row crosses into viewport — shared by every tile
  // so the whole row's entrance triggers off one observer, staggered by index.
  const [entered, setEntered] = useState(false)

  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const willAnimate = animate && !prefersReducedMotion
    setShouldAnim(willAnimate)

    if (!willAnimate) {
      setEntered(true)
      return
    }

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

  const headingId = useId()
  const hasHeader = !!(eyebrow || heading)

  return (
    <section
      ref={ref}
      data-block="stat"
      data-color={color}
      // Never more columns than stats, so three stats in the four-column setting don't leave a gap.
      data-cols={Math.min(columns, Math.max(stats.length, 1))}
      data-glass={glass ? 'yes' : 'no'}
      data-effect={effect}
      data-place={showIcons ? iconPlacement : 'inline'}
      data-animate={shouldAnim ? '' : undefined}
      data-in={shouldAnim && entered ? '' : undefined}
      // brand fill is always dark: assert dark theme so nested tokens resolve correctly.
      data-theme={color === 'brand' ? 'dark' : undefined}
      {...(heading ? { 'aria-labelledby': headingId } : { 'aria-label': 'Key metrics' })}
    >
      <div data-part="inner">
        {hasHeader && (
          <header data-part="header">
            {eyebrow && <p data-part="eyebrow">{eyebrow}</p>}
            {heading && <h2 data-part="heading" id={headingId}>{heading}</h2>}
          </header>
        )}
        <ul data-part="list" role="list">
          {stats.map((stat, i) => (
            <li key={i} data-part="item">
              <StatTile
                stat={{ ...stat, icon: showIcons ? stat.icon : undefined }}
                styleOptions={{ color, glass, iconPlacement, animate }}
                effect={effect}
                entered={entered}
                staggerMs={i * STAGGER_MS}
                variant={glass ? 'card' : 'row'}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
