import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'

/*
 * Every series and chrome color is a CSS variable defined in components/blocks/chart.css.
 * Recharts writes these as SVG presentation attributes, which resolve var() at paint time,
 * so the palette (brand / warm / cool / diverging / categorical / mono), the color variant
 * (canvas / surface / brand / glass) and light/dark mode all re-theme the chart in CSS,
 * with every series held at 3:1 or better against its ground (WCAG 1.4.11).
 */

const SERIES = ['var(--ch-1)', 'var(--ch-2)', 'var(--ch-3)', 'var(--ch-4)']

export const CHART_PALETTES: Record<string, string[]> = {
  brand: SERIES, warm: SERIES, cool: SERIES, diverging: SERIES, categorical: SERIES, mono: SERIES,
}

export type ChartTheme = {
  gridColor:     string
  axisColor:     string
  tickColor:     string
  tooltipBg:     string
  tooltipBorder: string
  tooltipText:   string
  legendColor:   string
  cursorFill:    string
}

export function getChartTheme(_color: ChartStyleOptions['color']): ChartTheme {
  return {
    gridColor:     'var(--ch-grid)',
    axisColor:     'var(--ch-axis)',
    tickColor:     'var(--ch-tick)',
    tooltipBg:     'var(--ch-tip-bg)',
    tooltipBorder: 'var(--ch-tip-line)',
    tooltipText:   'var(--ch-fg)',
    legendColor:   'var(--ch-muted)',
    cursorFill:    'var(--ch-cursor)',
  }
}

/** Axis ticks show the number; denominators like "/100" stay in the tooltip and the data table. */
export const tickSuffix = (suffix: string) => (suffix.startsWith('/') ? '' : suffix)
