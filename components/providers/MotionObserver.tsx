'use client'
import { useEffect } from 'react'

export function MotionObserver() {
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    let firstBatch = true

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '')
            obs.unobserve(entry.target)
          }
        }
        // After the first IO callback (which includes all initially-visible elements),
        // signal that the scroll system is ready. This gates the "off-screen = hidden"
        // CSS so visible elements aren't momentarily invisible before data-in is set.
        if (firstBatch) {
          firstBatch = false
          document.documentElement.classList.add('motion-ready')
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -80px 0px' }
    )

    document.querySelectorAll('[data-stagger]').forEach(el => obs.observe(el))

    return () => obs.disconnect()
  }, [])

  return null
}
