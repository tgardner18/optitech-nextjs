'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Activity,
  Globe,
  Users,
  FlaskConical,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  href:     string
  label:    string
  icon:     LucideIcon
  exact?:   boolean
  disabled?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'CMS',
    items: [
      { href: '/opti-admin',                 label: 'Dashboard',        icon: LayoutDashboard, exact: true },
      { href: '/opti-admin/calendar',        label: 'Content Calendar', icon: CalendarDays    },
      { href: '/opti-admin/component-usage', label: 'Components',       icon: BarChart3       },
    ],
  },
  {
    label: 'Demo',
    items: [
      { href: '/opti-admin/demo-controls', label: 'Demo Controls', icon: FlaskConical },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/opti-admin/analytics/traffic',     label: 'Traffic',      icon: TrendingUp, disabled: true },
      { href: '/opti-admin/analytics/performance', label: 'Performance',  icon: Activity,   disabled: true },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/opti-admin/settings/site', label: 'Site Config', icon: Globe,  disabled: true },
      { href: '/opti-admin/settings/team', label: 'Team',        icon: Users,  disabled: true },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-2.5 py-4.5 overflow-y-auto flex flex-col gap-6">
      {NAV_SECTIONS.map(section => (
        <div key={section.label}>
          <p className="oa-section-label text-[0.6rem] font-bold uppercase tracking-[0.14em] px-2 mb-1.5 select-none">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map(({ href, label, icon: Icon, exact, disabled }) => {
              const active = !disabled && (exact ? pathname === href : pathname.startsWith(href))
              return (
                <li key={href}>
                  {disabled ? (
                    <div className="oa-sb-nav-item flex items-center gap-2.5 px-2 py-2 text-[0.8125rem] select-none cursor-default opacity-30">
                      <Icon size={15} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                      <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-[0.08em]">Soon</span>
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className={`oa-sb-nav-item flex items-center gap-2.5 px-2 py-2 text-[0.8125rem] select-none ${active ? 'oa-active' : ''}`}
                    >
                      <Icon
                        size={15}
                        strokeWidth={active ? 2 : 1.5}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      {label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
