'use client'

import { BarChart2 } from 'lucide-react'
import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'
import { HEIGHT_MAP } from '@/cms/styling/OT_ChartBlock.styling'

type Props = {
  height: ChartStyleOptions['height']
  color:  ChartStyleOptions['color']
}

export default function ChartEmptyState({ height, color }: Props) {
  const px = HEIGHT_MAP[height]

  const isDark = color === 'brand' || color === 'glass'

  const iconColor  = isDark ? 'rgba(255,255,255,0.30)' : 'var(--ot-fg-muted)'
  const textColor  = isDark ? 'rgba(255,255,255,0.50)' : 'var(--ot-fg-muted)'
  const muteColor  = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(var(--ot-fg-muted), 0.6)'
  const borderCol  = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'

  return (
    <div
      style={{
        height:         px,
        border:         `1px dashed ${borderCol}`,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:             8,
      }}
    >
      <BarChart2
        size={24}
        style={{ color: iconColor }}
        strokeWidth={1.5}
      />
      <p style={{
        color:      textColor,
        fontSize:   '0.875rem',
        fontWeight: 600,
        fontFamily: 'var(--font-poppins, system-ui, sans-serif)',
        margin:     0,
      }}>
        Chart data unavailable
      </p>
      <p style={{
        color:      isDark ? 'rgba(255,255,255,0.35)' : 'var(--ot-fg-muted)',
        fontSize:   '0.75rem',
        fontFamily: 'var(--font-poppins, system-ui, sans-serif)',
        margin:     0,
        opacity:    0.7,
        textAlign:  'center',
        maxWidth:   340,
        padding:    '0 16px',
      }}>
        Check that the JSON in the CMS matches the required format for this chart type.
      </p>
    </div>
  )
}
