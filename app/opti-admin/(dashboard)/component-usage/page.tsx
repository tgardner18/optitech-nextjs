export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import ComponentUsageClient from '@/components/admin/ComponentUsageClient'
import { ALLOWED_QUERY_KEYS, ADMIN_BLOCK_TYPES } from '@/lib/admin/contentTypes'

export const metadata: Metadata = { title: 'Component Usage — Accelerator Admin' }

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function ComponentUsagePage({ searchParams }: Props) {
  const params = await searchParams
  const rawType = params.type ?? ''
  const initialType = ALLOWED_QUERY_KEYS.has(rawType)
    ? rawType
    : ADMIN_BLOCK_TYPES[0].key

  // Detect the current site's host so the client can default to filtering
  // results to just this site, with an option to show all sites.
  const h    = await headers()
  const host = h.get('host') ?? ''
  const proto = h.get('x-forwarded-proto')?.split(',')[0].trim()
    ?? (host.startsWith('localhost') ? 'http' : 'https')
  const currentSiteBase = host ? `${proto}://${host}` : null

  return (
    <div className="px-lg py-lg">
      <div className="mb-md">
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Component Usage
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed">
          Find which pages use each content type across your CMS.
        </p>
      </div>

      <div className="border-t border-fg/[0.07] pt-lg">
        <ComponentUsageClient
          initialType={initialType}
          currentSiteBase={currentSiteBase}
        />
      </div>
    </div>
  )
}
