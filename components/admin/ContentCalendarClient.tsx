'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, ExternalLink, CalendarDays } from 'lucide-react'
import type { CalendarItem } from '@/lib/admin/graph'

// ─── Status config ────────────────────────────────────────────────────────────

type StatusKey = 'Published' | 'Scheduled' | 'Previous' | 'Draft'

const STATUS_CONFIG: Record<StatusKey, {
  label:        string
  chipCls:      string
  pillCls:      string
  pillActiveCls: string
  dotCls:       string
}> = {
  Published: {
    label:         'Published',
    chipCls:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    pillCls:       'border-fg/[0.10] text-fg-muted hover:border-fg/20 hover:text-fg',
    pillActiveCls: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    dotCls:        'bg-emerald-400',
  },
  Scheduled: {
    label:         'Scheduled',
    chipCls:       'bg-brand/[0.09] text-brand border-brand/[0.18]',
    pillCls:       'border-fg/[0.10] text-fg-muted hover:border-fg/20 hover:text-fg',
    pillActiveCls: 'bg-brand/[0.08] border-brand/30 text-brand',
    dotCls:        'bg-brand',
  },
  Previous: {
    label:         'Previous',
    chipCls:       'bg-fg/[0.05] text-fg-muted/80 border-fg/8',
    pillCls:       'border-fg/[0.10] text-fg-muted hover:border-fg/20 hover:text-fg',
    pillActiveCls: 'bg-fg/[0.06] border-fg/20 text-fg-muted',
    dotCls:        'bg-fg-muted/40',
  },
  Draft: {
    label:         'Draft',
    chipCls:       'bg-amber-50 text-amber-700 border-amber-200',
    pillCls:       'border-fg/[0.10] text-fg-muted hover:border-fg/20 hover:text-fg',
    pillActiveCls: 'bg-amber-50 border-amber-300 text-amber-700',
    dotCls:        'bg-amber-400',
  },
}

const ALL_STATUSES: StatusKey[] = ['Published', 'Scheduled', 'Draft', 'Previous']

function normalizeStatus(s: string | null): StatusKey | null {
  const map: Record<string, StatusKey> = {
    published: 'Published',
    scheduled: 'Scheduled',
    previous:  'Previous',
    draft:     'Draft',
  }
  return map[(s ?? '').toLowerCase()] ?? null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December']

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function calendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

function chipCls(status: string | null): string {
  const key = normalizeStatus(status)
  return key ? STATUS_CONFIG[key].chipCls : STATUS_CONFIG.Draft.chipCls
}

function typeLabel(type: string): string {
  return type === 'blog' ? 'Blog Post' : 'Experience'
}

// ─── Calendar chip (visual only — interaction is on the date number) ──────────

function CalendarChip({ item }: { item: CalendarItem }) {
  return (
    <div
      title={item.displayName}
      className={`w-full px-1.25 py-0.5 text-[0.65rem] font-semibold leading-tight truncate border ${chipCls(item.status)}`}
    >
      {item.displayName || 'Untitled'}
    </div>
  )
}

// ─── Day flyout panel ─────────────────────────────────────────────────────────

function DayPanel({
  date,
  items,
  onClose,
}: {
  date:    string
  items:   CalendarItem[]
  onClose: () => void
}) {
  // Parse without timezone shift
  const [yr, mo, dy] = date.split('-').map(Number)
  const d = new Date(yr, mo - 1, dy)
  const weekday   = d.toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Slide-in panel */}
      <div
        role="complementary"
        aria-label={`Content for ${weekday}, ${dateLabel}`}
        className="oa-day-panel fixed top-0 right-0 h-full w-85 z-50 flex flex-col bg-surface border-l border-fg/8"
        style={{ boxShadow: '-8px 0 40px oklch(13% 0.012 170 / 0.12)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-md py-3.5 border-b border-fg/8 shrink-0">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-fg-muted/50 mb-0.75">
              {weekday}
            </p>
            <p className="text-[1rem] font-semibold text-fg leading-tight">
              {dateLabel}
            </p>
            <p className="text-[0.75rem] text-fg-muted mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-fg-muted/40 hover:text-fg-muted transition-colors duration-100 p-1 mt-0.5"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          {items.map(item => {
            const key       = normalizeStatus(item.status)
            const statusCls = key ? STATUS_CONFIG[key].chipCls : STATUS_CONFIG.Draft.chipCls
            return (
              <div
                key={item.key}
                className="flex flex-col gap-1.5 px-md py-3.5 border-b border-fg/5 last:border-none"
              >
                <p className="text-[0.875rem] font-semibold text-fg leading-snug">
                  {item.displayName || 'Untitled'}
                </p>
                <div className="flex items-center gap-sm flex-wrap">
                  <span className={`text-[0.65rem] font-semibold px-1.5 py-0.5 border ${statusCls}`}>
                    {item.status ?? 'Unknown'}
                  </span>
                  <span className="text-[0.75rem] text-fg-muted/60">
                    {typeLabel(item.type)}
                  </span>
                  {item.locale && (
                    <span className="text-[0.65rem] font-mono text-fg-muted/40 uppercase ml-auto">
                      {item.locale}
                    </span>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.25 text-[0.75rem] font-semibold text-brand hover:text-brand-hover transition-colors duration-150 w-fit"
                  >
                    <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
                    View page
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentCalendarClient({ items }: { items: CalendarItem[] }) {
  const today = new Date()
  const [year,           setYear]           = useState(today.getFullYear())
  const [month,          setMonth]          = useState(today.getMonth())
  const [selectedDate,   setSelectedDate]   = useState<string | null>(null)
  const [activeStatuses, setActiveStatuses] = useState<Set<StatusKey>>(new Set(ALL_STATUSES))

  const prevMonth = useCallback(() => {
    setSelectedDate(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else              { setMonth(m => m - 1) }
  }, [month])

  const nextMonth = useCallback(() => {
    setSelectedDate(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else               { setMonth(m => m + 1) }
  }, [month])

  function toggleStatus(key: StatusKey) {
    setActiveStatuses(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const rows    = useMemo(() => calendarGrid(year, month), [year, month])
  const todayMs = new Date().setHours(0, 0, 0, 0)

  const filteredItems = useMemo(() =>
    items.filter(item => {
      const key = normalizeStatus(item.status)
      return key ? activeStatuses.has(key) : activeStatuses.has('Draft')
    }),
    [items, activeStatuses],
  )

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of filteredItems) {
      if (!item.published) continue
      const key = isoDate(new Date(item.published))
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return map
  }, [filteredItems])

  const monthItemCount = useMemo(() =>
    [...itemsByDate.entries()]
      .filter(([key]) => {
        const d = new Date(key)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, [, arr]) => sum + arr.length, 0),
    [itemsByDate, year, month],
  )

  const selectedDayItems = selectedDate ? (itemsByDate.get(selectedDate) ?? []) : null

  return (
    <div>
      {/* ── Status filters ─── */}
      <div className="flex items-center gap-sm flex-wrap mb-md">
        <span className="text-[0.75rem] font-medium text-fg-muted/60 mr-xs">Filter:</span>
        {ALL_STATUSES.map(key => {
          const cfg    = STATUS_CONFIG[key]
          const active = activeStatuses.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleStatus(key)}
              className={[
                'flex items-center gap-1.5 px-sm py-1 text-[0.75rem] font-semibold border',
                'transition-[color,background-color,border-color] duration-120',
                active ? cfg.pillActiveCls : cfg.pillCls,
              ].join(' ')}
              aria-pressed={active}
            >
              <span className={`w-1.75 h-1.75 shrink-0 ${cfg.dotCls}`} aria-hidden="true" />
              {cfg.label}
            </button>
          )
        })}
        {activeStatuses.size < ALL_STATUSES.length && (
          <button
            type="button"
            onClick={() => setActiveStatuses(new Set(ALL_STATUSES))}
            className="text-[0.75rem] font-medium text-fg-muted/50 hover:text-fg-muted transition-colors duration-120 ml-xs"
          >
            Show all
          </button>
        )}
      </div>

      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <h2 className="text-[1.0625rem] font-semibold text-fg">
            {MONTHS[month]} {year}
          </h2>
          {monthItemCount > 0 && (
            <span className="text-[0.8125rem] text-fg-muted">
              — {monthItemCount} item{monthItemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-xs">
          <button type="button" aria-label="Previous month" onClick={prevMonth}
            className="p-1.75 text-fg-muted hover:text-fg hover:bg-fg/5 transition-colors duration-100">
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <button type="button" aria-label="Next month" onClick={nextMonth}
            className="p-1.75 text-fg-muted hover:text-fg hover:bg-fg/5 transition-colors duration-100">
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="border border-fg/8">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-fg/8 bg-fg/1.5">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/60">
              {d}
            </div>
          ))}
        </div>

        {/* Date rows */}
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 border-b border-fg/6 last:border-none">
            {row.map((cell, ci) => {
              if (!cell) {
                return (
                  <div key={ci} className="min-h-22 p-1.25 border-r border-fg/5 last:border-none bg-fg/[0.012]" />
                )
              }

              const key      = isoDate(cell)
              const dayItems = itemsByDate.get(key) ?? []
              const isToday  = new Date(cell).setHours(0,0,0,0) === todayMs
              const isPast   = new Date(cell).setHours(0,0,0,0) < todayMs
              const hasItems = dayItems.length > 0

              return (
                <div
                  key={key}
                  className={[
                    'min-h-22 p-1.25 border-r border-fg/5 last:border-none flex flex-col gap-0.75',
                    isPast && !isToday ? 'bg-fg/[0.008]' : '',
                  ].join(' ')}
                >
                  {/* Date number — clickable when there are items */}
                  <button
                    type="button"
                    onClick={hasItems ? () => setSelectedDate(key) : undefined}
                    disabled={!hasItems}
                    aria-label={hasItems ? `${dayItems.length} item${dayItems.length !== 1 ? 's' : ''} on ${cell.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : undefined}
                    className={[
                      'text-[0.75rem] font-semibold mb-0.5 w-5.5 h-5.5 flex items-center justify-center shrink-0 transition-colors duration-100',
                      hasItems && !isToday ? 'hover:bg-brand/12 hover:text-brand cursor-pointer' : '',
                      !hasItems ? 'cursor-default' : '',
                      isToday  ? 'bg-brand text-fg-on-brand' :
                      isPast   ? 'text-fg-muted/35' :
                                 'text-fg-muted',
                    ].join(' ')}
                  >
                    {cell.getDate()}
                  </button>

                  {dayItems.slice(0, 3).map(item => (
                    <CalendarChip key={item.key} item={item} />
                  ))}
                  {dayItems.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className="text-[0.65rem] text-fg-muted/60 font-medium px-1.25 hover:text-brand transition-colors duration-100 text-left"
                    >
                      +{dayItems.length - 3} more
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-md mt-sm flex-wrap">
        {ALL_STATUSES.map(key => (
          <div key={key} className="flex items-center gap-1.25">
            <span className={`w-2 h-2 shrink-0 ${STATUS_CONFIG[key].dotCls}`} aria-hidden="true" />
            <span className="text-[0.75rem] text-fg-muted">{STATUS_CONFIG[key].label}</span>
          </div>
        ))}
        <p className="text-[0.7rem] text-fg-muted/40 ml-auto italic">Click a date to see all items</p>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-md py-2xl text-center">
          <CalendarDays size={36} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <p className="text-[0.9375rem] text-fg-muted/60">No content found in the CMS.</p>
        </div>
      )}

      {/* Day flyout */}
      {selectedDate && selectedDayItems && (
        <DayPanel
          date={selectedDate}
          items={selectedDayItems}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
