import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_QuoteBlock } from '@/cms/content-types/OT_QuoteBlock'
import { getQuoteStyles } from '@/cms/styling/OT_QuoteBlock.styling'
import QuoteBlock from '@/components/blocks/QuoteBlock'

type Props = {
  content: ContentProps<typeof OT_QuoteBlock>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_QuoteBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getQuoteStyles(displaySettings)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <QuoteBlock
        quote={content.quote ?? ''}
        attribution={{ name: content.attributionName ?? '', title: content.attributionTitle ?? undefined }}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
