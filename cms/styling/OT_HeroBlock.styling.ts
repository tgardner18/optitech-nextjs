import type { HeroStyleOptions } from '@/components/blocks/HeroBlock'

export function getHeroStyles(s: Record<string, string | boolean>): HeroStyleOptions {
  // `direction` is NOT a display-template setting — it is a content field on
  // OT_HeroBlock, merged into styleOptions by the adapter. Only layout / color /
  // animation come from the display template here.
  return {
    layout:    (s.layout    ?? 'imageRight') as HeroStyleOptions['layout'],
    color:     (s.color     ?? 'brand')      as HeroStyleOptions['color'],
    animation: (s.animation ?? 'none')       as HeroStyleOptions['animation'],
  }
}
