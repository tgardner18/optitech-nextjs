import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_HeroBlock } from '@/cms/content-types/OT_HeroBlock'
import { getHeroStyles } from '@/cms/styling/OT_HeroBlock.styling'
import HeroBlock from '@/components/blocks/HeroBlock'

type Props = {
  content: ContentProps<typeof OT_HeroBlock>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_HeroBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getHeroStyles(displaySettings)

  return (
    <div {...pa(content.__composition)}>
      <HeroBlock
        eyebrow={content.eyebrow ?? undefined}
        headline={content.headline ?? ''}
        body={content.body ?? undefined}
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
        visualSrc={src(content.visual)}
        visualAlt={content.visualAlt ?? undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
