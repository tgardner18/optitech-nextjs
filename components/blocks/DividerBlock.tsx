import type {
  DividerStyleOptions,
  DividerOrnament,
} from '@/cms/styling/OT_DividerBlock.styling'

export type DividerBlockProps = {
  label?:        string
  styleOptions?: Partial<DividerStyleOptions>
}

// All visuals live in divider.css, keyed on the data attributes below.
// data-stagger="draw" rides the shared MotionObserver (data-in lands on this element).

const ORNAMENT_GLYPH: Record<Exclude<DividerOrnament, 'none'>, string> = {
  pendant:  '❧',
  asterism: '⁂',
  dot:      '•',
}

export default function DividerBlock({ label, styleOptions = {} }: DividerBlockProps) {
  const {
    style    = 'mark',
    space    = 'lg',
    tone     = 'neutral',
    ornament = 'pendant',
    weight   = 'slim',
    reveal   = 'static',
  } = styleOptions as DividerStyleOptions

  const text = label?.trim() ?? ''

  // The label renders in every style; otherwise Mark shows its ornament.
  const mark = text ? (
    <span data-part="mark"><span data-part="label">{text}</span></span>
  ) : style === 'mark' && ornament !== 'none' ? (
    <span data-part="mark">
      <span data-part="ornament" data-orn={ornament} aria-hidden="true">{ORNAMENT_GLYPH[ornament]}</span>
    </span>
  ) : null

  return (
    <div
      data-block="divider"
      data-style={style}
      data-tone={tone}
      data-weight={weight}
      data-space={space}
      data-has-mark={mark ? '' : undefined}
      data-stagger={reveal === 'draw' ? 'draw' : undefined}
    >
      <div data-part="rule" role="separator" aria-orientation="horizontal" aria-label={text || undefined}>
        {style === 'bleed' ? (
          <>
            <span data-part="wash" aria-hidden="true" />
            {mark}
          </>
        ) : mark ? (
          <>
            <span data-part="line" data-side="start" />
            {mark}
            <span data-part="line" data-side="end" />
          </>
        ) : (
          <span data-part="line" />
        )}
      </div>
    </div>
  )
}
