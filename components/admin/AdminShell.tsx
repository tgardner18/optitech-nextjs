import Image from 'next/image'
import AdminNav from './AdminNav'
import LogoutButton from './LogoutButton'
import AdminHeaderTitle from './AdminHeaderTitle'
import { getSiteSettings, getRequestDomain, getRequestLocale, getRequestBaseUrl } from '@/lib/optimizely'

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const siteName = (settings?.siteName as string | undefined) ?? 'OptiTech'
  const baseUrl  = await getRequestBaseUrl()
  const hostname = baseUrl ? baseUrl.replace(/^https?:\/\//, '') : domain

  return (
    <div className="flex h-full min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="oa-sidebar w-[220px] shrink-0 flex flex-col border-r">
        {/* Wordmark */}
        <div className="oa-wordmark-border h-[58px] flex items-center gap-[10px] px-md border-b shrink-0">
          <Image
            src="/brand/logo/optitech-icon.svg"
            alt="OptiTech"
            width={36}
            height={27}
            className="shrink-0"
            priority
          />
          <div className="flex flex-col leading-none gap-0.5">
            <span
              className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase leading-none"
              style={{ color: 'oklch(84% 0.010 175)' }}
            >
              OptiTech
            </span>
            <span
              className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase leading-none"
              style={{ color: 'oklch(68% 0.13 155)' }}
            >
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <AdminNav />

        {/* Sign out */}
        <div className="oa-sb-divider shrink-0 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="oa-topbar h-[58px] shrink-0 flex items-center justify-between px-lg bg-canvas relative z-10">
          {/* Page title — resolved client-side from route */}
          <AdminHeaderTitle />

          {/* Site context */}
          <div className="flex items-center gap-sm">
            <span className="text-[0.6875rem] font-medium text-fg-muted/50 uppercase tracking-[0.07em] select-none">
              {siteName}
            </span>
            <span className="oa-site-badge text-[0.6875rem] font-mono px-[7px] py-[3px] select-all">
              {hostname}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-canvas">
          {children}
        </main>
      </div>
    </div>
  )
}
