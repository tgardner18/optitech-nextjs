'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/opti-admin/auth', { method: 'DELETE' })
    router.push('/opti-admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-sm text-[0.8125rem] text-fg-muted hover:text-fg transition-colors duration-150 w-full px-sm py-[7px]"
    >
      <LogOut size={14} strokeWidth={1.75} className="shrink-0" />
      Sign out
    </button>
  )
}
