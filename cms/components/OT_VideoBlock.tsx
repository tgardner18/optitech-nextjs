import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getVideoStyles } from '@/cms/styling/OT_VideoBlock.styling'
import VideoBlock from '@/components/blocks/VideoBlock'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function OT_VideoBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getVideoStyles(displaySettings)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <VideoBlock
        src={content.videoUrl ?? ''}
        title={content.title ?? ''}
        caption={content.caption ?? undefined}
        styleOptions={styleOptions}
        previewAttrs={{ caption: pa('caption') }}
      />
    </div>
  )
}
