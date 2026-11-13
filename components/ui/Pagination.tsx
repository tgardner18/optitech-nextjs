'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page:       number
  totalPages: number
  onChange:   (p: number) => void
  label?:     string
}

/**
 * Page buttons. Presentation lives in a block stylesheet keyed on data-part="pager" / "pg"
 * (see components/blocks/resource-library.css). The range text ("Showing 1-6 of 9") belongs to the
 * caller, so it can fold in search and filter results.
 */
export default function Pagination({ page, totalPages, onChange, label = 'Pages' }: PaginationProps) {
  if (totalPages <= 1) return null

  // Always show first, last, and ±1 around current; insert ellipsis for gaps
  const pages = new Set<number>([1, totalPages])
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i)
  const pageList = [...pages].sort((a, b) => a - b)

  return (
    <nav data-part="pager" aria-label={label}>
      <button type="button" data-part="pg" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={18} strokeWidth={2} aria-hidden />
      </button>

      {pageList.map((p, i) => {
        const prev = pageList[i - 1]
        return (
          <span key={p} style={{ display: 'contents' }}>
            {prev !== undefined && p - prev > 1 && <span data-part="gap" aria-hidden="true">…</span>}
            <button
              type="button"
              data-part="pg"
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button type="button" data-part="pg" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight size={18} strokeWidth={2} aria-hidden />
      </button>
    </nav>
  )
}
