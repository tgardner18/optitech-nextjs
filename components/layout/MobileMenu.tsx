'use client'

import { useState, useEffect, startTransition } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { LocaleSelectorMobile } from '@/components/layout/LocaleSelector'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import type { NavItem } from '@/components/layout/DesktopNav'
import { useTranslation } from '@/lib/i18n/useTranslation'

type Props = {
  navItems:        NavItem[]
  ctaLabel:        string
  ctaHref:         string
  enabledLocales?: string[]
}

export default function MobileMenu({ navItems, ctaLabel, ctaHref, enabledLocales }: Props) {
  const [open,        setOpen]        = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [mounted,     setMounted]     = useState(false)
  const { t } = useTranslation()

  useEffect(() => { startTransition(() => setMounted(true)) }, [])

  // Lock body scroll and handle ESC while menu is open
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setExpandedIdx(null) }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open])

  function close() { setOpen(false); setExpandedIdx(null) }

  function toggleExpanded(i: number) {
    setExpandedIdx(v => (v === i ? null : i))
  }

  return (
    <>
      {/* Hamburger trigger — stays inside header */}
      <button
        type="button"
        className="lg:hidden flex flex-col justify-center gap-1.5 p-sm"
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setExpandedIdx(null) }}
      >
        <span className={`block w-5 h-px bg-fg origin-center transition-transform duration-200 ease-quick ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`block w-5 h-px bg-fg transition-opacity duration-150 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-px bg-fg origin-center transition-transform duration-200 ease-quick ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>

      {/* Overlay via portal — renders at document.body, outside header stacking context */}
      {mounted && createPortal(
        <div
          aria-hidden={!open}
          className={`fixed inset-0 z-[200] bg-canvas flex flex-col overflow-y-auto transition-opacity duration-200 ease-quick ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Header row — close button mirrors hamburger position */}
          <div className="flex items-center justify-end px-sm h-20 shrink-0">
            <button
              type="button"
              aria-label={t('nav.closeMenu')}
              onClick={close}
              className="flex flex-col justify-center gap-1.5 p-sm text-fg hover:text-fg-muted transition-colors duration-150 ease-quick"
            >
              <span className="block w-5 h-px bg-current origin-center translate-y-1.75 rotate-45" />
              <span className="block w-5 h-px bg-current opacity-0" />
              <span className="block w-5 h-px bg-current origin-center -translate-y-1.75 -rotate-45" />
            </button>
          </div>

          <nav aria-label={t('nav.openMenu')} className="px-md">
            {navItems.map((item, i) => {
              const hasChildren = !!item.children?.length
              const isExpanded  = expandedIdx === i

              if (!hasChildren) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-title font-semibold text-fg py-md border-b border-fg/10 hover:text-fg-muted transition-colors duration-150 ease-quick"
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                )
              }

              return (
                <div key={item.label} className="border-b border-fg/10">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(i)}
                    className="w-full flex items-center justify-between text-title font-semibold text-fg py-md hover:text-fg-muted transition-colors duration-150 ease-quick"
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`shrink-0 transition-transform duration-200 ease-quick ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="pb-md flex flex-col gap-xs">
                      {item.children!.map(sub => {
                        const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={close}
                            className="group/sub flex items-center gap-sm rounded-ot-control px-sm py-sm hover:bg-fg/5 active:bg-fg/8 transition-colors duration-150 ease-quick"
                          >
                            {Icon && (
                              <span
                                aria-hidden="true"
                                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-ot-surface bg-brand/10 text-fg"
                              >
                                <Icon size={18} strokeWidth={1.75} />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block text-body font-medium text-fg">{sub.label}</span>
                              {sub.description && (
                                <span className="block text-label text-fg-muted mt-0.5 leading-snug">{sub.description}</span>
                              )}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Locale selector — below nav links, above CTA */}
            <LocaleSelectorMobile onSelect={close} enabledLocales={enabledLocales} />
          </nav>

          <div className="mt-lg px-md">
            <Button href={ctaHref} onClick={close}>{ctaLabel}</Button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
