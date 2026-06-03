'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, ExternalLink, CalendarDays } from 'lucide-react'
import type { CalendarItem } from '@/lib/admin/graph'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December']

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function calendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  // Monday-first: convert Sunday (0) to 6, others to day-1
  const startDow = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ]
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

function statusColor(status: string | null): string {
  switch ((status ?? '').toLowerCase()) {
    case 'published': return 'bg-accent/[0.12] text-accent border-accent/[0.20]'
    case 'scheduled': return 'bg-brand/[0.10] text-brand border-brand/[0.18]'
    default:          return 'bg-fg/[0.06] text-fg-muted border-fg/[0.10]'
  }
}

function typeLabel(type: string): string {
  return type === 'blog' ? 'Blog Post' : 'Experience'
}

// ─── Item chip ────────────────────────────────────────────────────────────────

function CalendarChip({
  item,
  onClick,
}: {
  item:    CalendarItem
  onClick: (item: CalendarItem) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      title={item.displayName}
      className={[
        'w-full text-left px-[5px] py-[2px] text-[0.65rem] font-semibold leading-tight truncate',
        'border transition-opacity duration-100 hover:opacity-75',
        statusColor(item.status),
      ].join(' ')}
    >
      {item.displayName || 'Untitled'}
    </button>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  item,
  onClose,
}: {
  item:    CalendarItem
  onClose: () => void
}) {
  const published = item.published ? new Date(item.published) : null
  const dateStr   = published
    ? published.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown date'

  return (
    <div
      className="w-[280px] shrink-0 border-l border-fg/[0.08] bg-surface flex flex-col"
      role="complementary"
      aria-label="Content details"
    >
      <div className="flex items-center justify-between px-md py-[11px] border-b border-fg/[0.08]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">Details</p>
        <button
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="text-fg-muted/50 hover:text-fg-muted transition-colors duration-100"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-lg px-md py-md flex-1 overflow-y-auto">
        {/* Title */}
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60 mb-xs">Title</p>
          <p className="text-[0.9375rem] font-semibold text-fg leading-snug">
            {item.displayName || 'Untitled'}
          </p>
        </div>

        {/* Type + Status row */}
        <div className="flex gap-lg">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60 mb-xs">Type</p>
            <span className="text-[0.8125rem] font-medium text-fg">{typeLabel(item.type)}</span>
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60 mb-xs">Status</p>
            <span className={`text-[0.75rem] font-semibold px-[6px] py-[2px] border ${statusColor(item.status)}`}>
              {item.status ?? 'Unknown'}
            </span>
          </div>
        </div>

        {/* Date */}
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60 mb-xs">Published</p>
          <p className="text-[0.8125rem] text-fg-muted">{dateStr}</p>
        </div>

        {/* Locale */}
        {item.locale && (
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60 mb-xs">Locale</p>
            <p className="text-[0.8125rem] text-fg-muted font-medium uppercase">{item.locale}</p>
          </div>
        )}

        {/* Link */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-sm text-[0.8125rem] font-semibold text-brand hover:text-brand-hover transition-colors duration-150 mt-auto"
          >
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
            View page
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContentCalendarClient({ items }: { items: CalendarItem[] }) {
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [selected, setSelected] = useState<CalendarItem | null>(null)

  const prevMonth = useCallback(() => {
    setSelected(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else              { setMonth(m => m - 1) }
  }, [month])

  const nextMonth = useCallback(() => {
    setSelected(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else               { setMonth(m => m + 1) }
  }, [month])

  const rows    = useMemo(() => calendarGrid(year, month), [year, month])
  const todayMs = today.setHours(0, 0, 0, 0)

  // Build a map of date string → items
  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of items) {
      if (!item.published) continue
      const d   = new Date(item.published)
      const key = isoDate(d)
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return map
  }, [items])

  const monthItemCount = useMemo(() =>
    [...itemsByDate.entries()]
      .filter(([key]) => {
        const d = new Date(key)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, [, arr]) => sum + arr.length, 0),
    [itemsByDate, year, month],
  )

  return (
    <div>
      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <h2 className="text-[1.0625rem] font-semibold text-fg">
            {MONTHS[month]} {year}
          </h2>
          {monthItemCount > 0 && (
            <span className="text-[0.75rem] text-fg-muted font-medium">
              — {monthItemCount} item{monthItemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            aria-label="Previous month"
            onClick={prevMonth}
            className="p-[7px] text-fg-muted hover:text-fg hover:bg-fg/[0.05] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={nextMonth}
            className="p-[7px] text-fg-muted hover:text-fg hover:bg-fg/[0.05] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          >
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* ── Calendar grid + detail panel ── */}
      <div className="flex gap-0 border border-fg/[0.08]">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-fg/[0.08]">
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className="py-[7px] text-center text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/60"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date rows */}
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 border-b border-fg/[0.06] last:border-none">
              {row.map((cell, ci) => {
                if (!cell) {
                  return (
                    <div
                      key={ci}
                      className={[
                        'min-h-[90px] p-[5px] border-r border-fg/[0.06] last:border-none',
                        'bg-fg/[0.015]',
                      ].join(' ')}
                    />
                  )
                }

                const key      = isoDate(cell)
                const dayItems = itemsByDate.get(key) ?? []
                const isToday  = cell.setHours(0,0,0,0) === todayMs
                const isPast   = cell.setHours(0,0,0,0) < todayMs

                return (
                  <div
                    key={key}
                    className={[
                      'min-h-[90px] p-[5px] border-r border-fg/[0.06] last:border-none flex flex-col gap-[3px]',
                      isPast && !isToday ? 'bg-fg/[0.01]' : '',
                    ].join(' ')}
                  >
                    {/* Day number */}
                    <div className={[
                      'text-[0.75rem] font-semibold mb-[3px] w-[22px] h-[22px] flex items-center justify-center',
                      isToday
                        ? 'bg-brand text-fg-on-brand'
                        : isPast
                          ? 'text-fg-muted/40'
                          : 'text-fg-muted',
                    ].join(' ')}>
                      {cell.getDate()}
                    </div>

                    {/* Items */}
                    {dayItems.slice(0, 3).map(item => (
                      <CalendarChip
                        key={item.key}
                        item={item}
                        onClick={setSelected}
                      />
                    ))}
                    {dayItems.length > 3 && (
                      <p className="text-[0.65rem] text-fg-muted/60 font-medium px-[5px]">
                        +{dayItems.length - 3} more
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel item={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-md mt-md">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/50">Status</p>
        {[
          { label: 'Published', cls: 'bg-accent/[0.12] border-accent/[0.20]' },
          { label: 'Scheduled', cls: 'bg-brand/[0.10] border-brand/[0.18]'  },
          { label: 'Draft',     cls: 'bg-fg/[0.06] border-fg/[0.10]'        },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-xs">
            <span className={`w-3 h-3 border ${cls}`} aria-hidden="true" />
            <span className="text-[0.75rem] text-fg-muted font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-md pointer-events-none">
          <CalendarDays size={40} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <p className="text-[0.9375rem] text-fg-muted/60">No content found in the CMS.</p>
        </div>
      )}
    </div>
  )
}
