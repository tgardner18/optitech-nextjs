import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { cn } from '@/lib/utils'
import { getStatItemStyles } from '@/cms/styling/OT_StatItemBlock.styling'
import { buildStatItemFromContent } from '@/cms/adapters/statItemData'
import StatTile from '@/components/blocks/StatTile'
import type { CompositionNode } from '@/cms/compositions/groupAdjacentComponents'

/**
 * Renders a synthetic "__OT_StatItemBlockGroup" node built by
 * cms/compositions/Column.tsx when 2+ OT_StatItemBlock elements sit
 * adjacently in a column: a 2-column grid that wraps into additional rows
 * (4 items -> 2x2), rather than each stat rendering as its own bordered
 * standalone card. Never a real CMS content type — registered only in the
 * React component resolver.
 *
 * Per the confirmed design, the leading node's display settings (already
 * parsed by the SDK's OptimizelyGridSection before this component is
 * reached) control the whole group's color/glass/icon placement; each
 * node's own content fields (value, label, context, icon, effect) still
 * populate its own tile.
 *
 * color 'canvas'/'surface' render bare (horizontally) — dark numerals
 * directly on whatever background the column already sits on (StatTile's
 * `row` variant has no fill of its own). color 'brand' needs a dark surface
 * for its light-on-dark text to read at all, so the group supplies one
 * itself here — unlike a standalone StatItemBlock, there's no per-tile card
 * to carry it. Vertical padding is always applied regardless of color, so
 * the group never sits flush against whatever comes before/after it in the
 * column.
 */
type Props = {
  content: { __groupNodes: CompositionNode[] }
  displaySettings?: Record<string, string | boolean>
}

export default function OT_StatItemGroupAdapter({ content, displaySettings = {} }: Props) {
  const groupNodes    = content.__groupNodes ?? []
  const styleOptions  = getStatItemStyles(displaySettings)
  const isDarkSurface = styleOptions.color === 'brand'
  const tileVariant   = styleOptions.glass ? 'card' : 'row'

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-x-xl gap-y-lg w-full py-lg md:py-xl',
        isDarkSurface && 'bg-brand-fill rounded-ot-surface px-lg md:px-xl',
      )}
      data-theme={isDarkSurface ? 'dark' : undefined}
    >
      {groupNodes.map(node => {
        const { pa } = getPreviewUtils(node as any)
        const { stat, effect } = buildStatItemFromContent(node.component)
        return (
          <div
            key={node.key}
            data-block="stat"
            data-solo=""
            data-color={styleOptions.color ?? 'brand'}
            data-glass={styleOptions.glass ? 'yes' : 'no'}
            data-effect={effect}
            data-place={styleOptions.iconPlacement ?? 'inline'}
            {...pa(node as any)}
          >
            <StatTile
              stat={stat}
              styleOptions={styleOptions}
              effect={effect}
              variant={tileVariant}
              align="center"
            />
          </div>
        )
      })}
    </div>
  )
}
