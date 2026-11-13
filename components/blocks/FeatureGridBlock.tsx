'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { ArrowRight } from 'lucide-react'
import FeatureTile, { type FeatureItem } from './FeatureTile'

export type { FeatureItem }

export type FeatureGridStyleOptions = {
  color?:     'canvas' | 'surface' | 'brand'
  layout?:    'grid' | 'ruled'
  columns?:   2 | 3 | 4
  /**
   * none:       Icons hidden regardless of slot configuration.
   * accent:     Icon (32px, bold stroke) to the left of the headline and
   *             body, vertically centered across both.
   * structural: Icon (36px) in a tinted tile above the headline.
   */
  iconStyle?: 'none' | 'accent' | 'structural'
  animate?:   boolean
}

// Visual styling lives in feature.css (imported from app/globals.css). This component only sets
// data attributes and markup.

// ─── Animation constants ──────────────────────────────────────────────────────

const STAGGER_MS = 80

// ─── Component ────────────────────────────────────────────────────────────────

export type FeatureGridBlockProps = {
  features:     FeatureItem[]
  eyebrow?:     string
  heading?:     string
  subheading?:  string
  ctaLabel?:    string
  ctaUrl?:      string
  styleOptions?: FeatureGridStyleOptions
}

export default function FeatureGridBlock({
  features,
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaUrl,
  styleOptions = {},
}: FeatureGridBlockProps) {
  const {
    color     = 'canvas',
    layout    = 'grid',
    columns   = 3,
    iconStyle = 'none',
    animate   = true,
  } = styleOptions

  // Shared entrance trigger — every tile enters off one observer on the
  // section, staggered by index, rather than each tile observing itself.
  const ref = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  const prefersReducedMotion  = usePrefersReducedMotion()

  useEffect(() => {
    if (!animate || prefersReducedMotion) {
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
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate, prefersReducedMotion])

  // Ruled rows are paired up front (rather than left to the grid's own
  // auto-flow) so the zebra tint and hover highlight can be applied to one
  // element — a single <li> spanning both columns — and read correctly at
  // every breakpoint, including the single-column mobile layout where the
  // grid's own 2-up placement no longer applies.
  const ruledRows: FeatureItem[][] = []
  if (layout === 'ruled') {
    for (let i = 0; i < features.length; i += 2) {
      ruledRows.push(features.slice(i, i + 2))
    }
  }

  const headingId     = useId()
  const hasHeader     = eyebrow || heading || subheading
  const hasSectionCta = ctaLabel && ctaUrl

  return (
    <section
      ref={ref}
      data-block="feature"
      data-color={color}
      data-layout={layout}
      data-cols={columns}
      // brand fill is always dark: assert dark theme so nested tokens (links, focus rings) resolve correctly.
      data-theme={color === 'brand' ? 'dark' : undefined}
      {...(heading ? { 'aria-labelledby': headingId } : { 'aria-label': 'Features' })}
    >
      {/* ── Section header ──────────────────────────────────────────────── */}
      {hasHeader && (
        <div data-part="header">
          {eyebrow && <p data-part="eyebrow">{eyebrow}</p>}
          {heading && <h2 data-part="heading" id={headingId}>{heading}</h2>}
          {subheading && <p data-part="sub">{subheading}</p>}
        </div>
      )}

      {/* ── Feature grid ────────────────────────────────────────────────── */}
      {layout === 'ruled' ? (
        <ul data-part="ruled" role="list" data-ruled-grid="" data-color={color}>
          {ruledRows.map((rowFeatures, rowIndex) => (
            <li
              key={rowIndex}
              data-part="ruled-row"
              data-ruled-row=""
              data-color={color}
              data-zebra={rowIndex % 2 === 1 ? '' : undefined}
            >
              {rowFeatures.map((feature, colIndex) => (
                <div key={colIndex} data-part="item">
                  <FeatureTile
                    feature={feature}
                    styleOptions={{ iconStyle, animate }}
                    entered={entered}
                    staggerMs={(rowIndex * 2 + colIndex) * STAGGER_MS}
                    variant="bare"
                  />
                </div>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <ul data-part="list" role="list">
          {features.map((feature, i) => (
            <li key={i}>
              <FeatureTile
                feature={feature}
                styleOptions={{ iconStyle, animate }}
                entered={entered}
                staggerMs={i * STAGGER_MS}
                variant="card"
              />
            </li>
          ))}
        </ul>
      )}

      {/* ── Section CTA ─────────────────────────────────────────────────── */}
      {hasSectionCta && (
        <div data-part="cta">
          <a href={ctaUrl}>
            {ctaLabel}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  )
}
