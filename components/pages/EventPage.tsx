import { CalendarDays, Clock, MapPin, Video, Award, ArrowRight } from 'lucide-react'
import type { EventPageContent } from '@/lib/events'
import {
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
  formatEventLocation,
  formatCredit,
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
          ? 'inline-flex items-center px-sm py-0.75 bg-accent text-fg-on-accent text-label uppercase tracking-label font-semibold'
          : 'inline-flex items-center gap-xs text-label uppercase tracking-label font-semibold text-accent'
      }
    >
      {!onImage && <span className="block w-6 h-px bg-accent flex-none" aria-hidden />}
      {eventTypeLabel(type)}
    </span>
  )
}

// ─── Fact row ───────────────────────────────────────────────────────────────────

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-sm">
      <span className="flex-none mt-0.5 text-brand" aria-hidden>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-label uppercase tracking-label font-semibold text-fg-muted/70">{label}</p>
        <p className="text-body text-fg leading-snug">{value}</p>
      </div>
    </div>
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
  } = content

  const imageUrl     = featuredImage?.url?.default || null
  const dateLabel    = formatEventDate(startDate, endDate)
  const timeLabel    = formatEventTime(startDate, endDate)
  const locationLine = formatEventLocation({ locationType, venueName, city })
  const creditLabel  = formatCredit(creditType, creditHours)
  const regUrl       = registrationUrl?.default || null
  const isVirtual    = locationType === 'virtual'

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

      {/* ── Body + facts rail ───────────────────────────────────────────────── */}
      <section className="bg-canvas pt-xl pb-2xl">
        <div className="mx-auto max-w-5xl px-md lg:px-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-xl items-start">

            {/* Main column — single description. The opening paragraph carries
                the editorial lead-in (deck) at title scale; the remainder reads
                as the article body at the standard measure. */}
            <div className="min-w-0 order-2 lg:order-1">
              {description?.html && (
                <div
                  data-rich-text=""
                  data-color="canvas"
                  className="max-w-[68ch] [&>p:first-of-type]:text-title [&>p:first-of-type]:leading-title [&>p:first-of-type]:text-fg-muted [&>p:first-of-type]:text-pretty [&>p:first-of-type]:mb-lg"
                  {...pa?.('description')}
                  // CMS-managed rich text — not user input
                  dangerouslySetInnerHTML={{ __html: description.html }}
                />
              )}
            </div>

            {/* Facts rail */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="bg-surface border border-fg/10 p-lg flex flex-col gap-md">
                {dateLabel && <Fact icon={CalendarDays} label="Date" value={dateLabel} />}
                {timeLabel && <Fact icon={Clock} label="Time" value={timeLabel} />}
                {locationLine && (
                  <Fact icon={isVirtual ? Video : MapPin} label="Location" value={locationLine} />
                )}
                {creditLabel && <Fact icon={Award} label="Credit" value={`${creditLabel} credit`} />}

                {regUrl && (
                  <a
                    href={regUrl}
                    className="btn-signal group mt-xs inline-flex items-center justify-center gap-xs bg-brand text-fg-on-brand px-lg py-md text-label uppercase tracking-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Register
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
