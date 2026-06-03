'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, CalendarDays } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  href:  string
  label: string
  icon:  LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/opti-admin',                 label: 'Dashboard',        icon: LayoutDashboard, exact: true },
  { href: '/opti-admin/component-usage', label: 'Component Usage',  icon: BarChart3        },
  { href: '/opti-admin/calendar',        label: 'Content Calendar', icon: CalendarDays     },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-sm py-md overflow-y-auto">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 px-sm mb-sm select-none">
        Tools
      </p>
      <ul>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex items-center gap-[10px] px-sm py-[7px] text-[0.8125rem] font-medium',
                  'transition-colors duration-150 select-none',
                  active
                    ? 'bg-brand/[0.09] text-brand font-semibold'
                    : 'text-fg-muted hover:text-fg hover:bg-fg/[0.045]',
                ].join(' ')}
              >
                <Icon
                  size={14}
                  strokeWidth={active ? 2.25 : 1.75}
                  className="shrink-0"
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
