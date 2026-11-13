'use client'

import type { ChartTheme } from './chartColors'

// Recharts passes these props to custom tooltip content components
type Props = {
  active?:      boolean
  payload?:     ReadonlyArray<{ name?: string | number; value?: string | number; color?: string }>
  label?:       string | number
  theme?:       ChartTheme
  valuePrefix?: string
  valueSuffix?: string
}

export default function ChartTooltip({ active, payload, label, valuePrefix = '', valueSuffix = '' }: Props) {
  if (!active || !payload?.length) return null

  return (
    <div data-part="tip">
      {label != null && <p data-part="tip-label">{String(label)}</p>}
      {payload.map((entry, i) => (
        <p key={i} data-part="tip-row">
          <span data-part="swatch" style={{ background: String(entry.color ?? 'currentColor') }} />
          <span>{String(entry.name ?? '')}</span>
          <b>{valuePrefix}{entry.value != null ? String(entry.value) : ''}{valueSuffix}</b>
        </p>
      ))}
    </div>
  )
}
