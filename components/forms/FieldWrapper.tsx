import type { ReactNode } from 'react'
import FieldTooltip from './FieldTooltip'

type Props = {
  id: string
  label?: string
  tooltip?: string
  required?: boolean
  children: ReactNode
}

export default function FieldWrapper({ id, label, tooltip, required, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex items-center gap-xs">
          <label htmlFor={id} className="text-label font-medium text-fg-muted tracking-label uppercase">
            {label}
            {required && (
              <span className="text-brand ml-1.5" aria-hidden="true">*</span>
            )}
          </label>
          {tooltip && <FieldTooltip id={id} text={tooltip} />}
        </div>
      )}
      {children}
    </div>
  )
}
