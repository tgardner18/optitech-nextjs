import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { cn } from '@/lib/utils'
import { getFeatureItemStyles } from '@/cms/styling/OT_FeatureItemBlock.styling'
import { buildFeatureItemFromContent } from '@/cms/adapters/featureItemData'
import FeatureTile from '@/components/blocks/FeatureTile'
import type { CompositionNode } from '@/cms/compositions/groupAdjacentComponents'

/**
 * Renders a synthetic "__OT_FeatureItemBlockGroup" node built by
 * cms/compositions/Column.tsx when 2+ OT_FeatureItemBlock elements sit
 * adjacently in a column: a 2-column grid that wraps into additional rows
 * (4 items -> 2x2). Never a real CMS content type — registered only in the
 * React component resolver.
 *
 * Per the confirmed design, the leading node's display settings control the
 * whole group's color/icon style; each node's own content fields (headline,
 * body, CTA, icon) still populate its own tile.
 *
 * color 'brand' needs a dark surface behind it — featureCardCva's brand
 * variant is a light overlay tint meant to sit on one (see
 * FeatureItemBlock's standalone equivalent), which nothing else here
 * supplies.
 */
type Props = {
  content: { __groupNodes: CompositionNode[] }
  displaySettings?: Record<string, string | boolean>
}

export default function OT_FeatureItemGroupAdapter({ content, displaySettings = {} }: Props) {
  const groupNodes     = content.__groupNodes ?? []
  const styleOptions   = getFeatureItemStyles(displaySettings)
  const isDarkSurface  = styleOptions.color === 'brand'

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-x-lg gap-y-lg w-full',
        isDarkSurface && 'bg-brand-fill rounded-ot-surface p-lg md:p-xl',
      )}
      data-theme={isDarkSurface ? 'dark' : undefined}
    >
      {groupNodes.map(node => {
        const { pa } = getPreviewUtils(node as any)
        const feature = buildFeatureItemFromContent(node.component)
        return (
          <div
            key={node.key}
            data-block="feature"
            data-solo=""
            data-color={styleOptions.color ?? 'canvas'}
            {...pa(node as any)}
          >
            <FeatureTile feature={feature} styleOptions={styleOptions} variant="card" />
          </div>
        )
      })}
    </div>
  )
}
