'use client'

import { usePathname } from 'next/navigation'

const TITLES: Record<string, string> = {
  '/opti-admin':                 'Dashboard',
  '/opti-admin/component-usage': 'Component Usage',
  '/opti-admin/calendar':        'Content Calendar',
  '/opti-admin/demo-controls':   'Demo Controls',
}

export default function AdminHeaderTitle() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? 'OptiAdmin'
  return (
    <span className="text-[0.9375rem] font-semibold text-fg tracking-[-0.01em]">
      {title}
    </span>
  )
}
