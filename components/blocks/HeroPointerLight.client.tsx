'use client'

import { useEffect, useRef } from 'react'

/**
 * Spotlight pointer light. Renders nothing; it finds its hero section and writes the
 * --sp-* custom properties that hero.css reads, so the panel and photo bloom falls away
 * from the pointer like a light source. Without it (and on touch screens) the bloom simply
 * rests just below the panel. Skipped entirely when the visitor prefers reduced motion.
 */
export default function HeroPointerLight() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = marker.current?.closest<HTMLElement>('[data-block="hero"]')
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
    const set = (k: string, v: string) => el.style.setProperty(k, v)

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const panel = el.querySelector<HTMLElement>('[data-part="panel"]')
      if (!panel) return
      const r = el.getBoundingClientRect()
      const p = panel.getBoundingClientRect()
      const x = clamp((e.clientX - r.left) / r.width, 0, 1)
      const y = clamp((e.clientY - r.top) / r.height, 0, 1)
      el.setAttribute('data-pointer', '')
      set('--sp-dx', ((x - 0.5) * 2).toFixed(3))
      set('--sp-dy', ((y - 0.5) * 2).toFixed(3))
      set('--sp-x', `${(x * 100).toFixed(1)}%`)
      set('--sp-y', `${(y * 100).toFixed(1)}%`)
      set('--sp-px', `${clamp(((e.clientX - p.left) / p.width) * 100, -20, 120).toFixed(1)}%`)
      set('--sp-py', `${clamp(((e.clientY - p.top) / p.height) * 100, -20, 120).toFixed(1)}%`)
    }
    const leave = () => {
      el.removeAttribute('data-pointer')
      ;['--sp-dx', '--sp-dy', '--sp-x', '--sp-y', '--sp-px', '--sp-py'].forEach((k) => el.style.removeProperty(k))
    }

    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      leave()
    }
  }, [])

  return <span ref={marker} hidden aria-hidden="true" />
}
