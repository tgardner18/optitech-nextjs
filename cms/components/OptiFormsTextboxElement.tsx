import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import TextboxField from '@/components/forms/TextboxField'
import { parseValidators } from '@/cms/forms/validators'

type Props = { content: any }

export default function OptiFormsTextboxElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const id = content._metadata?.key ?? 'field'

  return (
    <div className="w-full" {...pa(content.__composition)}>
      <TextboxField
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
