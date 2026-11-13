'use client'

import { useEffect, useRef } from 'react'

/**
 * Renders nothing. Sets data-in on its enclosing block the first time it scrolls into view
 * (or at once for reduced motion), which the block's stylesheet uses to start its entrance.
 * Without it the content is simply shown, with no entrance motion.
 */
export default function EntranceTrigger({ block }: { block: string }) {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = marker.current?.closest<HTMLElement>(`[data-block="${block}"]`)
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      el.setAttribute('data-in', '')
      return
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [block])

  return <span ref={marker} hidden aria-hidden="true" />
}
