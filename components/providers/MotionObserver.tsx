'use client'
import { useEffect } from 'react'

export function MotionObserver() {
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    let firstBatch = true

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '')
            io.unobserve(entry.target)
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

    const observe = (el: Element) => {
      // Skip elements already revealed (e.g. persisted across navigation).
      if (!el.hasAttribute('data-in')) io.observe(el)
    }

    // Initial scan.
    document.querySelectorAll('[data-stagger]').forEach(observe)

    // The root layout — and therefore this effect — never re-mounts on App Router
    // client-side navigation. Watch the DOM so [data-stagger] elements added by a
    // soft navigation (or streamed in later) get observed too. Without this they
    // never receive data-in and the .motion-ready CSS holds them at opacity: 0.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue
          const el = node as Element
          if (el.matches('[data-stagger]')) observe(el)
          el.querySelectorAll?.('[data-stagger]').forEach(observe)
        }
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
