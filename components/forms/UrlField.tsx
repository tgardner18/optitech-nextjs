import FieldWrapper from './FieldWrapper'
import { inputBase } from './fieldStyles'

type Props = {
  id: string
  name: string
  label?: string
  placeholder?: string
  tooltip?: string
  defaultValue?: string
  required?: boolean
}

export default function UrlField({ id, name, label, placeholder, tooltip, defaultValue, required }: Props) {
  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <input
        type="url"
        id={id}
        name={name}
        className={inputBase}
        placeholder={placeholder ?? 'https://'}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={tooltip ? `${id}-hint` : undefined}
      />
    </FieldWrapper>
  )
}
