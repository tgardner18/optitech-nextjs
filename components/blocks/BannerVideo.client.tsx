'use client'

/**
 * BannerVideo
 *
 * Background <video> plus a pause button (WCAG 2.2.2: moving content that lasts more than
 * five seconds needs a way to stop it). Playback is driven imperatively so a reduced-motion
 * visitor never sees it start; it stays on the poster or first frame, and the button
 * can still start it. The button sits beside the media, not inside it, because the media
 * layer is hidden from assistive tech.
 */

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type Props = {
  src:     string
  poster?: string
}

export default function BannerVideo({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  // null = follow the visitor's motion preference until they press the button
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reduced

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (paused) { v.pause(); return }
    v.play().catch(() => { /* autoplay can be rejected; the poster stays as a static fallback */ })
  }, [paused])

  return (
    <>
      <div data-part="media" aria-hidden="true">
        <video ref={videoRef} src={src} poster={poster} muted loop playsInline preload="auto" aria-hidden="true" />
      </div>
      <button
        type="button"
        data-part="pause"
        aria-pressed={paused}
        aria-label={paused ? 'Play background video' : 'Pause background video'}
        onClick={() => setUserPaused(!paused)}
      >
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </button>
    </>
  )
}
