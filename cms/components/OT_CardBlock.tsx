import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getCardStyles } from '@/cms/styling/OT_CardBlock.styling'
import CardBlock from '@/components/blocks/CardBlock'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function OT_CardBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getCardStyles(displaySettings)

  return (
    <div {...pa()}>
      <CardBlock
        heading={content.heading ?? ''}
        eyebrow={content.eyebrow ?? undefined}
        description={content.description ?? undefined}
        image={
          content.image
            ? { src: src(content.image) ?? '', alt: content.imageAlt ?? '' }
            : undefined
        }
        cta={
          content.ctaLabel
            ? { label: content.ctaLabel, href: content.ctaUrl?.default ?? '#' }
            : undefined
        }
        styleOptions={styleOptions}
      />
    </div>
  )
}
