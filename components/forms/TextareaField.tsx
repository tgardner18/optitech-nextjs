import FieldWrapper, { describedBy } from './FieldWrapper'

type Props = {
  id: string
  name: string
  label?: string
  placeholder?: string
  tooltip?: string
  defaultValue?: string
  autoComplete?: string
  required?: boolean
}

export default function TextareaField({ id, name, label, placeholder, tooltip, defaultValue, autoComplete, required }: Props) {
  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <textarea
        id={id}
        name={name}
        data-part="input"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete || undefined}
        required={required}
        aria-describedby={describedBy(id, tooltip)}
      />
    </FieldWrapper>
  )
}
