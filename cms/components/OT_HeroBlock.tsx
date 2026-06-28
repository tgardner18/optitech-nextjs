import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_HeroBlock as OT_HeroBlockContentType } from '@/cms/content-types/OT_HeroBlock'
import { getHeroStyles } from '@/cms/styling/OT_HeroBlock.styling'
import HeroBlock, { type HeroStyleOptions } from '@/components/blocks/HeroBlock'

type Props = {
  content: ContentProps<typeof OT_HeroBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_HeroBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  // layout / color / animation come from the display template; `direction` is a
  // content field on the block itself, merged in here.
  const styleOptions: HeroStyleOptions = {
    ...getHeroStyles(displaySettings),
    direction: (content.direction ?? 'editorialSplit') as HeroStyleOptions['direction'],
  }

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
