import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_CardBlock as OT_CardBlockContentType } from '@/cms/content-types/OT_CardBlock'
import { getCardStyles } from '@/cms/styling/OT_CardBlock.styling'
import CardBlock from '@/components/blocks/CardBlock'

type Props = {
  content: ContentProps<typeof OT_CardBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_CardBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getCardStyles(content.imageStyle ? { ...displaySettings, imageStyle: content.imageStyle } : displaySettings)
  const imageSrc = content.image ? src(content.image) : undefined

  return (
    <div {...pa(content.__composition)} className="w-full h-full flex-1">
      <CardBlock
        heading={content.Heading ?? ''}
        eyebrow={content.Eyebrow ?? undefined}
        description={content.Description?.json ?? undefined}
        image={
          imageSrc
            ? { src: imageSrc, alt: content.imageAlt ?? '' }
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
