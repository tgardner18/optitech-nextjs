'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'

const STORAGE_KEY = 'ot-sidebar-open'

// Client shell for the sidebar nav. Wraps the server-rendered nav content
// in an animated aside and provides a toggle tab that rides the panel edge.
// Sets data-sidebar-open on <html> so CSS can adjust the content margin and
// the compact search panel position without JS round-trips.

export function SidebarNavShell({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  // On the live site: hydrate from localStorage so the user's last preference
  // is restored. In preview (defaultOpen=false) skip this — we always start
  // collapsed and don't want stored live-site prefs leaking into the VB view.
  useEffect(() => {
    if (!defaultOpen) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'false') setOpen(false)
    } catch {}
  }, [defaultOpen])

  // Sync open state → HTML data attribute + localStorage (live site only).
  useEffect(() => {
    document.documentElement.dataset.sidebarOpen = open ? 'true' : 'false'
    if (defaultOpen) {
      try { localStorage.setItem(STORAGE_KEY, String(open)) } catch {}
    }
  }, [open, defaultOpen])

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
