import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import SubmitButton from '@/components/forms/SubmitButton'

type Props = { content: any }

export default function OptiFormsSubmitElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)

  return (
    <div {...pa(content.__composition)}>
      <SubmitButton
        label={content.Label ?? undefined}
        tooltip={content.Tooltip ?? undefined}
      />
    </div>
  )
}
