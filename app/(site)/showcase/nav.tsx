'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CATEGORIES }  from './config'

// ─── EdgeFadeScroller ─────────────────────────────────────────────────────────
// A horizontal scroll lane that signals overflow with a soft edge fade instead of
// a scrollbar. The fade appears only on a side that has hidden content, so the row
// visibly "continues" when there's more, and reads as complete at the true ends —
// the showcase nav grows as blocks are added, and this keeps it scannable.
// It also recenters the active item (the one carrying aria-current) on navigation,
// so the selected tab is never stranded off-screen.

const FADE = '2.5rem'

function EdgeFadeScroller({
  scrollKey,
  className,
  children,
  ...rest
}: {
  scrollKey: string
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({
      start: el.scrollLeft <= 1,
      end:   el.scrollLeft >= max - 1,
    })
  }, [])

  // Track scroll position + container/content resize to keep the fades accurate.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [update])

  // On navigation, bring the active item into view — but only if it's actually
  // clipped, so we never nudge an already-visible row for no reason.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const active = el.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) {
      const lane = el.getBoundingClientRect()
      const chip = active.getBoundingClientRect()
      const clipped = chip.left < lane.left || chip.right > lane.right
      if (clipped) {
        const delta = (chip.left + chip.width / 2) - (lane.left + lane.width / 2)
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' })
      }
    }
    update()
  }, [scrollKey, update])

  // Soft-clip the edges that have more content; opaque elsewhere. Both ends opaque
  // when nothing overflows, so a short row shows no fade at all.
  const mask =
    `linear-gradient(to right, transparent 0, #000 ${edges.start ? '0px' : FADE}, ` +
    `#000 calc(100% - ${edges.end ? '0px' : FADE}), transparent 100%)`

  return (
    <div
      ref={ref}
      className={['overflow-x-auto overflow-y-hidden scrollbar-none', className]
        .filter(Boolean)
        .join(' ')}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── ShowcaseNav ──────────────────────────────────────────────────────────────

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
      <EdgeFadeScroller
        scrollKey={pathname}
        className="flex items-stretch border-b border-fg/10"
      >
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
      </EdgeFadeScroller>

      {/* ── Tier 2: Sub-item chips ─────────────────────────────────────────── */}
      {hasSubItems && (
        <EdgeFadeScroller
          scrollKey={pathname}
          className="flex items-center gap-xs px-md py-2.25 border-b border-fg/8"
        >
          {activeCategory!.items.map(item => {
            const itemHref   = item.href ?? `/showcase/${activeCategory!.slug}/${item.slug}`
            // Hash links (in-page anchors) can't be matched against the pathname.
            const isActive   = !item.href && pathname.startsWith(itemHref)
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
                    : 'text-fg-muted hover:text-fg hover:bg-fg/5',
                ].join(' ')}
              >
                {item.label}
              </a>
            )
          })}
        </EdgeFadeScroller>
      )}

    </nav>
  )
}
