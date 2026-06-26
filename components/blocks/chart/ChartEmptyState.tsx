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

  // brand/glass are dark-context variants → derive light values from
  // --ot-fg-on-brand (always light, no light-mode flip); other variants use the
  // theme-following fg tokens. The dashed border derives from --ot-fg so it
  // follows the canvas in both modes. All applied via inline style (CSS).
  const iconColor  = isDark ? 'oklch(from var(--ot-fg-on-brand) l c h / 0.30)' : 'var(--ot-fg-muted)'
  const textColor  = isDark ? 'oklch(from var(--ot-fg-on-brand) l c h / 0.50)' : 'var(--ot-fg-muted)'
  const muteColor  = isDark ? 'oklch(from var(--ot-fg-on-brand) l c h / 0.30)' : 'oklch(from var(--ot-fg-muted) l c h / 0.6)'
  const borderCol  = isDark ? 'oklch(from var(--ot-fg-on-brand) l c h / 0.15)' : 'oklch(from var(--ot-fg) l c h / 0.08)'

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
        fontFamily: 'var(--ot-font-sans)',
        margin:     0,
      }}>
        Chart data unavailable
      </p>
      <p style={{
        color:      isDark ? 'oklch(from var(--ot-fg-on-brand) l c h / 0.35)' : 'var(--ot-fg-muted)',
        fontSize:   '0.75rem',
        fontFamily: 'var(--ot-font-sans)',
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
