import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getImageStyles } from '@/cms/styling/OT_ImageBlock.styling'
import ImageBlock from '@/components/blocks/ImageBlock'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

// ImageBlock is 'use client' — this server shell applies the block-level preview
// attribute on the outer div; field editing is available through the CMS right panel.
export default function OT_ImageBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getImageStyles(displaySettings)

  return (
    <div {...pa()}>
      <ImageBlock
        src={src(content.image) ?? ''}
        alt={content.alt ?? ''}
        caption={content.caption ?? undefined}
        styleOptions={styleOptions}
      />
    </div>
  )
}
