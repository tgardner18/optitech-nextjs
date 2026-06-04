import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_PrimaryTextBlock } from '@/cms/content-types/OT_PrimaryTextBlock'
import { getPrimaryTextStyles } from '@/cms/styling/OT_PrimaryTextBlock.styling'
import PrimaryTextBlock from '@/components/blocks/PrimaryTextBlock'

type Props = {
  content: ContentProps<typeof OT_PrimaryTextBlock>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_PrimaryTextBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getPrimaryTextStyles(displaySettings)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <PrimaryTextBlock
        eyebrow={content.eyebrow ?? undefined}
        headline={content.headline ?? ''}
        body={content.body?.json ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
