import FieldWrapper, { describedBy } from './FieldWrapper'

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
        data-part="input"
        placeholder={placeholder ?? 'https://'}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={describedBy(id, tooltip)}
      />
    </FieldWrapper>
  )
}
