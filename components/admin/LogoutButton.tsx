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
      className="oa-sb-logout flex items-center gap-[10px] text-[0.8125rem] w-full px-[18px] py-[12px]"
    >
      <LogOut size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
      Sign out
    </button>
  )
}
