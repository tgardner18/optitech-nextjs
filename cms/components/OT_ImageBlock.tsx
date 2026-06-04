import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_ImageBlock } from '@/cms/content-types/OT_ImageBlock'
import { getImageStyles } from '@/cms/styling/OT_ImageBlock.styling'
import ImageBlock from '@/components/blocks/ImageBlock'

type Props = {
  content: ContentProps<typeof OT_ImageBlock>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_ImageBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getImageStyles(displaySettings)
  const imageSrc = src(content.image)

  if (!imageSrc) {
    return (
      <div
        {...pa(content.__composition)}
        className="w-full flex items-center justify-center bg-surface border border-fg/10"
        style={{ minHeight: 200 }}
      >
        <p className="text-label text-fg-muted/60 font-mono">
          Image not available — publish the asset in CMS to display it
        </p>
      </div>
    )
  }

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ImageBlock
        src={imageSrc}
        alt={content.alt ?? ''}
        caption={content.caption ?? undefined}
        styleOptions={styleOptions}
        previewAttrs={{ image: pa('image'), caption: pa('caption') }}
      />
    </div>
  )
}
