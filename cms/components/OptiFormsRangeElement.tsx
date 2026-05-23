import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import RangeField from '@/components/forms/RangeField'

type Props = { content: any }

export default function OptiFormsRangeElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const id = content._metadata?.key ?? 'field'

  return (
    <div className="w-full" {...pa(content.__composition)}>
      <RangeField
        id={id}
        name={id}
        label={content.Label ?? undefined}
        tooltip={content.Tooltip ?? undefined}
        defaultValue={content.PredefinedValue ?? undefined}
        min={content.Min ?? 0}
        max={content.Max ?? 100}
        step={content.Increment ?? 1}
      />
    </div>
  )
}
