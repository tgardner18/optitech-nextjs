'use client'

import { usePathname } from 'next/navigation'
import { TYPE_TABS, getSectionsForPath } from './config'

/**
 * Mobile navigation strip — visible below lg breakpoint only.
 * Sticky below the site header (top-16). Two rows:
 *   1. Type tabs — navigate between Blocks / Pages / Tokens / Theme / Overview
 *   2. Section/component chips — visible when sections exist for the current route
 *
 * Both rows scroll horizontally. Uses JS scrollIntoView with offset for the
 * component row to account for the site header + this strip's own height.
 */
export default function ShowcaseMobileNav() {
  const pathname  = usePathname()
  const sections  = getSectionsForPath(pathname)

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    // Account for site header (64px) + mobile nav strip (~72px) + 8px gap
    const OFFSET = 152
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div className="lg:hidden sticky top-16 z-10 bg-surface/90 backdrop-blur-sm border-b border-fg/10">
      {/* ── Type tabs row ─────────────────────────────────── */}
      <div className="flex overflow-x-auto gap-xs px-md py-sm border-b border-fg/5 scrollbar-none">
        {TYPE_TABS.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.match)
          return (
            <a
              key={tab.href}
              href={tab.href}
              className={[
                'flex-shrink-0 px-sm py-xs rounded-sm',
                'text-label font-semibold tracking-label uppercase',
                'transition-colors duration-150 ease-quick',
                isActive
                  ? 'bg-brand text-fg-on-brand'
                  : 'text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              {tab.label}
            </a>
          )
        })}
      </div>

      {/* ── Component chips row (only when sections exist) ── */}
      {sections.length > 0 && (
        <div className="flex overflow-x-auto gap-xs px-md py-sm scrollbar-none">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="flex-shrink-0 px-sm py-xs text-label text-fg-muted hover:text-fg transition-colors duration-150 ease-quick whitespace-nowrap"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
