export type CalloutIntent   = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'
export type CalloutVariant  = 'filled' | 'bordered' | 'bar' | 'split'
export type CalloutSize     = 'default' | 'compact'
export type CalloutAlign    = 'left' | 'center'
export type CalloutMaxWidth = 'full' | 'wide' | 'default' | 'narrow'

export type CalloutStyleOptions = {
  intent:      CalloutIntent
  variant:     CalloutVariant
  size:        CalloutSize
  alignment:   CalloutAlign
  dismissible: boolean
  sticky:      boolean
  icon:        string
  maxWidth:    CalloutMaxWidth
  label:       boolean
  /** Built-in per-variant entrance motion (the legacy stagger animations replace it when set). */
  nativeMotion: boolean
}

export function getCalloutStyles(s: Record<string, string | boolean>): CalloutStyleOptions {
  return {
    intent:      (s.intent    ?? 'info')    as CalloutIntent,
    variant:     (s.variant   ?? 'filled')  as CalloutVariant,
    size:        (s.size      ?? 'default') as CalloutSize,
    alignment:   (s.alignment ?? 'left')    as CalloutAlign,
    dismissible: s.dismissible === 'on' || s.dismissible === true,
    sticky:      s.sticky === 'on' || s.sticky === true,
    icon:        String(s.icon ?? 'none'),
    maxWidth:    (s.maxWidth   ?? 'full')   as CalloutMaxWidth,
    label:       !(s.label === 'off' || s.label === false),
    nativeMotion: (s.entranceAnimation ?? 'none') === 'none',
  }
}
