import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getButtonStyles } from '@/cms/styling/OT_ButtonBlock.styling'
import ButtonBlock from '@/components/blocks/ButtonBlock'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function OT_ButtonBlock({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getButtonStyles(displaySettings)

  const label = content.label ?? ''
  const url   = content.url?.default ?? content.url ?? undefined

  if (!label) {
    return (
      <div
        {...pa(content.__composition)}
        className="w-full flex items-center justify-center bg-surface border border-fg/10 px-md py-sm"
      >
        <p className="text-label text-fg-muted/60 font-mono">
          Button — add a label in the CMS editor
        </p>
      </div>
    )
  }

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ButtonBlock
        label={label}
        url={url}
        styleOptions={styleOptions}
      />
    </div>
  )
}
