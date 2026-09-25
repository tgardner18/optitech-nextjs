import FieldTooltip from './FieldTooltip'

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
    <fieldset className="flex flex-col gap-3 w-full">
      {label && (
        // The tooltip icon lives inside <legend> rather than in a wrapping
        // <div> around it — a <legend> is only recognized as its fieldset's
        // accessible name when it's the fieldset's direct child, so it can't
        // be nested one level deeper just to sit next to the icon.
        <legend className="flex items-center gap-xs text-label font-medium text-fg-muted tracking-label uppercase mb-xs">
          <span>
            {label}
            {required && <span className="text-brand ml-1.5" aria-hidden="true">*</span>}
          </span>
          {tooltip && <FieldTooltip id={id} text={tooltip} />}
        </legend>
      )}
      <div className="flex flex-col gap-3" aria-describedby={tooltip ? `${id}-hint` : undefined}>
        {options.map((opt, i) => {
          const optId = `${id}-${i}`
          return (
            <label key={optId} className="flex items-center gap-sm text-body text-fg cursor-pointer select-none group">
              <input
                type={inputType}
                id={optId}
                name={name}
                value={opt.value}
                defaultChecked={opt.checked}
                required={!allowMultiSelect && required}
                className="w-4 h-4 shrink-0 rounded-none accent-[var(--ot-brand)] disabled:opacity-50"
              />
              <span className="text-fg-muted group-has-[:checked]:text-fg transition-colors duration-150 ease-quick">
                {opt.caption}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
