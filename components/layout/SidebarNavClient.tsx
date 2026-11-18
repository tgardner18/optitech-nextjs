'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'

const STORAGE_KEY = 'ot-sidebar-open'

// Client shell for the sidebar nav. Wraps the server-rendered nav content
// in an animated aside and provides a toggle tab that rides the panel edge.
// Sets data-sidebar-open on <html> so CSS can adjust the content margin and
// the compact search panel position without JS round-trips.

export function SidebarNavShell({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  // Remember the last open/closed choice across refreshes. Preview (defaultOpen=false,
  // the CMS visual builder) keeps its own key so live-site prefs don't leak into it;
  // it still starts collapsed until the editor has opened it once.
  const storageKey = defaultOpen ? STORAGE_KEY : `${STORAGE_KEY}-preview`
  const hydrated = useRef(false)

  // Sync open state → HTML data attribute, and persist once the stored value has been read.
  useEffect(() => {
    document.documentElement.dataset.sidebarOpen = open ? 'true' : 'false'
    if (!hydrated.current) return
    try { localStorage.setItem(storageKey, String(open)) } catch {}
  }, [open, storageKey])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'true') setOpen(true)
      else if (stored === 'false') setOpen(false)
    } catch {}
    hydrated.current = true
  }, [storageKey])

  return (
    <>
      {/* The rail. A closed rail is inert, so Tab skips its links. Children are server-rendered nav content. */}
      <aside
        data-block="site-nav"
        data-style="sidebar"
        data-open={open}
        aria-label="Site navigation"
        inert={!open}
      >
        {children}
      </aside>

      {/* Toggle: a tab on the rail's edge when open; a labeled Menu button in the corner when collapsed. */}
      <button
        type="button"
        data-block="site-nav"
        data-part="rail-toggle"
        data-open={open}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={open ? 'Collapse sidebar' : 'Open menu'}
      >
        {open ? <ChevronLeft size={16} strokeWidth={2} aria-hidden /> : <Menu size={18} strokeWidth={2} aria-hidden />}
        <span data-part="rail-toggle-t">Menu</span>
      </button>
    </>
  )
}
