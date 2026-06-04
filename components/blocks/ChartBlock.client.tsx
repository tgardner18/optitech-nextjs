'use client'

import { parseChartData } from './chart/parseChartData'
import { CHART_PALETTES, getChartTheme } from './chart/chartColors'
import { HEIGHT_MAP } from '@/cms/styling/OT_ChartBlock.styling'
import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'
import LineChart       from './chart/LineChart'
import AreaChart       from './chart/AreaChart'
import BarChart        from './chart/BarChart'
import BarStackedChart from './chart/BarStackedChart'
import RadialChart     from './chart/RadialChart'
import ChartEmptyState from './chart/ChartEmptyState'

export type ChartBlockClientProps = {
  heading:       string
  subtext?:      string
  chartType:     string
  chartData:     string | null
  seriesColors:  string
  valuePrefix?:  string
  valueSuffix?:  string
  showLegend:    boolean
  showGrid:      boolean
  styleOptions:  ChartStyleOptions
}

// Color helpers — derived from the same patterns used by CardBlock and TabsBlock
function headingColor(color: ChartStyleOptions['color']): string {
  if (color === 'brand')  return 'var(--ot-fg-on-brand)'
  if (color === 'glass')  return 'rgba(255,255,255,0.95)'
  return 'var(--ot-fg)'
}

function subtextColor(color: ChartStyleOptions['color']): string {
  if (color === 'brand')  return 'rgba(255,255,255,0.65)'
  if (color === 'glass')  return 'rgba(255,255,255,0.55)'
  return 'var(--ot-fg-muted)'
}

// Outer wrapper class and style per color variant
function wrapperProps(color: ChartStyleOptions['color']): {
  className: string
  style?:    React.CSSProperties
  'data-theme'?:   string
  'data-surface'?: string
} {
  switch (color) {
    case 'surface':
      return { className: 'bg-surface px-lg py-xl w-full' }
    case 'brand':
      return {
        className: 'bg-brand px-lg py-xl w-full',
        'data-theme': 'dark',
      }
    case 'glass':
      return {
        className: 'px-lg py-xl w-full',
        style: {
          background:          'rgba(255,255,255,0.08)',
          border:              '1px solid rgba(255,255,255,0.12)',
          backdropFilter:      'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
        },
        'data-surface': 'dark',
      }
    case 'canvas':
    default:
      return { className: 'bg-canvas px-lg py-xl w-full' }
  }
}

export default function ChartBlockClient({
  heading,
  subtext,
  chartType,
  chartData,
  seriesColors,
  valuePrefix,
  valueSuffix,
  showLegend,
  showGrid,
  styleOptions,
}: ChartBlockClientProps) {
  const { color, height: heightKey } = styleOptions

  const parsed  = parseChartData(chartData, chartType)
  const palette = CHART_PALETTES[seriesColors] ?? CHART_PALETTES.brand
  const theme   = getChartTheme(color)
  const height  = HEIGHT_MAP[heightKey]

  const { className, style, ...attrs } = wrapperProps(color)

  const chartProps = {
    palette,
    theme,
    height,
    valuePrefix,
    valueSuffix,
    showLegend,
    showGrid,
  }

  function renderChart() {
    if (!parsed) {
      return <ChartEmptyState height={heightKey} color={color} />
    }

    switch (chartType) {
      case 'line':
        return <LineChart       data={parsed} {...chartProps} />
      case 'area':
        return <AreaChart       data={parsed} {...chartProps} />
      case 'bar':
        return <BarChart        data={parsed} {...chartProps} />
      case 'barStacked':
        return <BarStackedChart data={parsed} {...chartProps} />
      case 'radial':
        return (
          <RadialChart
            data={parsed}
            palette={palette}
            theme={theme}
            height={height}
            valuePrefix={valuePrefix}
            valueSuffix={valueSuffix}
          />
        )
      default:
        return <ChartEmptyState height={heightKey} color={color} />
    }
  }

  return (
    <div className={className} style={style} {...attrs}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{
          color:         headingColor(color),
          fontSize:      '1.25rem',
          fontWeight:    600,
          lineHeight:    1.3,
          letterSpacing: '-0.01em',
          fontFamily:    'var(--font-poppins, system-ui, sans-serif)',
          margin:        0,
          textWrap:      'balance',
        } as React.CSSProperties}>
          {heading}
        </h3>
        {subtext && (
          <p style={{
            color:       subtextColor(color),
            fontSize:    '0.8125rem',
            fontWeight:  600,
            fontFamily:  'var(--font-poppins, system-ui, sans-serif)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginTop:   6,
            margin:      '6px 0 0',
          }}>
            {subtext}
          </p>
        )}
      </div>

      {/* Chart */}
      {renderChart()}
    </div>
  )
}
