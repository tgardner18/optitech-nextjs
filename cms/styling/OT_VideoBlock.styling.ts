import type { VideoStyleOptions } from '@/components/blocks/VideoBlock'

const RATIO_MAP: Record<string, VideoStyleOptions['ratio']> = {
  r16_9: '16:9',
  r4_3:  '4:3',
  r3_2:  '3:2',
  r1_1:  '1:1',
}

export function getVideoStyles(s: Record<string, string | boolean>): VideoStyleOptions {
  return {
    ratio:           RATIO_MAP[s.ratio as string] ?? '16:9',
    overlay:         s.overlay === 'true' || s.overlay === true,
    frame:           (s.frame === 'none' || !s.frame) ? undefined : s.frame as VideoStyleOptions['frame'],
    captionPosition: (s.captionPosition ?? 'below') as VideoStyleOptions['captionPosition'],
    shadow:          s.shadow === 'true' || s.shadow === true,
    invertedBg:      s.bgColor === 'brand',
  }
}
