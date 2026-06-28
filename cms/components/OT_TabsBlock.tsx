import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }   from '@optimizely/cms-sdk/react/server'
import { OT_TabsBlock as OT_TabsBlockContentType } from '@/cms/content-types/OT_TabsBlock'
import { getTabsStyles }     from '@/cms/styling/OT_TabsBlock.styling'
import TabsBlock             from '@/components/blocks/TabsBlock'
import type { TabItemData }  from '@/components/blocks/TabsBlock'

type Props = {
  content:          ContentProps<typeof OT_TabsBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTabs(content: any, src: (ref: any) => string | undefined): TabItemData[] {
  if (!Array.isArray(content.tabs)) return []
  return (content.tabs as any[]).map(item => ({
    tabLabel:  String(item.tabLabel  ?? ''),
    tabIcon:   item.tabIcon          ?? undefined,
    heading:   item.heading          ?? undefined,
    body:      item.body?.json        ?? undefined,
    imageSrc:  src(item.image)       ?? undefined,
    imageAlt:  item.imageAlt         ?? '',
    ctaLabel:  item.ctaLabel         ?? undefined,
    ctaUrl:    item.ctaUrl?.default  ?? item.ctaUrl ?? undefined,
  })).filter(t => t.tabLabel)
}

export default function OT_TabsBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa, src }       = getPreviewUtils(content)
  const styleOptions      = getTabsStyles(content.tabStyle ? { ...displaySettings, tabStyle: content.tabStyle } : displaySettings)
  const tabs              = buildTabs(content, src)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  return (
    <div
      {...pa(content.__composition)}
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
      <TabsBlock
        eyebrow={content.eyebrow ?? undefined}
        heading={content.heading ?? undefined}
        tabs={tabs}
        styleOptions={styleOptions}
      />
    </div>
  )
}
