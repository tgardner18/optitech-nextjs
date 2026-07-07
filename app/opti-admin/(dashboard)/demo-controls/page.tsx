export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import ExperimentSimulator from '@/components/admin/ExperimentSimulator'
import TrafficSimulator from '@/components/admin/TrafficSimulator'

export const metadata: Metadata = { title: 'Demo Controls — Accelerator Admin' }

export default function DemoControlsPage() {
  return (
    <div className="px-lg py-lg">
      <div className="mb-lg">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 mb-xs">
          Operator only
        </p>
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Demo Controls
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed max-w-[70ch]">
          Set up demo data and run simulations before a live demo. These tools are not linked
          from the public site.
        </p>
      </div>

      <section className="border-t border-fg/[0.07] pt-lg mb-2xl">
        <TrafficSimulator />
      </section>

      <section className="border-t border-fg/[0.07] pt-lg">
        <ExperimentSimulator />
      </section>
    </div>
  )
}
