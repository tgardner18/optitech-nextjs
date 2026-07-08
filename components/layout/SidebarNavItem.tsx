'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import type { NavSubItem } from '@/components/layout/DesktopNav'

type Props = {
  label:    string
  href:     string
  children?: NavSubItem[]
}

export function SidebarNavItem({ label, href, children }: Props) {
  const [open, setOpen] = useState(false)
  const hasChildren = !!children?.length

  if (!hasChildren) {
    return (
      <Link
        href={href}
        className="flex items-center px-sm py-[7px] rounded-ot-control text-sm font-medium
                   text-fg-muted hover:text-fg hover:bg-fg/[0.05]
                   transition-colors duration-150 ease-quick"
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
        onClick={() => setOpen(v => !v)}
        className={[
          'w-full flex items-center justify-between gap-xs px-sm py-[7px] rounded-ot-control',
          'text-sm font-medium transition-colors duration-150 ease-quick',
          open ? 'text-fg' : 'text-fg-muted hover:text-fg hover:bg-fg/[0.05]',
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
          {children.map(sub => {
            const Icon = sub.icon ? ICON_REGISTRY[sub.icon] : null
            return (
              <Link
                key={sub.label}
                href={sub.href}
                className="flex items-center gap-xs px-sm py-[5px] rounded-ot-control
                           text-label text-fg-muted hover:text-fg hover:bg-fg/[0.05]
                           transition-colors duration-150 ease-quick"
              >
                {Icon && <Icon size={13} aria-hidden strokeWidth={1.75} className="shrink-0" />}
                {sub.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
