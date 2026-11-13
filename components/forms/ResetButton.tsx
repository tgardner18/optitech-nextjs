type Props = {
  label?: string
  tooltip?: string
}

// A quiet text action: Reset is destructive and rarely wanted, so it never
// competes with the filled Submit.
export default function ResetButton({ label, tooltip }: Props) {
  return (
    <div title={tooltip} data-part="reset-wrap">
      <button type="reset" data-part="reset">
        {label ?? 'Clear form'}
      </button>
    </div>
  )
}
