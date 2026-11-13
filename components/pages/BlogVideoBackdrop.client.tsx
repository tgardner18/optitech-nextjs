'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/**
 * The Atmospheric header's background video: muted and looped as before, but it never autoplays with
 * reduced motion, and it has a Pause button (WCAG 2.2.2).
 */
export default function BlogVideoBackdrop({ src, paEdit }: { src: string; paEdit?: Record<string, unknown> }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  function toggle() {
    const v = ref.current
    if (!v) return
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => {}) } else { v.pause(); setPlaying(false) }
  }

  return (
    <>
      <video ref={ref} data-part="backdrop" src={src} loop muted playsInline {...paEdit} />
      <button type="button" data-part="video-toggle" onClick={toggle} aria-pressed={!playing}>
        {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        <span>{playing ? 'Pause video' : 'Play video'}</span>
      </button>
    </>
  )
}
