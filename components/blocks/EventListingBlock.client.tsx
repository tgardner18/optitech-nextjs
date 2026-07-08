'use client'

import { useState, useMemo, useCallback, useId } from 'react'
import {
  LayoutGrid, List, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, ChevronRight as ChevronGo,
  MapPin, Video, Award, CalendarX2, ArrowRight,
} from 'lucide-react'
import type { EventCardData } from '@/lib/events'
import {
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
  formatEventLocation,
  formatCredit,
  eventDateBlock,
  isUpcoming,
  startOfDay,
} from '@/lib/eventFormat'

// ─── Types ────────────────────────────────────────────────────────────────────

type View  = 'card' | 'list' | 'calendar'
type Color = 'canvas' | 'surface'

export type EventListingClientProps = {
  events:         EventCardData[]
  maxItems?:      number
  defaultView:    View
  color:          Color
  showViewToggle: boolean
  showTypeFilter: boolean
  pastMode:       'hide' | 'show' | 'toggle'
  /** True when the editor locked the listing to one type — suppresses chips. */
  typeLocked:     boolean
  /** Server-stamped ISO "now" — keeps the upcoming/past split + today marker stable. */
  nowIso:         string
}

// Canonical type ordering for the filter chips.
const TYPE_ORDER = ['webinar', 'conference', 'workshop', 'seminar', 'community', 'screening', 'training']

// ─── Color helpers ──────────────────────────────────────────────────────────────
// Cards sit one elevation off the section ground: surface-on-canvas, canvas-on-surface.

function cardSurface(color: Color): string {
  return color === 'surface' ? 'bg-canvas' : 'bg-surface'
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

// Date numerals: Poppins (the body/display sans), NEVER the `font-display` role
// — that resolves to Syne, whose slanted geometry reads as italic and is banned
// below headline scale (DESIGN.md). Explicitly upright + tabular so single/double
// digit days share a baseline. Size and weight are set per context.
const DAY_NUMERAL = 'font-sans not-italic tabular-nums tracking-[-0.03em]'
// Month abbreviation: 11px / 600 / 0.12em tracked uppercase. Colour per context.
const MONTH_LABEL = 'font-semibold uppercase tracking-[0.12em] text-[0.6875rem] leading-none'

// Event type badge — one treatment for every type (accent fill signals "category
// label"; the text says which category). Sharp corners, label scale. Position is
// supplied by the caller (absolute overlay in cards, inline in list rows).
function TypeBadge({ type, className = '' }: { type: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-ot-control bg-brand text-fg-on-brand px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] leading-none ${className}`}>
      {eventTypeLabel(type)}
    </span>
  )
}

function CreditPill({ event }: { event: EventCardData }) {
  const label = formatCredit(event.creditType, event.creditHours)
  if (!label) return null
  return (
    <span className="inline-flex items-center gap-xs text-label font-semibold text-fg-muted">
      <Award size={13} strokeWidth={2} className="text-brand" aria-hidden />
      {label}
    </span>
  )
}

function LocationLine({ event, className = '' }: { event: EventCardData; className?: string }) {
  const line = formatEventLocation(event)
  if (!line) return null
  const Icon = event.locationType === 'virtual' ? Video : MapPin
  return (
    <span className={`inline-flex items-center gap-xs text-label text-fg-muted min-w-0 ${className}`}>
      <Icon size={13} strokeWidth={2} className="flex-none text-fg-muted/70" aria-hidden />
      <span className="truncate">{line}</span>
    </span>
  )
}

// ─── Card view ──────────────────────────────────────────────────────────────────

function EventCard({ event, color }: { event: EventCardData; color: Color }) {
  const href  = event.url ?? '#'
  const block = eventDateBlock(event.startDate)

  return (
    <a
      href={href}
      className={`group flex flex-col rounded-ot-surface overflow-hidden card-hover-lift border border-fg/10 ${cardSurface(color)}
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
    >
      {/* Media / date panel */}
      <div className="relative aspect-video overflow-hidden">
        {event.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt=""
              aria-hidden
              loading="lazy"
              className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            {/* Date chip over the image */}
            {block && (
              <span className="absolute bottom-0 left-0 bg-canvas/85 [backdrop-filter:blur(6px)] px-sm py-xs text-label font-semibold text-fg">
                {formatEventDate(event.startDate, event.endDate)}
              </span>
            )}
          </>
        ) : (
          // No-image: a deliberate typographic card — the date is the anchor,
          // floating over a soft radial brand bloom on a brand-tinted surface.
          <div className="relative w-full h-full bg-brand/8 overflow-hidden flex flex-col items-center justify-center" aria-hidden>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 62% 62% at 50% 48%, var(--ot-bloom-brand-faint) 0%, transparent 70%)' }}
            />
            {block ? (
              <div className="relative flex flex-col items-center">
                <span className={`${MONTH_LABEL} text-brand/70`}>{block.month}</span>
                <span className={`${DAY_NUMERAL} text-[clamp(2.5rem,6vw,3.5rem)] leading-none font-extrabold text-brand mt-0.5`}>{block.day}</span>
              </div>
            ) : (
              <CalendarIcon size={32} strokeWidth={1.5} className="relative text-brand/50" />
            )}
          </div>
        )}
        {/* Type badge — overlays the top-left of the media / placeholder area */}
        {event.eventType && <TypeBadge type={event.eventType} className="absolute top-3 left-3" />}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-sm px-md pt-md pb-lg flex-1">
        <h3 className="text-title leading-title font-semibold text-fg text-balance line-clamp-3">
          {event.title}
        </h3>
        <div className="mt-auto flex flex-col gap-xs">
          <LocationLine event={event} />
          <CreditPill event={event} />
        </div>
      </div>
    </a>
  )
}

// ─── List view ──────────────────────────────────────────────────────────────────

// Calendar tear-off: brand-bloom chromatic surface anchored by a 2px top accent
// line (a top edge — not a banned side-stripe). The day numeral dominates; the
// month sits above it, small and tracked. Reads identically on canvas/surface.
const DATE_BLOCK_SURFACE =
  'flex-none w-16 bg-brand/8 border-t-2 border-brand shadow-[0_4px_16px_var(--ot-bloom-brand-faint)]'

function DateBlock({ event }: { event: EventCardData }) {
  const block = eventDateBlock(event.startDate)
  if (!block) {
    return (
      <div className={`${DATE_BLOCK_SURFACE} h-16 flex items-center justify-center text-brand/50`} aria-hidden>
        <CalendarIcon size={20} strokeWidth={1.5} />
      </div>
    )
  }
  return (
    <div className={`${DATE_BLOCK_SURFACE} flex flex-col items-center justify-center gap-0.5 py-sm`} aria-hidden>
      <span className={`${MONTH_LABEL} text-fg-muted`}>{block.month}</span>
      <span className={`${DAY_NUMERAL} text-3xl leading-none font-extrabold text-brand`}>{block.day}</span>
    </div>
  )
}

function EventListRow({ event }: { event: EventCardData }) {
  const href = event.url ?? '#'
  const time = formatEventTime(event.startDate, event.endDate)
  return (
    <a
      href={href}
      className="group flex items-stretch gap-md py-md border-b border-fg/8 last:border-b-0
        transition-colors duration-150 ease-quick
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <DateBlock event={event} />
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-xs">
        {event.eventType && <TypeBadge type={event.eventType} className="self-start" />}
        <h3 className="text-title leading-title font-semibold text-fg text-balance group-hover:underline decoration-fg/20 underline-offset-2">
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-md gap-y-xs">
          <span className="text-label text-fg-muted">{formatEventDate(event.startDate, event.endDate)}{time && ` · ${time}`}</span>
          <LocationLine event={event} />
          <CreditPill event={event} />
        </div>
      </div>
      <div className="hidden sm:flex items-center shrink-0 text-fg-muted/40 group-hover:text-brand transition-transform duration-150 group-hover:translate-x-0.5">
        <ChevronGo size={18} strokeWidth={1.75} aria-hidden />
      </div>
    </a>
  )
}

// ─── Calendar view ────────────────────────────────────────────────────────────

type DayInfo = { date: Date; key: string }

// Calendar layout constants (px). The numeral zone sits at the top of every cell;
// multi-day bars stack in lanes below it; single-day pills flow below the bars.
const NUMERAL_ZONE = 24   // h-6 — top strip holding the date numeral
const BAR_H        = 22   // one multi-day lane (18px bar + 4px gap)
const MAX_BARS     = 3    // visible multi-day lanes per week
const MAX_PILLS    = 3    // visible single-day pills per day

function ymKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function dayMs(d: Date): number {
  return startOfDay(d).getTime()
}

function eventStartEnd(event: EventCardData): { start: number; end: number } | null {
  if (!event.startDate) return null
  const start = new Date(event.startDate)
  if (Number.isNaN(start.getTime())) return null
  const endRaw = event.endDate ? new Date(event.endDate) : start
  const end = Number.isNaN(endRaw.getTime()) ? start : endRaw
  return { start: dayMs(start), end: dayMs(end) }
}

function eventCoversDay(event: EventCardData, day: Date): boolean {
  const se = eventStartEnd(event)
  if (!se) return false
  const d = dayMs(day)
  return d >= se.start && d <= se.end
}

function isMultiDay(event: EventCardData): boolean {
  const se = eventStartEnd(event)
  return !!se && se.end > se.start
}

// Greedy lane-packing of the multi-day events that overlap one week (7 columns).
// Returns each placement's column span + lane, and the lane count used (capped).
type Span = {
  event: EventCardData
  colStart: number
  colEnd: number
  lane: number
  continuesLeft: boolean
  continuesRight: boolean
}

function placeMultiDay(week: (DayInfo | null)[], events: EventCardData[]): { spans: Span[]; laneCount: number } {
  const raw: Omit<Span, 'lane'>[] = []
  for (const e of events) {
    if (!isMultiDay(e)) continue
    const se = eventStartEnd(e)!
    let colStart = -1, colEnd = -1
    for (let c = 0; c < 7; c++) {
      const cell = week[c]
      if (cell && eventCoversDay(e, cell.date)) {
        if (colStart < 0) colStart = c
        colEnd = c
      }
    }
    if (colStart < 0) continue
    raw.push({
      event: e,
      colStart,
      colEnd,
      continuesLeft:  se.start < dayMs(week[colStart]!.date),
      continuesRight: se.end   > dayMs(week[colEnd]!.date),
    })
  }
  // Longest spans first, then left-to-right, so big bars settle into low lanes.
  raw.sort((a, b) => (b.colEnd - b.colStart) - (a.colEnd - a.colStart) || a.colStart - b.colStart)
  const laneEnds: number[] = []
  const spans: Span[] = []
  for (const s of raw) {
    let lane = laneEnds.findIndex(end => s.colStart > end)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(s.colEnd) }
    else laneEnds[lane] = s.colEnd
    if (lane < MAX_BARS) spans.push({ ...s, lane })
  }
  return { spans, laneCount: Math.min(laneEnds.length, MAX_BARS) }
}

// Single-day event strip inside a calendar cell: start time (mono), type badge,
// then the title. A brand-tinted fill + full 1px border reads as an event strip
// (DESIGN.md prohibits side-stripe borders > 1px, so no left accent rule here).
function CalendarPill({ event }: { event: EventCardData }) {
  const time = formatEventTime(event.startDate)
  return (
    <span className="block overflow-hidden rounded-ot-control bg-brand/10 border border-brand/25 px-1.5 py-1 leading-tight">
      {time && <span className="block font-mono text-[10px] text-fg-muted leading-none">{time}</span>}
      {event.eventType && (
        <span className="inline-block bg-accent text-fg-on-accent text-[8px] font-bold uppercase tracking-wider px-1 leading-[1.4] mt-0.5">
          {eventTypeLabel(event.eventType)}
        </span>
      )}
      <span className="block truncate text-xs font-medium text-fg leading-tight mt-0.5">{event.title}</span>
    </span>
  )
}

function CalendarView({ events, color, now }: { events: EventCardData[]; color: Color; now: Date }) {
  const [cursor, setCursor]       = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected]   = useState<string | null>(null)
  const labelId                   = useId()

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(cursor),
    [cursor],
  )

  // Build the calendar matrix (leading blanks + days of the month).
  const cells = useMemo<(DayInfo | null)[]>(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth()
    const firstWeekday = new Date(y, m, 1).getDay() // 0 = Sun
    const daysInMonth  = new Date(y, m + 1, 0).getDate()
    const out: (DayInfo | null)[] = []
    for (let i = 0; i < firstWeekday; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d)
      out.push({ date, key: `${ymKey(date)}-${String(d).padStart(2, '0')}` })
    }
    return out
  }, [cursor])

  // Pad to whole weeks (trailing blanks) and chunk into rows of 7 so each week
  // can host its own multi-day strip overlay.
  const weeks = useMemo<(DayInfo | null)[][]>(() => {
    const padded = [...cells]
    while (padded.length % 7 !== 0) padded.push(null)
    const out: (DayInfo | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7))
    return out
  }, [cells])

  // Events visible in the current month, and a per-day index.
  const monthEvents = useMemo(
    () => events.filter(e => {
      if (!e.startDate) return false
      const s = new Date(e.startDate)
      const en = e.endDate ? new Date(e.endDate) : s
      // overlaps the visible month
      return !(en < new Date(cursor.getFullYear(), cursor.getMonth(), 1) ||
               s > new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))
    }).sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? '')),
    [events, cursor],
  )

  const eventsForDay = useCallback(
    (day: Date) => monthEvents.filter(e => eventCoversDay(e, day)),
    [monthEvents],
  )

  const todayKey = `${ymKey(now)}-${String(now.getDate()).padStart(2, '0')}`
  const selectedDate = selected
    ? cells.find(c => c?.key === selected)?.date ?? null
    : null
  const agendaEvents = selectedDate ? eventsForDay(selectedDate) : []

  const goMonth = useCallback((delta: number) => {
    setCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1))
    setSelected(null)
  }, [])

  // Jump to the next month (forward, then backward) that actually has events.
  const jumpToEvents = useCallback(() => {
    const all = events
      .map(e => (e.startDate ? new Date(e.startDate) : null))
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())
    if (!all.length) return
    const future = all.find(d => d >= new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
    const target = future ?? all[0]
    setCursor(new Date(target.getFullYear(), target.getMonth(), 1))
    setSelected(null)
  }, [events, cursor])

  const navBtn = 'inline-flex items-center justify-center w-11 h-11 rounded-ot-control border border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-md">
        <h3 id={labelId} className="text-[1.75rem] leading-none tracking-[-0.02em] font-bold text-fg">{monthLabel}</h3>
        <div className="flex items-center gap-xs">
          <button type="button" className={navBtn} aria-label="Previous month" onClick={() => goMonth(-1)}>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="px-sm h-9 rounded-ot-control border border-fg/15 text-label uppercase tracking-label font-semibold text-fg-muted hover:border-fg/30 hover:text-fg transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => { setCursor(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(null) }}
          >
            Today
          </button>
          <button type="button" className={navBtn} aria-label="Next month" onClick={() => goMonth(1)}>
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Desktop calendar. Presented as a labelled group of day toggle buttons
          (natively Tab-operable) rather than role="grid" — an ARIA grid contracts
          for 2D arrow-key navigation we don't implement, so the honest semantics
          are a group. Each day's aria-label carries its full weekday + date, so
          the visual weekday header is decorative (aria-hidden). */}
      <div className="hidden sm:block" role="group" aria-labelledby={labelId}>
        {/* Weekday header — decorative; day buttons announce the full weekday */}
        <div className="grid grid-cols-7 border-t border-l border-fg/10" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="border-r border-b border-fg/10 px-xs py-xs text-label uppercase tracking-label font-semibold text-fg-muted/70 text-center">
              {d}
            </div>
          ))}
        </div>
        {/* Day cells — one grid per week, each with a multi-day strip overlay */}
        <div className="border-l border-fg/10">
          {weeks.map((week, wi) => {
            const { spans, laneCount } = placeMultiDay(week, monthEvents)
            return (
              <div key={wi} className="relative grid grid-cols-7">
                {week.map((cell, col) => {
                  if (!cell) {
                    return <div key={`b-${wi}-${col}`} aria-hidden className="border-r border-b border-fg/10 bg-fg/2 min-h-20 lg:min-h-30" />
                  }
                  const dayEvents = eventsForDay(cell.date)
                  const singles   = dayEvents.filter(e => !isMultiDay(e))
                  const shown     = singles.slice(0, MAX_PILLS)
                  const hidden    = singles.length - shown.length
                  const isToday   = cell.key === todayKey
                  const isSel     = cell.key === selected
                  const hasEvents = dayEvents.length > 0
                  return (
                    <button
                      type="button"
                      key={cell.key}
                      aria-pressed={hasEvents ? isSel : undefined}
                      aria-label={`${new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(cell.date)}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                      disabled={!hasEvents}
                      onClick={() => hasEvents && setSelected(isSel ? null : cell.key)}
                      className={`group relative text-left border-r border-b border-fg/10 min-h-20 lg:min-h-30 flex flex-col
                        transition-colors duration-150 ease-quick
                        ${hasEvents ? 'cursor-pointer hover:bg-brand/8' : 'cursor-default'}
                        ${isToday && !isSel ? 'bg-brand/4' : ''}
                        ${isSel ? 'bg-brand/10' : ''}
                        focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand`}
                    >
                      {/* Numeral zone (fixed height; multi-day bars + pills sit below) */}
                      <span className="flex items-center justify-end px-1 flex-none" style={{ height: NUMERAL_ZONE }}>
                        <span className={`not-italic tabular-nums font-bold text-[0.8125rem] leading-none ${
                          isToday
                            ? 'inline-flex items-center justify-center min-w-5 h-5 px-1 bg-brand text-fg-on-brand'
                            : 'text-fg-muted'
                        }`}>
                          {cell.date.getDate()}
                        </span>
                      </span>
                      {/* Reserve the multi-day lane band (bars are drawn in the overlay) */}
                      {laneCount > 0 && <span aria-hidden className="flex-none" style={{ height: laneCount * BAR_H }} />}
                      {/* Single-day event strips */}
                      {shown.length > 0 && (
                        <span className="flex flex-col gap-0.5 px-0.5 pb-0.5 min-w-0">
                          {shown.map(e => <CalendarPill key={e.key} event={e} />)}
                          {hidden > 0 && (
                            <span className="text-[10px] font-semibold text-fg-muted/70 px-1 leading-tight">+{hidden} more</span>
                          )}
                        </span>
                      )}
                    </button>
                  )
                })}
                {/* Multi-day spanning overlay — shares the 7-col track with the cells */}
                {spans.length > 0 && (
                  <div
                    className="pointer-events-none absolute inset-0 grid grid-cols-7"
                    style={{ paddingTop: NUMERAL_ZONE, gridAutoRows: `${BAR_H}px` }}
                    aria-hidden
                  >
                    {spans.map(s => (
                      <span
                        key={`${s.event.key}-${s.lane}`}
                        className="px-0.5"
                        style={{ gridColumn: `${s.colStart + 1} / span ${s.colEnd - s.colStart + 1}`, gridRowStart: s.lane + 1 }}
                      >
                        <span className="flex items-center h-4.5 bg-brand text-fg-on-brand text-[11px] font-semibold leading-none px-1.5 overflow-hidden whitespace-nowrap">
                          <span className="truncate">{s.continuesLeft ? ' ' : s.event.title}</span>
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected-day agenda */}
        {selectedDate && agendaEvents.length > 0 && (
          <div className={`mt-md rounded-ot-surface border border-fg/10 ${cardSurface(color)} p-md`}>
            <p className="text-label uppercase tracking-label font-semibold text-fg-muted/70 mb-sm">
              {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDate)}
            </p>
            <div className="flex flex-col">
              {agendaEvents.map(e => <EventListRow key={e.key} event={e} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: month agenda list (a 7-col grid is unusable at 320px) */}
      <div className="sm:hidden">
        {monthEvents.length > 0 ? (
          <div className="flex flex-col">
            {monthEvents.map(e => <EventListRow key={e.key} event={e} />)}
          </div>
        ) : (
          <CalendarEmpty monthLabel={monthLabel} onJump={jumpToEvents} hasAny={events.length > 0} />
        )}
      </div>

      {/* Desktop empty month */}
      {monthEvents.length === 0 && (
        <div className="hidden sm:block">
          <CalendarEmpty monthLabel={monthLabel} onJump={jumpToEvents} hasAny={events.length > 0} />
        </div>
      )}
    </div>
  )
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyShell({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-2xl gap-sm text-fg-muted">
      <div className="w-12 h-12 rounded-ot-surface border-2 border-fg/12 flex items-center justify-center text-fg-muted/60">{icon}</div>
      <p className="text-title font-semibold text-fg">{title}</p>
      {children}
    </div>
  )
}

function CalendarEmpty({ monthLabel, onJump, hasAny }: { monthLabel: string; onJump: () => void; hasAny: boolean }) {
  return (
    <div className="rounded-ot-surface border border-fg/10 border-dashed">
      <EmptyShell icon={<CalendarX2 size={20} strokeWidth={1.5} />} title={`No events in ${monthLabel}`}>
        {hasAny && (
          <button
            type="button"
            onClick={onJump}
            className="mt-xs inline-flex items-center gap-xs text-label uppercase tracking-label font-semibold text-brand hover:text-brand-hover transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Jump to next events <ArrowRight size={14} strokeWidth={2} aria-hidden />
          </button>
        )}
      </EmptyShell>
    </div>
  )
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const items: { v: View; label: string; Icon: typeof LayoutGrid }[] = [
    { v: 'card',     label: 'Cards',    Icon: LayoutGrid },
    { v: 'list',     label: 'List',     Icon: List },
    { v: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  ]
  return (
    <div className="inline-flex rounded-ot-control overflow-hidden border border-fg/15" role="group" aria-label="View mode">
      {items.map(({ v, label, Icon }, i) => {
        const active = view === v
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={`inline-flex items-center gap-xs px-sm py-xs text-label uppercase tracking-label font-semibold
              transition-colors duration-150 ease-quick cursor-pointer
              ${i > 0 ? 'border-l border-fg/15' : ''}
              ${active ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:text-fg hover:bg-fg/[0.04]'}
              focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand`}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-ot-control text-label uppercase tracking-label font-semibold px-sm py-1.25 border transition-colors duration-150 ease-quick cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        ${active
          ? 'bg-brand border-transparent text-fg-on-brand'
          : 'bg-transparent border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg'}`}
    >
      {label}
    </button>
  )
}

// ─── Listing grid (card/list with optional past divider) ────────────────────────

function ListingBody({
  view, upcoming, past, color, showPast, pastMode,
}: {
  view: View
  upcoming: EventCardData[]
  past: EventCardData[]
  color: Color
  showPast: boolean
  pastMode: 'hide' | 'show' | 'toggle'
}) {
  const renderGroup = (items: EventCardData[], dim = false) =>
    view === 'card' ? (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg ${dim ? 'opacity-70' : ''}`}>
        {items.map(e => <EventCard key={e.key} event={e} color={color} />)}
      </div>
    ) : (
      <div className={dim ? 'opacity-70' : ''}>
        {items.map(e => <EventListRow key={e.key} event={e} />)}
      </div>
    )

  // 'show' mode merges everything chronologically into one stream.
  const mergedShowAll = pastMode === 'show'

  return (
    <div className="flex flex-col gap-lg">
      {mergedShowAll
        ? renderGroup([...upcoming, ...past].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? '')))
        : renderGroup(upcoming)}

      {!mergedShowAll && showPast && past.length > 0 && (
        <>
          <div className="flex items-center gap-md">
            <span className="text-label uppercase tracking-label font-semibold text-fg-muted/70">Past events</span>
            <span className="flex-1 h-px bg-fg/10" aria-hidden />
          </div>
          {renderGroup(past, true)}
        </>
      )}
    </div>
  )
}

// ─── EventListingClient ─────────────────────────────────────────────────────────

export default function EventListingClient({
  events,
  maxItems,
  defaultView,
  color,
  showViewToggle,
  showTypeFilter,
  pastMode,
  typeLocked,
  nowIso,
}: EventListingClientProps) {
  const now = useMemo(() => new Date(nowIso), [nowIso])

  const [view,       setView]       = useState<View>(defaultView)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [showPast,   setShowPast]   = useState(pastMode === 'show')

  // Lock the view when the editor disabled the toggle.
  const effectiveView: View = showViewToggle ? view : defaultView

  // Types present across all loaded events (for the chips), in canonical order.
  const availableTypes = useMemo(() => {
    const present = new Set(events.map(e => e.eventType).filter(Boolean) as string[])
    return TYPE_ORDER.filter(t => present.has(t))
  }, [events])

  // Type-filtered set (chips).
  const typeFiltered = useMemo(
    () => activeType ? events.filter(e => e.eventType === activeType) : events,
    [events, activeType],
  )

  // Upcoming / past split (day-granular).
  const { upcoming, past } = useMemo(() => {
    const up: EventCardData[] = []
    const pa: EventCardData[] = []
    for (const e of typeFiltered) {
      (isUpcoming(e.startDate, e.endDate, now) ? up : pa).push(e)
    }
    up.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
    pa.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '')) // most recent past first
    return { upcoming: up, past: pa }
  }, [typeFiltered, now])

  // maxItems caps the card/list streams (not the calendar).
  const capUpcoming = maxItems ? upcoming.slice(0, maxItems) : upcoming
  const capPast     = maxItems ? past.slice(0, maxItems)     : past

  const changeType = useCallback((t: string | null) => setActiveType(t), [])

  const showChips    = showTypeFilter && !typeLocked && availableTypes.length > 0
  const showPastCtrl = pastMode === 'toggle' && past.length > 0 && effectiveView !== 'calendar'

  // ── Empty states for card/list ────────────────────────────────────────────
  const listEmpty = effectiveView !== 'calendar' && capUpcoming.length === 0 &&
    (pastMode !== 'show' || past.length === 0)

  // Polite announcement for SR users — the visible body swaps silently when the
  // view, type filter, or past-toggle changes.
  const resultAnnouncement = effectiveView === 'calendar'
    ? `Calendar view, ${typeFiltered.length} event${typeFiltered.length === 1 ? '' : 's'}`
    : `${capUpcoming.length} upcoming event${capUpcoming.length === 1 ? '' : 's'}${showPast && capPast.length ? `, ${capPast.length} past` : ''}, ${effectiveView === 'list' ? 'list' : 'card'} view`

  return (
    <div>
      {/* ── Controls bar ─────────────────────────────────────────────────────── */}
      {(showChips || showViewToggle || showPastCtrl) && (
        <div className="flex flex-wrap items-center justify-between gap-md pb-md mb-lg border-b border-fg/8">
          <div className="flex flex-wrap items-center gap-sm">
            {showChips && (
              <div className="flex flex-wrap items-center gap-xs" role="group" aria-label="Filter by event type">
                <TypeChip label="All" active={activeType === null} onClick={() => changeType(null)} />
                {availableTypes.map(t => (
                  <TypeChip
                    key={t}
                    label={eventTypeLabel(t)}
                    active={activeType === t}
                    onClick={() => changeType(activeType === t ? null : t)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-md">
            {showPastCtrl && (
              <label className="inline-flex items-center gap-xs min-h-[44px] text-label uppercase tracking-label font-semibold text-fg-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPast}
                  onChange={e => setShowPast(e.target.checked)}
                  className="accent-[var(--ot-brand)] w-4 h-4"
                />
                Show past events
              </label>
            )}
            {showViewToggle && <ViewToggle view={effectiveView} onChange={setView} />}
          </div>
        </div>
      )}

      {/* SR-only result announcement — the visible body below swaps silently */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{resultAnnouncement}</p>

      {/* ── Views ────────────────────────────────────────────────────────────── */}
      {effectiveView === 'calendar' ? (
        <CalendarView events={typeFiltered} color={color} now={now} />
      ) : listEmpty ? (
        activeType !== null ? (
          <EmptyShell icon={<CalendarX2 size={20} strokeWidth={1.5} />} title={`No ${eventTypeLabel(activeType).toLowerCase()} events`}>
            <button
              type="button"
              onClick={() => changeType(null)}
              className="mt-xs text-label uppercase tracking-label font-semibold text-brand hover:text-brand-hover transition-colors duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Clear filter
            </button>
          </EmptyShell>
        ) : (
          <EmptyShell icon={<CalendarX2 size={20} strokeWidth={1.5} />} title="No upcoming events">
            <p className="text-body text-fg-muted">Check back soon for new events.</p>
          </EmptyShell>
        )
      ) : (
        <ListingBody
          view={effectiveView}
          upcoming={capUpcoming}
          past={capPast}
          color={color}
          showPast={showPast}
          pastMode={pastMode}
        />
      )}
    </div>
  )
}
