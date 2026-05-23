import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import ResetButton from '@/components/forms/ResetButton'

type Props = { content: any }

export default function OptiFormsResetElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)

  return (
    <div {...pa(content.__composition)}>
      <ResetButton
        label={content.Label ?? undefined}
        tooltip={content.Tooltip ?? undefined}
      />
    </div>
  )
}
