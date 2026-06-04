'use client'

import { usePathname } from 'next/navigation'
import { CATEGORIES }  from './config'

export default function ShowcaseNav() {
  const pathname = usePathname()

  const activeCategory = CATEGORIES.find(c => pathname.startsWith(c.match)) ?? null
  const hasSubItems    = (activeCategory?.items.length ?? 0) > 0

  return (
    <nav
      aria-label="Showcase navigation"
      className="sticky top-16 z-20 bg-canvas/92 backdrop-blur-md"
    >

      {/* ── Tier 1: Category tabs ──────────────────────────────────────────── */}
      <div className="flex items-stretch overflow-x-auto overflow-y-hidden scrollbar-none border-b border-fg/10">

        {/* Identity mark */}
        <div className="hidden sm:flex items-center px-md shrink-0 border-r border-fg/10 select-none">
          <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-fg-muted/35">
            Showcase
          </span>
        </div>

        {/* Category tabs */}
        {CATEGORIES.map(cat => {
          const isActive = pathname.startsWith(cat.match)
          return (
            <a
              key={cat.slug}
              href={cat.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'shrink-0 px-md py-3.75',
                'text-label font-semibold tracking-label uppercase',
                'border-b-2 -mb-px transition-colors duration-150 ease-quick',
                isActive
                  ? 'border-brand text-fg'
                  : 'border-transparent text-fg-muted hover:text-fg hover:border-fg/20',
              ].join(' ')}
            >
              {cat.label}
            </a>
          )
        })}
      </div>

      {/* ── Tier 2: Sub-item chips ─────────────────────────────────────────── */}
      {hasSubItems && (
        <div className="flex items-center overflow-x-auto scrollbar-none gap-xs px-md py-2.25 border-b border-fg/8">
          {activeCategory!.items.map(item => {
            const itemHref   = `/showcase/${activeCategory!.slug}/${item.slug}`
            const isActive   = pathname.startsWith(itemHref)
            return (
              <a
                key={item.slug}
                href={itemHref}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'shrink-0 px-2.5 py-1.25',
                  'text-label font-semibold tracking-label uppercase whitespace-nowrap',
                  'transition-colors duration-150 ease-quick',
                  isActive
                    ? 'bg-brand text-fg-on-brand'
                    : 'text-fg-muted hover:text-fg',
                ].join(' ')}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      )}

    </nav>
  )
}
