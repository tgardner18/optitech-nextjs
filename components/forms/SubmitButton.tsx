import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

type Props = {
  label?: string
  tooltip?: string
}

export default function SubmitButton({ label, tooltip }: Props) {
  return (
    <div title={tooltip}>
      <Button type="submit" variant="brand" size="sm" trailingIcon={<ArrowRight />}>
        {label ?? 'Submit'}
      </Button>
    </div>
  )
}
