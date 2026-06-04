import Link from 'next/link'
import { BarChart3, CalendarDays, ArrowRight, Clock } from 'lucide-react'
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { ADMIN_BLOCK_TYPES } from '@/lib/admin/contentTypes'
import { getRecentContent } from '@/lib/admin/graph'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'

export const metadata: Metadata = { title: 'Dashboard — OptiAdmin' }

function categoryBadge(category: string): string {
  switch (category) {
    case 'content': return 'bg-brand/[0.07] text-brand'
    case 'media':   return 'bg-accent/[0.08] text-accent'
    case 'data':    return 'bg-fg/[0.06] text-fg-muted'
    default:        return 'bg-fg/[0.05] text-fg-muted/70'
  }
}

export default async function DashboardPage() {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const siteName = (settings?.siteName as string | undefined) ?? 'OptiTech'

  const recentItems = await getRecentContent(8)

  return (
    <div className="px-lg py-lg">
      {/* ── Page header ── */}
      <div className="mb-lg">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 mb-xs">
          {siteName}
        </p>
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Dashboard
        </h1>
      </div>

      {/* ── Tool shortcuts ── */}
      <section className="mb-lg" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 mb-md">
          Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {[
            {
              href:        '/opti-admin/component-usage',
              icon:        BarChart3,
              label:       'Component Usage',
              description: `Find which pages use each of the ${ADMIN_BLOCK_TYPES.length} registered block types.`,
            },
            {
              href:        '/opti-admin/calendar',
              icon:        CalendarDays,
              label:       'Content Calendar',
              description: 'Browse scheduled and published content by date across the CMS.',
            },
          ].map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className={[
                'group flex items-start gap-md p-lg border border-fg/[0.08] bg-surface',
                'hover:border-brand/30 hover:bg-brand/[0.03]',
                'transition-[border-color,background-color] duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
              ].join(' ')}
            >
              <div className="w-9 h-9 bg-brand/[0.08] flex items-center justify-center shrink-0 group-hover:bg-brand/[0.13] transition-colors duration-150">
                <Icon size={17} strokeWidth={1.75} className="text-brand" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.9375rem] font-semibold text-fg leading-tight">{label}</p>
                <p className="text-[0.8125rem] text-fg-muted mt-[3px] leading-relaxed">{description}</p>
              </div>
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                className="shrink-0 text-fg-muted/30 group-hover:text-brand motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-[3px]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Two-column lower section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-xl">
        {/* Block type inventory */}
        <section aria-labelledby="inventory-heading">
          <h2 id="inventory-heading" className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 mb-md">
            Block Inventory <span className="font-normal normal-case tracking-normal text-fg-muted/40">({ADMIN_BLOCK_TYPES.length} types)</span>
          </h2>
          <div className="border border-fg/[0.08]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_60px] px-md py-[7px] border-b border-fg/[0.08] bg-fg/[0.02]">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60">Component</p>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60">Category</p>
              <div />
            </div>
            {ADMIN_BLOCK_TYPES.map(type => (
              <div
                key={type.key}
                className="grid grid-cols-[1fr_80px_60px] items-center px-md py-[9px] border-b border-fg/[0.06] last:border-none hover:bg-fg/[0.025] transition-colors duration-100"
              >
                <p className="text-[0.875rem] font-medium text-fg">{type.displayName}</p>
                <span className={`text-[0.65rem] font-semibold uppercase tracking-[0.06em] px-[5px] py-[2px] w-fit ${categoryBadge(type.category)}`}>
                  {type.category}
                </span>
                <Link
                  href={`/opti-admin/component-usage?type=${type.key}`}
                  className="text-[0.75rem] font-medium text-brand/60 hover:text-brand transition-colors duration-100 flex items-center gap-[4px]"
                >
                  View <ArrowRight size={10} strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Recent content */}
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 mb-md">
            Recent Content
          </h2>

          {recentItems.length === 0 ? (
            <div className="border border-fg/[0.08] px-md py-xl flex flex-col items-center gap-sm text-center">
              <Clock size={24} strokeWidth={1.25} className="text-fg-muted/25" aria-hidden="true" />
              <p className="text-[0.8125rem] text-fg-muted">No content found in the CMS.</p>
            </div>
          ) : (
            <ul className="border border-fg/[0.08]">
              {recentItems.map(item => {
                const date    = item.published ? new Date(item.published) : null
                const dateStr = date
                  ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'

                return (
                  <li
                    key={item.key}
                    className="flex flex-col px-md py-[10px] border-b border-fg/[0.06] last:border-none hover:bg-fg/[0.025] transition-colors duration-100"
                  >
                    <p className="text-[0.875rem] font-medium text-fg leading-snug truncate">
                      {item.displayName || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-sm mt-[3px]">
                      <span className="text-[0.75rem] text-fg-muted">{dateStr}</span>
                      <span className="text-fg-muted/30 text-[0.6875rem]">·</span>
                      <span className="text-[0.75rem] text-fg-muted capitalize">{item.type}</span>
                      {item.url && (
                        <>
                          <span className="text-fg-muted/30 text-[0.6875rem]">·</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.75rem] text-brand/60 hover:text-brand transition-colors duration-100 truncate"
                          >
                            {item.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                          </a>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <Link
            href="/opti-admin/calendar"
            className="flex items-center gap-xs mt-sm text-[0.8125rem] font-medium text-brand/70 hover:text-brand transition-colors duration-150"
          >
            Open full calendar <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  )
}
