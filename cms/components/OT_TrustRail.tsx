import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }       from '@optimizely/cms-sdk/react/server'
import { OT_TrustRail } from '@/cms/content-types/OT_TrustRail'
import { getTrustRailStyles }    from '@/cms/styling/OT_TrustRail.styling'
import TrustRail, { type LogoItem } from '@/components/blocks/TrustRail'

type Props = {
  content:          ContentProps<typeof OT_TrustRail>
  displaySettings?: Record<string, string | boolean>
}

/**
 * Resolve each OT_LogoItem entry from the CMS array into the plain
 * LogoItem shape the UI component expects.
 *
 * content.logos is an array of OT_LogoItem components. The CMS SDK
 * resolves content references so logo.image.url.default is the CDN URL.
 */
function buildLogos(content: any): LogoItem[] {
  if (!Array.isArray(content.logos)) return []

  return (content.logos as any[])
    .map((item): LogoItem | null => {
      const imageUrl = item?.image?.url?.default ?? item?.image?.url
      if (!imageUrl) return null
      return {
        imageUrl: String(imageUrl),
        altText:  item.altText  ? String(item.altText)       : undefined,
        url:      item.url?.default ?? item.url ?? undefined,
      }
    })
    .filter((l): l is LogoItem => l !== null)
}

export default function OT_TrustRailAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getTrustRailStyles(displaySettings)
  const logos        = buildLogos(content)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <TrustRail
        headline={content.headline ?? undefined}
        logos={logos}
        styleOptions={styleOptions}
      />
    </div>
  )
}
