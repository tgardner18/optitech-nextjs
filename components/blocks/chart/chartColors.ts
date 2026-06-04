import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'

export const CHART_PALETTES: Record<string, string[]> = {
  // Brand palette: primary token + accent token + two brand-family tones
  brand: [
    'var(--ot-brand)',
    'var(--ot-accent)',
    'oklch(72% 0.10 195)',   // lighter teal — brand family
    'oklch(38% 0.12 195)',   // deep teal — brand family
  ],

  // Warm palette: amber-gold family in perceptually uniform OKLCH.
  // Chosen to contrast with the teal brand without clashing.
  warm: [
    'oklch(78% 0.17 78)',    // warm amber-gold
    'oklch(66% 0.20 52)',    // warm orange
    'oklch(58% 0.18 38)',    // warm terracotta
    'oklch(83% 0.14 90)',    // warm straw
  ],

  // Cool palette: blue-indigo family, harmonious with teal brand hue.
  cool: [
    'oklch(62% 0.18 240)',   // periwinkle blue
    'oklch(55% 0.20 265)',   // deep indigo
    'oklch(70% 0.15 225)',   // soft sky
    'oklch(48% 0.14 280)',   // violet-indigo
  ],

  // Diverging: brand token at one pole, accent at the other,
  // with two intermediate tones bridging the hue arc.
  diverging: [
    'var(--ot-brand)',
    'oklch(62% 0.18 220)',   // blue-green transition
    'oklch(70% 0.18 170)',   // yellow-green transition
    'var(--ot-accent)',
  ],

  // Categorical: diverse multi-hue ramp inspired by classic data viz standards
  // (D3 category10 / Tableau 10) — steel blue, safety orange, olive green, brick red.
  categorical: [
    'oklch(52% 0.14 230)',   // steel blue
    'oklch(72% 0.18 55)',    // safety orange
    'oklch(58% 0.17 145)',   // olive green
    'oklch(50% 0.20 25)',    // brick red
  ],

  // Mono: white alphas — retained for backward compatibility with brand/glass backgrounds.
  mono: [
    'rgba(255,255,255,0.95)',
    'rgba(255,255,255,0.65)',
    'rgba(255,255,255,0.40)',
    'rgba(255,255,255,0.20)',
  ],
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

export function getChartTheme(color: ChartStyleOptions['color']): ChartTheme {
  switch (color) {
    case 'surface':
      return {
        gridColor:     'rgba(255,255,255,0.06)',
        axisColor:     'transparent',
        tickColor:     'var(--ot-fg-muted)',
        tooltipBg:     'var(--ot-canvas)',
        tooltipBorder: 'rgba(255,255,255,0.10)',
        tooltipText:   'var(--ot-fg)',
        legendColor:   'var(--ot-fg-muted)',
        cursorFill:    'rgba(255,255,255,0.04)',
      }
    case 'brand':
      return {
        gridColor:     'rgba(255,255,255,0.10)',
        axisColor:     'transparent',
        tickColor:     'rgba(255,255,255,0.60)',
        tooltipBg:     'rgba(0,0,0,0.70)',
        tooltipBorder: 'rgba(255,255,255,0.15)',
        tooltipText:   'rgba(255,255,255,0.95)',
        legendColor:   'rgba(255,255,255,0.70)',
        cursorFill:    'rgba(255,255,255,0.06)',
      }
    case 'glass':
      // glass assumes a dark background context
      return {
        gridColor:     'rgba(255,255,255,0.10)',
        axisColor:     'transparent',
        tickColor:     'rgba(255,255,255,0.60)',
        tooltipBg:     'rgba(0,0,0,0.70)',
        tooltipBorder: 'rgba(255,255,255,0.15)',
        tooltipText:   'rgba(255,255,255,0.95)',
        legendColor:   'rgba(255,255,255,0.70)',
        cursorFill:    'rgba(255,255,255,0.06)',
      }
    case 'canvas':
    default:
      return {
        gridColor:     'rgba(255,255,255,0.06)',
        axisColor:     'transparent',
        tickColor:     'var(--ot-fg-muted)',
        tooltipBg:     'var(--ot-surface)',
        tooltipBorder: 'rgba(255,255,255,0.10)',
        tooltipText:   'var(--ot-fg)',
        legendColor:   'var(--ot-fg-muted)',
        cursorFill:    'rgba(255,255,255,0.04)',
      }
  }
}
