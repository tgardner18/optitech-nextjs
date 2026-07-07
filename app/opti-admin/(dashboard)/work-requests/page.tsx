export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import WorkRequestClient from '@/components/admin/WorkRequestClient'

export const metadata: Metadata = { title: 'Work Requests — Accelerator Admin' }

export default function WorkRequestsPage() {
  return (
    <div className="px-lg py-xl">
      <WorkRequestClient />
    </div>
  )
}
