'use client'

import { useState, useMemo, useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import {
  LayoutGrid, List, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Award, MapPin, Video,
  CalendarX2, ArrowRight, Layers, SlidersHorizontal, X,
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

// Presentation lives in components/blocks/event-listing.css, keyed on the data attributes below.

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
  /** True for any CMS draft/preview render — hides the filter trigger + drawer. */
  isPreview?:     boolean
}

// Canonical type ordering for the filter.
const TYPE_ORDER = ['webinar', 'conference', 'workshop', 'seminar', 'community', 'screening', 'training']

const noopSubscribe = () => () => {}
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function TypeTag({ type }: { type: string }) {
  return <span data-part="type">{eventTypeLabel(type)}</span>
}

function DateTile({ event, weekday }: { event: EventCardData; weekday?: boolean }) {
  const b = eventDateBlock(event.startDate)
  if (!b) return null
  return (
    <span data-part="date-tile" aria-hidden="true">
      <span data-part="dt-month">{b.month}</span>
      <span data-part="dt-day">{b.day}</span>
      {weekday && <span data-part="dt-wd">{b.weekday}</span>}
    </span>
  )
}

function Meta({ event }: { event: EventCardData }) {
  const loc    = formatEventLocation(event)
  const credit = formatCredit(event.creditType, event.creditHours)
  const time   = formatEventTime(event.startDate, event.endDate)
  const LocIcon = event.locationType === 'virtual' ? Video : MapPin
  return (
    <ul data-part="meta">
      <li>
        <CalendarIcon strokeWidth={2} aria-hidden="true" />
        <span>{formatEventDate(event.startDate, event.endDate)}{time && !isMultiDay(event) ? ` · ${time}` : ''}</span>
      </li>
      {loc && <li><LocIcon strokeWidth={2} aria-hidden="true" /><span>{loc}</span></li>}
      {credit && <li data-part="credit"><Award strokeWidth={2} aria-hidden="true" /><span>{credit} credit</span></li>}
    </ul>
  )
}

function isPastEvent(e: EventCardData, now: Date): boolean {
  return !isUpcoming(e.startDate, e.endDate, now)
}

// ─── Card + row ───────────────────────────────────────────────────────────────

function EventCard({ event, now }: { event: EventCardData; now: Date }) {
  const past = isPastEvent(event, now)
  return (
    <li>
      <a href={event.url ?? '#'} data-part="card" data-past={past ? '' : undefined}>
        <div data-part="media" data-empty={event.imageUrl ? undefined : ''}>
          {event.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt="" loading="lazy" />
          )}
          {event.eventType && <TypeTag type={event.eventType} />}
          <DateTile event={event} />
        </div>
        <div data-part="body">
          {past && <span data-part="past-tag">Past event</span>}
          <h3 data-part="title">{event.title}</h3>
          <Meta event={event} />
        </div>
      </a>
    </li>
  )
}

function EventRow({ event, now }: { event: EventCardData; now: Date }) {
  const past = isPastEvent(event, now)
  return (
    <li>
      <a href={event.url ?? '#'} data-part="row" data-past={past ? '' : undefined}>
        <DateTile event={event} weekday />
        <div data-part="row-body">
          <div data-part="row-top">
            {event.eventType && <TypeTag type={event.eventType} />}
            {past && <span data-part="past-tag">Past event</span>}
          </div>
          <h3 data-part="title">{event.title}</h3>
          <Meta event={event} />
        </div>
        <span data-part="go" aria-hidden="true"><ChevronRight strokeWidth={1.75} /></span>
      </a>
    </li>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

type DayInfo = { date: Date; key: string }

// Calendar layout constants (px). The numeral zone sits at the top of every cell;
// multi-day bars stack in lanes below it; single-day pills flow below the bars.
const MAX_BARS     = 3    // visible multi-day lanes per week
const MAX_PILLS    = 2    // visible single-day chips per day

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

function Empty({ icon, title, text, children }: { icon: React.ReactNode; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div data-part="empty">
      <span data-part="empty-icon">{icon}</span>
      <p data-part="empty-title">{title}</p>
      {text && <p data-part="empty-text">{text}</p>}
      {children}
    </div>
  )
}

function CalendarView({ events, now }: { events: EventCardData[]; now: Date }) {
  const [cursor, setCursor]     = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected] = useState<string | null>(null)
  const labelId                 = useId()

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(cursor),
    [cursor],
  )

  const cells = useMemo<(DayInfo | null)[]>(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth()
    const firstWeekday = new Date(y, m, 1).getDay()
    const daysInMonth  = new Date(y, m + 1, 0).getDate()
    const out: (DayInfo | null)[] = []
    for (let i = 0; i < firstWeekday; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d)
      out.push({ date, key: `${ymKey(date)}-${String(d).padStart(2, '0')}` })
    }
    return out
  }, [cursor])

  const weeks = useMemo<(DayInfo | null)[][]>(() => {
    const padded = [...cells]
    while (padded.length % 7 !== 0) padded.push(null)
    const out: (DayInfo | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7))
    return out
  }, [cells])

  const monthEvents = useMemo(
    () => events.filter(e => {
      if (!e.startDate) return false
      const s = new Date(e.startDate)
      const en = e.endDate ? new Date(e.endDate) : s
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
  const selectedDate = selected ? cells.find(c => c?.key === selected)?.date ?? null : null
  const agendaEvents = selectedDate ? eventsForDay(selectedDate) : []

  const goMonth = useCallback((delta: number) => {
    setCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1))
    setSelected(null)
  }, [])

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

  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  const head = (
    <div data-part="cal-head">
      <h3 data-part="cal-month" id={labelId}>{monthLabel}</h3>
      <div data-part="cal-nav">
        <button type="button" data-part="cal-btn" aria-label="Previous month" onClick={() => goMonth(-1)}><ChevronLeft strokeWidth={2} /></button>
        <button type="button" data-part="cal-btn" onClick={() => { setCursor(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(null) }}>Today</button>
        <button type="button" data-part="cal-btn" aria-label="Next month" onClick={() => goMonth(1)}><ChevronRight strokeWidth={2} /></button>
      </div>
    </div>
  )

  if (monthEvents.length === 0) {
    return (
      <div data-part="cal">
        {head}
        <Empty icon={<CalendarX2 strokeWidth={1.75} />} title={`No events in ${monthLabel}`} text={events.length ? 'Events are scheduled in other months.' : undefined}>
          {events.length > 0 && (
            <button type="button" data-part="empty-action" onClick={jumpToEvents}>
              Jump to the next events <ArrowRight strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </Empty>
      </div>
    )
  }

  return (
    <div data-part="cal">
      {head}
      {/* A labelled group of day toggle buttons (no ARIA grid: we don't implement 2D arrow keys). */}
      <div data-part="cal-grid" role="group" aria-labelledby={labelId}>
        <div data-part="cal-dow" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
        </div>
        {weeks.map((week, wi) => {
          const { spans, laneCount } = placeMultiDay(week, monthEvents)
          return (
            <div key={wi} data-part="cal-week">
              {week.map((cell, col) => {
                if (!cell) return <div key={`b-${wi}-${col}`} data-part="cal-day" data-blank aria-hidden="true" />
                const dayEvents = eventsForDay(cell.date)
                const singles   = dayEvents.filter(e => !isMultiDay(e))
                const shown     = singles.slice(0, MAX_PILLS)
                const hidden    = singles.length - shown.length
                const isToday   = cell.key === todayKey
                const isSel     = cell.key === selected
                const has       = dayEvents.length > 0
                return (
                  <button
                    type="button"
                    key={cell.key}
                    data-part="cal-day"
                    data-has={has ? '' : undefined}
                    data-today={isToday ? '' : undefined}
                    aria-pressed={has ? isSel : undefined}
                    aria-label={`${dayFmt.format(cell.date)}${isToday ? ', today' : ''}${has ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                    disabled={!has}
                    onClick={() => has && setSelected(isSel ? null : cell.key)}
                  >
                    <span data-part="cal-num">{cell.date.getDate()}</span>
                    {laneCount > 0 && <span aria-hidden="true" style={{ flex: 'none', height: `calc(1.5rem * ${laneCount} - .2rem)` }} />}
                    {shown.map(e => {
                      const t = formatEventTime(e.startDate)
                      return (
                        <span key={e.key} data-part="chip">
                          {t && <span data-part="chip-time">{t}</span>}
                          <span data-part="chip-title">{e.title}</span>
                        </span>
                      )
                    })}
                    {hidden > 0 && <span data-part="more">+{hidden} more</span>}
                  </button>
                )
              })}
              {spans.length > 0 && (
                <div data-part="spans" aria-hidden="true">
                  {spans.map(sp => (
                    <span
                      key={`${sp.event.key}-${sp.lane}`}
                      data-part="bar"
                      data-cont-l={sp.continuesLeft ? '' : undefined}
                      data-cont-r={sp.continuesRight ? '' : undefined}
                      style={{ gridColumn: `${sp.colStart + 1} / span ${sp.colEnd - sp.colStart + 1}`, gridRowStart: sp.lane + 1 }}
                    >
                      {sp.continuesLeft ? '← ' : ''}{sp.event.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && agendaEvents.length > 0 && (
        <div data-part="agenda" aria-live="polite">
          <p data-part="agenda-title">{dayFmt.format(selectedDate)}</p>
          <ul data-part="list">{agendaEvents.map(e => <EventRow key={e.key} event={e} now={now} />)}</ul>
        </div>
      )}

      {/* Narrow containers: a month agenda list (a 7-column grid is unusable at 320px) */}
      <div data-part="cal-mobile">
        <ul data-part="list">{monthEvents.map(e => <EventRow key={e.key} event={e} now={now} />)}</ul>
      </div>
    </div>
  )
}

// ─── Filter drawer ────────────────────────────────────────────────────────────

function EventDrawer({
  id, open, onClose, types, active, onSelect, triggerRef,
}: {
  id: string
  open: boolean
  onClose: () => void
  types: string[]
  active: string | null
  onSelect: (t: string | null) => void
  triggerRef: React.RefObject<HTMLElement | null>
}) {
  const mounted  = useHydrated()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      trigger?.focus()
    }
  }, [open, onClose, triggerRef])

  if (!mounted) return null

  const opt = (value: string | null, label: string) => (
    <button key={value ?? 'all'} type="button" data-part="radio-row" role="radio" aria-checked={active === value} onClick={() => onSelect(value)}>
      <span data-part="dot" aria-hidden="true" />
      {label}
    </button>
  )

  return createPortal(
    <div data-part="ev-drawer" aria-hidden={!open}>
      <div data-part="scrim" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} id={id} data-part="sheet" role="dialog" aria-modal="true" aria-label="Refine" tabIndex={-1}>
        <div data-part="sheet-head">
          <h2 data-part="sheet-title"><SlidersHorizontal strokeWidth={2} aria-hidden="true" />Refine</h2>
          <button type="button" data-part="close" onClick={onClose} aria-label="Close filters"><X strokeWidth={1.75} /></button>
        </div>
        <div data-part="sheet-body">
          <h3 data-part="group-title"><Layers strokeWidth={2} aria-hidden="true" />Type</h3>
          <div role="radiogroup" aria-label="Filter by event type">
            {opt(null, 'All types')}
            {types.map(t => opt(t, eventTypeLabel(t)))}
          </div>
        </div>
        <div data-part="sheet-foot">
          <button type="button" data-part="clear" onClick={() => onSelect(null)} disabled={!active}>Clear filters</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Listing body ─────────────────────────────────────────────────────────────

function ListingBody({
  view, upcoming, past, showPast, pastMode, now,
}: {
  view: View
  upcoming: EventCardData[]
  past: EventCardData[]
  showPast: boolean
  pastMode: 'hide' | 'show' | 'toggle'
  now: Date
}) {
  const renderGroup = (items: EventCardData[]) =>
    view === 'card' ? (
      <ul data-part="cards">{items.map(e => <EventCard key={e.key} event={e} now={now} />)}</ul>
    ) : (
      <ul data-part="list">{items.map(e => <EventRow key={e.key} event={e} now={now} />)}</ul>
    )

  const merged = pastMode === 'show'
  const main = merged
    ? [...upcoming, ...past].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
    : upcoming

  return (
    <>
      {main.length > 0 && renderGroup(main)}
      {!merged && showPast && past.length > 0 && (
        <>
          <div data-part="divider">Past events</div>
          {renderGroup(past)}
        </>
      )}
    </>
  )
}

// ─── EventListingClient ───────────────────────────────────────────────────────

export default function EventListingClient({
  events,
  maxItems,
  defaultView,
  showViewToggle,
  showTypeFilter,
  pastMode,
  typeLocked,
  nowIso,
  isPreview = false,
}: EventListingClientProps) {
  const now = useMemo(() => new Date(nowIso), [nowIso])

  const [view,        setView]        = useState<View>(defaultView)
  const [activeType,  setActiveType]  = useState<string | null>(null)
  const [showPast,    setShowPast]    = useState(pastMode === 'show')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterTriggerRef = useRef<HTMLButtonElement>(null)
  const filterPanelId    = useId()

  const effectiveView: View = showViewToggle ? view : defaultView

  const availableTypes = useMemo(() => {
    const present = new Set(events.map(e => e.eventType).filter(Boolean) as string[])
    return TYPE_ORDER.filter(t => present.has(t))
  }, [events])

  const typeFiltered = useMemo(
    () => activeType ? events.filter(e => e.eventType === activeType) : events,
    [events, activeType],
  )

  const { upcoming, past } = useMemo(() => {
    const up: EventCardData[] = []
    const pa: EventCardData[] = []
    for (const e of typeFiltered) (isUpcoming(e.startDate, e.endDate, now) ? up : pa).push(e)
    up.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
    pa.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))
    return { upcoming: up, past: pa }
  }, [typeFiltered, now])

  const capUpcoming = maxItems ? upcoming.slice(0, maxItems) : upcoming
  const capPast     = maxItems ? past.slice(0, maxItems)     : past

  const closeFilters = useCallback(() => setFiltersOpen(false), [])

  // Hidden entirely in CMS preview/edit renders — live-front-end feature only.
  const showChips    = showTypeFilter && !typeLocked && availableTypes.length > 0 && !isPreview
  const showPastCtrl = pastMode === 'toggle' && past.length > 0 && effectiveView !== 'calendar'
  const n = activeType ? 1 : 0

  const listEmpty = effectiveView !== 'calendar' && capUpcoming.length === 0 &&
    (pastMode !== 'show' || past.length === 0) && !(showPast && capPast.length > 0)

  const announcement = effectiveView === 'calendar'
    ? `Calendar view, ${typeFiltered.length} event${typeFiltered.length === 1 ? '' : 's'}`
    : `${capUpcoming.length} upcoming event${capUpcoming.length === 1 ? '' : 's'}${showPast && capPast.length ? `, ${capPast.length} past` : ''}, ${effectiveView === 'list' ? 'list' : 'card'} view`

  const views: { v: View; label: string; Icon: typeof LayoutGrid }[] = [
    { v: 'card', label: 'Cards', Icon: LayoutGrid },
    { v: 'list', label: 'List', Icon: List },
    { v: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  ]

  let body: React.ReactNode
  if (effectiveView === 'calendar') {
    body = <CalendarView events={typeFiltered} now={now} />
  } else if (listEmpty) {
    if (activeType !== null) {
      body = (
        <Empty icon={<CalendarX2 strokeWidth={1.75} />} title={`No ${eventTypeLabel(activeType).toLowerCase()} events coming up`} text="Try another type, or clear the filter.">
          <button type="button" data-part="empty-action" onClick={() => setActiveType(null)}>Clear filter</button>
        </Empty>
      )
    } else if (pastMode === 'toggle' && past.length > 0) {
      body = (
        <Empty icon={<CalendarX2 strokeWidth={1.75} />} title="No upcoming events right now" text={`There ${past.length === 1 ? 'is 1 past event' : `are ${past.length} past events`} you can still look back on.`}>
          <button type="button" data-part="empty-action" onClick={() => setShowPast(true)}>
            Show past events <ArrowRight strokeWidth={2} aria-hidden="true" />
          </button>
        </Empty>
      )
    } else {
      body = <Empty icon={<CalendarX2 strokeWidth={1.75} />} title="No upcoming events right now" text="Check back soon for new events." />
    }
  } else {
    body = <ListingBody view={effectiveView} upcoming={capUpcoming} past={capPast} showPast={showPast} pastMode={pastMode} now={now} />
  }

  return (
    <>
      {(showChips || showViewToggle || showPastCtrl) && (
        <div data-part="toolbar">
          {showChips ? (
            <button
              ref={filterTriggerRef}
              type="button"
              data-part="filter"
              onClick={() => setFiltersOpen(v => !v)}
              aria-expanded={filtersOpen}
              aria-controls={filterPanelId}
              aria-haspopup="dialog"
            >
              <SlidersHorizontal aria-hidden="true" />
              <span>Filters</span>
              {n > 0 && <span data-part="badge" aria-hidden="true">{n}</span>}
              <span data-part="filter-note">{activeType ? eventTypeLabel(activeType) : 'Filter by event type'}</span>
            </button>
          ) : <span />}

          <div data-part="tools">
            {showPastCtrl && (
              <label data-part="past">
                <input type="checkbox" role="switch" checked={showPast} onChange={e => setShowPast(e.target.checked)} />
                <span data-part="switch" aria-hidden="true" />
                Show past events ({past.length})
              </label>
            )}
            {showViewToggle && (
              <div data-part="views" role="group" aria-label="View">
                {views.map(({ v, label, Icon }) => (
                  <button key={v} type="button" data-part="view" aria-pressed={effectiveView === v} onClick={() => setView(v)}>
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showChips && (
        <EventDrawer
          id={filterPanelId}
          open={filtersOpen}
          onClose={closeFilters}
          types={availableTypes}
          active={activeType}
          onSelect={setActiveType}
          triggerRef={filterTriggerRef}
        />
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>

      {/* Keyed on the type so a filter change fades the swapped-in set in; the calendar owns its own month state. */}
      {effectiveView === 'calendar' ? body : <div key={activeType ?? 'all'} className="animate-filter-swap">{body}</div>}
    </>
  )
}
