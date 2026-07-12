import type { RichTextStyleOptions } from '@/components/blocks/RichTextBlock'

export function getRichTextStyles(s: Record<string, string | boolean>): RichTextStyleOptions {
  return {
    color:     (s.color     ?? 'canvas')    as RichTextStyleOptions['color'],
    alignment: (s.alignment ?? 'left')      as RichTextStyleOptions['alignment'],
    size:      (s.size      ?? 'editorial') as RichTextStyleOptions['size'],
    treatment: (s.treatment ?? 'standard')  as RichTextStyleOptions['treatment'],
  }
}
