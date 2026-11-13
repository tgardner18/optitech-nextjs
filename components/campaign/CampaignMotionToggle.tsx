'use client'

import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/**
 * Pause button for the looks that move without end (Neon flickers; Stage scrolls a marquee and follows the
 * pointer). WCAG 2.2.2: motion longer than five seconds needs a way to stop it. Pausing sets the page to the
 * existing "still" motion setting (data-motion), and data-paused hides the spotlight; playing restores the setting.
 */
export default function CampaignMotionToggle({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [paused, setPaused] = useState(false)

  const toggle = () => {
    const root = ref.current?.closest<HTMLElement>('.ot-campaign')
    if (root) {
      if (!paused) {
        root.dataset.motionWas = root.dataset.motion ?? 'full'
        root.dataset.motion = 'still'
        root.setAttribute('data-paused', '')
      } else {
        root.dataset.motion = root.dataset.motionWas ?? 'full'
        root.removeAttribute('data-paused')
      }
    }
    setPaused(p => !p)
  }

  return (
    <button ref={ref} type="button" data-part="motion-toggle" aria-pressed={paused} onClick={toggle}>
      {paused ? <Play aria-hidden fill="currentColor" strokeWidth={0} /> : <Pause aria-hidden fill="currentColor" strokeWidth={0} />}
      <span>{paused ? playLabel : pauseLabel}</span>
    </button>
  )
}
