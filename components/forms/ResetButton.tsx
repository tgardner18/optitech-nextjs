import Button from '@/components/ui/Button'

type Props = {
  label?: string
  tooltip?: string
}

export default function ResetButton({ label, tooltip }: Props) {
  return (
    <div title={tooltip}>
      <Button type="reset" variant="ghost" size="sm">
        {label ?? 'Reset'}
      </Button>
    </div>
  )
}
