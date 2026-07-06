export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import WorkRequestClient from '@/components/admin/WorkRequestClient'

export const metadata: Metadata = { title: 'Work Requests — Accelerator Admin' }

export default function WorkRequestsPage() {
  return (
    <div className="px-lg py-lg">
      {/* ── Page header ── */}
      <div className="mb-md">
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Work Requests
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed">
          Submit a marketing work request into Optimizely CMP without CMP access — pick a request type and the form adapts to its fields.
        </p>
      </div>

      <div className="border-t border-fg/[0.07] pt-lg">
        <WorkRequestClient />
      </div>
    </div>
  )
}
