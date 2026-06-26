'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
// brand/glass are dark-context variants; --ot-fg-on-brand is always light, so
// deriving from it keeps the text light without a light-mode flip, and re-tints
// under a CMS rebrand. Applied via inline style (CSS), so relative color resolves.
function headingColor(color: ChartStyleOptions['color']): string {
  if (color === 'brand')  return 'var(--ot-fg-on-brand)'
  if (color === 'glass')  return 'oklch(from var(--ot-fg-on-brand) l c h / 0.95)'
  return 'var(--ot-fg)'
}

function subtextColor(color: ChartStyleOptions['color']): string {
  if (color === 'brand')  return 'oklch(from var(--ot-fg-on-brand) l c h / 0.65)'
  if (color === 'glass')  return 'oklch(from var(--ot-fg-on-brand) l c h / 0.55)'
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
        // Glass material — token-derived tint (matches the unified .bg-glass
        // philosophy: --ot-fg @ low alpha; backdrop-filter does the frosting).
        // data-surface='dark' below keeps --ot-fg light in this dark-glass context.
        style: {
          background:          'oklch(from var(--ot-fg) l c h / 0.08)',
          border:              '1px solid oklch(from var(--ot-fg) l c h / 0.12)',
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

  // Re-key the chart area on every route change so Recharts re-fires its entrance
  // animation after client-side navigation (the App Router cache keeps this component
  // alive between visits, which suppresses Recharts' mount-based animation).
  const pathname = usePathname()
  const [chartKey, setChartKey] = useState(0)
  useEffect(() => { setChartKey(k => k + 1) }, [pathname])

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
          // Title type scale from tokens (not hand-copied literals); --ot-font-sans
          // follows the ThemeManager primary-font axis, unlike the raw Poppins var.
          fontSize:      'var(--ot-text-title)',
          fontWeight:    'var(--ot-weight-title)',
          lineHeight:    'var(--ot-leading-title)',
          letterSpacing: 'var(--ot-tracking-title)',
          fontFamily:    'var(--ot-font-sans)',
          margin:        0,
          textWrap:      'balance',
        } as React.CSSProperties}>
          {heading}
        </h3>
        {subtext && (
          <p style={{
            color:         subtextColor(color),
            // Label type scale from tokens — incl. the system's +0.06em label
            // tracking (was an off-token 0.04em).
            fontSize:      'var(--ot-text-label)',
            fontWeight:    'var(--ot-weight-label)',
            fontFamily:    'var(--ot-font-sans)',
            letterSpacing: 'var(--ot-tracking-label)',
            textTransform: 'uppercase',
            margin:        '6px 0 0',
          } as React.CSSProperties}>
            {subtext}
          </p>
        )}
      </div>

      {/* Chart — keyed so Recharts remounts and re-animates on every navigation */}
      <div key={chartKey}>{renderChart()}</div>
    </div>
  )
}
