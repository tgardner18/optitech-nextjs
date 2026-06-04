import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_CardBlock } from '@/cms/content-types/OT_CardBlock'
import { getCardStyles } from '@/cms/styling/OT_CardBlock.styling'
import CardBlock from '@/components/blocks/CardBlock'

type Props = {
  content: ContentProps<typeof OT_CardBlock>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_CardBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getCardStyles(displaySettings)

  return (
    <div {...pa(content.__composition)} className="w-full h-full">
      <CardBlock
        heading={content.Heading ?? ''}
        eyebrow={content.Eyebrow ?? undefined}
        description={content.Description?.json ?? undefined}
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
        pa={pa}
      />
    </div>
  )
}
