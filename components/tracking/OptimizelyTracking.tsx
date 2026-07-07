'use client'

/**
 * Optimizely FX + ODP client-side tracking.
 *
 * Mounted once in the root layout (only when an ODP key and/or FX SDK key is
 * configured for the domain, and never in CMS preview/draft mode).
 *
 *   - Boots the browser FX client so the TRACK→ODP fan-out listener is armed
 *     before any user interaction (see lib/fx/browser-client.ts).
 *   - Fires an ODP `pageview` on initial load and on every client-side route
 *     change. Next.js has no `astro:after-swap`; we use usePathname() instead.
 *
 * The ODP stub (window.zaius) and the FX SDK key on window are injected as
 * blocking inline scripts in <head> by the layout, so both are available by the
 * time this component's effects run.
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initBrowserFxClient } from '@/lib/fx/browser-client'

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return match ? match[1] : ''
}

function trackOdpPageview(): void {
  if (typeof window === 'undefined' || !window.zaius?.event) return
  window.zaius.event('pageview')
  // Optimizely Content Intelligence id, when present, ties the pageview to the CI profile.
  const contentIntel = readCookie('_iv_') || readCookie('iv')
  if (contentIntel) {
    window.zaius.customer({ content_intelligence_id: contentIntel })
  }
}

export function OptimizelyTracking() {
  // Boot the FX client once on first mount.
  useEffect(() => {
    void initBrowserFxClient()
  }, [])

  // Fire a pageview on initial load and on every route change.
  const pathname = usePathname()
  useEffect(() => {
    trackOdpPageview()
  }, [pathname])

  return null
}
