import { ChevronDown } from 'lucide-react'
import FieldWrapper, { describedBy } from './FieldWrapper'
import MultiSelectDropdown from './MultiSelectDropdown'

type Option = { caption: string; value: string; checked: boolean }

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
  // A native <select multiple> isn't a dropdown (every option renders open,
  // always-visible) and only adds to the selection on a modifier-held click —
  // MultiSelectDropdown is the closed-by-default, plain-click equivalent.
  if (allowMultiSelect) {
    return <MultiSelectDropdown id={id} name={name} label={label} placeholder={placeholder} tooltip={tooltip} options={options} required={required} />
  }

  const preSelected = options.find(o => o.checked)?.value ?? ''

  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <div data-part="select">
        <select
          id={id}
          name={name}
          defaultValue={preSelected}
          autoComplete={autoComplete || undefined}
          required={required}
          aria-describedby={describedBy(id, tooltip)}
          data-part="input"
        >
          <option value="" disabled={!!options.find(o => o.checked)}>
            {placeholder ?? 'Select an option'}
          </option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.caption}</option>
          ))}
        </select>
        <ChevronDown data-part="chev" aria-hidden="true" />
      </div>
    </FieldWrapper>
  )
}
