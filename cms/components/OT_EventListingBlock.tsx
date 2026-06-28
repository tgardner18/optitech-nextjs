import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_EventListingBlock as OT_EventListingBlockContentType } from '@/cms/content-types/OT_EventListingBlock'
import { getRequestLocale, getRequestBaseUrl } from '@/lib/optimizely'
import { getAllEvents, getUpcomingEvents } from '@/lib/events'
import { getEventListingStyles } from '@/cms/styling/OT_EventListingBlock.styling'
import EventListingBlock from '@/components/blocks/EventListingBlock'

type Props = {
  content:          ContentProps<typeof OT_EventListingBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Async server component. Fetches events at render time, then hands them to the
// server wrapper (which applies the type lock and renders the heading) and the
// client component (which owns all interaction). React cache() in lib/events.ts
// dedups the round-trip when multiple listings share a locale.
export default async function OT_EventListingBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  const styleOptions = getEventListingStyles(content.defaultView ? { ...displaySettings, defaultView: content.defaultView } : displaySettings)

  const locale      = await getRequestLocale()
  const siteBaseUrl = await getRequestBaseUrl()

  // The calendar always needs the full set (past + future). Card/list with past
  // events hidden can fetch only upcoming. Decide which loader to call.
  const canReachCalendar = styleOptions.defaultView === 'calendar' || styleOptions.showViewToggle
  const needsAll = styleOptions.showPastEvents !== 'hide' || canReachCalendar

  const events = needsAll
    ? await getAllEvents(undefined, locale, siteBaseUrl || null)
    : await getUpcomingEvents(undefined, locale, siteBaseUrl || null)

  const rawMax = content.maxItems ?? 0
  const maxItems = Number.isInteger(rawMax) && rawMax >= 1 ? rawMax : undefined

  const filterByType =
    typeof content.filterByType === 'string' && content.filterByType
      ? content.filterByType
      : null

  return (
    <div {...pa(content.__composition)} className="w-full">
      <EventListingBlock
        heading={content.heading ?? undefined}
        subtext={content.subtext ?? undefined}
        events={events}
        filterByType={filterByType}
        maxItems={maxItems}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
