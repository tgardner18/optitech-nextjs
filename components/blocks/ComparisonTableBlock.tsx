'use client'

import { useState, useRef } from 'react'
import {
  Check, Minus, X, CircleCheck, CircleMinus,
  Star, Zap, Shield, Lock, Unlock, Clock,
  Infinity as InfinityIcon, MessageCircle,
  Users, Globe, Database, Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button               from '@/components/ui/Button'
import { cn }               from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ComparisonCell {
  icon?:    string
  text?:    string
  isEmpty?: boolean
}

export interface ComparisonRow {
  rowType: 'group' | 'row'
  label:   string
  tooltip?: string
  cells:   ComparisonCell[]
}

export interface ComparisonColumn {
  label:     string
  subLabel?: string
  badgeText?: string
  ctaLabel?: string
  ctaHref?:  string
}

interface Props {
  eyebrow?:    string
  headline:    string
  subHeadline?: string
  columns:     ComparisonColumn[]
  rows:        ComparisonRow[]
  color?:      'canvas' | 'surface'
}

// ── Icon registry ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  'check':          Check,
  'minus':          Minus,
  'xmark':          X,
  'circle-check':   CircleCheck,
  'circle-minus':   CircleMinus,
  'star':           Star,
  'zap':            Zap,
  'shield':         Shield,
  'lock':           Lock,
  'unlock':         Unlock,
  'clock':          Clock,
  'infinity':       InfinityIcon,
  'message-circle': MessageCircle,
  'users':          Users,
  'globe':          Globe,
  'database':       Database,
}

function iconColorClass(key: string): string {
  if (key === 'check' || key === 'circle-check') return 'text-brand'
  if (key === 'minus' || key === 'circle-minus' || key === 'xmark') return 'text-fg-muted/40'
  return 'text-fg-muted'
}

// ── Cell content renderer ─────────────────────────────────────────────────────

function CellContent({ cell }: { cell: ComparisonCell | undefined }) {
  if (!cell || cell.isEmpty || (!cell.icon && !cell.text)) {
    return <span className="text-fg-muted/35 text-body font-mono select-none">—</span>
  }

  const Icon = cell.icon ? ICON_MAP[cell.icon] : undefined

  return (
    <span className="flex items-center gap-xs">
      {Icon && (
        <Icon
          size={16}
          className={cn('shrink-0', cell.icon ? iconColorClass(cell.icon) : '')}
          aria-hidden="true"
        />
      )}
      {cell.text && (
        <span className="text-sm font-medium text-fg">{cell.text}</span>
      )}
    </span>
  )
}

// ── Tooltip wrapper ───────────────────────────────────────────────────────────

function TooltipLabel({ label, tooltip }: { label: string; tooltip?: string }) {
  return (
    <span className="flex items-center gap-xs min-w-0">
      <span className="text-sm text-fg truncate">{label}</span>
      {tooltip && (
        <span className="relative group/tip shrink-0">
          <button
            type="button"
            className="flex items-center text-fg-muted/40 hover:text-fg-muted focus-visible:text-fg-muted transition-colors duration-150"
            aria-label={`More information: ${tooltip}`}
          >
            <Info size={12} />
          </button>
          <span
            role="tooltip"
            className={cn(
              'absolute bottom-full left-0 mb-2 w-52 z-10',
              'bg-surface border border-fg/10 rounded-ot-surface px-sm py-xs',
              'text-xs text-fg-muted leading-relaxed shadow-lg',
              'opacity-0 pointer-events-none',
              'group-hover/tip:opacity-100 group-focus-within/tip:opacity-100',
              'transition-opacity duration-150 ease-out',
            )}
          >
            {tooltip}
          </span>
        </span>
      )}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComparisonTableBlock({
  eyebrow,
  headline,
  subHeadline,
  columns,
  rows,
  color = 'canvas',
}: Props) {
  const featuredIdx = columns.findIndex(c => !!c.badgeText)
  const [activeCol, setActiveCol] = useState(() => featuredIdx >= 0 ? featuredIdx : 0)
  const touchStartX = useRef(0)

  const colCount  = columns.length
  const gridStyle = {
    gridTemplateColumns: `minmax(140px, 210px) repeat(${colCount}, minmax(120px, 1fr))`,
  }
  const bgClass = color === 'surface' ? 'bg-surface' : 'bg-canvas'

  // ── Mobile swipe ──────────────────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      setActiveCol(prev =>
        dx < 0
          ? Math.min(prev + 1, colCount - 1)
          : Math.max(prev - 1, 0)
      )
    }
  }

  return (
    <section className={cn('py-xl px-md lg:px-lg', bgClass)}>

      {/* ── Above-table header ─────────────────────────────────────────────── */}
      {(eyebrow || headline || subHeadline) && (
        <div className="mb-2xl">
          {eyebrow && (
            <p className="text-label tracking-label uppercase font-semibold text-brand mb-sm">
              {eyebrow}
            </p>
          )}
          <h2 className="text-headline font-bold leading-headline text-fg">
            {headline}
          </h2>
          {subHeadline && (
            <p className="text-body leading-body text-fg-muted mt-md max-w-[65ch]">
              {subHeadline}
            </p>
          )}
        </div>
      )}

      {/* ── Mobile column selector ─────────────────────────────────────────── */}
      <div
        className="sm:hidden mb-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex rounded-ot-control border border-fg/10 overflow-hidden" role="tablist" aria-label="Select column">
          {columns.map((col, i) => {
            const isFeat   = i === featuredIdx
            const isActive = i === activeCol
            return (
              <button
                key={i}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCol(i)}
                className={cn(
                  'flex-1 px-sm py-sm text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
                  isActive && isFeat  && 'bg-brand text-fg-on-brand',
                  isActive && !isFeat && 'bg-surface text-fg',
                  !isActive           && 'text-fg-muted hover:text-fg hover:bg-fg/4',
                )}
              >
                <span className="block text-sm font-semibold leading-tight">{col.label}</span>
                {col.badgeText && (
                  <span className={cn(
                    'block text-[10px] font-medium mt-0.5',
                    isActive && isFeat ? 'text-fg-on-brand/70' : 'text-brand',
                  )}>
                    {col.badgeText}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-fg-muted/40 text-center mt-xs">Swipe to compare</p>
      </div>

      {/* ── Desktop: full grid table ───────────────────────────────────────── */}
      <div
        className="hidden sm:block"
        role="table"
        aria-label={headline}
      >
        {/* Column headers — pt-sm reserves visual headroom for featured column top accent */}
        <div role="rowgroup" className="pt-sm">
          <div role="row" className="grid" style={gridStyle}>

            {/* Row label header spacer */}
            <div role="columnheader" aria-label="Feature" />

            {/* Data column headers */}
            {columns.map((col, i) => {
              const featured = i === featuredIdx
              return (
                <div
                  key={i}
                  role="columnheader"
                  className={cn(
                    'flex flex-col gap-sm px-md pt-md pb-lg',
                    featured && [
                      '-mt-sm rounded-t-ot-surface',
                      'bg-brand text-fg-on-brand',
                      'shadow-[0_2px_24px_var(--ot-bloom-brand-faint),0_0_0_1px_oklch(from_var(--ot-brand)_l_c_h/0.3)]',
                    ]
                  )}
                >
                  {/* Badge — or fixed spacer so all column names share the same baseline */}
                  {col.badgeText ? (
                    <span className={cn(
                      'self-start text-[10px] tracking-widest uppercase font-bold px-sm py-0.5 rounded-full',
                      featured
                        ? 'bg-fg-on-brand/15 text-fg-on-brand'
                        : 'bg-brand/15 text-brand'
                    )}>
                      {col.badgeText}
                    </span>
                  ) : (
                    <div className="h-5" aria-hidden="true" />
                  )}

                  {/* Column name */}
                  <p className={cn(
                    'text-title font-bold leading-tight',
                    featured ? 'text-fg-on-brand' : 'text-fg'
                  )}>
                    {col.label}
                  </p>

                  {/* Sub-label / price */}
                  {col.subLabel && (
                    <p className={cn(
                      'text-sm',
                      featured ? 'text-fg-on-brand/70' : 'text-fg-muted'
                    )}>
                      {col.subLabel}
                    </p>
                  )}

                  {/* CTA */}
                  {col.ctaLabel && (
                    <div className="mt-sm">
                      {featured ? (
                        <a
                          href={col.ctaHref ?? '#'}
                          className={cn(
                            'flex items-center justify-center w-full',
                            'rounded-ot-control border border-fg-on-brand/30 text-fg-on-brand',
                            'text-label font-semibold tracking-label uppercase px-md py-sm',
                            'hover:bg-fg-on-brand/10 transition-colors duration-150 ease-out',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-on-brand',
                          )}
                        >
                          {col.ctaLabel}
                        </a>
                      ) : (
                        <Button href={col.ctaHref ?? '#'} size="sm" variant="brand" className="w-full justify-center">
                          {col.ctaLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Table body rows */}
        <div role="rowgroup" className="border border-fg/10">
          {rows.map((row, rowIdx) => {

            // ── Group header row ──────────────────────────────────────────
            if (row.rowType === 'group') {
              return (
                <div
                  key={rowIdx}
                  role="row"
                  className={cn(
                    'grid border-t border-fg/10',
                    rowIdx === 0 && 'border-t-0',
                  )}
                  style={gridStyle}
                >
                  <div
                    role="rowheader"
                    className="col-span-full px-md py-sm bg-brand/6"
                    style={{ gridColumn: `1 / ${colCount + 2}` }}
                  >
                    <span className="text-label tracking-label uppercase font-semibold text-brand">
                      {row.label}
                    </span>
                  </div>
                </div>
              )
            }

            // ── Data row ──────────────────────────────────────────────────
            return (
              <div
                key={rowIdx}
                role="row"
                className={cn(
                  'grid border-t border-fg/6 transition-colors duration-100',
                  'hover:bg-fg/1.5',
                  rowIdx === 0 && 'border-t-0',
                )}
                style={gridStyle}
              >
                {/* Row label */}
                <div role="rowheader" className="px-md py-md flex items-center">
                  <TooltipLabel label={row.label} tooltip={row.tooltip} />
                </div>

                {/* Cells */}
                {columns.map((col, colIdx) => {
                  const featured = colIdx === featuredIdx
                  return (
                    <div
                      key={colIdx}
                      role="cell"
                      className={cn(
                        'px-md py-md flex items-center',
                        featured && 'bg-brand/8',
                      )}
                    >
                      <CellContent cell={row.cells[colIdx]} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mobile: single-column view ────────────────────────────────────── */}
      <div
        className="sm:hidden"
        role="table"
        aria-label={headline}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div role="rowgroup">
          {rows.map((row, rowIdx) => {

            if (row.rowType === 'group') {
              return (
                <div key={rowIdx} role="row">
                  <div
                    role="cell"
                    className={cn(
                      'px-md py-sm bg-brand/6',
                      'border-t border-fg/10',
                      rowIdx === 0 && 'border-t-0',
                    )}
                  >
                    <span className="text-label tracking-label uppercase font-semibold text-brand">
                      {row.label}
                    </span>
                  </div>
                </div>
              )
            }

            const cell     = row.cells[activeCol]
            const featured = activeCol === featuredIdx

            return (
              <div
                key={rowIdx}
                role="row"
                className={cn(
                  'flex items-center justify-between border-t border-fg/6 px-md py-md gap-md',
                  rowIdx === 0 && 'border-t-0',
                  featured && 'bg-brand/5',
                )}
              >
                <div role="rowheader" className="min-w-0 flex-1">
                  <TooltipLabel label={row.label} tooltip={row.tooltip} />
                </div>
                <div role="cell" className="shrink-0">
                  <CellContent cell={cell} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
