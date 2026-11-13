'use client'

import { useEffect, useRef } from 'react'

/**
 * Renders nothing. It finds its Primary Text section and
 *  1. sets data-in once the section scrolls into view (text.css starts entrance motion from it), and
 *  2. for the Highlight effect, splits the headline into one span per rendered line so each line
 *     gets its own marker stroke, timed at pen speed.
 * Without it the effects still render, just without the entrance motion and with one band per line fragment.
 */
export default function PrimaryTextFx({ effect, headline, block = 'text' }: { effect: string; headline: string; block?: string }) {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = marker.current?.closest<HTMLElement>(`[data-block="${block}"]`)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      el.setAttribute('data-in', '')
      return
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() }
    }, { threshold: 0.2 })
    // Watch the marker's own container (the headline area), not the whole block: a Blog Page is far taller than the
    // viewport, so 20% of the article would never be visible.
    io.observe(marker.current?.parentElement ?? el)
    return () => io.disconnect()
  }, [block])

  useEffect(() => {
    if (effect !== 'highlight') return
    const el = marker.current?.closest<HTMLElement>(`[data-block="${block}"]`)
    const mark = el?.querySelector<HTMLElement>('[data-part="mark"]')
    if (!el || !mark) return

    const lineify = () => {
      const text = (mark.dataset.src ?? mark.textContent ?? '').replace(/\s+/g, ' ').trim()
      mark.dataset.src = text
      // Measure: one span per word, grouped by rendered line. Built with textContent (never innerHTML).
      mark.replaceChildren(...text.split(' ').flatMap((w, i, all) => {
        const s = document.createElement('span'); s.dataset.w = ''; s.textContent = w
        return i < all.length - 1 ? [s, document.createTextNode(' ')] : [s]
      }))
      const lines: string[][] = []
      let top: number | null = null
      mark.querySelectorAll<HTMLElement>('[data-w]').forEach((w) => {
        const t = Math.round(w.offsetTop)
        if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t }
        lines[lines.length - 1].push(w.textContent ?? '')
      })
      mark.replaceChildren(...lines.map((l) => {
        const line = document.createElement('span'); line.dataset.part = 'mark-line'
        const inner = document.createElement('span'); inner.dataset.part = 'mark-text'; inner.textContent = l.join(' ')
        line.appendChild(inner); return line
      }))
      let t = 0.2
      mark.querySelectorAll<HTMLElement>('[data-part="mark-line"]').forEach((line) => {
        const dur = Math.min(Math.max(line.offsetWidth / 950, 0.35), 1.1)
        line.style.setProperty('--dur', `${dur.toFixed(2)}s`)
        line.style.setProperty('--delay', `${t.toFixed(2)}s`)
        t += dur + 0.12
      })
    }

    lineify()
    let lastW = window.innerWidth
    const onResize = () => { if (Math.abs(window.innerWidth - lastW) > 20) { lastW = window.innerWidth; lineify() } }
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(lineify)
    return () => window.removeEventListener('resize', onResize)
  }, [effect, headline, block])

  return <span ref={marker} hidden aria-hidden="true" />
}
