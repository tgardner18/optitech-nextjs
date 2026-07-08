'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page:        number
  totalPages:  number
  total:       number
  pageSize:    number
  countLabel:  string
  onBrand?:    boolean
  onChange:    (p: number) => void
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  countLabel,
  onBrand = false,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  const btnBase = 'inline-flex items-center justify-center w-11 h-11 rounded-ot-control border text-label font-semibold transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

  const btnInactive = onBrand
    ? 'border-fg-on-brand/20 text-fg-on-brand/70 hover:bg-fg/15 hover:text-fg-on-brand'
    : 'border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg'

  const btnActive = onBrand
    ? 'bg-fg/25 border-fg-on-brand/50 text-fg-on-brand'
    : 'bg-brand border-transparent text-fg-on-brand'

  const btnDisabled = onBrand
    ? 'border-fg-on-brand/10 text-fg-on-brand/25 cursor-not-allowed'
    : 'border-fg/8 text-fg/25 cursor-not-allowed'

  const countClass = onBrand ? 'text-fg-on-brand/55' : 'text-fg-muted'

  // Always show first, last, and ±1 around current; insert ellipsis for gaps
  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i)
  const pageList = [...pages].sort((a, b) => a - b)

  return (
    <div className="mt-xl flex flex-col items-center gap-md">
      <p className={`text-label ${countClass}`} aria-live="polite" aria-atomic="true">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> {countLabel}
      </p>

      <div className="flex items-center gap-xs">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${btnBase} ${page <= 1 ? btnDisabled : btnInactive}`}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {pageList.map((p, i) => {
          const prev    = pageList[i - 1]
          const showGap = prev !== undefined && p - prev > 1
          return (
            <span key={p} className="flex items-center gap-xs">
              {showGap && (
                <span className={`w-9 text-center text-label select-none ${countClass}`}>…</span>
              )}
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onChange(p)}
                className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              >
                {p}
              </button>
            </span>
          )
        })}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className={`${btnBase} ${page >= totalPages ? btnDisabled : btnInactive}`}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
