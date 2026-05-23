import FieldWrapper from './FieldWrapper'

const inputBase = [
  'w-full bg-canvas border border-fg/15 px-sm py-2.5',
  'text-body text-fg placeholder:text-fg-muted/40',
  'rounded-input',
  'focus:outline-none focus-visible:border-brand',
  'transition-colors duration-150 ease-quick',
  'disabled:opacity-50',
].join(' ')

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
