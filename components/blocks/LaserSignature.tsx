'use client'

/**
 * LaserSignature
 *
 * Renders the attribution name as a large cursive SVG signature that appears to
 * be cut into metal by a laser beam. The animation has three visual moments:
 *
 *   1. Separator rule scores left → right (150ms) — the laser positioning
 *   2. Beam draws the letterforms via stroke-dashoffset (1.6s kinetic ease)
 *      Simultaneously, a white-hot tip circle traverses the drawn width
 *   3. Beam glow fades; cooled etched line + ghost fill remain
 *
 * Layer stack (SVG, bottom → top):
 *   ls-bloom  — very wide stroke, high blur; the outer energy halo
 *   ls-glow   — medium stroke with chained drop-shadows; the beam itself
 *   ls-line   — 0.8px crisp stroke; the permanent incision
 *   ls-tip    — circle animated via Web Animations API; the white-hot cut point
 *
 * Font: Dancing Script 700 — connected script letterforms trace beautifully
 * with stroke-dashoffset (left-to-right glyph direction follows writing order).
 *
 * prefers-reduced-motion: data-static skips all animation; static etch shown.
 */

import { useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  name:      string
  color:     'none' | 'brand' | 'canvas' | 'surface'
  /** Optimizely edit-mode attrs forwarded from the parent pa() call */
  epiProps?: { 'data-epi-property-name'?: string }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LaserSignature({ name, color, epiProps }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const svgRef  = useRef<SVGSVGElement>(null)
  const lineRef = useRef<SVGTextElement>(null)
  const tipRef  = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const svg  = svgRef.current
    const line = lineRef.current
    const tip  = tipRef.current
    if (!wrap || !svg || !line || !tip) return

    // ── Reduced-motion: static reveal, no beam ────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.dataset.static = 'true'
      return
    }

    // ── Kinetic path: IO fires the sequence ───────────────────────────────
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()

        // Measure the text bounding box BEFORE activating CSS animations
        // (getBBox works on SVG text once the font is loaded)
        const bbox = line.getBBox()
        const tipY = bbox.y + bbox.height * 0.42  // cap-height region

        // Position tip at left edge of text, then animate it rightward
        tip.setAttribute('cx', String(bbox.x))
        tip.setAttribute('cy', String(tipY))
        tip.setAttribute('r', String(Math.max(3, bbox.height * 0.12)))

        tip.animate(
          [
            { transform: 'translateX(0px)',              opacity: '1' },
            { transform: `translateX(${bbox.width * 0.82}px)`, opacity: '1', offset: 0.82 },
            { transform: `translateX(${bbox.width}px)`,  opacity: '0' },
          ],
          {
            duration: 1600,
            delay: 150,           // matches the CSS animation-delay on ls-* layers
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }
        )

        // Trigger CSS animations for rule + stroke layers
        wrap.dataset.active = 'true'
      },
      { threshold: 0.4 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  const isBrand = color === 'brand'

  return (
    <span
      ref={wrapRef}
      className={`ls-wrap${isBrand ? ' ls-wrap--brand' : ''}`}
      role="text"
      aria-label={name}
      {...epiProps}
    >
      {/* Separator rule — scores left→right before the signature starts */}
      <span className="ls-rule" aria-hidden="true" />

      {/* Signature SVG — overflow:visible so the glow extends past bounds */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className={`ls-svg${isBrand ? ' ls-svg--brand' : ''}`}
        style={{ display: 'block', width: '100%', overflow: 'visible' }}
      >
        {/* Bloom — wide halo stroke, very blurred */}
        <text className="ls-bloom" x="0" y="1em">{name}</text>
        {/* Glow — the laser beam itself, chained drop-shadows */}
        <text className="ls-glow"  x="0" y="1em">{name}</text>
        {/* Etch — crisp 0.8px line that persists after the beam fades */}
        <text ref={lineRef} className="ls-line" x="0" y="1em">{name}</text>
        {/* Hot tip — positioned via JS; animates with Web Animations API */}
        <circle ref={tipRef} className="ls-tip" cx="-40" cy="-40" r="4" />
      </svg>
    </span>
  )
}
