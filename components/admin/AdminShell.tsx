import { Settings2 } from 'lucide-react'
import AdminNav from './AdminNav'
import LogoutButton from './LogoutButton'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const siteName = (settings?.siteName as string | undefined) ?? 'OptiTech'

  return (
    <div className="flex h-full min-h-screen">
      {/* ── Sidebar ── */}
      <aside
        className="w-[220px] shrink-0 flex flex-col bg-surface border-r border-fg/[0.07]"
        style={{ boxShadow: '1px 0 0 var(--ot-bloom-brand-border)' }}
      >
        {/* Logo / wordmark */}
        <div className="h-[54px] flex items-center gap-[9px] px-md border-b border-fg/[0.07] shrink-0">
          <div className="w-6 h-6 bg-brand flex items-center justify-center shrink-0">
            <Settings2 size={13} strokeWidth={2} className="text-fg-on-brand" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[0.75rem] font-semibold tracking-[0.04em] uppercase text-fg leading-none">
              Opti
            </span>
            <span className="text-[0.75rem] font-semibold tracking-[0.04em] uppercase text-brand leading-none">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <AdminNav />

        {/* Footer */}
        <div className="shrink-0 border-t border-fg/[0.07]">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-[54px] shrink-0 flex items-center justify-between px-lg border-b border-fg/[0.07] bg-canvas">
          <div />
          <div className="flex items-center gap-sm">
            <span className="text-[0.6875rem] text-fg-muted/50 uppercase tracking-[0.08em] font-semibold select-none">
              Site
            </span>
            <span className="text-[0.8125rem] font-medium text-fg-muted">
              {siteName}
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
