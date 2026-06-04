import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }              from '@optimizely/cms-sdk/react/server'
import { OT_StatBlock as OT_StatBlockContentType } from '@/cms/content-types/OT_StatBlock'
import { getStatBlockStyles, getStatBlockIcons } from '@/cms/styling/OT_StatBlock.styling'
import StatBlock, { type StatItem }     from '@/components/blocks/StatBlock'

type Props = {
  content:          ContentProps<typeof OT_StatBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

/**
 * Build a base StatItem[] from content (without icons — those come from
 * display settings and are overlaid below).
 *
 * Supports three formats:
 *   1. CMS array:   content.stats[]   — OT_StatItem components (current)
 *   2. Items array: content.items[]   — showcase / testing format
 *   3. Flat props:  content.stat1Value … stat4Value — legacy fallback
 */
function buildStats(content: any): StatItem[] {
  // CMS array property (OT_StatItem components)
  if (Array.isArray(content.stats)) {
    return (content.stats as any[])
      .filter(item => item?.value && item?.label)
      .map(item => ({
        value:   String(item.value),
        label:   String(item.label),
        context: item.context ? String(item.context) : undefined,
        icon:    item.icon    ? String(item.icon)    : undefined,
      }))
  }

  // Format 3: flat CMS properties (legacy — stat1Value … stat4Value)
  const stats: StatItem[] = []
  for (let n = 1; n <= 4; n++) {
    const v = content[`stat${n}Value`]
    const l = content[`stat${n}Label`]
    if (v && l) {
      stats.push({
        value:   String(v),
        label:   String(l),
        context: content[`stat${n}Context`] ? String(content[`stat${n}Context`]) : undefined,
      })
    }
  }
  return stats
}

export default function OT_StatBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getStatBlockStyles(displaySettings)
  const slotIcons    = getStatBlockIcons(displaySettings)

  // Slot icons (display settings) take precedence; content icon is the fallback
  const stats: StatItem[] = buildStats(content).map((stat, i) => ({
    ...stat,
    icon: slotIcons[i] ?? stat.icon,
  }))

  return (
    <div {...pa(content.__composition)} className="w-full">
      <StatBlock
        stats={stats}
        styleOptions={styleOptions}
      />
    </div>
  )
}
