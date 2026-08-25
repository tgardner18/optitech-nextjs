'use client'

import { useState } from 'react'
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

  if (!hasChildren) {
    return (
      <Link
        href={href}
        aria-current={self.exact ? 'page' : undefined}
        className={[
          'flex items-center px-sm py-[7px] rounded-ot-control text-sm transition-colors duration-150 ease-quick',
          sectionActive
            ? 'bg-brand/15 text-fg font-semibold'
            : 'font-medium text-fg-muted hover:text-fg hover:bg-fg/[0.05]',
        ].join(' ')}
      >
        {label}
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setManualOpen(v => !v)}
        className={[
          'w-full flex items-center justify-between gap-xs px-sm py-[7px] rounded-ot-control',
          'text-sm transition-colors duration-150 ease-quick',
          // Three tiers: contains the current page (tinted fill + bold) >
          // merely expanded to browse (bold only — the "focus" state) >
          // collapsed and not current (muted).
          sectionActive
            ? 'bg-brand/15 text-fg font-semibold'
            : open
              ? 'text-fg font-semibold hover:bg-fg/[0.05]'
              : 'text-fg-muted font-medium hover:text-fg hover:bg-fg/[0.05]',
        ].join(' ')}
      >
        {label}
        <ChevronDown
          aria-hidden
          size={13}
          strokeWidth={2}
          className={`shrink-0 transition-transform duration-200 ease-quick ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="ml-sm pl-xs border-l border-fg/10 my-xs flex flex-col gap-0.5">
          {children!.map((sub, i) => {
            const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
            const subActive = childMatches[i].section
            return (
              <Link
                key={sub.label}
                href={sub.href}
                aria-current={childMatches[i].exact ? 'page' : undefined}
                className={[
                  'group/sub flex items-center gap-xs px-sm py-[5px] rounded-ot-control text-label transition-colors duration-150 ease-quick',
                  subActive
                    ? 'bg-brand/15 text-fg font-semibold'
                    : 'font-medium text-fg-muted hover:text-fg hover:bg-fg/[0.05]',
                ].join(' ')}
              >
                {Icon && (
                  <span
                    aria-hidden="true"
                    className={[
                      'flex items-center justify-center w-6 h-6 shrink-0 rounded-ot-control transition-colors duration-150 ease-quick',
                      subActive
                        ? 'bg-brand text-fg-on-brand'
                        : 'bg-fg/[0.06] text-fg-muted group-hover/sub:bg-brand/15 group-hover/sub:text-fg',
                    ].join(' ')}
                  >
                    <Icon size={12} strokeWidth={1.75} />
                  </span>
                )}
                {sub.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
