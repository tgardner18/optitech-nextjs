'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import type { ChartData } from './parseChartData'
import type { ChartTheme } from './chartColors'

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

export default function LineChart({
  data, palette, theme, height, valuePrefix = '', valueSuffix = '', showLegend, showGrid,
}: Props) {
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { label }
    data.series.forEach(s => { point[s.name] = s.data[i] ?? 0 })
    return point
  })

  const tickStyle = {
    fill:       theme.tickColor,
    fontSize:   11,
    fontFamily: 'var(--ot-font-sans)',
    fontWeight: 500,
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.gridColor}
            vertical={false}
          />
        )}
        <XAxis
          dataKey="label"
          axisLine={{ stroke: theme.axisColor }}
          tickLine={false}
          tick={tickStyle}
          dy={6}
        />
        <YAxis
          axisLine={{ stroke: theme.axisColor }}
          tickLine={false}
          tick={tickStyle}
          tickFormatter={(v: number) => `${valuePrefix}${v}${valueSuffix}`}
          width={42}
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
        {showLegend && (
          <Legend
            wrapperStyle={{
              color:      theme.legendColor,
              fontSize:   11,
              fontFamily: 'var(--ot-font-sans)',
            }}
          />
        )}
        {data.series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={palette[i % palette.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
