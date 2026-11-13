import EventListingClient from './EventListingBlock.client'
import type { EventCardData } from '@/lib/events'
import type { EventListingStyleOptions } from '@/cms/styling/OT_EventListingBlock.styling'

export type EventListingBlockProps = {
  heading?:      string
  subtext?:      string
  events:        EventCardData[]
  /** When set by the editor, the listing is locked to this event type. */
  filterByType?: string | null
  /** Caps the card/list views; the calendar always shows the full set. */
  maxItems?:     number
  styleOptions:  EventListingStyleOptions
  /** True for any CMS draft/preview render (Visual Builder, draft links) — hides the filter drawer. */
  isPreview?:    boolean
  /** Preview-attribute factory from getPreviewUtils — server context only. */
  pa?:           (prop: string) => Record<string, unknown>
}

// Server wrapper (no 'use client'): renders the heading/subtext server-side so
// they carry preview attributes and are SEO-indexable, applies the editor's
// type lock, and hands the data + style options to the client component, which
// owns all interaction state (view toggle, chips, past-events, calendar nav).
export default function EventListingBlock({
  heading,
  subtext,
  events,
  filterByType = null,
  maxItems,
  styleOptions,
  isPreview = false,
  pa = () => ({}),
}: EventListingBlockProps) {
  const { color } = styleOptions

  // Type lock is applied server-side so the client never receives off-type events.
  const scoped = filterByType
    ? events.filter(e => e.eventType === filterByType)
    : events

  // Stamp "now" server-side and pass it down so the upcoming/past split and the
  // calendar's today marker render identically on server and client (no hydration drift).
  const nowIso = new Date().toISOString()

  return (
    <section data-block="events" data-color={color} data-view={styleOptions.defaultView}>
      <div data-part="inner">
        {(heading || subtext) && (
          <header data-part="head">
            {heading && <h2 data-part="headline" {...pa('heading')}>{heading}</h2>}
            {subtext && <p data-part="sub" {...pa('subtext')}>{subtext}</p>}
          </header>
        )}

        <EventListingClient
          events={scoped}
          maxItems={maxItems}
          defaultView={styleOptions.defaultView}
          color={color}
          showViewToggle={styleOptions.showViewToggle}
          showTypeFilter={styleOptions.showTypeFilter}
          pastMode={styleOptions.showPastEvents}
          typeLocked={!!filterByType}
          nowIso={nowIso}
          isPreview={isPreview}
        />
      </div>
    </section>
  )
}
