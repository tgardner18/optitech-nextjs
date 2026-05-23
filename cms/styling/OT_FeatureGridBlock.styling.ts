import type { FeatureGridStyleOptions } from '@/components/blocks/FeatureGridBlock'

export function getFeatureGridStyles(s: Record<string, string | boolean>): FeatureGridStyleOptions {
  const rawCols = String(s.columns ?? 'col3')
  const cols    = rawCols === 'col2' || rawCols === '2' ? 2
                : rawCols === 'col4' || rawCols === '4' ? 4
                : 3

  return {
    color:     (s.color     ?? 'canvas') as FeatureGridStyleOptions['color'],
    layout:    (s.layout    ?? 'grid')   as FeatureGridStyleOptions['layout'],
    columns:   cols as 2 | 3 | 4,
    iconStyle: (s.iconStyle ?? 'none')   as FeatureGridStyleOptions['iconStyle'],
    animate:    s.animate   !== false    && s.animate !== 'false',
  }
}

/**
 * Extract up to 6 per-slot icon keys from display settings.
 * Returns undefined for slots where 'none' or no value is set.
 */
export function getFeatureGridIcons(
  s: Record<string, string | boolean>,
): [
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
] {
  const resolve = (v: string | boolean | undefined) => {
    if (!v || v === 'none') return undefined
    return String(v)
  }
  return [
    resolve(s.feature1Icon),
    resolve(s.feature2Icon),
    resolve(s.feature3Icon),
    resolve(s.feature4Icon),
    resolve(s.feature5Icon),
    resolve(s.feature6Icon),
  ]
}
