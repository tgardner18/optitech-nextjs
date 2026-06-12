import type { RichTextStyleOptions } from '@/components/blocks/RichTextBlock'

export function getRichTextStyles(s: Record<string, string | boolean>): RichTextStyleOptions {
  return {
    color:         (s.color         ?? 'canvas')    as RichTextStyleOptions['color'],
    alignment:     (s.alignment     ?? 'left')      as RichTextStyleOptions['alignment'],
    size:          (s.size          ?? 'editorial') as RichTextStyleOptions['size'],
    treatment:     (s.treatment     ?? 'standard')  as RichTextStyleOptions['treatment'],
    ruledHeadings: s.ruledHeadings === 'true' || s.ruledHeadings === true,
    textScale:     (s.textScale     ?? 'body')      as RichTextStyleOptions['textScale'],
    textWeight:    (s.textWeight    ?? 'regular')   as RichTextStyleOptions['textWeight'],
    columns:          (s.columns    ?? 'single')    as RichTextStyleOptions['columns'],
    ground:           (s.ground     ?? 'flat')      as RichTextStyleOptions['ground'],
    dividers:         (s.dividers   ?? 'rule')      as RichTextStyleOptions['dividers'],
    numberedHeadings: s.numberedHeadings === 'true' || s.numberedHeadings === true,
    reveal:           (s.reveal     ?? 'none')      as RichTextStyleOptions['reveal'],
  }
}
