import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import FieldTooltip from './FieldTooltip'

type Props = {
  id: string
  label?: string
  tooltip?: string
  required?: boolean
  children: ReactNode
}

/** The id of a field's inline error line (filled in by FormWrapper's validation). */
export const errorId = (id: string) => `${id}-err`

/** aria-describedby for a control: its tooltip text (if any) and its error line. */
export function describedBy(id: string, tooltip?: string): string {
  return [tooltip ? `${id}-hint` : null, errorId(id)].filter(Boolean).join(' ')
}

/** The inline error line. Hidden by CSS until the field carries `data-invalid`. */
export function FieldError({ id }: { id: string }) {
  return (
    <p data-part="error" id={errorId(id)}>
      <CircleAlert aria-hidden="true" />
      <span data-part="error-text" />
    </p>
  )
}

export default function FieldWrapper({ id, label, tooltip, required, children }: Props) {
  return (
    <div data-part="field">
      {label && (
        <div data-part="label-row">
          <label htmlFor={id} data-part="label">
            {label}
            {required && <span data-part="req" aria-hidden="true"> *</span>}
          </label>
          {tooltip && <FieldTooltip id={id} text={tooltip} />}
        </div>
      )}
      {children}
      <FieldError id={id} />
    </div>
  )
}
