export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getCalendarItems } from '@/lib/admin/graph'
import ContentCalendarClient from '@/components/admin/ContentCalendarClient'

export const metadata: Metadata = { title: 'Content Calendar — Accelerator Admin' }

export default async function CalendarPage() {
  const items = await getCalendarItems()

  return (
    <div className="px-lg py-lg">
      {/* ── Page header ── */}
      <div className="mb-md">
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Content Calendar
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed">
          Published and scheduled content across experiences and blog posts.
        </p>
      </div>

      <div className="border-t border-fg/[0.07] pt-lg">
        <ContentCalendarClient items={items} />
      </div>
    </div>
  )
}
