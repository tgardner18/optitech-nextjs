import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_PractitionerListingBlock as OT_PractitionerListingBlockContentType } from '@/cms/content-types/OT_PractitionerListingBlock'
import { getRequestLocale } from '@/lib/optimizely'
import { getAllPractitioners } from '@/lib/practitioners'
import { getPractitionerListingStyles } from '@/cms/styling/OT_PractitionerListingBlock.styling'
import PractitionerListingBlock from '@/components/blocks/PractitionerListingBlock'

type Props = {
  content:          ContentProps<typeof OT_PractitionerListingBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Async server component. Fetches practitioners at render time (scoped to the
// editor's group tag), then hands them to the server wrapper + client component.
// React cache() in lib/practitioners.ts dedups the round-trip across listings.
export default async function OT_PractitionerListingBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  const styleOptions = getPractitionerListingStyles(content.layout ? { ...displaySettings, layout: content.layout } : displaySettings)
  const locale       = await getRequestLocale()

  const groupTag =
    typeof content.groupTagFilter === 'string' && content.groupTagFilter.trim()
      ? content.groupTagFilter.trim()
      : undefined

  const rawMax  = content.maxItems ?? 0
  const limit   = Number.isInteger(rawMax) && rawMax >= 1 ? rawMax : 24

  const practitioners = await getAllPractitioners({ groupTag, limit, locale })

  return (
    <div {...pa(content.__composition)} className="w-full">
      <PractitionerListingBlock
        heading={content.heading ?? undefined}
        subtext={content.subtext ?? undefined}
        practitioners={practitioners}
        emptyMessage={content.emptyMessage ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
