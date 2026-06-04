export type ChartStyleOptions = {
  color:       'canvas' | 'surface' | 'brand' | 'glass'
  height:      'sm' | 'md' | 'lg'
  aspectRatio: 'wide' | 'standard' | 'square'
}

export function getChartStyles(s: Record<string, string | boolean>): ChartStyleOptions {
  return {
    color:       (s.color       ?? 'canvas') as ChartStyleOptions['color'],
    height:      (s.height      ?? 'md')     as ChartStyleOptions['height'],
    aspectRatio: (s.aspectRatio ?? 'wide')   as ChartStyleOptions['aspectRatio'],
  }
}

export const HEIGHT_MAP: Record<ChartStyleOptions['height'], number> = {
  sm: 240,
  md: 320,
  lg: 420,
}
