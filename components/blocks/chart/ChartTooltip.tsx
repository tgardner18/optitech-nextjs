'use client'

import type { ChartTheme } from './chartColors'

// Recharts passes these props to custom tooltip content components
type Props = {
  active?:      boolean
  payload?:     ReadonlyArray<{
    name?:  string | number
    value?: string | number
    color?: string
  }>
  label?:       string | number
  theme:        ChartTheme
  valuePrefix?: string
  valueSuffix?: string
}

export default function ChartTooltip({
  active,
  payload,
  label,
  theme,
  valuePrefix = '',
  valueSuffix = '',
}: Props) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background:          theme.tooltipBg,
        border:              `1px solid ${theme.tooltipBorder}`,
        backdropFilter:      'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        padding:             '8px 12px',
        boxShadow:           '0 8px 32px var(--ot-bloom-brand-faint)',
        minWidth:            120,
      }}
    >
      {label != null && (
        <p style={{
          color:         theme.legendColor,
          fontSize:      '0.75rem',
          fontWeight:    600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin:        '0 0 6px',
          fontFamily:    'var(--ot-font-sans)',
        }}>
          {String(label)}
        </p>
      )}
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:          6,
            marginBottom: i < payload.length - 1 ? 4 : 0,
          }}
        >
          <span style={{
            width:           8,
            height:          8,
            borderRadius:    '50%',
            backgroundColor: String(entry.color ?? 'currentColor'),
            flexShrink:      0,
          }} />
          <span style={{
            color:      theme.legendColor,
            fontSize:   '0.8125rem',
            fontFamily: 'var(--ot-font-sans)',
            flexGrow:    1,
          }}>
            {String(entry.name ?? '')}
          </span>
          <span style={{
            color:      theme.tooltipText,
            fontWeight: 700,
            fontSize:   '0.8125rem',
            fontFamily: 'var(--ot-font-sans)',
            marginLeft:  8,
          }}>
            {valuePrefix}{entry.value != null ? String(entry.value) : ''}{valueSuffix}
          </span>
        </div>
      ))}
    </div>
  )
}
