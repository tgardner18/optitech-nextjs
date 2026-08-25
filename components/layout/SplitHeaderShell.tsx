'use client'

import { useState, useEffect } from 'react'

const SCROLL_THRESHOLD = 80

/**
 * Owns the scroll-linked state for the split-bar masthead. At rest the header
 * is fully transparent — logo and nav read directly against the hero. Past
 * SCROLL_THRESHOLD it crossfades into a glass surface (see `.split-shell` in
 * globals.css) — a single choreographed material change on the whole bar,
 * not a per-element pill trick. Only paint properties (background-color,
 * box-shadow, backdrop-filter, opacity) and the logo's `transform: scale()`
 * animate — never layout properties — so the transition never reflows the
 * page underneath the sticky header.
 */
export function SplitHeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    // Sync on mount in case the page is loaded already scrolled
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-nav="split-bar"
      data-scrolled={scrolled}
      className="split-shell sticky top-0 z-50
                 bg-canvas/80 backdrop-blur-md border-b border-fg/5
                 lg:bg-transparent lg:border-none lg:backdrop-blur-none"
    >
      {children}
    </header>
  )
}
