'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts'
import type { ChartData } from './parseChartData'
import type { ChartTheme } from './chartColors'

type Props = {
  data:         ChartData
  palette:      string[]
  theme:        ChartTheme
  height:       number
  valuePrefix?: string
  valueSuffix?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function RadialChart({
  data, palette, theme, height, valuePrefix = '', valueSuffix = '',
}: Props) {
  const value   = data.series[0].data[0]
  const max     = data.max ?? 100
  const name    = data.series[0].name
  const fillPct = Math.min((value / max) * 100, 100)

  const [displayValue, setDisplayValue] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value)
      return
    }
    const duration  = 800
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayValue(Math.round(easeOutExpo(progress) * value))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [value, reducedMotion])

  // Single data point — RadialBar uses background prop for the track ring
  const radialData = [{ name, value: fillPct }]

  const fillColor  = palette[0]

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          data={radialData}
          startAngle={230}
          endAngle={-50}
          innerRadius="62%"
          outerRadius="88%"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            fill={fillColor}
            // background acts as the track ring — rendered behind the fill arc
            background={{ fill: fillColor, opacity: 0.15 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center label — absolutely positioned over the chart */}
      <div style={{
        position:       'absolute',
        inset:           0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        pointerEvents:  'none',
        paddingBottom:  Math.round(height * 0.04),
      }}>
        <span style={{
          color:         theme.tooltipText,
          fontSize:      `${Math.max(Math.round(height * 0.14), 28)}px`,
          fontWeight:    800,
          fontFamily:    'var(--ot-font-sans)',
          letterSpacing: '-0.03em',
          lineHeight:    1,
        }}>
          {valuePrefix}{displayValue}{valueSuffix}
        </span>
        <span style={{
          color:         theme.legendColor,
          fontSize:      '0.75rem',
          fontWeight:    600,
          fontFamily:    'var(--ot-font-sans)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop:     6,
          maxWidth:      120,
          textAlign:     'center',
          lineHeight:    1.3,
        }}>
          {name}
        </span>
      </div>
    </div>
  )
}
