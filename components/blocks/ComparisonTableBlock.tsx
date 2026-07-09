'use client'

import { useState, useRef, useEffect } from 'react'
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

export type TableStyle = 'clean' | 'elevated' | 'bold'

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
  tableStyle?: TableStyle
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

// ── Style system ──────────────────────────────────────────────────────────────

type CellVariant = 'default' | 'inverted'

interface StyleConfig {
  groupBg:             string
  groupText:           string
  rowLabelClass:       string
  rowDivider:          string
  rowHover:            string
  // Featured body cells in elevated are transparent — the overlay provides color
  featuredBodyCell:    string
  featuredCellVariant: CellVariant
  featuredGradient:    string
  featuredShadow:      string
  tableBorder:         string
}

const STYLE_CONFIG: Record<TableStyle, StyleConfig> = {
  clean: {
    groupBg:             'bg-brand',
    groupText:           'text-fg-on-brand font-semibold tracking-label uppercase text-label',
    rowLabelClass:       'text-sm font-semibold text-fg',
    rowDivider:          'border-t border-fg/6',
    rowHover:            'hover:bg-fg/2',
    featuredBodyCell:    'bg-brand/10',
    featuredCellVariant: 'default',
    featuredGradient:    'linear-gradient(to bottom, var(--ot-brand) 0%, oklch(from var(--ot-brand) calc(l * 0.85) c h) 100%)',
    featuredShadow:      'shadow-[0_4px_32px_var(--ot-bloom-brand-faint),0_0_0_1px_oklch(from_var(--ot-brand)_l_c_h/0.25)]',
    tableBorder:         'border border-fg/10 rounded-b-ot-surface overflow-hidden',
  },
  elevated: {
    groupBg:             'bg-accent',
    groupText:           'text-fg-on-accent font-bold tracking-label uppercase text-label',
    rowLabelClass:       'text-sm font-semibold text-fg',
    rowDivider:          'border-t border-fg/6',
    rowHover:            'hover:bg-fg/[0.03]',
    // Transparent — the card overlay provides the brand fill
    featuredBodyCell:    'relative z-10 bg-transparent',
    featuredCellVariant: 'inverted',
    // Gradient lightens slightly at top, lands on full brand at bottom to meet the card overlay
    featuredGradient:    'linear-gradient(to bottom, oklch(from var(--ot-brand) calc(l * 1.06) c h) 0%, var(--ot-brand) 100%)',
    // Header: ring matches the body overlay ring, faint top bloom for lift
    featuredShadow:      'shadow-[0_0_0_1.5px_oklch(from_var(--ot-brand)_calc(l*0.85)_c_h/0.5),0_-4px_14px_var(--ot-bloom-brand-faint)]',
    // No top border — header card connects directly to the body overlay; rounded-b for border radius
    tableBorder:         'border-x border-b border-fg/10 relative rounded-b-ot-surface',
  },
  bold: {
    groupBg:             'bg-accent',
    groupText:           'text-fg-on-accent font-bold tracking-label uppercase text-label',
    rowLabelClass:       'text-sm font-bold text-fg',
    rowDivider:          'border-t border-fg/8',
    rowHover:            'hover:bg-fg/3',
    featuredBodyCell:    'bg-brand',
    featuredCellVariant: 'inverted',
    featuredGradient:    'linear-gradient(150deg, oklch(from var(--ot-brand) calc(l * 1.06) c h) 0%, oklch(from var(--ot-brand) calc(l * 0.70) c h) 100%)',
    featuredShadow:      'shadow-[0_16px_64px_var(--ot-bloom-brand),0_0_0_2px_oklch(from_var(--ot-brand)_l_c_h/0.5)]',
    tableBorder:         'border border-fg/12 rounded-b-ot-surface overflow-hidden',
  },
}

// ── Icon color helper ─────────────────────────────────────────────────────────

function iconColor(key: string, variant: CellVariant): string {
  if (variant === 'inverted') {
    if (key === 'check' || key === 'circle-check') return 'text-fg-on-brand'
    if (key === 'minus' || key === 'circle-minus' || key === 'xmark') return 'text-fg-on-brand/40'
    return 'text-fg-on-brand/80'
  }
  if (key === 'check' || key === 'circle-check') return 'text-brand'
  if (key === 'minus' || key === 'circle-minus' || key === 'xmark') return 'text-fg-muted/50'
  return 'text-fg-muted'
}

// ── Cell content renderer ─────────────────────────────────────────────────────

function CellContent({ cell, variant = 'default' }: { cell: ComparisonCell | undefined; variant?: CellVariant }) {
  if (!cell || cell.isEmpty || (!cell.icon && !cell.text)) {
    return (
      <span className={cn(
        'text-body font-mono select-none',
        variant === 'inverted' ? 'text-fg-on-brand/30' : 'text-fg-muted/50',
      )}>
        —
      </span>
    )
  }

  const Icon = cell.icon ? ICON_MAP[cell.icon] : undefined

  return (
    <span className="flex items-center gap-xs">
      {Icon && (
        <Icon
          size={16}
          className={cn('shrink-0', cell.icon ? iconColor(cell.icon, variant) : '')}
          aria-hidden="true"
        />
      )}
      {cell.text && (
        <span className={cn(
          'text-sm font-medium',
          variant === 'inverted' ? 'text-fg-on-brand' : 'text-fg',
        )}>
          {cell.text}
        </span>
      )}
    </span>
  )
}

// ── Tooltip wrapper ───────────────────────────────────────────────────────────

function TooltipLabel({ label, tooltip, labelClass }: {
  label:       string
  tooltip?:    string
  labelClass?: string
}) {
  return (
    <span className="flex items-center gap-xs min-w-0">
      <span className={cn(labelClass ?? 'text-sm font-semibold text-fg', 'truncate')}>{label}</span>
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
  tableStyle = 'clean',
}: Props) {
  const style       = STYLE_CONFIG[tableStyle]
  const featuredIdx = columns.findIndex(c => !!c.badgeText)
  const [activeCol, setActiveCol] = useState(() => featuredIdx >= 0 ? featuredIdx : 0)
  const touchStartX = useRef(0)

  // Elevated card overlay: measured from the featured column header
  const featuredHeaderRef = useRef<HTMLDivElement>(null)
  const tableBodyRef      = useRef<HTMLDivElement>(null)
  const [overlayLeft, setOverlayLeft] = useState<number | null>(null)
  const [overlayWidth, setOverlayWidth] = useState<number | null>(null)

  useEffect(() => {
    if (tableStyle !== 'elevated' || featuredIdx < 0) return

    function measure() {
      if (!featuredHeaderRef.current || !tableBodyRef.current) return
      const hRect = featuredHeaderRef.current.getBoundingClientRect()
      const bRect = tableBodyRef.current.getBoundingClientRect()
      setOverlayLeft(hRect.left - bRect.left)
      setOverlayWidth(hRect.width)
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (featuredHeaderRef.current) ro.observe(featuredHeaderRef.current)
    if (tableBodyRef.current)      ro.observe(tableBodyRef.current)
    return () => ro.disconnect()
  }, [tableStyle, featuredIdx, columns.length])

  const colCount  = columns.length
  const gridStyle = {
    gridTemplateColumns: `minmax(140px, 210px) repeat(${colCount}, minmax(120px, 1fr))`,
  }
  const bgClass = color === 'surface' ? 'bg-surface' : 'bg-canvas'

  const lastDataRowIdx = rows.reduceRight(
    (acc, row, i) => acc === -1 && row.rowType === 'row' ? i : acc,
    -1,
  )

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

  const mobileIsFeatured = activeCol === featuredIdx
  // Elevated and bold both show solid brand + inverted text in mobile featured view
  const mobileInverted   = (tableStyle === 'elevated' || tableStyle === 'bold') && mobileIsFeatured

  return (
    <section className={cn('py-xl px-md lg:px-lg', bgClass)}>

      {/* ── Above-table header ─────────────────────────────────────────────── */}
      {(eyebrow || headline || subHeadline) && (
        <div className="mb-2xl">
          {eyebrow && (
            <p className="text-label tracking-label uppercase font-semibold mb-sm accent-ink">
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
        <div
          className="flex rounded-ot-control border border-fg/10 overflow-hidden"
          role="tablist"
          aria-label="Select column"
        >
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
                  'flex-1 px-sm py-sm text-center transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
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
        {/* Column headers — pt-sm reserves headroom for the featured column's -mt-sm lift */}
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
                  ref={featured && tableStyle === 'elevated' ? featuredHeaderRef : undefined}
                  style={featured ? { background: style.featuredGradient } : undefined}
                  className={cn(
                    'flex flex-col gap-sm px-md pt-md pb-lg items-center text-center',
                    featured && [
                      '-mt-sm rounded-t-ot-surface',
                      'text-fg-on-brand',
                      style.featuredShadow,
                    ],
                    !featured && i > 0 && 'border-l border-fg/8',
                  )}
                >
                  {/* Badge — or fixed spacer so all column names align horizontally */}
                  {col.badgeText ? (
                    <span className={cn(
                      'text-[10px] tracking-widest uppercase font-bold px-sm py-0.5 rounded-full',
                      featured
                        ? 'bg-fg-on-brand/15 text-fg-on-brand'
                        : 'bg-accent/20 text-fg-on-accent'
                    )}>
                      {col.badgeText}
                    </span>
                  ) : (
                    <div className="h-5" aria-hidden="true" />
                  )}

                  {/* Column name */}
                  <p className={cn(
                    'text-title font-black leading-tight',
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
                            'flex items-center justify-center',
                            'rounded-ot-control bg-fg-on-brand text-brand',
                            'text-label font-semibold tracking-label uppercase px-md py-sm',
                            'hover:bg-fg-on-brand/90 transition-colors duration-150 ease-out',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                          )}
                        >
                          {col.ctaLabel}
                        </a>
                      ) : (
                        <Button href={col.ctaHref ?? '#'} size="sm" variant="brand">
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
        <div
          ref={tableBodyRef}
          role="rowgroup"
          className={style.tableBorder}
        >
          {/* ── Elevated card overlay ─────────────────────────────────────────
              Absolutely positioned brand-fill panel spanning the full featured
              column height. Cells above it (z-10) are transparent so this
              provides the consistent brand bg. Bloom + ring give the 3D lift.  */}
          {tableStyle === 'elevated' && featuredIdx >= 0 && overlayLeft !== null && (
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 bg-brand rounded-b-ot-surface pointer-events-none z-0"
              style={{
                left:  overlayLeft,
                width: overlayWidth ?? 0,
                boxShadow: [
                  // Clean card border ring — matches header ring
                  '0 0 0 1.5px oklch(from var(--ot-brand) calc(l * 0.85) c h / 0.5)',
                  // Subtle bottom-only lift shadow
                  '0 8px 28px oklch(from var(--ot-brand) l c h / 0.18)',
                  '0 2px 6px oklch(from var(--ot-brand) l c h / 0.12)',
                ].join(', '),
              }}
            />
          )}

          {rows.map((row, rowIdx) => {

            // ── Group header row ──────────────────────────────────────────
            if (row.rowType === 'group') {
              // Elevated: individual cells so the featured card runs through unbroken
              if (tableStyle === 'elevated' && featuredIdx >= 0) {
                return (
                  <div
                    key={rowIdx}
                    role="row"
                    className={cn('grid border-t border-fg/10', rowIdx === 0 && 'border-t-0')}
                    style={gridStyle}
                  >
                    {/* Label cell: accent fill */}
                    <div role="rowheader" className="px-md py-sm bg-accent">
                      <span className={style.groupText}>{row.label}</span>
                    </div>
                    {/* Per-column: featured cell is transparent (overlay shows through), others accent */}
                    {columns.map((col, ci) => {
                      const isFeat = ci === featuredIdx
                      return (
                        <div
                          key={ci}
                          aria-hidden="true"
                          className={cn(
                            'py-sm',
                            isFeat ? 'relative z-10 bg-transparent' : 'bg-accent',
                          )}
                        />
                      )
                    })}
                  </div>
                )
              }

              // Clean / bold: full-width spanning cell
              return (
                <div
                  key={rowIdx}
                  role="row"
                  className={cn('grid border-t border-fg/10', rowIdx === 0 && 'border-t-0')}
                  style={gridStyle}
                >
                  <div
                    role="rowheader"
                    className={cn('col-span-full px-md py-sm', style.groupBg)}
                    style={{ gridColumn: `1 / ${colCount + 2}` }}
                  >
                    <span className={style.groupText}>{row.label}</span>
                  </div>
                </div>
              )
            }

            // ── Data row ──────────────────────────────────────────────────
            const isLastData = rowIdx === lastDataRowIdx

            return (
              <div
                key={rowIdx}
                role="row"
                className={cn(
                  'grid transition-colors duration-100',
                  style.rowDivider,
                  style.rowHover,
                  rowIdx === 0 && 'border-t-0',
                )}
                style={gridStyle}
              >
                {/* Row label */}
                <div role="rowheader" className="px-md py-md flex items-center">
                  <TooltipLabel
                    label={row.label}
                    tooltip={row.tooltip}
                    labelClass={style.rowLabelClass}
                  />
                </div>

                {/* Cells */}
                {columns.map((col, colIdx) => {
                  const featured      = colIdx === featuredIdx
                  const cellVariant   = featured ? style.featuredCellVariant : 'default'
                  // Bold gets rounded bottom; elevated rounding comes from the overlay
                  const roundedBottom = featured && isLastData && tableStyle === 'bold'

                  return (
                    <div
                      key={colIdx}
                      role="cell"
                      className={cn(
                        'px-md py-md flex items-center justify-center',
                        colIdx > 0 && !featured && 'border-l border-fg/8',
                        featured && style.featuredBodyCell,
                        // Cell-level divider for featured column in elevated + bold:
                        // the row's border-t sits behind the overlay (z-0 paints after normal flow),
                        // so we apply it on the cell itself (z-10) with an on-brand color.
                        featured && (tableStyle === 'elevated' || tableStyle === 'bold') && rowIdx > 0 && 'border-t border-fg-on-brand/10',
                        roundedBottom && 'rounded-b-ot-surface',
                      )}
                    >
                      <CellContent cell={row.cells[colIdx]} variant={cellVariant} />
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
                      'px-md py-sm',
                      style.groupBg,
                      'border-t border-fg/10',
                      rowIdx === 0 && 'border-t-0',
                    )}
                  >
                    <span className={style.groupText}>{row.label}</span>
                  </div>
                </div>
              )
            }

            const cell        = row.cells[activeCol]
            const cellVariant = mobileInverted ? 'inverted' : 'default'

            return (
              <div
                key={rowIdx}
                role="row"
                className={cn(
                  'flex items-center justify-between px-md py-md gap-md',
                  'border-t border-fg/6',
                  rowIdx === 0 && 'border-t-0',
                  mobileInverted    ? 'bg-brand' :
                  mobileIsFeatured  ? 'bg-brand/5' : '',
                )}
              >
                <div role="rowheader" className="min-w-0 flex-1">
                  <TooltipLabel
                    label={row.label}
                    tooltip={row.tooltip}
                    labelClass={mobileInverted
                      ? 'text-sm font-semibold text-fg-on-brand'
                      : style.rowLabelClass
                    }
                  />
                </div>
                <div role="cell" className="shrink-0">
                  <CellContent cell={cell} variant={cellVariant} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
