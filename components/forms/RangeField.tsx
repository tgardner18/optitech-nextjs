'use client'
import { useState } from 'react'
import FieldWrapper from './FieldWrapper'

type Props = {
  id: string
  name: string
  label?: string
  tooltip?: string
  defaultValue?: string
  min?: number
  max?: number
  step?: number
  required?: boolean
}

export default function RangeField({ id, name, label, tooltip, defaultValue, min = 0, max = 100, step = 1, required }: Props) {
  const initial = defaultValue !== undefined && defaultValue !== '' ? Number(defaultValue) : min
  const [value, setValue] = useState(initial)

  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <div className="flex items-center gap-md">
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          required={required}
          aria-describedby={tooltip ? `${id}-hint` : undefined}
          className="flex-1 h-[3px] cursor-pointer rounded-none accent-[var(--ot-brand)] disabled:opacity-50"
        />
        <output
          htmlFor={id}
          className="text-label font-medium tabular-nums text-fg-muted min-w-[2.5rem] text-right shrink-0"
        >
          {value}
        </output>
      </div>
    </FieldWrapper>
  )
}
