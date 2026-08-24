import { ContentProps }    from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_CarouselBlock as OT_CarouselBlockContentType } from '@/cms/content-types/OT_CarouselBlock'
import { getCarouselStyles }  from '@/cms/styling/OT_CarouselBlock.styling'
import CarouselBlock          from '@/components/blocks/CarouselBlock'
import type { CarouselSlideData } from '@/components/blocks/CarouselBlock'

type Props = {
  content:          ContentProps<typeof OT_CarouselBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSlides(content: any, src: (ref: any) => string | undefined): CarouselSlideData[] {
  if (!Array.isArray(content.slides)) return []
  return (content.slides as any[]).map(item => ({
    imageSrc:  src(item.image) ?? item.imageSrc ?? undefined,
    imageAlt:  item.imageAlt  ?? '',
    eyebrow:   item.eyebrow   ?? undefined,
    heading:   item.heading   ?? undefined,
    body:      item.body      ?? undefined,
    ctaLabel:  item.ctaLabel  ?? undefined,
    ctaUrl:    item.ctaUrl?.default ?? item.ctaUrl ?? undefined,
  }))
}

export default function OT_CarouselBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa, src }       = getPreviewUtils(content)
  const styleOptions      = getCarouselStyles(displaySettings)
  const slides            = buildSlides(content, src)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  return (
    <div
      {...pa(content.__composition)}
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
      <CarouselBlock
        eyebrow={content.eyebrow ?? undefined}
        heading={content.heading ?? undefined}
        slides={slides}
        styleOptions={styleOptions}
      />
    </div>
  )
}
