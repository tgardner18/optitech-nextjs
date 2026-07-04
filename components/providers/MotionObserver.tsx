'use client'
import { useEffect } from 'react'

export function MotionObserver() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: no-preference)')

    let stopObservers: (() => void) | null = null

    function start() {
      if (!mq.matches) return

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

      // ── Offscreen-pause observer ────────────────────────────────────────────
      // A SECOND observer for ambient, infinite, paint-bound animations (hero
      // breathe, liquid text sweep, marquee). Unlike `io` above it does NOT
      // unobserve — it toggles on every enter/exit so the animation pauses while
      // well offscreen and resumes on return. A generous rootMargin means it only
      // pauses once the host is well past the fold, never snapping at the edge.
      // Default state is running (no data-offscreen) until JS confirms offscreen,
      // so there is no hydration flash and behavior is unchanged when JS is absent.
      const pauseIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) entry.target.removeAttribute('data-offscreen')
            else                      entry.target.setAttribute('data-offscreen', '')
          }
        },
        { rootMargin: '200px 0px 200px 0px' }
      )

      const observePause = (el: Element) => pauseIo.observe(el)

      // Initial scan.
      document.querySelectorAll('[data-stagger]').forEach(observe)
      document.querySelectorAll('[data-pause-offscreen]').forEach(observePause)

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
            if (el.matches('[data-pause-offscreen]')) observePause(el)
            el.querySelectorAll?.('[data-pause-offscreen]').forEach(observePause)
          }
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })

      stopObservers = () => {
        io.disconnect()
        pauseIo.disconnect()
        mo.disconnect()
        // Remove motion-gating class so elements remain visible when motion is disabled.
        document.documentElement.classList.remove('motion-ready')
        document.querySelectorAll('[data-offscreen]').forEach(el => el.removeAttribute('data-offscreen'))
      }
    }

    start()

    // Re-evaluate live when the OS motion preference changes mid-session.
    const onMqChange = (e: MediaQueryListEvent) => {
      stopObservers?.()
      stopObservers = null
      if (e.matches) start()
    }

    mq.addEventListener('change', onMqChange)

    return () => {
      mq.removeEventListener('change', onMqChange)
      stopObservers?.()
    }
  }, [])

  return null
}
