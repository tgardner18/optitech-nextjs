import FieldWrapper from './FieldWrapper'
import { inputBase } from './fieldStyles'

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

export default function TextboxField({ id, name, label, placeholder, tooltip, defaultValue, autoComplete, required }: Props) {
  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <input
        type="text"
        id={id}
        name={name}
        className={inputBase}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete || undefined}
        required={required}
        aria-describedby={tooltip ? `${id}-hint` : undefined}
      />
    </FieldWrapper>
  )
}
