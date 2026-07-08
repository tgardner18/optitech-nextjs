'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'

const STORAGE_KEY = 'ot-sidebar-open'

// Client shell for the sidebar nav. Wraps the server-rendered nav content
// in an animated aside and provides a toggle tab that rides the panel edge.
// Sets data-sidebar-open on <html> so CSS can adjust the content margin and
// the compact search panel position without JS round-trips.

export function SidebarNavShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  // Hydrate from localStorage on mount (server always renders open).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'false') setOpen(false)
    } catch {}
  }, [])

  // Sync open state → HTML data attribute + localStorage.
  useEffect(() => {
    document.documentElement.dataset.sidebarOpen = open ? 'true' : 'false'
    try { localStorage.setItem(STORAGE_KEY, String(open)) } catch {}
  }, [open])

  return (
    <>
      {/* Animated sidebar — children are server-rendered nav content */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 border-r border-fg/8"
        style={{
          width:      'var(--ot-sidebar-width, 240px)',
          background: 'var(--ot-surface)',
          boxShadow:  '4px 0 32px var(--ot-bloom-brand-faint)',
          transform:  open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-label="Site navigation"
        aria-hidden={!open || undefined}
      >
        {children}
      </aside>

      {/* Toggle tab — rides the right edge of the sidebar, always accessible */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className={[
          'fixed top-6 z-[51] hidden lg:inline-flex items-center justify-center',
          'w-5 h-5 rounded-full',
          'bg-surface border border-fg/15',
          'text-fg-muted/60 hover:text-fg hover:border-fg/30',
          'shadow-[0_1px_4px_oklch(0%_0_0_/_0.12)]',
          'motion-safe:transition-[left,transform]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        ].join(' ')}
        style={{
          left:       open ? 'calc(var(--ot-sidebar-width, 240px) - 10px)' : '8px',
          transition: 'left 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <ChevronLeft
          size={11}
          strokeWidth={2.5}
          style={{
            transform:  open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </button>
    </>
  )
}
