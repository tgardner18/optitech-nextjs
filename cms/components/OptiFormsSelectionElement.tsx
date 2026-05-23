import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import SelectionField from '@/components/forms/SelectionField'
import { parseValidators } from '@/cms/forms/validators'
import { parseOptions } from '@/cms/forms/options'

type Props = { content: any }

export default function OptiFormsSelectionElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const id = content._metadata?.key ?? 'field'

  return (
    <div {...pa(content.__composition)}>
      <SelectionField
        id={id}
        name={id}
        label={content.Label ?? undefined}
        placeholder={content.Placeholder ?? undefined}
        tooltip={content.Tooltip ?? undefined}
        options={parseOptions(content.Options)}
        allowMultiSelect={content.AllowMultiSelect ?? false}
        autoComplete={content.AutoComplete ?? undefined}
        required={parseValidators(content.Validators).required}
      />
    </div>
  )
}
