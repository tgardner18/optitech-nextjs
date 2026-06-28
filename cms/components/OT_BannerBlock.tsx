import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }        from '@optimizely/cms-sdk/react/server'
import { OT_BannerBlock as OT_BannerBlockContentType } from '@/cms/content-types/OT_BannerBlock'
import { getBannerStyles }        from '@/cms/styling/OT_BannerBlock.styling'
import BannerBlock                from '@/components/blocks/BannerBlock'

type Props = {
  content:          ContentProps<typeof OT_BannerBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_BannerBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getBannerStyles(content.treatment ? { ...displaySettings, treatment: content.treatment } : displaySettings)

  return (
    <div {...pa(content.__composition)}>
      <BannerBlock
        heading={content.heading ?? ''}
        headingLevel={(content.headingLevel as 'h1' | 'h2' | undefined) ?? 'h2'}
        eyebrow={content.eyebrow ?? undefined}
        body={content.body?.json ?? undefined}
        bgImageSrc={src(content.backgroundImage) ?? undefined}
        primaryCta={
          content.primaryCtaLabel
            ? { label: content.primaryCtaLabel, href: content.primaryCtaUrl?.default ?? '#' }
            : undefined
        }
        secondaryCta={
          content.secondaryCtaLabel
            ? { label: content.secondaryCtaLabel, href: content.secondaryCtaUrl?.default ?? '#' }
            : undefined
        }
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
