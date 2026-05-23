import ShowcaseNav    from './nav'
import ShowcaseMobileNav from './MobileNav'

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Desktop sidebar: identity + type tabs + component list ─────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-fg/10">
        <ShowcaseNav />
      </aside>

      {/* ── Content column ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile nav strip — hidden on lg+ */}
        <ShowcaseMobileNav />

        {/* Page content */}
        <div className="divide-y divide-fg/5">
          {children}
        </div>
      </div>

    </div>
  )
}
