import FieldTooltip from './FieldTooltip'
import { FieldError, describedBy } from './FieldWrapper'

type Option = { caption: string; value: string; checked: boolean }

type Props = {
  id: string
  name: string
  label?: string
  tooltip?: string
  options: Option[]
  allowMultiSelect?: boolean
  required?: boolean
}

export default function ChoiceField({ id, name, label, tooltip, options, allowMultiSelect, required }: Props) {
  const inputType = allowMultiSelect ? 'checkbox' : 'radio'

  return (
    <fieldset data-part="field" aria-describedby={describedBy(id, tooltip)}>
      {label && (
        // The tooltip lives inside <legend>: a legend is only a fieldset's
        // accessible name when it is the fieldset's direct child.
        <legend data-part="label-row">
          <span data-part="label">
            {label}
            {required && <span data-part="req" aria-hidden="true"> *</span>}
          </span>
          {tooltip && <FieldTooltip id={id} text={tooltip} />}
        </legend>
      )}
      <div data-part="options">
        {options.map((opt, i) => {
          const optId = `${id}-${i}`
          return (
            <label key={optId} data-part="option">
              <input
                type={inputType}
                id={optId}
                name={name}
                value={opt.value}
                defaultChecked={opt.checked}
                required={!allowMultiSelect && required}
                data-part={allowMultiSelect ? 'check' : 'radio'}
              />
              <span>{opt.caption}</span>
            </label>
          )
        })}
      </div>
      <FieldError id={id} />
    </fieldset>
  )
}
