import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getRichTextStyles } from '@/cms/styling/OT_RichTextBlock.styling'
import RichTextBlock from '@/components/blocks/RichTextBlock'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function OT_RichTextBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getRichTextStyles(displaySettings)

  return (
    <div {...pa(content.__composition)}>
      <RichTextBlock
        content={content.content?.html ?? ''}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
