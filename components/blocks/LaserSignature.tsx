'use client'

/**
 * LaserSignature
 *
 * Renders the attribution name as a Caveat 400 signature that writes itself
 * character by character when scrolled into view — each letter flashes with a
 * hot-teal laser glow, then cools to the settled brand color, giving the
 * impression of a laser etching each stroke in real time.
 *
 * Font: Caveat 400 — thin handwriting strokes, non-calligraphic, reads as a
 * genuine personal signature rather than decorative script.
 *
 * Animation sequence (fires when 40% of the wrapper enters the viewport):
 *
 *   0ms    Separator rule scores left→right (180ms scaleX, ease-out)
 *   200ms  First character: flash bright white-hot → cool to brand teal (500ms)
 *   +110ms Each subsequent character follows with 110ms stagger
 *
 * Per-character keyframe (lsCharWrite, 500ms ease-out):
 *   0%   invisible at settled color
 *   18%  opaque, near-white-hot teal, teal text-shadow glow (laser active)
 *   100% opaque, brand teal (or near-white on brand bg), no glow (etched)
 *
 * The settled color adapts via --ls-settled-color custom property:
 *   default   → oklch(55% 0.18 195)  brand teal
 *   brand bg  → oklch(97% 0.005 195) near-white
 *
 * prefers-reduced-motion: data-static reveals all characters instantly.
 */

import { useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  name:      string
  color:     'none' | 'brand' | 'canvas' | 'surface'
  epiProps?: { 'data-epi-property-name'?: string }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LaserSignature({ name, color, epiProps }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    // Reduced-motion: reveal all characters statically, no laser effect
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.dataset.static = 'true'
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Remove first to reset mid-cycle; reflow forces browser to clear state
          delete wrap.dataset.active
          void wrap.offsetHeight
          wrap.dataset.active = 'true'
        } else {
          delete wrap.dataset.active
        }
      },
      { threshold: 0.4 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  const isBrand = color === 'brand'
  const chars = name.split('')

  return (
    <span
      ref={wrapRef}
      className={`ls-wrap${isBrand ? ' ls-wrap--brand' : ''}`}
      role="text"
      aria-label={name}
      {...epiProps}
    >
      {/* Separator rule: laser scores this line before signing begins */}
      <span className="ls-rule" aria-hidden="true" />

      {/* Signature: one span per character, each gets a staggered delay */}
      <span className="ls-sig" aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={i}
            className="ls-char"
            style={{ '--ls-char-delay': `${200 + i * 110}ms` } as React.CSSProperties}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </span>
  )
}
