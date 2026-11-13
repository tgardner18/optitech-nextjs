'use client'

/**
 * ComparisonTableBlock
 *
 * A native <table> on wide containers and a plan picker + definition list on narrow ones.
 * Presentation lives in components/blocks/comparison-table.css, keyed on the data attributes
 * below. The featured column is styled cell by cell from [data-featured]; there is no
 * measuring script and no overlay.
 */

import { useId, useRef, useState } from 'react'
import {
  Check, Minus, X, CircleCheck, CircleMinus,
  Star, Zap, Shield, Lock, Unlock, Clock,
  Infinity as InfinityIcon, MessageCircle,
  Users, Globe, Database, Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

// ── Icons ─────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  'check': Check, 'minus': Minus, 'xmark': X, 'circle-check': CircleCheck, 'circle-minus': CircleMinus,
  'star': Star, 'zap': Zap, 'shield': Shield, 'lock': Lock, 'unlock': Unlock, 'clock': Clock,
  'infinity': InfinityIcon, 'message-circle': MessageCircle, 'users': Users, 'globe': Globe, 'database': Database,
}

const YES = new Set(['check', 'circle-check'])
const NO  = new Set(['minus', 'circle-minus', 'xmark'])

/** Text alternatives, so icon-only cells aren't silent to screen readers. */
const SR_TEXT: Record<string, string> = {
  'check': 'Included', 'circle-check': 'Included', 'minus': 'Not included', 'circle-minus': 'Not included',
  'xmark': 'Not included', 'infinity': 'Unlimited',
}

// ── Cell + tooltip ────────────────────────────────────────────────────────────

function CellContent({ cell }: { cell: ComparisonCell | undefined }) {
  if (!cell || cell.isEmpty || (!cell.icon && !cell.text)) {
    return (
      <>
        <span data-part="dash" aria-hidden="true">—</span>
        <span className="sr-only">Not applicable</span>
      </>
    )
  }
  const Icon = cell.icon ? ICON_MAP[cell.icon] : undefined
  const kind = cell.icon && YES.has(cell.icon) ? 'yes' : cell.icon && NO.has(cell.icon) ? 'no' : 'info'
  const sr   = cell.icon && !cell.text ? SR_TEXT[cell.icon] : undefined
  return (
    <span data-part="val">
      {Icon && (
        <span data-part="mark" data-kind={kind} aria-hidden="true">
          <Icon strokeWidth={kind === 'yes' ? 2.75 : 2.25} />
        </span>
      )}
      {sr && <span className="sr-only">{sr}</span>}
      {cell.text && <span>{cell.text}</span>}
    </span>
  )
}

function Tip({ id, text }: { id: string; text: string }) {
  return (
    <span data-part="tip">
      <button type="button" data-part="info" aria-describedby={id}>
        <span className="sr-only">More information</span>
        <Info strokeWidth={2} aria-hidden="true" />
      </button>
      <span data-part="tooltip" role="tooltip" id={id}>{text}</span>
    </span>
  )
}

function PlanInner({ col, featured }: { col: ComparisonColumn; featured: boolean }) {
  return (
    <span data-part="plan-in">
      {col.badgeText && <span data-part="badge">{col.badgeText}</span>}
      <span data-part="plan-name">{col.label}</span>
      {col.subLabel && <span data-part="price">{col.subLabel}</span>}
      {col.ctaLabel && (
        <a href={col.ctaHref ?? '#'} data-part="cta" data-kind={featured ? 'primary' : 'secondary'}>{col.ctaLabel}</a>
      )}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComparisonTableBlock({
  eyebrow,
  headline,
  subHeadline,
  columns,
  rows,
  color = 'canvas',
  tableStyle = 'clean',
}: Props) {
  const uid         = useId().replace(/:/g, '')
  const headingId   = `ct-${uid}-h`
  const featuredIdx = columns.findIndex(c => !!c.badgeText)
  const [active, setActive] = useState(() => (featuredIdx >= 0 ? featuredIdx : 0))
  const touchX = useRef(0)
  const n = columns.length
  const sel = columns[Math.min(active, n - 1)]
  const hasHead = Boolean(eyebrow || headline || subHeadline)

  function onKey(e: React.KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const k = e.key === 'ArrowRight' ? (active + 1) % n : e.key === 'ArrowLeft' ? (active - 1 + n) % n : e.key === 'Home' ? 0 : n - 1
    setActive(k)
    document.getElementById(`ct-${uid}-p${k}`)?.focus()
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 64) setActive(p => (dx < 0 ? Math.min(p + 1, n - 1) : Math.max(p - 1, 0)))
  }

  return (
    <section data-block="comparison" data-color={color} data-style={tableStyle} data-cols={n}>
      <div data-part="inner">

        {hasHead && (
          <header data-part="head">
            {eyebrow && <p data-part="eyebrow">{eyebrow}</p>}
            {headline && <h2 data-part="headline" id={headingId}>{headline}</h2>}
            {subHeadline && <p data-part="sub">{subHeadline}</p>}
          </header>
        )}

        {/* ── Wide: a real table ──────────────────────────────────────────── */}
        <div data-part="wide">
          <table data-part="table" aria-labelledby={headline ? headingId : undefined}>
            <colgroup>
              <col data-part="col-label" />
              {columns.map((_, i) => <col key={i} />)}
            </colgroup>
            <thead>
              <tr>
                <td aria-hidden="true" />
                {columns.map((col, i) => (
                  <th key={i} scope="col" data-part="plan" data-featured={i === featuredIdx ? '' : undefined}>
                    <PlanInner col={col} featured={i === featuredIdx} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) =>
                row.rowType === 'group' ? (
                  <tr key={ri} data-part="group">
                    <th scope="colgroup">{row.label}</th>
                    {columns.map((_, ci) => <td key={ci} aria-hidden="true" data-featured={ci === featuredIdx ? '' : undefined} />)}
                  </tr>
                ) : (
                  <tr key={ri} data-part="row">
                    <th scope="row">
                      <span data-part="feature">
                        {row.label}
                        {row.tooltip && <Tip id={`ct-${uid}-t${ri}`} text={row.tooltip} />}
                      </span>
                    </th>
                    {columns.map((_, ci) => (
                      <td key={ci} data-featured={ci === featuredIdx ? '' : undefined}>
                        <CellContent cell={row.cells[ci]} />
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {/* ── Narrow: plan picker, the plan's price and button, then its rows ── */}
        {sel && (
          <div data-part="narrow" onTouchStart={e => { touchX.current = e.touches[0].clientX }} onTouchEnd={onTouchEnd}>
            <div data-part="picker" role="tablist" aria-label="Choose a plan to see its details" onKeyDown={onKey}>
              {columns.map((col, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`ct-${uid}-p${i}`}
                  data-part="pick"
                  data-featured={i === featuredIdx ? '' : undefined}
                  aria-selected={i === active}
                  aria-controls={`ct-${uid}-panel`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                >
                  {col.label}
                  {col.badgeText && <small>{col.badgeText}</small>}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`ct-${uid}-panel`} aria-labelledby={`ct-${uid}-p${active}`}>
              <div data-part="plan-card" data-featured={active === featuredIdx ? '' : undefined}>
                <PlanInner col={sel} featured={active === featuredIdx} />
              </div>
              <dl data-part="mrows">
                {rows.map((row, ri) =>
                  row.rowType === 'group' ? (
                    <div key={ri} role="heading" aria-level={3} data-part="mgroup">{row.label}</div>
                  ) : (
                    <div key={ri} data-part="mrow">
                      <dt>
                        <span data-part="feature">
                          {row.label}
                          {row.tooltip && <Tip id={`ct-${uid}-m${ri}`} text={row.tooltip} />}
                        </span>
                      </dt>
                      <dd><CellContent cell={row.cells[active]} /></dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
