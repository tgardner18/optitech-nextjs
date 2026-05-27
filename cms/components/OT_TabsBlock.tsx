import { getPreviewUtils }   from '@optimizely/cms-sdk/react/server'
import { getTabsStyles }     from '@/cms/styling/OT_TabsBlock.styling'
import TabsBlock             from '@/components/blocks/TabsBlock'
import type { TabItemData }  from '@/components/blocks/TabsBlock'

type Props = {
  content:          any
  displaySettings?: Record<string, string | boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTabs(content: any, src: (ref: any) => string | undefined): TabItemData[] {
  if (!Array.isArray(content.tabs)) return []
  return (content.tabs as any[]).map(item => ({
    tabLabel:  String(item.tabLabel  ?? ''),
    tabIcon:   item.tabIcon          ?? undefined,
    heading:   item.heading          ?? undefined,
    body:      item.body             ?? undefined,
    imageSrc:  src(item.image)       ?? undefined,
    imageAlt:  item.imageAlt         ?? '',
    ctaLabel:  item.ctaLabel         ?? undefined,
    ctaUrl:    item.ctaUrl?.default  ?? item.ctaUrl ?? undefined,
  })).filter(t => t.tabLabel)
}

export default function OT_TabsBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getTabsStyles(displaySettings)
  const tabs         = buildTabs(content, src)

  return (
    <div {...pa(content.__composition)}>
      <TabsBlock
        eyebrow={content.eyebrow ?? undefined}
        heading={content.heading ?? undefined}
        tabs={tabs}
        styleOptions={styleOptions}
      />
    </div>
  )
}
