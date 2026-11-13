import { ArrowRight } from 'lucide-react'

type Props = {
  label?: string
  tooltip?: string
}

export default function SubmitButton({ label, tooltip }: Props) {
  return (
    // The Forms editor often gives Submit its own column alongside Reset;
    // the wrapper anchors it to that column's trailing edge.
    <div title={tooltip} data-part="submit-wrap">
      <button type="submit" data-part="submit">
        {label ?? 'Submit'}
        <ArrowRight aria-hidden="true" />
      </button>
    </div>
  )
}
