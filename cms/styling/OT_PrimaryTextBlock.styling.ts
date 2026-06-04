import type { PrimaryTextStyleOptions } from '@/components/blocks/PrimaryTextBlock'

export function getPrimaryTextStyles(s: Record<string, string | boolean>): PrimaryTextStyleOptions {
  return {
    alignment: (s.alignment ?? 'left')     as PrimaryTextStyleOptions['alignment'],
    color:     (s.color     ?? 'canvas')   as PrimaryTextStyleOptions['color'],
    size:      (s.size      ?? 'headline') as PrimaryTextStyleOptions['size'],
    gradient:  (s.gradient  ?? 'none')     as PrimaryTextStyleOptions['gradient'],
    depth:     (s.depth     ?? 'none')     as PrimaryTextStyleOptions['depth'],
  }
}
