import type { ReactNode } from 'react'
import { Calendar, Clock, MapPin, Monitor, Award, ArrowRight, User } from 'lucide-react'
import type { EventPageContent } from '@/lib/events'
import {
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
  locationTypeLabel,
  timeZoneAbbr,
  getInitials,
} from '@/lib/eventFormat'

// ─── Types ────────────────────────────────────────────────────────────────────

type PreviewAttrs = (field: string) => Record<string, unknown>

type Props = {
  content: EventPageContent
  pa?:     PreviewAttrs
}

// ─── Type badge ─────────────────────────────────────────────────────────────────

function TypeBadge({ type, onImage = false }: { type: string; onImage?: boolean }) {
  return (
    <span
      className={
        onImage
          ? 'inline-flex items-center rounded-ot-control px-sm py-0.75 bg-brand text-fg-on-brand text-label uppercase tracking-label font-semibold'
          : 'inline-flex items-center gap-xs text-label uppercase tracking-label font-semibold text-accent'
      }
    >
      {!onImage && <span className="block w-6 h-px bg-accent flex-none" aria-hidden />}
      {eventTypeLabel(type)}
    </span>
  )
}

// ─── Sidebar detail row ───────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-sm">
      <Icon size={16} strokeWidth={1.75} className="flex-none mt-0.5 text-brand" aria-hidden />
      <div className="min-w-0">
        <p className="text-label uppercase tracking-label font-semibold text-fg-muted/70 mb-0.5">{label}</p>
        <div className="text-body text-fg leading-snug">{children}</div>
      </div>
    </div>
  )
}

// ─── Agenda time parsing ──────────────────────────────────────────────────────
// The agenda `time` is free-text from the CMS (e.g. "8:30 AM – 9:00 AM" or
// "9:00 AM"). Split a range on the dash so the time column renders as a deliberate
// two-line display instead of mid-range wrapping.
function splitTimeRange(raw?: string | null): { start: string; end: string | null } | null {
  const t = (raw ?? '').trim()
  if (!t) return null
  const parts = t.split(/\s*[–—-]\s*/)
  if (parts.length >= 2 && parts[1]) {
    return { start: parts[0].trim(), end: parts.slice(1).join(' – ').trim() }
  }
  return { start: t, end: null }
}

// ─── Section heading — chapter marker ─────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-headline leading-headline tracking-headline font-bold text-fg pb-sm mb-lg border-b border-fg/10">
      {children}
    </h2>
  )
}

// ─── Page component ─────────────────────────────────────────────────────────────

export default function EventPage({ content, pa }: Props) {
  const {
    title, eventType,
    description, featuredImage,
    startDate, endDate,
    locationType, venueName, city,
    creditType, creditHours,
    registrationUrl,
    speakers, agenda,
  } = content

  const imageUrl   = featuredImage?.url?.default || null
  const dateLabel  = formatEventDate(startDate, endDate)
  const timeLabel  = formatEventTime(startDate, endDate)
  const tzAbbr     = timeZoneAbbr(startDate)
  const regUrl     = registrationUrl?.default || null
  const isVirtual  = locationType === 'virtual'

  const hasCredit =
    !!creditType && creditType !== 'none' && typeof creditHours === 'number' && creditHours > 0
  const creditHoursLabel = hasCredit
    ? (Number.isInteger(creditHours!) ? String(creditHours) : creditHours!.toFixed(1))
    : ''

  // ── Sidebar rows — built conditionally so dividers only fall between present
  //    sections ──────────────────────────────────────────────────────────────
  const rows: ReactNode[] = []

  if (dateLabel) {
    rows.push(<DetailRow key="date" icon={Calendar} label="Date">{dateLabel}</DetailRow>)
  }
  if (timeLabel) {
    rows.push(
      <DetailRow key="time" icon={Clock} label="Time">
        {timeLabel}
        {tzAbbr && (
          <span className="block text-label uppercase tracking-label text-fg-muted/70 mt-0.5">{tzAbbr}</span>
        )}
      </DetailRow>,
    )
  }
  if (locationType || venueName || city) {
    rows.push(
      <DetailRow key="loc" icon={isVirtual ? Monitor : MapPin} label="Location">
        {isVirtual ? (
          venueName || 'Virtual'
        ) : venueName || city ? (
          <>
            {venueName && <span className="block">{venueName}</span>}
            {city && <span className="block text-fg-muted">{city}</span>}
          </>
        ) : (
          locationTypeLabel(locationType)
        )}
      </DetailRow>,
    )
  }
  if (hasCredit) {
    rows.push(
      <DetailRow key="credit" icon={Award} label="Professional Credit">
        <span className="block text-title font-bold text-fg leading-none">{creditHoursLabel}</span>
        <span className="block text-label uppercase tracking-label text-fg-muted mt-0.5">{creditType}</span>
      </DetailRow>,
    )
  }

  return (
    <article>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      {imageUrl ? (
        <header
          data-theme="dark"
          className="relative overflow-hidden flex flex-col justify-end min-h-[clamp(340px,50vh,560px)]"
          style={{ backgroundColor: 'oklch(38% 0.16 195)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            {...pa?.('featuredImage')}
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{ background: 'linear-gradient(to top, oklch(12% 0.012 195 / 0.92) 0%, oklch(12% 0.012 195 / 0.45) 45%, transparent 100%)' }}
          />
          <div className="relative z-10 px-md lg:px-xl pb-xl">
            <div className="mx-auto max-w-5xl">
              {eventType && <div className="mb-md" {...pa?.('eventType')}><TypeBadge type={eventType} onImage /></div>}
              <h1 className="text-headline lg:text-display leading-headline lg:leading-display tracking-headline font-bold text-fg text-balance max-w-[20ch]" {...pa?.('title')}>
                {title}
              </h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-canvas">
          <div className="h-0.75 bg-brand" />
          <div className="mx-auto max-w-5xl px-md lg:px-xl pt-xl pb-lg">
            {eventType && <div className="mb-md" {...pa?.('eventType')}><TypeBadge type={eventType} /></div>}
            <h1 className="text-headline lg:text-display leading-headline lg:leading-display tracking-headline font-bold text-fg text-balance max-w-[20ch]" {...pa?.('title')}>
              {title}
            </h1>
          </div>
        </header>
      )}

      {/* ── Body — 65/35 two-column. Sidebar stacks above content on mobile. ─── */}
      <section className="bg-canvas pt-xl pb-2xl">
        <div className="mx-auto max-w-5xl px-md lg:px-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-xl items-start">

            {/* Main column */}
            <div className="order-2 lg:order-1 min-w-0">
              {/* Description — opening paragraph carries the editorial lead-in. */}
              {description?.html && (
                <div
                  data-rich-text=""
                  data-color="canvas"
                  className="max-w-(--ot-measure-wide) [&>p:first-of-type]:text-title [&>p:first-of-type]:leading-title [&>p:first-of-type]:text-fg-muted [&>p:first-of-type]:text-pretty [&>p:first-of-type]:mb-lg"
                  {...pa?.('description')}
                  // CMS-managed rich text — not user input
                  dangerouslySetInnerHTML={{ __html: description.html }}
                />
              )}

              {/* Agenda — vertical timeline */}
              {agenda && agenda.length > 0 && (
                <section className="mt-2xl" {...pa?.('agenda')}>
                  <SectionHeading>Agenda</SectionHeading>
                  <ol className="relative">
                    {agenda.map((item, i) => {
                      const isLast = i === agenda.length - 1
                      const t = splitTimeRange(item.time)
                      return (
                        <li key={i} className="flex gap-md pb-xl last:pb-0">
                          {/* Time column — intentional two-line split for ranges */}
                          <div className="w-22 flex-none pt-0.5 text-right font-mono text-xs leading-tight whitespace-nowrap">
                            {t && (
                              t.end ? (
                                <>
                                  <span className="block text-fg font-medium">{t.start}</span>
                                  <span className="block text-fg-muted">– {t.end}</span>
                                </>
                              ) : (
                                <span className="block text-fg font-medium">{t.start}</span>
                              )
                            )}
                          </div>
                          {/* Spine + ring dot */}
                          <div className="relative flex-none w-2.5 self-stretch">
                            <span className="absolute left-1/2 -translate-x-1/2 top-1 block w-2.5 h-2.5 rounded-full border-2 border-brand bg-canvas" aria-hidden />
                            {!isLast && (
                              <span
                                className="absolute left-1/2 -translate-x-1/2 top-4 bottom-0 block w-px"
                                style={{ background: 'oklch(from var(--ot-brand) l c h / 0.25)' }}
                                aria-hidden
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            {item.title && <p className="text-body font-semibold text-fg leading-snug">{item.title}</p>}
                            {item.description && <p className="text-body text-fg-muted mt-xs text-pretty">{item.description}</p>}
                            {item.speaker && (
                              <p className="flex items-center gap-xs mt-sm text-xs italic text-brand">
                                <User size={12} strokeWidth={1.75} className="flex-none" aria-hidden />
                                {item.speaker}
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              )}

              {/* Speakers — full-width horizontal cards */}
              {speakers && speakers.length > 0 && (
                <section className="mt-2xl" {...pa?.('speakers')}>
                  <SectionHeading>Speakers</SectionHeading>
                  <ul className="flex flex-col gap-3">
                    {speakers.map((sp, i) => {
                      const photo    = sp.headshot?.url?.default || null
                      const profile  = sp.profileUrl?.default || null
                      const subline  = [sp.title, sp.organization].filter(Boolean).join(' · ')
                      const initials = getInitials(sp.name)
                      return (
                        <li key={i} className="card-hover-lift flex flex-col items-center md:flex-row md:items-center gap-6 rounded-ot-surface overflow-hidden bg-surface border border-fg/10 px-6 py-5">
                          {/* Headshot — 96px circle with a chromatic bloom ring */}
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo}
                              alt={sp.name ?? ''}
                              className="flex-none w-24 h-24 rounded-full object-cover"
                              style={{ boxShadow: '0 0 0 2px oklch(from var(--ot-brand) l c h / 0.3)' }}
                            />
                          ) : (
                            <div
                              className="flex-none flex items-center justify-center w-24 h-24 rounded-full text-[1.5rem] font-bold text-brand"
                              style={{
                                background: 'oklch(from var(--ot-brand) l c h / 0.15)',
                                border:     '1px solid oklch(from var(--ot-brand) l c h / 0.3)',
                              }}
                              aria-hidden
                            >
                              {initials || <User size={32} strokeWidth={1.75} aria-hidden />}
                            </div>
                          )}
                          {/* Content */}
                          <div className="min-w-0 flex-1 text-center md:text-left">
                            {sp.name && <p className="text-title font-bold text-fg leading-snug">{sp.name}</p>}
                            {subline && <p className="text-sm text-fg-muted mt-0.5">{subline}</p>}
                            {sp.bio && <p className="text-sm text-fg-muted/80 leading-snug mt-sm line-clamp-3 text-pretty">{sp.bio}</p>}
                            {profile && (
                              <a
                                href={profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-sm inline-flex items-center gap-xs text-xs font-semibold text-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                              >
                                View Profile
                                <ArrowRight size={13} strokeWidth={2} className="motion-safe:transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                              </a>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}
            </div>

            {/* Event details card — sticky on desktop, above content on mobile */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 min-w-0">
              <div className="rounded-ot-surface overflow-hidden bg-surface border border-fg/10">
                <div className="p-lg flex flex-col">
                  {rows.map((row, i) => (
                    <div key={i} className={i > 0 ? 'mt-md pt-md border-t border-fg/10' : ''}>
                      {row}
                    </div>
                  ))}
                </div>
                {regUrl && (
                  <a
                    href={regUrl}
                    className="btn-signal group flex items-center justify-center gap-xs rounded-ot-control bg-brand text-fg-on-brand px-lg py-md text-label uppercase tracking-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {isVirtual ? 'Join' : 'Register'}
                    <ArrowRight size={16} strokeWidth={2} className="motion-safe:transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </a>
                )}
              </div>
            </aside>

          </div>
        </div>
      </section>
    </article>
  )
}
