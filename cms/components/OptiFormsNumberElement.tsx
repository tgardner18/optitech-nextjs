import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import NumberField from '@/components/forms/NumberField'
import { parseValidators } from '@/cms/forms/validators'

type Props = { content: any }

export default function OptiFormsNumberElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const id = content._metadata?.key ?? 'field'

  return (
    <div {...pa(content.__composition)}>
      <NumberField
        id={id}
        name={id}
        label={content.Label ?? undefined}
        placeholder={content.Placeholder ?? undefined}
        tooltip={content.Tooltip ?? undefined}
        defaultValue={content.PredefinedValue ?? undefined}
        autoComplete={content.AutoComplete ?? undefined}
        required={parseValidators(content.Validators).required}
      />
    </div>
  )
}
