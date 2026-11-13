'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
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

export default function BarStackedChart({
  data, palette, theme, height, valuePrefix = '', valueSuffix = '', showLegend, showGrid,
}: Props) {
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { label }
    data.series.forEach(s => { point[s.name] = s.data[i] ?? 0 })
    return point
  })

  const tickStyle = {
    fill:       theme.tickColor,
    fontSize:   12,
    fontFamily: 'var(--ot-font-sans)',
    fontWeight: 500,
  }

  const lastIndex = data.series.length - 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
        {showGrid && (
          <CartesianGrid
            stroke={theme.gridColor}
            vertical={false}
          />
        )}
        <XAxis
          dataKey="label"
          minTickGap={16}
          axisLine={{ stroke: theme.axisColor }}
          tickLine={false}
          tick={tickStyle}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={tickStyle}
          tickFormatter={(v: number) => `${valuePrefix}${v}${tickSuffix(valueSuffix)}`}
          width="auto"
        />
        <Tooltip
          cursor={{ fill: theme.cursorFill }}
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload as any}
              label={label}
              theme={theme}
              valuePrefix={valuePrefix}
              valueSuffix={valueSuffix}
            />
          )}
        />
        {data.series.map((s, i) => (
          <Bar
            key={s.name}
            dataKey={s.name}
            stackId="stack"
            fill={palette[i % palette.length]}
            // Rounded corners only on the topmost (last) bar in the stack
            radius={i === lastIndex ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            animationDuration={500}
            animationEasing="ease-out"
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
