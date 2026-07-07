import FieldWrapper from '@/components/forms/FieldWrapper'
import TextboxField from '@/components/forms/TextboxField'
import TextareaField from '@/components/forms/TextareaField'
import NumberField from '@/components/forms/NumberField'
import SelectionField from '@/components/forms/SelectionField'
import ChoiceField from '@/components/forms/ChoiceField'
import { inputBase } from '@/components/forms/fieldStyles'
import type { CmpFieldDef } from '@/lib/admin/cmpWorkRequests'

// Renders one CMP template field definition to a form control, driven entirely
// by whatever the selected template reports — no field is hardcoded.
// Uncontrolled, like the rest of components/forms/* — values are read back
// via FormData on submit (see WorkRequestClient), keyed by `field.identifier`
// to match the work-request `form_fields` shape.
//
// A field's nominal `type` does NOT reliably indicate whether it's
// choice-driven — a live template used `type: "label"` for a genuine
// multi-select field. So "has options" is the primary signal for rendering a
// select/checkbox-group; `type` is only consulted for fields with no options.
export default function DynamicCmpField({ field }: { field: CmpFieldDef }) {
  const { identifier, type, label, required, options, isMultiSelect } = field

  if (options && options.length > 0) {
    const asOptions = options.map(o => ({ caption: o.label, value: o.value, checked: false }))

    // Respect an explicit radio_button/checkbox type; otherwise fall back to
    // the is_multi_select flag (this is the path the real "label" fields take).
    if (type === 'radio_button') {
      return <ChoiceField id={identifier} name={identifier} label={label} required={required} options={asOptions} />
    }
    if (type === 'checkbox' || isMultiSelect) {
      return <ChoiceField id={identifier} name={identifier} label={label} required={required} allowMultiSelect options={asOptions} />
    }
    return <SelectionField id={identifier} name={identifier} label={label} required={required} options={asOptions} />
  }

  switch (type) {
    case 'section':
      return (
        <div className="flex items-center gap-md pt-xs">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-muted/50 whitespace-nowrap">
            {label}
          </span>
          <div className="h-px flex-1 bg-fg/[0.07]" />
        </div>
      )

    case 'text_area':
    case 'brief':
    case 'richtext':
      return <TextareaField id={identifier} name={identifier} label={label} required={required} />

    case 'date':
      return (
        <FieldWrapper id={identifier} label={label} required={required}>
          <input type="date" id={identifier} name={identifier} className={inputBase} required={required} />
        </FieldWrapper>
      )

    case 'simple_number':
      return <NumberField id={identifier} name={identifier} label={label} required={required} />

    case 'currency_number':
    case 'percentage_number': {
      const affix = type === 'currency_number' ? '$' : '%'
      return (
        <FieldWrapper id={identifier} label={label} required={required}>
          <div className="relative">
            <input
              type="number"
              id={identifier}
              name={identifier}
              required={required}
              className={`${inputBase} ${type === 'currency_number' ? 'pl-lg' : 'pr-lg'}`}
            />
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-fg-muted/60 text-body pointer-events-none ${
                type === 'currency_number' ? 'left-md' : 'right-md'
              }`}
            >
              {affix}
            </span>
          </div>
        </FieldWrapper>
      )
    }

    case 'checkbox':
      // Boolean checkbox with no options — submits "true" when checked, absent when not.
      return (
        <label className="flex items-center gap-sm text-body text-fg cursor-pointer select-none group">
          <input
            type="checkbox"
            id={identifier}
            name={identifier}
            value="true"
            className="w-4 h-4 shrink-0 rounded-none accent-brand"
          />
          <span className="text-fg-muted group-has-checked:text-fg transition-colors duration-150 ease-quick">
            {label}
            {required && <span className="text-brand ml-1.5" aria-hidden="true">*</span>}
          </span>
        </label>
      )

    case 'file':
      // No upload mechanism confirmed for the work-request form_fields API —
      // shown for template fidelity, excluded from submission (see WorkRequestClient).
      return (
        <FieldWrapper id={identifier} label={label}>
          <p className="text-[0.8125rem] text-fg-muted/60 italic">
            File upload isn&apos;t supported in this demo — attach {label.toLowerCase()} directly in CMP after the request is created.
          </p>
        </FieldWrapper>
      )

    case 'text':
    default:
      return <TextboxField id={identifier} name={identifier} label={label} required={required} />
  }
}
