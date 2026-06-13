export type DividerStyle    = 'slope' | 'mark' | 'bleed'
export type DividerSpace    = 'sm' | 'md' | 'lg' | 'xl'
export type DividerTone     = 'neutral' | 'brand' | 'accent'
export type DividerSlant    = 'rise' | 'fall'
export type DividerOrnament = 'none' | 'pendant' | 'asterism' | 'dot'
export type DividerReveal   = 'static' | 'draw'

export type DividerStyleOptions = {
  style:    DividerStyle
  space:    DividerSpace
  tone:     DividerTone
  slant:    DividerSlant
  ornament: DividerOrnament
  reveal:   DividerReveal
}

export function getDividerStyles(s: Record<string, string | boolean>): DividerStyleOptions {
  return {
    style:    (s.style    ?? 'slope')   as DividerStyle,
    space:    (s.space    ?? 'lg')      as DividerSpace,
    tone:     (s.tone     ?? 'neutral') as DividerTone,
    slant:    (s.slant    ?? 'rise')    as DividerSlant,
    ornament: (s.ornament ?? 'pendant') as DividerOrnament,
    reveal:   (s.reveal   ?? 'static')  as DividerReveal,
  }
}
