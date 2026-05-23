'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { TYPE_TABS, getSectionsForPath, type NavSection } from './config'

export default function ShowcaseNav() {
  const pathname = usePathname()
  const sections = getSectionsForPath(pathname)
  const [activeId, setActiveId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // ── IntersectionObserver: track which section is top-most in viewport ──────
  useEffect(() => {
    if (sections.length === 0) {
      setActiveId(null)
      return
    }

    // Wait one tick for the page DOM to be ready after navigation
    const timer = setTimeout(() => {
      const els = sections
        .map(s => document.getElementById(s.id))
        .filter(Boolean) as HTMLElement[]

      if (els.length === 0) return

      const io = new IntersectionObserver(
        entries => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (visible.length > 0) {
            setActiveId(visible[0].target.id)
          }
        },
        // rootMargin: push the bottom of the detection window 55% up —
        // the section has to clear the fold to become "active".
        { rootMargin: '0px 0px -55% 0px', threshold: 0.01 },
      )

      els.forEach(el => io.observe(el))
      return () => io.disconnect()
    }, 80)

    return () => clearTimeout(timer)
  }, [pathname, sections])

  // ── Auto-scroll sidebar item into view when active changes ────────────────
  useEffect(() => {
    if (!activeId || !listRef.current) return
    const btn = listRef.current.querySelector(`[data-section-id="${activeId}"]`) as HTMLElement
    btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId])

  // ── Smooth scroll with offset for sticky site header ─────────────────────
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const OFFSET = 80 // 64px site header + 16px breathing room
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  const sectionLabel = pathname.startsWith('/showcase/blocks')
    ? 'Components'
    : pathname.startsWith('/showcase/tokens')
      ? 'Sections'
      : null

  return (
    <nav
      aria-label="Showcase navigation"
      className="flex flex-col h-full overflow-hidden"
    >
      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <div className="px-md pt-lg pb-sm flex-shrink-0">
        <p className="text-[0.65rem] tracking-widest uppercase text-fg-muted/50 font-semibold mb-0.75">
          Internal · Design System
        </p>
        <p className="font-syne font-bold text-title leading-title tracking-title text-fg">
          Showcase
        </p>
      </div>

      {/* ── Type tabs ────────────────────────────────────────────────────── */}
      <div className="px-md pt-sm pb-md shrink-0 border-b border-fg/8">
        <p className="text-[0.6rem] tracking-widest uppercase text-fg-muted/40 font-semibold mb-sm">
          View
        </p>
        <ul className="flex flex-col gap-0.5">
          {TYPE_TABS.map(tab => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.match)
            return (
              <li key={tab.href}>
                <a
                  href={tab.href}
                  className={[
                    'flex items-center gap-sm pl-sm py-1.25 rounded-sm',
                    'text-label font-semibold tracking-label uppercase',
                    'border-l-2 transition-colors duration-150 ease-quick',
                    isActive
                      ? 'text-brand border-brand bg-brand/4'
                      : 'text-fg-muted border-transparent hover:text-fg hover:border-fg/20 hover:bg-fg/2.5',
                  ].join(' ')}
                >
                  {tab.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Component / section list ──────────────────────────────────────── */}
      {sections.length > 0 && (
        <div className="flex-1 overflow-y-auto py-md px-md min-h-0">
          {sectionLabel && (
            <p className="text-[0.6rem] tracking-widest uppercase text-fg-muted/40 font-semibold mb-sm px-sm">
              {sectionLabel}
            </p>
          )}
          <ul ref={listRef} className="flex flex-col gap-0.5">
            {sections.map(s => {
              const isActive = activeId === s.id
              return (
                <li key={s.id}>
                  <button
                    data-section-id={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={[
                      'w-full text-left flex items-center gap-sm pl-sm pr-xs py-1.25 text-sm',
                      'rounded-sm transition-colors duration-150 ease-quick',
                      isActive
                        ? 'text-fg bg-fg/6 font-medium'
                        : 'text-fg-muted hover:text-fg hover:bg-fg/3',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-1.25 h-1.25 rounded-full shrink-0',
                        'transition-all duration-200',
                        isActive ? 'bg-brand scale-100' : 'bg-fg/15 scale-75',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    {s.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}
