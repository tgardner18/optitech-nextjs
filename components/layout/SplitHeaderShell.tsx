'use client'

import { useState, useEffect } from 'react'

// Glass from the first scroll. (It used to wait for 80px, so headlines slid under bare links.)
const SCROLL_THRESHOLD = 8

/**
 * Owns the scroll-linked state for the split-bar masthead. At the very top the
 * bar is transparent, so the logo and links read directly against the hero; past
 * SCROLL_THRESHOLD it fades into glass (see data-scrolled in site-nav.css). Only
 * paint properties animate, never layout, so the page underneath never reflows.
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
    <header data-block="site-nav" data-style="split-bar" data-scrolled={scrolled}>
      {children}
    </header>
  )
}
