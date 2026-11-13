import type { ReactNode } from 'react'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'
import Button from '@/components/ui/Button'
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

// ─── Fact row (a <dl> entry in the details card) ─────────────────────────────

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock
  label: string
  children: ReactNode
}) {
  return (
    <div data-part="fact">
      <span data-part="fact-ic" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <dt>{label}</dt>
      <dd>{children}</dd>
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
    <h2 data-part="section-h">{children}</h2>
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
    rows.push(<Fact key="date" icon={Calendar} label="Date">{dateLabel}</Fact>)
  }
  if (timeLabel) {
    rows.push(
      <Fact key="time" icon={Clock} label="Time">
        {timeLabel}
        {tzAbbr && (
          <> <abbr data-part="tz">{tzAbbr}</abbr></>
        )}
      </Fact>,
    )
  }
  if (locationType || venueName || city) {
    rows.push(
      <Fact key="loc" icon={isVirtual ? Monitor : MapPin} label="Location">
        {isVirtual ? (
          venueName || 'Virtual'
        ) : venueName || city ? (
          <>
            {venueName}
            {city && <span data-part="sub">{city}</span>}
          </>
        ) : (
          locationTypeLabel(locationType)
        )}
      </Fact>,
    )
  }
  if (hasCredit) {
    rows.push(
      <Fact key="credit" icon={Award} label="Professional credit">
        <span data-part="credit"><b>{creditHoursLabel}</b> {creditType}</span>
      </Fact>,
    )
  }

  const headFacts = (
    <p data-part="head-facts">
      {dateLabel && <><Calendar size={16} strokeWidth={2} aria-hidden />{dateLabel}</>}
      {dateLabel && (city || venueName) && <span aria-hidden="true">·</span>}
      {(city || venueName) && <>{isVirtual ? <Monitor size={16} strokeWidth={2} aria-hidden /> : <MapPin size={16} strokeWidth={2} aria-hidden />}{city || venueName}</>}
    </p>
  )

  return (
    <article data-block="event-page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header data-part="head" data-media={imageUrl ? '' : undefined} data-theme={imageUrl ? 'dark' : undefined}>
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-part="head-img" src={imageUrl} alt="" aria-hidden {...pa?.('featuredImage')} />
            <span data-part="scrim" aria-hidden="true" />
          </>
        ) : (
          <span data-part="rule" aria-hidden="true" />
        )}
        <div data-part="head-in">
          {eventType && <span data-part="badge" data-on-media={imageUrl ? '' : undefined} {...pa?.('eventType')}>{eventTypeLabel(eventType)}</span>}
          <h1 data-part="title" {...pa?.('title')}>{title}</h1>
          {headFacts}
        </div>
      </header>

      {/* ── Body: main column + sticky facts rail (stacks above content on mobile) ── */}
      <div data-part="body">
        <div data-part="grid">
          <div data-part="main">
            {description?.html && (
              <div
                data-rich-text=""
                data-color="canvas"
                data-part="desc"
                {...pa?.('description')}
                // CMS-managed rich text — not user input
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(description.html) }}
              />
            )}

            {agenda && agenda.length > 0 && (
              <section data-part="section" {...pa?.('agenda')}>
                <SectionHeading>Agenda</SectionHeading>
                <ol data-part="agenda">
                  {agenda.map((item, i) => {
                    const t = splitTimeRange(item.time)
                    return (
                      <li key={i} data-part="slot">
                        <p data-part="time">
                          {t && <><time>{t.start}</time>{t.end && <span>to {t.end}</span>}</>}
                        </p>
                        <span data-part="node" aria-hidden="true" />
                        <div data-part="slot-body">
                          {item.title && <h3>{item.title}</h3>}
                          {item.description && <p>{item.description}</p>}
                          {item.speaker && (
                            <p data-part="who"><User size={14} strokeWidth={2} aria-hidden />{item.speaker}</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}

            {speakers && speakers.length > 0 && (
              <section data-part="section" {...pa?.('speakers')}>
                <SectionHeading>Speakers</SectionHeading>
                <ul data-part="speakers">
                  {speakers.map((sp, i) => {
                    const photo    = sp.headshot?.url?.default || null
                    const profile  = sp.profileUrl?.default || null
                    const subline  = [sp.title, sp.organization].filter(Boolean).join(' · ')
                    const initials = getInitials(sp.name)
                    return (
                      <li key={i} data-part="speaker" data-linked={profile ? '' : undefined}>
                        <span data-part="avatar">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" />
                          ) : initials ? (
                            <b aria-hidden="true">{initials}</b>
                          ) : (
                            <User size={32} strokeWidth={1.75} aria-hidden />
                          )}
                        </span>
                        <div data-part="sp-body">
                          {sp.name && (
                            <h3>
                              {profile
                                ? <a href={profile} target="_blank" rel="noopener noreferrer" data-part="sp-link">{sp.name}</a>
                                : sp.name}
                            </h3>
                          )}
                          {subline && <p data-part="sp-role">{subline}</p>}
                          {sp.bio && <p data-part="sp-bio">{sp.bio}</p>}
                          {profile && <span data-part="sp-more" aria-hidden="true">View profile<ArrowRight size={14} strokeWidth={2} /></span>}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>

          <aside data-part="aside" aria-label="Event details">
            <div data-part="card">
              <dl data-part="facts">{rows}</dl>
              {regUrl && (
                <div data-part="cta">
                  <Button variant="brand" href={regUrl} trailingIcon={<ArrowRight size={16} strokeWidth={2} />}>
                    {isVirtual ? 'Join' : 'Register'}
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
