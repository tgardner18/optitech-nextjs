'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ICON_REGISTRY, type IconKey } from '@/components/icons/iconRegistry'

export type NavSubItem = { label: string; href: string; description?: string; icon?: IconKey }
export type NavItem    = { label: string; href: string; children?: NavSubItem[] }

type Props = { navItems: NavItem[] }

export default function DesktopNav({ navItems }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)

  const close = useCallback(() => setOpenIndex(null), [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [close])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  return (
    <nav ref={navRef} className="hidden lg:flex items-center gap-lg" aria-label="Primary navigation">
      {navItems.map((item, i) => {
        const hasChildren = !!item.children?.length
        const isOpen      = openIndex === i

        if (!hasChildren) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative group py-xs text-sm font-medium text-fg-muted hover:text-fg transition-colors duration-150 ease-quick"
            >
              {item.label}
              {/* Kinetic underline — scales in from center on hover */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-px bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-center"
                style={{
                  transitionDuration: '220ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </Link>
          )
        }

        return (
          <div key={item.label} className="relative">
            {/* Trigger button */}
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`relative group flex items-center gap-xs py-xs text-sm font-medium transition-colors duration-150 ease-quick ${
                isOpen ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {item.label}
              <svg
                aria-hidden="true"
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                className={`shrink-0 transition-transform duration-200 ease-quick ${isOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Kinetic underline — stays extended while open */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-px bg-brand origin-center transition-transform"
                style={{
                  transform: isOpen ? 'scaleX(1)' : 'scaleX(0)',
                  transitionDuration: '220ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </button>

            {/* ── Feature dropdown panel ──────────────────────────────────────────
              *
              * A single flat `surface` panel — no angled clip-path, no two-zone
              * brand/canvas dissolve. Because it is built entirely on semantic
              * tokens (`bg-surface`, `text-fg`, `border-fg/*`), the whole panel
              * inverts automatically between dark and light mode via the
              * [data-theme] token blocks — the ground reads correctly on any
              * theme the ThemeManager configures.
              *
              * Depth comes from a chromatic brand-hued bloom shadow (never a grey
              * shadow), and a 1px brand→accent horizon along the top edge — the
              * same elevation vocabulary as the site footer.
              *
              * Always rendered; visibility controlled by opacity + translate +
              * `inert` (blocks focus and pointer events when closed).
              * ─────────────────────────────────────────────────────────────────── */}
            <div
              role="menu"
              aria-hidden={!isOpen}
              inert={!isOpen}
              className="absolute top-full left-0 z-50 w-[24rem] overflow-hidden rounded-ot-surface border-x border-b border-fg/10"
              style={{
                marginTop: '9px',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.985)',
                transformOrigin: 'top left',
                transition: isOpen
                  ? 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'opacity 100ms ease-in, transform 100ms ease-in',
                boxShadow:
                  '0 24px 56px -16px var(--ot-bloom-brand-faint), 0 6px 20px -8px var(--ot-bloom-brand-border)',
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              {/* 1px brand → accent gradient horizon — mirrors the footer's top bar */}
              <div
                aria-hidden="true"
                style={{
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, var(--ot-brand) 15%, var(--ot-accent) 85%, transparent)',
                }}
              />

              {/* Panel body — single flat surface, inset rows */}
              <div className="bg-surface p-sm">
                {item.children!.map((sub, j) => {
                  const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      role="menuitem"
                      onClick={close}
                      className="group/sub flex items-center gap-md rounded-ot-control px-sm py-sm hover:bg-fg/[0.05] transition-colors duration-150 ease-quick"
                      style={{
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0)' : 'translateY(4px)',
                        transition:
                          'opacity 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                        transitionDelay: isOpen ? `${60 + j * 45}ms` : '0ms',
                      }}
                    >
                      {/* Icon tile — faint brand fill at rest, fills brand on hover */}
                      {Icon && (
                        <span
                          aria-hidden="true"
                          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-ot-surface bg-brand/10 text-brand group-hover/sub:bg-brand group-hover/sub:text-fg-on-brand transition-colors duration-150 ease-quick"
                        >
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                      )}

                      {/* Title + description */}
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-fg">
                          {sub.label}
                        </span>
                        {sub.description && (
                          <span className="block text-label text-fg-muted mt-0.5 leading-snug">
                            {sub.description}
                          </span>
                        )}
                      </div>

                      {/* Trailing affordance — slides in on hover */}
                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                        strokeWidth={2}
                        className="ml-auto shrink-0 text-brand opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-150 ease-quick"
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
