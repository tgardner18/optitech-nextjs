'use client'

import { useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import type { NavSubItem } from '@/components/layout/DesktopNav'

type Props = {
  label:    string
  href:     string
  children?: NavSubItem[]
}

/**
 * `exact`: true only when pathname === href — the correct condition for
 * aria-current="page". `section`: also true for any sub-path (pathname
 * starts with href + '/') — used for the visual "you're in this area"
 * treatment, which is intentionally looser than aria-current.
 */
function matchHref(pathname: string, href: string) {
  if (!href || href === '#') return { exact: false, section: false }
  let path = href
  if (href.startsWith('http')) {
    try { path = new URL(href).pathname } catch { return { exact: false, section: false } }
  }
  // CMS stores hrefs with trailing slashes; usePathname() returns paths without.
  // Normalise both sides so '/pricing/' matches '/pricing'.
  const normPath     = path     === '/' ? path     : path.replace(/\/$/, '')
  const normPathname = pathname === '/' ? pathname : pathname.replace(/\/$/, '')
  const exact   = normPathname === normPath
  const section = exact || (normPath !== '/' && normPathname.startsWith(`${normPath}/`))
  return { exact, section }
}

export function SidebarNavItem({ label, href, children }: Props) {
  const pathname = usePathname()
  const hasChildren = !!children?.length

  const self = matchHref(pathname, href)
  const childMatches = hasChildren ? children!.map(c => matchHref(pathname, c.href)) : []
  const childActive = childMatches.some(m => m.section)
  const sectionActive = self.section || childActive

  // `manualOpen` only tracks the user's own toggle clicks. Whether the
  // section is actually open is derived at render time as
  // `childActive || manualOpen`, not synced via an effect — so a section
  // containing the current page is always expanded (and can't be collapsed
  // out from under you), while navigating between sibling sub-pages in this
  // persistent, never-remounted sidebar stays correct automatically, with no
  // effect-driven setState render cascade.
  const [manualOpen, setManualOpen] = useState(false)
  const open = childActive || manualOpen

  const listId = useId()

  if (!hasChildren) {
    return (
      <Link
        href={href}
        data-part="s-link"
        data-section={sectionActive ? '' : undefined}
        aria-current={self.exact ? 'page' : undefined}
      >
        {label}
      </Link>
    )
  }

  return (
    <div data-part="s-group">
      <button
        type="button"
        data-part="s-link"
        data-section={sectionActive ? '' : undefined}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setManualOpen(v => !v)}
      >
        {label}
        <ChevronDown aria-hidden size={16} strokeWidth={2} />
      </button>

      {open && (
        <ul id={listId}>
          {children!.map((sub, i) => {
            const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
            return (
              <li key={sub.label}>
                <Link
                  href={sub.href}
                  data-part="s-sub"
                  data-section={childMatches[i].section ? '' : undefined}
                  aria-current={childMatches[i].exact ? 'page' : undefined}
                >
                  {Icon && <span data-part="s-ic" aria-hidden="true"><Icon size={16} strokeWidth={1.75} /></span>}
                  {sub.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
