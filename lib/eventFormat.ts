/**
 * lib/eventFormat.ts
 *
 * Pure, dependency-free formatting helpers for events. Deliberately contains NO
 * server imports (no getClient, no @optimizely/cms-sdk) so it is safe to import
 * from both the server page component (components/pages/EventPage.tsx) and the
 * client listing block (components/blocks/EventListingBlock.client.tsx) without
 * pulling server-only code into the client bundle.
 *
 * This is the single source of truth for event date logic — do not duplicate it.
 */

// ── Type / credit / location vocabularies ──────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<string, string> = {
  webinar:    'Webinar',
  conference: 'Conference',
  workshop:   'Workshop',
  seminar:    'Seminar',
  community:  'Community Event',
  screening:  'Health Screening',
  training:   'Training',
}

export function eventTypeLabel(type?: string | null): string {
  if (!type) return ''
  return EVENT_TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1)
}

export const LOCATION_TYPE_LABELS: Record<string, string> = {
  inPerson: 'In Person',
  virtual:  'Virtual',
  hybrid:   'Hybrid',
}

export function locationTypeLabel(type?: string | null): string {
  if (!type) return ''
  return LOCATION_TYPE_LABELS[type] ?? type
}

/**
 * Human-readable location line: prefers "Venue · City" for in-person/hybrid,
 * falls back to the venue or the location-type label. Returns '' when nothing
 * meaningful is set.
 */
export function formatEventLocation(opts: {
  locationType?: string | null
  venueName?:    string | null
  city?:         string | null
}): string {
  const { locationType, venueName, city } = opts
  if (locationType === 'virtual') return venueName || 'Virtual'
  const parts = [venueName, city].filter(Boolean) as string[]
  if (parts.length) return parts.join(' · ')
  return locationTypeLabel(locationType)
}

// ── Timezone ──────────────────────────────────────────────────────────────────

/**
 * The single site-wide timezone every event date and time is displayed in.
 *
 * Events are authored in the CMS as instants and reach us normalised to UTC
 * (e.g. "2026-09-01T13:00:00.000Z") — there is no per-event timezone stored, so
 * without this the runtime zone (UTC on Vercel) would leak into the UI. Every
 * formatter below renders in this zone. To move the whole site to another zone,
 * change this one constant to any IANA identifier (e.g. 'America/Los_Angeles').
 */
export const EVENT_TIMEZONE = 'America/New_York'

// ── Date helpers ────────────────────────────────────────────────────────────────

function toDate(iso?: string | null): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "YYYY-MM-DD" as observed in `tz` — day-granular comparisons in the display
 *  zone rather than the server zone. */
function dayKeyInZone(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
}

/** Short timezone label for an instant in `tz`, e.g. "EDT" / "EST". */
export function timeZoneAbbr(iso?: string | null, tz: string = EVENT_TIMEZONE, locale = 'en-US'): string {
  const d = toDate(iso)
  if (!d) return ''
  const part = new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(d)
    .find(p => p.type === 'timeZoneName')
  return part?.value ?? ''
}

/** Midnight (local) of the given date — used for day-granular comparisons. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * True when the event's start (or end, for multi-day events) is today or later.
 * Day-granular: an event earlier today still counts as upcoming until midnight.
 */
export function isUpcoming(startIso?: string | null, endIso?: string | null, now: Date = new Date()): boolean {
  const ref   = startOfDay(now)
  const end   = toDate(endIso)
  const start = toDate(startIso)
  const compare = end ?? start
  if (!compare) return false
  return startOfDay(compare).getTime() >= ref.getTime()
}

/**
 * Full date for a single event. Honours an end date on the same day (time range)
 * or a different day (date range).
 *
 *   formatEventDate('2026-07-14T16:00:00Z')                              → "July 14, 2026"
 *   formatEventDate('2026-07-14T16:00:00Z', '2026-07-14T17:30:00Z')      → "July 14, 2026 · 4:00 – 5:30 PM"  (when withTime)
 *   formatEventDate('2026-07-14T16:00:00Z', '2026-07-16T16:00:00Z')      → "July 14 – 16, 2026"
 */
export function formatEventDate(
  startIso?: string | null,
  endIso?: string | null,
  opts: { withTime?: boolean; locale?: string; timeZone?: string } = {},
): string {
  const { withTime = false, locale, timeZone = EVENT_TIMEZONE } = opts
  const start = toDate(startIso)
  if (!start) return ''
  const end = toDate(endIso)

  const dateFmt = (d: Date, withYear: boolean) =>
    new Intl.DateTimeFormat(locale, {
      timeZone, month: 'long', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}),
    }).format(d)

  const timeFmt = (d: Date) =>
    new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit' }).format(d)

  // Multi-day range — compare calendar days as observed in the display zone.
  if (end && dayKeyInZone(end, timeZone) !== dayKeyInZone(start, timeZone)) {
    const sameYear = dayKeyInZone(start, timeZone).slice(0, 4) === dayKeyInZone(end, timeZone).slice(0, 4)
    return `${dateFmt(start, !sameYear)} – ${dateFmt(end, true)}`
  }

  const base = dateFmt(start, true)
  if (!withTime) return base

  // Same-day with a time (and optional end time)
  if (end) return `${base} · ${timeFmt(start)} – ${timeFmt(end)}`
  return `${base} · ${timeFmt(start)}`
}

/** Time-only label, e.g. "4:00 PM". Empty string when no start time. */
export function formatEventTime(
  startIso?: string | null,
  endIso?: string | null,
  locale?: string,
  timeZone: string = EVENT_TIMEZONE,
): string {
  const start = toDate(startIso)
  if (!start) return ''
  const timeFmt = (d: Date) =>
    new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit' }).format(d)
  const end = toDate(endIso)
  return end ? `${timeFmt(start)} – ${timeFmt(end)}` : timeFmt(start)
}

/** Parts for a calendar-style date block: { month: "JUL", day: "14", weekday: "TUE" }. */
export function eventDateBlock(
  startIso?: string | null,
  locale?: string,
  timeZone: string = EVENT_TIMEZONE,
): { month: string; day: string; weekday: string } | null {
  const start = toDate(startIso)
  if (!start) return null
  return {
    month:   new Intl.DateTimeFormat(locale, { timeZone, month: 'short' }).format(start).toUpperCase(),
    day:     new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric' }).format(start),
    weekday: new Intl.DateTimeFormat(locale, { timeZone, weekday: 'short' }).format(start).toUpperCase(),
  }
}

/**
 * Initials for a speaker headshot fallback. First letter of first word + first
 * letter of last word, skipping honorific prefixes and credential suffixes:
 *   "Marcus Webb"     → "MW"
 *   "Marcus"          → "MA"   (single name: first two letters)
 *   "Dr. Priya Nair"  → "PN"   (prefix skipped)
 *   ""                → ""     (caller renders a person icon instead)
 */
const NAME_PREFIXES = new Set(['dr', 'mr', 'mrs', 'ms', 'miss', 'prof', 'professor', 'sir', 'dame', 'rev', 'hon'])
const NAME_SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v', 'phd', 'md', 'esq', 'cpa', 'mba', 'jd'])

export function getInitials(name?: string | null): string {
  if (!name) return ''
  const norm = (w: string) => w.replace(/[.,]/g, '').toLowerCase()
  let words = name.trim().split(/\s+/).filter(Boolean)
  while (words.length > 1 && NAME_PREFIXES.has(norm(words[0]))) words = words.slice(1)
  while (words.length > 1 && NAME_SUFFIXES.has(norm(words[words.length - 1]))) words = words.slice(0, -1)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/** Credit label, e.g. "1.5 CLE". Empty when no credit. */
export function formatCredit(creditType?: string | null, creditHours?: number | null): string {
  if (!creditType || creditType === 'none') return ''
  const hrs = typeof creditHours === 'number' && creditHours > 0
    ? `${Number.isInteger(creditHours) ? creditHours : creditHours.toFixed(1)} `
    : ''
  return `${hrs}${creditType}`
}
