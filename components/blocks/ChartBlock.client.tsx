'use client'

import { useEffect, useId, useState } from 'react'
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
import type { ChartData } from './chart/parseChartData'

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
  /** True for any CMS draft / edit render: only then is the empty state shown. */
  isPreview?:    boolean
}

function fmt(v: number, prefix = '', suffix = '') { return `${prefix}${v}${suffix}` }

/** One plain-language sentence, so the chart has a text alternative. */
function summarize(d: ChartData, type: string, prefix = '', suffix = ''): string {
  if (type === 'radial') return `${d.series[0].name}: ${fmt(d.series[0].data[0], prefix, suffix)}, out of a maximum of ${d.max ?? 100}.`
  const kind = ({ line: 'Line chart', area: 'Area chart', bar: 'Bar chart', barStacked: 'Stacked bar chart' } as Record<string, string>)[type] ?? 'Chart'
  const parts = d.series.map(s => {
    const mx = Math.max(...s.data), mn = Math.min(...s.data)
    return `${s.name} ranges from ${fmt(mn, prefix, suffix)} (${d.labels[s.data.indexOf(mn)]}) to ${fmt(mx, prefix, suffix)} (${d.labels[s.data.indexOf(mx)]})`
  })
  return `${kind}, ${d.labels[0]} to ${d.labels[d.labels.length - 1]}. ${parts.join('; ')}.`
}

export default function ChartBlockClient({
  heading, subtext, chartType, chartData, seriesColors, valuePrefix, valueSuffix, showLegend, showGrid, styleOptions, isPreview = false,
}: ChartBlockClientProps) {
  const { color, height: heightKey } = styleOptions
  const uid = useId().replace(/:/g, '')

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

  // Invalid data: editors get an explanation, visitors get nothing.
  if (!parsed && !isPreview) return null

  const valid = parsed && ['line', 'area', 'bar', 'barStacked', 'radial'].includes(chartType)
  const chartProps = { palette, theme, height, valuePrefix, valueSuffix, showLegend, showGrid }

  function renderChart() {
    if (!parsed || !valid) return <ChartEmptyState height={heightKey} color={color} />
    switch (chartType) {
      case 'line':       return <LineChart       data={parsed} {...chartProps} />
      case 'area':       return <AreaChart       data={parsed} {...chartProps} />
      case 'bar':        return <BarChart        data={parsed} {...chartProps} />
      case 'barStacked': return <BarStackedChart data={parsed} {...chartProps} />
      default:
        return <RadialChart data={parsed} palette={palette} theme={theme} height={height} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />
    }
  }

  const showLegendList = valid && parsed && chartType !== 'radial' && (showLegend || parsed.series.length > 1)
    && !(chartType === 'bar' && parsed.series.length === 1)

  return (
    <figure
      data-block="chart"
      data-color={color}
      data-palette={seriesColors}
      data-type={chartType}
      data-theme={color === 'brand' ? 'dark' : undefined}
    >
      <figcaption data-part="head">
        <h3 data-part="title" id={`${uid}-t`}>{heading}</h3>
        {subtext && <p data-part="sub">{subtext}</p>}
      </figcaption>

      {showLegendList && parsed && (
        <ul data-part="legend" data-kind={chartType === 'line' || chartType === 'area' ? 'line' : 'box'} aria-hidden="true">
          {parsed.series.map((s, i) => (
            <li key={s.name}><span data-part="key" style={{ '--k': `var(--ch-${(i % 4) + 1})` } as React.CSSProperties} />{s.name}</li>
          ))}
        </ul>
      )}

      {/* Keyed so Recharts remounts and re-animates on every navigation */}
      <div
        key={chartKey}
        data-part="plot"
        role={valid ? 'img' : undefined}
        aria-labelledby={valid ? `${uid}-t ${uid}-s` : undefined}
      >
        {renderChart()}
      </div>

      {valid && parsed && (
        <>
          <p className="sr-only" id={`${uid}-s`}>{summarize(parsed, chartType, valuePrefix, valueSuffix)}</p>
          <details data-part="data">
            <summary>Show the data</summary>
            <div data-part="table-wrap">
              <table>
                <caption className="sr-only">{heading}</caption>
                <thead>
                  <tr>
                    <th scope="col">{chartType === 'radial' ? 'Measure' : ''}</th>
                    {chartType === 'radial'
                      ? <th scope="col">Value</th>
                      : parsed.series.map(s => <th key={s.name} scope="col">{s.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {chartType === 'radial' ? (
                    <tr><th scope="row">{parsed.series[0].name}</th><td>{fmt(parsed.series[0].data[0], valuePrefix, valueSuffix)}</td></tr>
                  ) : parsed.labels.map((l, i) => (
                    <tr key={l + i}>
                      <th scope="row">{l}</th>
                      {parsed.series.map(s => <td key={s.name}>{fmt(s.data[i], valuePrefix, valueSuffix)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </figure>
  )
}
