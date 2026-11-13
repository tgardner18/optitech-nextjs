'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { ICON_REGISTRY, type LucideIcon } from '@/components/icons/iconRegistry'
import { ArrowRight } from 'lucide-react'
import { RichText } from '@optimizely/cms-sdk/react/richText'

const ICONS: Record<string, LucideIcon> = { ...ICON_REGISTRY }

// ─── Public types ─────────────────────────────────────────────────────────────

export type FeatureItem = {
  headline:  string
  body?:     Parameters<typeof RichText>[0]['content'] | null
  ctaLabel?: string
  ctaUrl?:   string
  icon?:     string
}

export type FeatureTileStyleOptions = {
  color?:     'canvas' | 'surface' | 'brand'
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
// data attributes and markup; the surrounding Feature Grid (or a standalone wrapper) supplies the
// data-color attribute the stylesheet reads.

// ─── Component ────────────────────────────────────────────────────────────────

export type FeatureTileProps = {
  feature:       FeatureItem
  styleOptions?: FeatureTileStyleOptions
  /**
   * Row-level entrance state, shared across a grid so every tile enters off
   * one coordinated trigger. Omit to let the tile observe its own visibility
   * — used when it renders standalone in a column.
   */
  entered?:      boolean
  /** Per-tile delay in ms, for staggering a coordinated multi-tile entrance. */
  staggerMs?:    number
  /**
   * 'card' (default) — self-contained bordered/padded tile, for standalone
   * column placement. 'bare' — no self background/border/padding; the caller
   * (FeatureGridBlock's grid or ruled layout) supplies that chrome.
   */
  variant?:      'card' | 'bare'
  className?:    string
}

export default function FeatureTile({
  feature,
  styleOptions = {},
  entered: externalEntered,
  staggerMs = 0,
  variant = 'card',
  className,
}: FeatureTileProps) {
  const {
    iconStyle = 'none',
    animate   = true,
  } = styleOptions

  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const [shouldAnim, setShouldAnim]           = useState(false)
  const [internalEntered, setInternalEntered] = useState(false)

  const isControlled = externalEntered !== undefined
  const entered = isControlled ? externalEntered : internalEntered

  useEffect(() => {
    const willAnimate = animate && !prefersReducedMotion
    setShouldAnim(willAnimate)

    if (!willAnimate || isControlled) {
      if (!willAnimate) setInternalEntered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternalEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate, prefersReducedMotion, isControlled])

  const Icon           = feature.icon ? ICONS[feature.icon] : null
  const showIcon       = iconStyle !== 'none' && !!Icon
  const showAccentIcon = showIcon && iconStyle === 'accent'

  const itemStyle: React.CSSProperties = shouldAnim
    ? {
        opacity:   entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(1rem)',
        transition: entered
          ? [
              `opacity 500ms var(--ot-ease-kinetic) ${staggerMs}ms`,
              `transform 500ms var(--ot-ease-kinetic) ${staggerMs}ms`,
            ].join(', ')
          : 'none',
      }
    : {}

  const textBlock = (
    <>
      <h3 data-part="title">{feature.headline}</h3>

      {feature.body && (
        <div data-part="desc">
          <RichText content={feature.body} />
        </div>
      )}

      {feature.ctaLabel && feature.ctaUrl && (
        <a href={feature.ctaUrl} data-part="link">
          {feature.ctaLabel}
          <ArrowRight aria-hidden="true" />
        </a>
      )}
    </>
  )

  const content = (
    <>
      {showIcon && iconStyle === 'structural' && (
        <span data-part="tile" aria-hidden="true">
          <Icon />
        </span>
      )}

      {showAccentIcon ? (
        <div data-part="row">
          <span data-part="icon" aria-hidden="true">
            <Icon />
          </span>
          <div data-part="body">{textBlock}</div>
        </div>
      ) : (
        textBlock
      )}
    </>
  )

  return (
    <div ref={ref} data-part="tilewrap" className={className} style={itemStyle}>
      {variant === 'card' ? <div data-part="card">{content}</div> : content}
    </div>
  )
}
