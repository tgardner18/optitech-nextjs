'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

export type NavSubItem = { label: string; href: string; description?: string }
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
              * Background system (three stacked absolute layers, same vocabulary
              * as the site footer):
              *
              * z-0  brand-hover fills the full panel — the right-zone base color
              * z-1  canvas panel masked with a soft gradient dissolve to the right,
              *      matching the footer's mist-blend technique
              * z-2  top-edge elevation glow on the brand-hover side — makes the
              *      right zone feel raised above the canvas zone
              *
              * Always rendered; visibility controlled by opacity + translate +
              * `inert` (blocks focus and pointer events when closed).
              * ─────────────────────────────────────────────────────────────────── */}
            <div
              role="menu"
              aria-hidden={!isOpen}
              inert={!isOpen}
              className="absolute top-full left-0 z-50 w-130 overflow-hidden"
              style={{
                marginTop: '9px',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.985)',
                transformOrigin: 'top left',
                transition: isOpen
                  ? 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'opacity 100ms ease-in, transform 100ms ease-in',
                boxShadow: '0 20px 56px oklch(from var(--ot-brand) calc(l - 0.18) calc(c * 0.45) h / 0.38), 0 4px 16px oklch(4% 0.005 195 / 0.50)',
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

              {/* Panel body — layered backgrounds */}
              <div className="relative overflow-hidden">

                {/* z-0: brand-hover base, full width */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ zIndex: 0, background: 'var(--ot-brand-hover)' }}
                />

                {/* z-1: canvas zone, soft dissolve to the right via CSS mask */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    zIndex: 1,
                    background: 'var(--ot-canvas)',
                    WebkitMaskImage:
                      'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.82) 56%, rgba(0,0,0,0.46) 62%, rgba(0,0,0,0.14) 68%, transparent 73%)',
                    maskImage:
                      'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.82) 56%, rgba(0,0,0,0.46) 62%, rgba(0,0,0,0.14) 68%, transparent 73%)',
                  }}
                />

                {/* z-2: top-edge elevation glow on the brand-hover side */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    zIndex: 2,
                    background:
                      'linear-gradient(to bottom, oklch(from var(--ot-brand-hover) calc(l + 0.10) c h / 0.42) 0%, transparent 55%)',
                    clipPath: 'polygon(53% 0, 100% 0, 100% 100%, calc(53% - 3.5rem) 100%)',
                  }}
                />

                {/* z-10: sub-link rows */}
                <div className="relative py-xs" style={{ zIndex: 10 }}>
                  {item.children!.map(sub => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      role="menuitem"
                      onClick={close}
                      className="group/sub flex items-start gap-md px-md py-sm hover:bg-brand/8 transition-colors duration-100 ease-quick"
                    >
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-fg group-hover/sub:text-brand transition-colors duration-100">
                          {sub.label}
                        </span>
                        {sub.description && (
                          <span className="block text-label text-fg-muted mt-0.75 leading-snug max-w-[38ch]">
                            {sub.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
