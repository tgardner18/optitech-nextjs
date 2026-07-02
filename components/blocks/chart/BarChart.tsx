'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  Cell,
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

export default function BarChart({
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

  // Single-series bar charts get per-bar Cell coloring for visual interest
  const isSingleSeries = data.series.length === 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
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
        {showLegend && !isSingleSeries && (
          <Legend
            wrapperStyle={{
              color:      theme.legendColor,
              fontSize:   11,
              fontFamily: 'var(--ot-font-sans)',
            }}
          />
        )}
        {data.series.map((s, si) => (
          <Bar
            key={s.name}
            dataKey={s.name}
            fill={palette[si % palette.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {/* Multi-color cells only on single-series charts */}
            {isSingleSeries && data.labels.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
