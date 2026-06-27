import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_LocationListingBlock as OT_LocationListingBlockContentType } from '@/cms/content-types/OT_LocationListingBlock'
import { getRequestLocale } from '@/lib/optimizely'
import { getAllLocations } from '@/lib/locations'
import { getLocationListingStyles } from '@/cms/styling/OT_LocationListingBlock.styling'
import LocationListingBlock from '@/components/blocks/LocationListingBlock'

type Props = {
  content:          ContentProps<typeof OT_LocationListingBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Async server component. Fetches location records at render time (scoped to the
// editor's group tag), then hands them to the server wrapper, which geocodes the
// addresses and delegates to the client. React cache() in lib/locations.ts dedups
// the Graph round-trip across multiple listings on one page.
export default async function OT_LocationListingBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  const styleOptions = getLocationListingStyles(displaySettings)
  const locale       = await getRequestLocale()

  const groupTag =
    typeof content.groupTagFilter === 'string' && content.groupTagFilter.trim()
      ? content.groupTagFilter.trim()
      : undefined

  const rawMax = content.maxItems ?? 0
  const limit  = Number.isInteger(rawMax) && rawMax >= 1 ? rawMax : 50

  const locations = await getAllLocations({ groupTag, limit, locale })

  return (
    <div {...pa(content.__composition)} className="w-full">
      <LocationListingBlock
        heading={content.heading ?? undefined}
        subtext={content.subtext ?? undefined}
        locations={locations}
        emptyMessage={content.emptyMessage ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
