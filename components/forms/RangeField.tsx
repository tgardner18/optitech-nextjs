'use client'
import { useState, type CSSProperties } from 'react'
import FieldWrapper, { describedBy } from './FieldWrapper'

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
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0

  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <div data-part="range-row">
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
          aria-describedby={describedBy(id, tooltip)}
          data-part="range"
          style={{ '--pct': `${pct}%` } as CSSProperties}
        />
        <output htmlFor={id} data-part="range-out">{value}</output>
      </div>
      <div data-part="range-scale" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </FieldWrapper>
  )
}
