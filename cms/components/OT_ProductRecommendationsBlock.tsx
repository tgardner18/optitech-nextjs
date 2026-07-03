import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_ProductRecommendationsBlock as OT_ProductRecommendationsBlockContentType } from '@/cms/content-types/OT_ProductRecommendationsBlock'
import ProductRecommendationsBlock from '@/components/blocks/ProductRecommendationsBlock'
import type { ProductRecColor } from '@/components/blocks/ProductRecommendationsBlock'

type Props = {
  content:          ContentProps<typeof OT_ProductRecommendationsBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Live-only: no server data fetch. The Peerius engine (script injected in
// app/layout.tsx when configured) fires recommendations client-side; the widget
// listens for the `peerius:recs` event. The adapter just maps CMS props.

export default function OT_ProductRecommendationsBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa } = getPreviewUtils(content)

  const initialCount = Number(content.initialCount) || 3
  const color = String(displaySettings.color ?? 'canvas') as ProductRecColor

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ProductRecommendationsBlock
        heading={content.heading ?? undefined}
        subheading={content.subheading ?? undefined}
        widgetPosition={content.widgetPosition ?? undefined}
        initialCount={initialCount}
        showAllLabel={content.showAllLabel ?? 'Show all'}
        color={color}
        pa={pa}
      />
    </div>
  )
}
