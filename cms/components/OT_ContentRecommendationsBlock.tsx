import { cookies } from 'next/headers'
import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_ContentRecommendationsBlock as OT_ContentRecommendationsBlockContentType } from '@/cms/content-types/OT_ContentRecommendationsBlock'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { fetchContentRecommendations } from '@/lib/recommendations/contentRecs'
import ContentRecommendationsBlock from '@/components/blocks/ContentRecommendationsBlock'
import type { ContentRecColor } from '@/components/blocks/ContentRecommendationsBlock'

type Props = {
  content:          ContentProps<typeof OT_ContentRecommendationsBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Idio sets the visitor id in the `iv` cookie via ia.js. Before it exists
// (first SSR), fall back to a demo id so the API still returns generic recs.
const FALLBACK_VISITOR_ID = '123'

export default async function OT_ContentRecommendationsBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const apiKey   = (settings?.contentRecsApiKey as string | null | undefined) ?? ''

  const rpp = Number(content.rpp) || 3
  const visitorId = (await cookies()).get('iv')?.value || FALLBACK_VISITOR_ID

  const items = apiKey
    ? await fetchContentRecommendations({ apiKey, rpp, visitorId })
    : []

  const color = String(displaySettings.color ?? 'canvas') as ContentRecColor

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ContentRecommendationsBlock
        heading={content.heading ?? undefined}
        subheading={content.subheading ?? undefined}
        items={items}
        color={color}
        pa={pa}
      />
    </div>
  )
}
