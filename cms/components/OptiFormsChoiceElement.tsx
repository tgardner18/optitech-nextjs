import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import ChoiceField from '@/components/forms/ChoiceField'
import { parseValidators } from '@/cms/forms/validators'
import { parseOptions } from '@/cms/forms/options'

type Props = { content: any }

export default function OptiFormsChoiceElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const id = content._metadata?.key ?? 'field'

  return (
    <div {...pa(content.__composition)}>
      <ChoiceField
        id={id}
        name={id}
        label={content.Label ?? undefined}
        tooltip={content.Tooltip ?? undefined}
        options={parseOptions(content.Options)}
        allowMultiSelect={content.AllowMultiSelect ?? false}
        required={parseValidators(content.Validators).required}
      />
    </div>
  )
}
