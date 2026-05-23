import type { ReactNode } from 'react'

type Props = {
  id: string
  label?: string
  tooltip?: string
  required?: boolean
  children: ReactNode
}

export default function FieldWrapper({ id, label, tooltip, required, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-label font-medium text-fg-muted tracking-label uppercase">
          {label}
          {required && (
            <span className="text-brand ml-1.5" aria-hidden="true">*</span>
          )}
        </label>
      )}
      {children}
      {tooltip && (
        <p id={`${id}-hint`} className="text-[11px] text-fg-muted/60 leading-snug">{tooltip}</p>
      )}
    </div>
  )
}
