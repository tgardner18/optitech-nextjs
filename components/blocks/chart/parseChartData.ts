export type ChartSeries = {
  name: string
  data: number[]
}

export type ChartData = {
  series: ChartSeries[]
  labels: string[]
  max?:   number
}

export function parseChartData(raw: string | null, chartType: string): ChartData | null {
  if (!raw || raw.trim() === '') return null

  // Strip "RAW:" prefix used when chart data is stored via the composition API
  // (the CMS deep-parses bare JSON strings, so we prefix to prevent that)
  const src = raw.startsWith('RAW:') ? raw.slice(4) : raw

  let parsed: unknown
  try {
    parsed = JSON.parse(src)
  } catch {
    console.warn('[OT_ChartBlock] chartData is not valid JSON')
    return null
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    console.warn('[OT_ChartBlock] chartData must be a plain object')
    return null
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.series) || obj.series.length === 0) {
    console.warn('[OT_ChartBlock] chartData.series must be a non-empty array')
    return null
  }

  for (let i = 0; i < obj.series.length; i++) {
    const s = obj.series[i]
    if (typeof s !== 'object' || s === null) {
      console.warn(`[OT_ChartBlock] chartData.series[${i}] must be an object`)
      return null
    }
    const item = s as Record<string, unknown>
    if (typeof item.name !== 'string') {
      console.warn(`[OT_ChartBlock] chartData.series[${i}].name must be a string`)
      return null
    }
    if (!Array.isArray(item.data) || item.data.length === 0) {
      console.warn(`[OT_ChartBlock] chartData.series[${i}].data must be a non-empty array`)
      return null
    }
    for (const v of item.data) {
      if (typeof v !== 'number') {
        console.warn(`[OT_ChartBlock] chartData.series[${i}].data contains a non-number value`)
        return null
      }
    }
  }

  if (chartType === 'radial') {
    if (obj.series.length !== 1) {
      console.warn('[OT_ChartBlock] radial chartData.series must have exactly one item')
      return null
    }
    const radialData = (obj.series[0] as Record<string, unknown>).data as number[]
    if (radialData.length !== 1) {
      console.warn('[OT_ChartBlock] radial chartData.series[0].data must have exactly one value')
      return null
    }
    if (obj.max !== undefined) {
      if (typeof obj.max !== 'number' || obj.max <= 0) {
        console.warn('[OT_ChartBlock] chartData.max must be a positive number')
        return null
      }
    }
    return {
      series: obj.series as ChartSeries[],
      labels: Array.isArray(obj.labels) ? (obj.labels as string[]) : ['Score'],
      max:    typeof obj.max === 'number' ? obj.max : 100,
    }
  }

  if (!Array.isArray(obj.labels) || obj.labels.length === 0) {
    console.warn('[OT_ChartBlock] chartData.labels must be a non-empty array of strings')
    return null
  }
  for (const l of obj.labels) {
    if (typeof l !== 'string') {
      console.warn('[OT_ChartBlock] chartData.labels contains a non-string value')
      return null
    }
  }

  return {
    series: obj.series as ChartSeries[],
    labels: obj.labels as string[],
  }
}
