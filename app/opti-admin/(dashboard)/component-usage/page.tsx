import type { Metadata } from 'next'
import ComponentUsageClient from '@/components/admin/ComponentUsageClient'
import { ALLOWED_QUERY_KEYS, ADMIN_BLOCK_TYPES } from '@/lib/admin/contentTypes'

export const metadata: Metadata = { title: 'Component Usage — OptiAdmin' }

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function ComponentUsagePage({ searchParams }: Props) {
  const params = await searchParams
  const rawType = params.type ?? ''
  const initialType = ALLOWED_QUERY_KEYS.has(rawType)
    ? rawType
    : ADMIN_BLOCK_TYPES[0].key

  return (
    <div className="px-xl py-xl max-w-[1100px]">
      {/* ── Page header ── */}
      <div className="mb-xl">
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Component Usage
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed">
          Find which pages use each content type across your CMS.
        </p>
      </div>

      <div className="border-t border-fg/[0.07] pt-xl">
        <ComponentUsageClient initialType={initialType} />
      </div>
    </div>
  )
}
