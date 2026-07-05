import type { PrimaryTextStyleOptions } from '@/components/blocks/PrimaryTextBlock'

export function getPrimaryTextStyles(s: Record<string, string | boolean>): PrimaryTextStyleOptions {
  // 'embossed' was retired in favor of 'glitch'; content saved before the enum
  // change still carries the old value, so map it rather than dropping to none.
  const headerEffect = s.headerEffect === 'embossed' ? 'glitch' : s.headerEffect
  return {
    alignment: (s.alignment   ?? 'left')     as PrimaryTextStyleOptions['alignment'],
    color:     (s.color       ?? 'canvas')   as PrimaryTextStyleOptions['color'],
    size:      (s.size        ?? 'headline') as PrimaryTextStyleOptions['size'],
    effect:    (headerEffect  ?? 'none')     as PrimaryTextStyleOptions['effect'],
  }
}
