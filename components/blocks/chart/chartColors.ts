import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'

/*
 * NOTE ON token-exempt LITERALS BELOW
 * These colors are NOT theme tokens by design:
 *   1. The warm/cool/categorical/diverging palettes are FIXED multi-hue data-viz
 *      ramps. They must stay distinct from each other and must NOT recalibrate to
 *      the brand hue on a CMS rebrand — a brand-tracking palette would collapse a
 *      4-series chart into one hue. (brand/diverging keep var(--ot-brand)/accent
 *      anchors where that IS intended; the bridging tones stay fixed.)
 *   2. The theme grid/axis/tick/tooltip/cursor colors and the series palettes are
 *      handed to Recharts, which renders them as SVG presentation attributes
 *      (fill/stroke) — CSS var() and relative color syntax do NOT resolve in that
 *      context. They must be concrete values.
 * Both are flagged /* token-exempt: ... *​/ for the components/blocks color guard.
 */

export const CHART_PALETTES: Record<string, string[]> = {
  // Brand palette: primary token + accent token + two brand-family tones
  brand: [
    'var(--ot-brand)',
    'var(--ot-accent)',
    'oklch(72% 0.10 195)',   /* token-exempt: fixed brand-family data-viz tone, consumed by Recharts as SVG attr */
    'oklch(38% 0.12 195)',   /* token-exempt: fixed brand-family data-viz tone, consumed by Recharts as SVG attr */
  ],

  // Warm palette: amber-gold family in perceptually uniform OKLCH.
  // Chosen to contrast with the teal brand without clashing.
  warm: [
    'oklch(78% 0.17 78)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(66% 0.20 52)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(58% 0.18 38)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(83% 0.14 90)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
  ],

  // Cool palette: blue-indigo family, harmonious with teal brand hue.
  cool: [
    'oklch(62% 0.18 240)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(55% 0.20 265)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(70% 0.15 225)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(48% 0.14 280)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
  ],

  // Diverging: brand token at one pole, accent at the other,
  // with two intermediate tones bridging the hue arc.
  diverging: [
    'var(--ot-brand)',
    'oklch(62% 0.18 220)',   /* token-exempt: fixed bridging tone in a data-viz diverging ramp, consumed by Recharts as SVG attr */
    'oklch(70% 0.18 170)',   /* token-exempt: fixed bridging tone in a data-viz diverging ramp, consumed by Recharts as SVG attr */
    'var(--ot-accent)',
  ],

  // Categorical: diverse multi-hue ramp inspired by classic data viz standards
  // (D3 category10 / Tableau 10) — steel blue, safety orange, olive green, brick red.
  categorical: [
    'oklch(52% 0.14 230)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(72% 0.18 55)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(58% 0.17 145)',   /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
    'oklch(50% 0.20 25)',    /* token-exempt: fixed multi-hue data-viz palette — intentionally not brand-tracking */
  ],

  // Mono: white alphas — retained for backward compatibility with brand/glass backgrounds.
  mono: [
    'rgba(255,255,255,0.95)',  /* token-exempt: data-viz series color consumed by Recharts as SVG attr; var() does not resolve there */
    'rgba(255,255,255,0.65)',  /* token-exempt: data-viz series color consumed by Recharts as SVG attr; var() does not resolve there */
    'rgba(255,255,255,0.40)',  /* token-exempt: data-viz series color consumed by Recharts as SVG attr; var() does not resolve there */
    'rgba(255,255,255,0.20)',  /* token-exempt: data-viz series color consumed by Recharts as SVG attr; var() does not resolve there */
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
        gridColor:     'rgba(255,255,255,0.06)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        axisColor:     'transparent',
        tickColor:     'var(--ot-fg-muted)',
        tooltipBg:     'var(--ot-canvas)',
        tooltipBorder: 'rgba(255,255,255,0.10)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipText:   'var(--ot-fg)',
        legendColor:   'var(--ot-fg-muted)',
        cursorFill:    'rgba(255,255,255,0.04)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
      }
    case 'brand':
      return {
        gridColor:     'rgba(255,255,255,0.10)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        axisColor:     'transparent',
        tickColor:     'rgba(255,255,255,0.60)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipBg:     'rgba(0,0,0,0.70)',        /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipBorder: 'rgba(255,255,255,0.15)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipText:   'rgba(255,255,255,0.95)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        legendColor:   'rgba(255,255,255,0.70)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        cursorFill:    'rgba(255,255,255,0.06)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
      }
    case 'glass':
      // glass assumes a dark background context
      return {
        gridColor:     'rgba(255,255,255,0.10)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        axisColor:     'transparent',
        tickColor:     'rgba(255,255,255,0.60)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipBg:     'rgba(0,0,0,0.70)',        /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipBorder: 'rgba(255,255,255,0.15)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipText:   'rgba(255,255,255,0.95)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        legendColor:   'rgba(255,255,255,0.70)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        cursorFill:    'rgba(255,255,255,0.06)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
      }
    case 'canvas':
    default:
      return {
        gridColor:     'rgba(255,255,255,0.06)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        axisColor:     'transparent',
        tickColor:     'var(--ot-fg-muted)',
        tooltipBg:     'var(--ot-surface)',
        tooltipBorder: 'rgba(255,255,255,0.10)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
        tooltipText:   'var(--ot-fg)',
        legendColor:   'var(--ot-fg-muted)',
        cursorFill:    'rgba(255,255,255,0.04)',  /* token-exempt: Recharts SVG attr; var()/relative-color does not resolve */
      }
  }
}
