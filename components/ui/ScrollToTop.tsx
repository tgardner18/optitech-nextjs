'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const SHOW_THRESHOLD = 400

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY >= SHOW_THRESHOLD)
    // Check immediately in case the page loads already scrolled
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    // prefers-reduced-motion users get instant jump
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      data-visible={visible}
      className={[
        // Position + size
        'fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50',
        'w-11 h-11',
        // Shape
        'rounded-full',
        // Presence: visibility driven by data-visible via CSS
        'scroll-top-btn',
      ].join(' ')}
    >
      {/* ── Comet arc ring ────────────────────────────────────────────────────
        * A conic-gradient div sits inset by -3px (outside the button bounds),
        * creating an arc that appears as a ring around the button face.
        * It rotates continuously — the comet tail effect comes from the gradient
        * fading from accent → transparent over ~70° of the circle.
        * motion-safe: ensures the orbit only runs when the user allows motion. */}
      <span
        aria-hidden="true"
        className="absolute inset-[-3px] rounded-full motion-safe:animate-scroll-top-orbit"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, transparent 25%, oklch(from var(--ot-accent) l c h / 0.55) 60%, var(--ot-accent) 72%, transparent 100%)',
        }}
      />

      {/* ── Button face — sits above the arc ─────────────────────────────── */}
      <span
        className={[
          'absolute inset-0 rounded-full z-10',
          'flex items-center justify-center',
          // Dark glass surface with brand bloom shadow
          'bg-canvas border border-fg/10',
          'shadow-[0_4px_24px_var(--ot-bloom-brand-faint)]',
          // Hover: deeper shadow + arc acceleration handled via CSS
          'transition-shadow duration-200 ease-quick',
          'hover:shadow-[0_6px_32px_var(--ot-bloom-brand-faint),0_0_0_1px_oklch(from_var(--ot-accent)_l_c_h_/_0.25)]',
        ].join(' ')}
      >
        <ArrowUp
          size={16}
          strokeWidth={2.25}
          className="text-fg transition-transform duration-200 ease-quick group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </button>
  )
}
