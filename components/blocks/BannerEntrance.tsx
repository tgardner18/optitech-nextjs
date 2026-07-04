'use client'

/**
 * BannerEntrance
 *
 * Client wrapper that fires the banner's staggered entrance animation each
 * time the block scrolls into view (threshold 0.25). Setting data-active on
 * the wrapper triggers the CSS rules in globals.css (.banner-wrap[data-active]
 * .banner-eyebrow / heading / body / ctas).
 *
 * Re-fires on every re-entry: removing data-active resets all animated
 * children back to opacity 0, then a forced reflow ensures the browser
 * clears any in-progress animation before the attribute is re-added.
 *
 * LCP note: the wrapper is server-rendered with data-static="true" so banner
 * content is immediately visible (opacity 1) in the initial HTML — CSS would
 * otherwise hide it (opacity 0) until JS hydrates. For above-fold banners,
 * data-static is kept so LCP is not blocked by JavaScript execution.
 * Below-fold banners have data-static removed once JS runs; they animate in
 * when the user scrolls them into view.
 *
 * prefers-reduced-motion: data-static stays → all elements visible instantly.
 */

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type Props = {
  children:  React.ReactNode
  className?: string
}

export default function BannerEntrance({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced-motion: keep data-static (set by SSR) — content stays visible.
    if (prefersReducedMotion) return

    // Above-fold detection: if the banner top is already in the viewport on
    // initial load, keep data-static so content remains visible without animation.
    // LCP has already occurred; hiding then re-animating the heading would be jarring.
    const rect = el.getBoundingClientRect()
    const isAboveFold = rect.top < window.innerHeight

    if (isAboveFold) {
      // Keep data-static for the initial view. Set up the observer so that if
      // the user scrolls this banner out of view and back, it re-animates.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            // Scrolled away — remove static so re-entry can animate.
            delete el.dataset.static
            delete el.dataset.active
          } else if (!el.dataset.static) {
            // Re-entered after scrolling away — trigger animation.
            delete el.dataset.active
            void el.offsetHeight
            el.dataset.active = 'true'
          }
        },
        { threshold: 0.25 },
      )
      io.observe(el)
      return () => io.disconnect()
    }

    // Below fold: remove data-static so elements are hidden (opacity 0) until
    // they scroll into view and the entrance animation plays.
    delete el.dataset.static

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delete el.dataset.active
          void el.offsetHeight
          el.dataset.active = 'true'
        } else {
          delete el.dataset.active
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [prefersReducedMotion])

  // data-static is set server-side so the initial HTML shows content immediately.
  // CSS: .banner-wrap[data-static] .banner-heading { opacity: 1 } overrides the
  // default opacity-0 rule, preventing a flash of invisible content before hydration.
  return (
    <div ref={ref} data-static="true" className={cn('banner-wrap', className)}>
      {children}
    </div>
  )
}
