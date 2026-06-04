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
 * prefers-reduced-motion: data-static reveals all elements instantly.
 */

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children:  React.ReactNode
  className?: string
}

export default function BannerEntrance({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.static = 'true'
      return
    }

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
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('banner-wrap', className)}>
      {children}
    </div>
  )
}
