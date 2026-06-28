import { ContentProps }   from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_DividerBlock as OT_DividerBlockContentType } from '@/cms/content-types/OT_DividerBlock'
import { getDividerStyles } from '@/cms/styling/OT_DividerBlock.styling'
import DividerBlock         from '@/components/blocks/DividerBlock'

type Props = {
  content:          ContentProps<typeof OT_DividerBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_DividerBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getDividerStyles(content.style ? { ...displaySettings, style: content.style } : displaySettings)

  // The "draw" reveal rides the shared MotionObserver: data-stagger marks the
  // element for the IntersectionObserver, and the scoped CSS in globals.css
  // animates .ot-divider-line / .ot-divider-bleed once data-in lands.
  const reveal = String(displaySettings?.reveal ?? 'static')

  return (
    <div
      {...pa(content.__composition)}
      data-stagger={reveal === 'draw' ? 'draw' : undefined}
    >
      <DividerBlock
        label={content.label ?? undefined}
        styleOptions={styleOptions}
      />
    </div>
  )
}
