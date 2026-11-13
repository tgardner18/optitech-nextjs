export type SliderStyleOptions = {
  width:                'fullBleed' | 'contained'
  height:               'compact' | 'standard' | 'large' | 'fullScreen' | 'fitContent'
  autoPlay:             'off' | 'slow' | 'medium' | 'fast'
  /** Dwell time in ms per slide, or null when Auto-Play is off. */
  autoPlayMs:           number | null
  loop:                 'loop' | 'bounce' | 'none'
  navigation:           'both' | 'arrows' | 'dots' | 'none'
  headingLevel:         'h1' | 'h2'
  entranceAnimation:    'none' | 'fade' | 'slide'
}

const AUTOPLAY_MS: Record<string, number> = { slow: 8000, medium: 5000, fast: 3000 }

export function getSliderStyles(s: Record<string, string | boolean>): SliderStyleOptions {
  const autoPlay = (['off', 'slow', 'medium', 'fast'].includes(s.autoPlay as string)
    ? s.autoPlay
    : 'off') as SliderStyleOptions['autoPlay']

  return {
    width:                (s.width                ?? 'fullBleed') as SliderStyleOptions['width'],
    height:               (s.height               ?? 'standard')  as SliderStyleOptions['height'],
    autoPlay,
    autoPlayMs:           AUTOPLAY_MS[autoPlay] ?? null,
    loop:                 (s.loop                 ?? 'loop')       as SliderStyleOptions['loop'],
    navigation:           (s.navigation           ?? 'both')       as SliderStyleOptions['navigation'],
    headingLevel:         (s.headingLevel         ?? 'h2')         as SliderStyleOptions['headingLevel'],
    entranceAnimation:    (s.entranceAnimation    ?? 'none')       as SliderStyleOptions['entranceAnimation'],
  }
}
