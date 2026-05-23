import type { StatBlockStyleOptions } from '@/components/blocks/StatBlock'

export function getStatBlockStyles(s: Record<string, string | boolean>): StatBlockStyleOptions {
  const rawCols = String(s.columns ?? 'col3')
  const cols    = rawCols === 'col2' || rawCols === '2' ? 2
                : rawCols === 'col4' || rawCols === '4' ? 4
                : 3

  return {
    columns:   cols as 2 | 3 | 4,
    color:     (s.color    ?? 'brand')  as StatBlockStyleOptions['color'],
    showIcons:  s.showIcons === true || s.showIcons === 'true',
    animate:    s.animate  !== false  && s.animate  !== 'false',
  }
}

/**
 * Extract up to 4 per-slot icon keys from display settings.
 * Returns undefined for slots where 'none' or no value is set.
 */
export function getStatBlockIcons(
  s: Record<string, string | boolean>,
): [string | undefined, string | undefined, string | undefined, string | undefined] {
  const resolve = (v: string | boolean | undefined) => {
    if (!v || v === 'none') return undefined
    return String(v)
  }
  return [
    resolve(s.stat1Icon),
    resolve(s.stat2Icon),
    resolve(s.stat3Icon),
    resolve(s.stat4Icon),
  ]
}
