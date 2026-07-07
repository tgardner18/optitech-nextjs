'use client'

import {
  useCallback, useEffect, useRef, useState,
  forwardRef, type HTMLAttributes,
} from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { CATEGORIES } from './config'

// ─── EdgeFadeScroller ─────────────────────────────────────────────────────────
// A horizontal scroll lane that signals overflow with a soft edge fade.
// forwardRef lets ShowcaseNav call .scrollBy() for the chevron buttons.

const FADE = '2.5rem'

type EdgeScrollerProps = {
  scrollKey: string
  className?: string
  children: React.ReactNode
} & HTMLAttributes<HTMLDivElement>

const EdgeFadeScroller = forwardRef<HTMLDivElement, EdgeScrollerProps>(
  function EdgeFadeScroller({ scrollKey, className, children, ...rest }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement>(null)
    const [edges, setEdges] = useState({ start: true, end: true })

    // Merge the internal ref with the forwarded ref so both stay in sync.
    const mergeRef = useCallback((node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    }, [forwardedRef])

    const update = useCallback(() => {
      const el = innerRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 })
    }, [])

    useEffect(() => {
      const el = innerRef.current
      if (!el) return
      update()
      el.addEventListener('scroll', update, { passive: true })
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => { el.removeEventListener('scroll', update); ro.disconnect() }
    }, [update])

    // Re-center the active chip on navigation.
    useEffect(() => {
      const el = innerRef.current
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

    const mask =
      `linear-gradient(to right, transparent 0, #000 ${edges.start ? '0px' : FADE}, ` +
      `#000 calc(100% - ${edges.end ? '0px' : FADE}), transparent 100%)`

    return (
      <div
        ref={mergeRef}
        className={['overflow-x-auto overflow-y-hidden scrollbar-none', className]
          .filter(Boolean).join(' ')}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

// ─── ShowcaseNav ──────────────────────────────────────────────────────────────

export default function ShowcaseNav() {
  const pathname  = usePathname()
  const [query, setQuery] = useState('')
  const tier2Ref  = useRef<HTMLDivElement>(null)

  // Track tier-2 overflow so chevrons only appear when there's content to reach.
  const [tier2Edges, setTier2Edges] = useState({ start: true, end: true })

  const activeCategory = CATEGORIES.find(c => pathname.startsWith(c.match)) ?? null
  const allItems       = activeCategory?.items ?? []
  const hasSubItems    = allItems.length > 0

  // Filter within the active category. Empty query → show all.
  const q = query.trim().toLowerCase()
  const filteredItems = q
    ? allItems.filter(item => item.label.toLowerCase().includes(q))
    : allItems

  // Clear search when the user switches categories.
  useEffect(() => { setQuery('') }, [activeCategory?.slug])

  // Track tier-2 scroll position to drive chevron visibility.
  const updateTier2Edges = useCallback(() => {
    const el = tier2Ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setTier2Edges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 })
  }, [])

  useEffect(() => {
    const el = tier2Ref.current
    if (!el) return
    updateTier2Edges()
    el.addEventListener('scroll', updateTier2Edges, { passive: true })
    const ro = new ResizeObserver(updateTier2Edges)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateTier2Edges); ro.disconnect() }
  }, [updateTier2Edges, hasSubItems])

  // Re-check edges when the filtered list changes length (overflow may shift).
  useEffect(() => { updateTier2Edges() }, [filteredItems.length, updateTier2Edges])

  function scrollTier2(dir: 1 | -1) {
    const el = tier2Ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * 200, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <nav aria-label="Showcase navigation" className="sticky top-16 z-20 bg-canvas/92 backdrop-blur-md">

      {/* ── Tier 1: Category tabs ──────────────────────────────────────────── */}
      <EdgeFadeScroller
        scrollKey={pathname}
        className="flex items-stretch border-b border-fg/10"
      >
        <div className="hidden sm:flex items-center px-md shrink-0 border-r border-fg/10 select-none">
          <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-fg-muted/35">
            Showcase
          </span>
        </div>

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

      {/* ── Filter + Tier 2 ───────────────────────────────────────────────── */}
      {hasSubItems && (
        <>
          {/* Search/filter row — sits between category tabs and item chips */}
          <div className="flex items-center gap-sm px-md py-1.5 border-b border-fg/8">
            <Search size={12} className="text-fg-muted/35 shrink-0" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Filter ${allItems.length} ${activeCategory?.label.toLowerCase() ?? 'items'}…`}
              aria-label="Filter showcase items"
              className="flex-1 min-w-0 bg-transparent text-label text-fg placeholder:text-fg-muted/30 outline-none"
            />
            {query && (
              <>
                <span className="text-label tabular-nums text-fg-muted/35 shrink-0">
                  {filteredItems.length}/{allItems.length}
                </span>
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear filter"
                  className="text-fg-muted/40 hover:text-fg-muted transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>

          {/* Item chip row with desktop scroll chevrons */}
          <div className="relative flex items-stretch border-b border-fg/8">

            {/* Left chevron — desktop only, fades when at the start */}
            <button
              onClick={() => scrollTier2(-1)}
              aria-hidden
              tabIndex={-1}
              className={[
                'hidden md:flex items-center justify-center shrink-0',
                'w-7 border-r border-fg/8 bg-canvas/92',
                'text-fg-muted hover:text-fg transition-colors duration-100 ease-quick',
                tier2Edges.start ? 'opacity-20 pointer-events-none' : 'opacity-100',
              ].join(' ')}
            >
              <ChevronLeft size={13} />
            </button>

            <EdgeFadeScroller
              ref={tier2Ref}
              scrollKey={pathname + '|' + q}
              className="flex-1 flex items-center gap-xs px-md py-2.25"
              style={{ scrollSnapType: 'x proximity' } as React.CSSProperties}
            >
              {filteredItems.length === 0 ? (
                <span className="text-label italic text-fg-muted/35 select-none py-0.5">
                  No matches
                </span>
              ) : (
                filteredItems.map(item => {
                  const itemHref = item.href ?? `/showcase/${activeCategory!.slug}/${item.slug}`
                  const isActive = !item.href && pathname.startsWith(itemHref)
                  return (
                    <a
                      key={item.slug}
                      href={itemHref}
                      aria-current={isActive ? 'page' : undefined}
                      style={{ scrollSnapAlign: 'start' } as React.CSSProperties}
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
                })
              )}
            </EdgeFadeScroller>

            {/* Right chevron — desktop only, fades when at the end */}
            <button
              onClick={() => scrollTier2(1)}
              aria-hidden
              tabIndex={-1}
              className={[
                'hidden md:flex items-center justify-center shrink-0',
                'w-7 border-l border-fg/8 bg-canvas/92',
                'text-fg-muted hover:text-fg transition-colors duration-100 ease-quick',
                tier2Edges.end ? 'opacity-20 pointer-events-none' : 'opacity-100',
              ].join(' ')}
            >
              <ChevronRight size={13} />
            </button>

          </div>
        </>
      )}

    </nav>
  )
}
