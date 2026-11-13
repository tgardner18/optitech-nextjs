'use client'

import { useState, useEffect, useRef, useId, startTransition } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
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
  ctaLabel:        string
  ctaHref:         string
  enabledLocales?: string[]
  /** Which Navbar Style this menu belongs to: site-nav.css hides it at that style's desktop breakpoint. */
  navStyle?:       'top-bar' | 'split-bar' | 'sidebar'
}

/**
 * The menu button plus its full-screen sheet. While closed, the sheet is `inert`,
 * so Tab never lands on links nobody can see. While open it is a labeled modal
 * dialog: focus moves to the close button, the page behind goes inert, Escape
 * closes it, and focus returns to the menu button.
 */
export default function MobileMenu({ navItems, ctaLabel, ctaHref, enabledLocales, navStyle = 'top-bar' }: Props) {
  const [open,        setOpen]        = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [mounted,     setMounted]     = useState(false)
  const pathname  = usePathname()
  const { t }     = useTranslation()
  const baseId    = useId()
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef  = useRef<HTMLButtonElement>(null)
  const rootRef   = useRef<HTMLDivElement>(null)
  const wasOpen   = useRef(false)

  useEffect(() => { startTransition(() => setMounted(true)) }, [])

  // Lock body scroll and handle ESC while the menu is open
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

  // Dialog focus: in on open, back to the menu button on close. The rest of the page is inert while open.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) burgerRef.current?.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true
    const root = rootRef.current
    const blocked: HTMLElement[] = []
    Array.from(document.body.children).forEach(el => {
      if (el === root || !(el instanceof HTMLElement) || el.inert) return
      if (['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName)) return
      el.inert = true
      blocked.push(el)
    })
    closeRef.current?.focus()
    return () => { blocked.forEach(el => { el.inert = false }) }
  }, [open, mounted])

  function close() { setOpen(false); setExpandedIdx(null) }

  return (
    <>
      {/* Menu button: stays inside the header */}
      <button
        ref={burgerRef}
        type="button"
        data-part="burger"
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={open}
        aria-controls={`${baseId}-sheet`}
        onClick={() => { setOpen(v => !v); setExpandedIdx(null) }}
      >
        <span /><span /><span />
      </button>

      {/* Sheet via portal: renders at document.body, outside the header's stacking context */}
      {mounted && createPortal(
        <div ref={rootRef} data-block="site-nav">
          <div
            id={`${baseId}-sheet`}
            data-part="sheet"
            data-for={navStyle}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.openMenu')}
            data-open={open ? '' : undefined}
            inert={!open}
          >
            <div data-part="sheet-head">
              <span aria-hidden="true" />
              <button ref={closeRef} type="button" data-part="burger" data-open="" aria-label={t('nav.closeMenu')} onClick={close}>
                <span /><span /><span />
              </button>
            </div>

            <nav aria-label={t('nav.openMenu')} data-part="sheet-nav">
              {navItems.map((item, i) => {
                const children      = item.children ?? []
                const self          = matchHref(pathname, item.href)
                const childMatches  = children.map(c => matchHref(pathname, c.href))
                const sectionActive = self.section || childMatches.some(m => m.section)

                if (children.length === 0) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      data-part="sheet-link"
                      data-section={sectionActive ? '' : undefined}
                      aria-current={self.exact ? 'page' : undefined}
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  )
                }

                const isExpanded = expandedIdx === i
                const listId     = `${baseId}-g${i}`
                return (
                  <div key={item.label} data-part="sheet-group">
                    <button
                      type="button"
                      data-part="sheet-link"
                      data-section={sectionActive ? '' : undefined}
                      aria-expanded={isExpanded}
                      aria-controls={listId}
                      onClick={() => setExpandedIdx(v => (v === i ? null : i))}
                    >
                      {item.label}
                      <ChevronDown aria-hidden size={18} strokeWidth={1.75} />
                    </button>

                    {isExpanded && (
                      <ul id={listId}>
                        {children.map((sub, j) => {
                          const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
                          return (
                            <li key={sub.label}>
                              <Link
                                href={sub.href}
                                data-part="sheet-sub"
                                data-section={childMatches[j].section ? '' : undefined}
                                aria-current={childMatches[j].exact ? 'page' : undefined}
                                onClick={close}
                              >
                                <span data-part="sub-ic" aria-hidden="true">{Icon && <Icon size={18} strokeWidth={1.75} />}</span>
                                <span data-part="sub-t">
                                  <b>{sub.label}</b>
                                  {sub.description && <small>{sub.description}</small>}
                                </span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}

              {/* Locale selector: below the links, above the CTA */}
              <LocaleSelectorMobile onSelect={close} enabledLocales={enabledLocales} scoped />
            </nav>

            {ctaLabel && (
              <div data-part="sheet-cta">
                <Button href={ctaHref} onClick={close} className="w-full justify-center">{ctaLabel}</Button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
