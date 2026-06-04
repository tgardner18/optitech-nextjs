import type { BannerStyleOptions } from '@/components/blocks/BannerBlock'

export function getBannerStyles(s: Record<string, string | boolean>): BannerStyleOptions {
  return {
    color:      (s.color      ?? 'canvas')  as BannerStyleOptions['color'],
    treatment:  (s.treatment  ?? 'scrim')   as BannerStyleOptions['treatment'],
    alignment:  (s.alignment  ?? 'center')  as BannerStyleOptions['alignment'],
    size:       (s.size       ?? 'large')   as BannerStyleOptions['size'],
    imageBlend: (s.imageBlend ?? 'overlay') as BannerStyleOptions['imageBlend'],
  }
}
