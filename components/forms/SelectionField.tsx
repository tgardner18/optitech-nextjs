import FieldWrapper from './FieldWrapper'

type Option = { caption: string; value: string; checked: boolean }

const selectBase = [
  'w-full bg-canvas border border-fg/15 px-sm py-2.5',
  'text-body text-fg',
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
  options: Option[]
  allowMultiSelect?: boolean
  autoComplete?: string
  required?: boolean
}

export default function SelectionField({ id, name, label, placeholder, tooltip, options, allowMultiSelect, autoComplete, required }: Props) {
  const preSelected = allowMultiSelect
    ? options.filter(o => o.checked).map(o => o.value)
    : (options.find(o => o.checked)?.value ?? '')

  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <select
        id={id}
        name={name}
        multiple={allowMultiSelect}
        defaultValue={preSelected as string & string[]}
        autoComplete={autoComplete || undefined}
        required={required}
        aria-describedby={tooltip ? `${id}-hint` : undefined}
        className={selectBase}
        size={allowMultiSelect ? Math.min(options.length + 1, 6) : undefined}
      >
        {!allowMultiSelect && placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.caption}</option>
        ))}
      </select>
    </FieldWrapper>
  )
}
