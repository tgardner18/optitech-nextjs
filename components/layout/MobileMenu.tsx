'use client'

import { useState, useEffect, startTransition } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import MemberAuth from '@/components/auth/MemberAuth'
import { usePathname } from 'next/navigation'
import { LocaleSelectorMobile } from '@/components/layout/LocaleSelector'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import type { NavItem } from '@/components/layout/DesktopNav'
import { useTranslation } from '@/lib/i18n/useTranslation'

function matchHref(pathname: string, href: string) {
  if (!href || href === '#') return { exact: false, section: false }
  let path = href
  if (href.startsWith('http')) {
    try { path = new URL(href).pathname } catch { return { exact: false, section: false } }
  }
  const normPath     = path     === '/' ? path     : path.replace(/\/$/, '')
  const normPathname = pathname === '/' ? pathname : pathname.replace(/\/$/, '')
  const exact   = normPathname === normPath
  const section = exact || (normPath !== '/' && normPathname.startsWith(`${normPath}/`))
  return { exact, section }
}

type Props = {
  navItems:        NavItem[]
  ctaLabel?:       string
  ctaHref?:        string
  enabledLocales?: string[]
}

export default function MobileMenu({ navItems, enabledLocales }: Props) {
  const [open,        setOpen]        = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [mounted,     setMounted]     = useState(false)
  const pathname = usePathname()
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
              const hasChildren   = !!item.children?.length
              const isExpanded    = expandedIdx === i
              const self          = matchHref(pathname, item.href)
              const childMatches  = hasChildren ? item.children!.map(c => matchHref(pathname, c.href)) : []
              const childActive   = childMatches.some(m => m.section)
              const sectionActive = self.section || childActive

              if (!hasChildren) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={self.exact ? 'page' : undefined}
                    className={[
                      'flex items-center justify-between py-md border-b border-fg/10 text-title font-semibold transition-colors duration-150 ease-quick',
                      sectionActive ? 'text-fg' : 'text-fg hover:text-fg-muted',
                    ].join(' ')}
                    onClick={close}
                  >
                    <span className={[
                      'inline-flex items-center gap-sm',
                      sectionActive ? 'px-sm py-0.5 rounded-ot-control bg-brand/10' : '',
                    ].join(' ')}>
                      {sectionActive && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                      {item.label}
                    </span>
                  </Link>
                )
              }

              return (
                <div key={item.label} className="border-b border-fg/10">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(i)}
                    className={[
                      'w-full flex items-center justify-between text-title font-semibold py-md transition-colors duration-150 ease-quick',
                      sectionActive ? 'text-fg' : 'text-fg hover:text-fg-muted',
                    ].join(' ')}
                  >
                    <span className={[
                      'inline-flex items-center gap-sm',
                      sectionActive ? 'px-sm py-0.5 rounded-ot-control bg-brand/10' : '',
                    ].join(' ')}>
                      {sectionActive && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                      {item.label}
                    </span>
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
                      {item.children!.map((sub, j) => {
                        const Icon      = sub.icon ? ICON_REGISTRY[sub.icon] : null
                        const subActive = childMatches[j]?.section ?? false
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            aria-current={childMatches[j]?.exact ? 'page' : undefined}
                            onClick={close}
                            className={[
                              'group/sub flex items-center gap-sm rounded-ot-control px-sm py-sm transition-colors duration-150 ease-quick',
                              subActive ? 'bg-brand/10' : 'hover:bg-fg/5 active:bg-fg/8',
                            ].join(' ')}
                          >
                            {Icon && (
                              <span
                                aria-hidden="true"
                                className={[
                                  'flex items-center justify-center w-10 h-10 shrink-0 rounded-ot-surface transition-colors duration-150 ease-quick',
                                  subActive ? 'bg-brand text-fg-on-brand' : 'bg-brand/10 text-fg',
                                ].join(' ')}
                              >
                                <Icon size={18} strokeWidth={1.75} />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className={['block text-body', subActive ? 'font-semibold text-fg' : 'font-medium text-fg'].join(' ')}>{sub.label}</span>
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
            <MemberAuth mobile onMenuClose={close} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
