import type { TrustRailStyleOptions } from '@/components/blocks/TrustRail'

export function getTrustRailStyles(s: Record<string, string | boolean>): TrustRailStyleOptions {
  return {
    motion:     (s.motion     ?? 'scroll')  as TrustRailStyleOptions['motion'],
    treatment:  (s.treatment  ?? 'mono')    as TrustRailStyleOptions['treatment'],
    background: (s.background ?? 'canvas')  as TrustRailStyleOptions['background'],
    density:    (s.density    ?? 'compact') as TrustRailStyleOptions['density'],
    size:       (s.size       ?? 'md')      as TrustRailStyleOptions['size'],
    glass:      s.glass === true || s.glass === 'true',
  }
}
