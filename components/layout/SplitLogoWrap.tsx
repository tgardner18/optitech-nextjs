'use client'

import { useState, useEffect } from 'react'

const SCROLL_THRESHOLD = 80

/**
 * Wraps the split-bar logo anchor in a glass pill once the user scrolls past
 * the hero. At rest (scroll ≤ threshold) the logo floats freely against the
 * hero — no backing surface. After scrolling, a glass pill matching the nav
 * pill appears so the logo stays legible on any page background.
 */
export function SplitLogoWrap({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    // Sync on mount in case the page is loaded already scrolled
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="flex items-center rounded-full border transition-[background,border-color,box-shadow,padding] duration-300 ease-out"
      style={scrolled ? {
        borderColor:          'oklch(from var(--ot-fg) l c h / 0.15)',
        background:           'color-mix(in oklch, var(--ot-surface) 92%, transparent)',
        backdropFilter:       'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow:            '0 2px 20px var(--ot-bloom-brand-faint), 0 1px 4px oklch(0 0 0 / 0.08)',
        paddingLeft:          '0.75rem',
        paddingRight:         '0.75rem',
        paddingTop:           '0.375rem',
        paddingBottom:        '0.375rem',
      } : {
        borderColor:  'transparent',
        background:   'transparent',
        paddingLeft:  '0',
        paddingRight: '0',
        paddingTop:   '0',
        paddingBottom:'0',
      }}
    >
      {children}
    </div>
  )
}
