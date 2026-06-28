import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_PrimaryTextBlock as OT_PrimaryTextBlockContentType } from '@/cms/content-types/OT_PrimaryTextBlock'
import { getPrimaryTextStyles } from '@/cms/styling/OT_PrimaryTextBlock.styling'
import PrimaryTextBlock from '@/components/blocks/PrimaryTextBlock'

type Props = {
  content: ContentProps<typeof OT_PrimaryTextBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_PrimaryTextBlock({ content, displaySettings = {} }: Props) {
  const { pa }            = getPreviewUtils(content)
  const styleOptions      = getPrimaryTextStyles(content.headerEffect ? { ...displaySettings, headerEffect: content.headerEffect } : displaySettings)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  return (
    <div
      {...pa(content.__composition)}
      className="w-full"
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
      <PrimaryTextBlock
        eyebrow={content.eyebrow ?? undefined}
        headline={content.headline ?? ''}
        headingLevel={(content.headingLevel as 'h1' | 'h2' | undefined) ?? 'h2'}
        body={content.body?.json ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
