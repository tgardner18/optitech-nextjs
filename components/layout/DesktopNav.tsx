'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ICON_REGISTRY, type IconKey } from '@/components/icons/iconRegistry'

export type NavSubItem = { label: string; href: string; description?: string; icon?: IconKey }
export type NavItem    = { label: string; href: string; children?: NavSubItem[] }

type Props = {
  navItems: NavItem[]
  /** Override the landmark label. Needed when a caller renders two DesktopNav
   * instances side by side (the split-bar masthead splits one item list into
   * a left and right wing) so screen reader users get two distinct landmarks
   * instead of two identically-labeled ones. */
  ariaLabel?: string
  /** Split Bar only: which wing this list sits in. site-nav.css uses it to lay the wings out. */
  wing?: 'left' | 'right'
  /** The last dropdown opens toward the left so it never leaves the screen. Off for a left wing. */
  alignLastEnd?: boolean
}

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

/**
 * Primary links for the Top Bar and Split Bar. Presentation lives in
 * components/layout/site-nav.css, keyed on the data attributes below.
 *
 * A dropdown is a disclosure (a button that shows a list of links), not an
 * application menu: aria-expanded + aria-controls on the trigger, plain links in
 * the panel. Escape closes it and returns focus to the trigger; so does moving
 * focus out of the group or clicking elsewhere. A closed panel is `inert`, so Tab
 * never lands on a link that cannot be seen.
 */
export default function DesktopNav({ navItems, ariaLabel = 'Primary navigation', wing, alignLastEnd = true }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const pathname = usePathname()
  const navRef   = useRef<HTMLElement>(null)
  const baseId   = useId()

  const close = useCallback(() => setOpenIndex(null), [])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [close])

  useEffect(() => {
    if (openIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const trigger = navRef.current?.querySelector<HTMLElement>(`[data-part="trigger"][aria-expanded="true"]`)
      close()
      trigger?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openIndex, close])

  return (
    <nav ref={navRef} data-part="links" data-wing={wing} aria-label={ariaLabel}>
      {navItems.map((item, i) => {
        const children      = item.children ?? []
        const hasChildren   = children.length > 0
        const self          = matchHref(pathname, item.href)
        const sectionActive = self.section || children.some(c => matchHref(pathname, c.href).section)

        if (!hasChildren) {
          return (
            <Link
              key={item.label}
              href={item.href}
              data-part="link"
              data-section={sectionActive ? '' : undefined}
              aria-current={self.exact ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        }

        const isOpen  = openIndex === i
        const panelId = `${baseId}-p${i}`
        const isLast  = i === navItems.length - 1

        return (
          <div
            key={item.label}
            data-part="group"
            onBlur={e => { if (isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) close() }}
          >
            <button
              type="button"
              data-part="trigger"
              data-section={sectionActive ? '' : undefined}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              {item.label}
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              id={panelId}
              data-part="panel"
              data-align={isLast && alignLastEnd ? 'end' : 'start'}
              data-open={isOpen ? '' : undefined}
              inert={!isOpen}
            >
              <ul>
                {children.map(sub => {
                  const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
                  const m    = matchHref(pathname, sub.href)
                  return (
                    <li key={sub.label}>
                      <Link
                        href={sub.href}
                        data-part="sub"
                        aria-current={m.exact ? 'page' : undefined}
                        onClick={close}
                      >
                        <span data-part="sub-ic" aria-hidden="true">{Icon && <Icon size={20} strokeWidth={1.75} />}</span>
                        <span data-part="sub-t">
                          <b>{sub.label}</b>
                          {sub.description && <small>{sub.description}</small>}
                        </span>
                        <span data-part="sub-go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2} /></span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
