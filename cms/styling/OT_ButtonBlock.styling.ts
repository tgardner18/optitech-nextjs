import type { ButtonBlockStyleOptions } from '@/components/blocks/ButtonBlock'

export function getButtonStyles(s: Record<string, string | boolean>): ButtonBlockStyleOptions {
  return {
    variant:      (s.variant      ?? 'primary')  as ButtonBlockStyleOptions['variant'],
    size:         (s.size         ?? 'md')        as ButtonBlockStyleOptions['size'],
    icon:         (s.icon         ?? 'none')      as ButtonBlockStyleOptions['icon'],
    iconPosition: (s.iconPosition ?? 'trailing')  as ButtonBlockStyleOptions['iconPosition'],
    alignment:    (s.alignment    ?? 'left')      as ButtonBlockStyleOptions['alignment'],
    fullWidth:    s.fullWidth === 'true' || s.fullWidth === true,
  }
}
