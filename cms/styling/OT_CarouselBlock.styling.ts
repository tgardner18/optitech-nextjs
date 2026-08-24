export type CarouselStyleOptions = {
  slideLayout: 'fullBleed' | 'split'
  overlay:     'gradient' | 'none'
  transition:  'slide' | 'cover' | 'fade' | 'morph'
  controls:    'both' | 'arrows' | 'dots' | 'none'
  autoplay:    'off' | 'slow' | 'medium' | 'fast'
  loop:        'loop' | 'bounce' | 'none'
  peek:        'none' | 'sm' | 'md' | 'lg'
  gap:         'none' | 'small' | 'medium' | 'large'
  color:       'canvas' | 'surface' | 'brand'
}

export function getCarouselStyles(s: Record<string, string | boolean>): CarouselStyleOptions {
  return {
    slideLayout: (s.slideLayout ?? 'fullBleed')  as CarouselStyleOptions['slideLayout'],
    overlay:     (s.overlay     ?? 'gradient')   as CarouselStyleOptions['overlay'],
    transition:  (s.transition  ?? 'slide')      as CarouselStyleOptions['transition'],
    controls:    (s.controls    ?? 'both')       as CarouselStyleOptions['controls'],
    autoplay:    (s.autoplay    ?? 'off')        as CarouselStyleOptions['autoplay'],
    loop:        (s.loop        ?? 'loop')       as CarouselStyleOptions['loop'],
    peek:        (s.peek        ?? 'none')       as CarouselStyleOptions['peek'],
    gap:         (s.gap         ?? 'medium')     as CarouselStyleOptions['gap'],
    color:       (s.color       ?? 'canvas')     as CarouselStyleOptions['color'],
  }
}
