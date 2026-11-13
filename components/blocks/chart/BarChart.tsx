'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import type { ChartData } from './parseChartData'
import { tickSuffix, type ChartTheme } from './chartColors'

type Props = {
  data:          ChartData
  palette:       string[]
  theme:         ChartTheme
  height:        number
  valuePrefix?:  string
  valueSuffix?:  string
  showLegend:    boolean
  showGrid:      boolean
}

/** Approximate rendered width of a 12px axis label, so we know when category names won't fit under the bars. */
const LABEL_PX = 6.6

export default function BarChart({
  data, palette, theme, height, valuePrefix = '', valueSuffix = '', showGrid,
}: Props) {
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { label }
    data.series.forEach(s => { point[s.name] = s.data[i] ?? 0 })
    return point
  })

  const tickStyle = { fill: theme.tickColor, fontSize: 12, fontFamily: 'var(--ot-font-sans)', fontWeight: 500 }

  // One series means one color, with the value printed on each bar.
  const isSingleSeries = data.series.length === 1

  // When category names don't fit under the bars (phones), a single-series chart turns sideways.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const longest  = Math.max(...data.labels.map(l => l.length))
  const sideways = isSingleSeries && width > 0 && (width - 60) / data.labels.length < longest * LABEL_PX
  const labelW   = Math.min(Math.ceil(longest * LABEL_PX) + 12, Math.round(width * 0.45))
  const rowH     = Math.min(44, Math.max(30, (height - 8) / data.labels.length))
  const h        = sideways ? Math.round(rowH * data.labels.length + 8) : height

  const tooltip = (
    <Tooltip
      cursor={{ fill: theme.cursorFill }}
      content={({ active, payload, label }) => (
        <ChartTooltip active={active} payload={payload as any} label={label} theme={theme} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />
      )}
    />
  )

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={h}>
        {sideways ? (
          <RechartsBarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={labelW} axisLine={{ stroke: theme.axisColor }} tickLine={false} tick={tickStyle} />
            {tooltip}
            <Bar dataKey={data.series[0].name} fill={palette[0]} radius={[0, 4, 4, 0]} barSize={Math.round(rowH * 0.62)} animationDuration={500}>
              <LabelList dataKey={data.series[0].name} position="right" formatter={(v: unknown) => `${valuePrefix}${v}`} style={{ fill: 'var(--ch-fg)', fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </RechartsBarChart>
        ) : (
          <RechartsBarChart data={chartData} margin={{ top: 20, right: 16, bottom: 0, left: 8 }}>
            {showGrid && <CartesianGrid stroke={theme.gridColor} vertical={false} />}
            <XAxis dataKey="label" axisLine={{ stroke: theme.axisColor }} tickLine={false} tick={tickStyle} dy={6} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              tickFormatter={(v: number) => `${valuePrefix}${v}${tickSuffix(valueSuffix)}`}
              width="auto"
            />
            {tooltip}
            {data.series.map((s, si) => (
              <Bar key={s.name} dataKey={s.name} fill={palette[si % palette.length]} radius={[4, 4, 0, 0]} animationDuration={500} animationEasing="ease-out">
                {isSingleSeries && (
                  <LabelList dataKey={s.name} position="top" formatter={(v: unknown) => `${valuePrefix}${v}`} style={{ fill: 'var(--ch-fg)', fontSize: 12, fontWeight: 600 }} />
                )}
              </Bar>
            ))}
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
