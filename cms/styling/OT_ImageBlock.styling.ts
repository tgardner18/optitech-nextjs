import type { ImageStyleOptions } from '@/components/blocks/ImageBlock'

const RATIO_MAP: Record<string, ImageStyleOptions['ratio']> = {
  r16_9: '16:9',
  r4_3:  '4:3',
  r3_2:  '3:2',
  r1_1:  '1:1',
}

export function getImageStyles(s: Record<string, string | boolean>): ImageStyleOptions {
  return {
    ratio:           RATIO_MAP[s.ratio as string],
    minHeight:       (s.minHeight ?? 'md') as ImageStyleOptions['minHeight'],
    maxHeight:       (s.maxHeight ?? 'none') as ImageStyleOptions['maxHeight'],
    overlay:         s.overlay === 'true' || s.overlay === true,
    frame:           (s.frame === 'none' || !s.frame) ? undefined : s.frame as ImageStyleOptions['frame'],
    animate:         s.animate === 'true' || s.animate === true,
    captionPosition: (s.captionPosition ?? 'below') as ImageStyleOptions['captionPosition'],
    shadow:          s.shadow === 'true' || s.shadow === true,
    lightbox:        s.lightbox === 'true' || s.lightbox === true,
  }
}
