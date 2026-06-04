import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_RichTextBlock as OT_RichTextBlockContentType } from '@/cms/content-types/OT_RichTextBlock'
import { getRichTextStyles } from '@/cms/styling/OT_RichTextBlock.styling'
import RichTextBlock from '@/components/blocks/RichTextBlock'

type Props = {
  content: ContentProps<typeof OT_RichTextBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_RichTextBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getRichTextStyles(displaySettings)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <RichTextBlock
        content={content.content?.json ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
