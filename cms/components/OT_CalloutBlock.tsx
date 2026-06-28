import { ContentProps }     from '@optimizely/cms-sdk'
import { getPreviewUtils }   from '@optimizely/cms-sdk/react/server'
import { OT_CalloutBlock as OT_CalloutBlockContentType } from '@/cms/content-types/OT_CalloutBlock'
import { getCalloutStyles }  from '@/cms/styling/OT_CalloutBlock.styling'
import CalloutBlock          from '@/components/blocks/CalloutBlock'

type Props = {
  content:          ContentProps<typeof OT_CalloutBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_CalloutBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getCalloutStyles(content.intent ? { ...displaySettings, intent: content.intent } : displaySettings)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctaUrl = (content.ctaUrl as any)?.default ?? content.ctaUrl ?? undefined

  return (
    <div
      {...pa(content.__composition)}
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
      <CalloutBlock
        heading={content.heading ?? ''}
        body={content.body       ?? undefined}
        ctaLabel={content.ctaLabel ?? undefined}
        ctaUrl={typeof ctaUrl === 'string' ? ctaUrl : undefined}
        styleOptions={styleOptions}
      />
    </div>
  )
}
