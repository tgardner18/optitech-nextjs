import { ChevronDown } from 'lucide-react'
import FieldWrapper from './FieldWrapper'
import { inputBase } from './fieldStyles'
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
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={preSelected}
          autoComplete={autoComplete || undefined}
          required={required}
          aria-describedby={tooltip ? `${id}-hint` : undefined}
          className={`${inputBase} appearance-none cursor-pointer pr-10`}
        >
          <option value="" disabled={!!options.find(o => o.checked)}>
            {placeholder ?? 'Select an option'}
          </option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.caption}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-fg/40"
          aria-hidden="true"
        />
      </div>
    </FieldWrapper>
  )
}
