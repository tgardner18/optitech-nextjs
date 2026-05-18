import type { CardStyleOptions } from '@/components/blocks/CardBlock'

export function getCardStyles(s: Record<string, string | boolean>): CardStyleOptions {
  return {
    fill:       (s.fill       ?? 'ghost')   as CardStyleOptions['fill'],
    border:     (s.border     ?? 'none')    as CardStyleOptions['border'],
    imageStyle: (s.imageStyle ?? 'top')     as CardStyleOptions['imageStyle'],
    imageSide:  (s.imageSide  ?? 'left')    as CardStyleOptions['imageSide'],
    hover:      (s.hover      ?? 'none')    as CardStyleOptions['hover'],
    density:    (s.density    ?? 'default') as CardStyleOptions['density'],
    noise:      s.noise === 'true' || s.noise === true,
    accentLine: (s.accentLine ?? 'none')    as CardStyleOptions['accentLine'],
    maxHeight:  (s.maxHeight  ?? 'none')    as CardStyleOptions['maxHeight'],
  }
}
