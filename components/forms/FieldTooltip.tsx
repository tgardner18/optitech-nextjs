import { Info } from 'lucide-react'

type Props = {
  id: string
  text: string
}

/**
 * A small info icon next to a field's label that reveals its help text as a
 * floating popover on hover or keyboard focus. CSS-only (:hover /
 * :focus-within) so it stays a plain server-renderable leaf.
 *
 * The popover text is only visually hidden (opacity), never `hidden`, so it
 * stays in the accessibility tree and is announced via `aria-describedby`
 * on focus regardless of hover state. Styling lives in blocks/forms.css.
 */
export default function FieldTooltip({ id, text }: Props) {
  return (
    <span data-part="tip">
      <button type="button" data-part="info" aria-describedby={`${id}-hint`}>
        <Info aria-hidden="true" />
        <span className="sr-only">More info</span>
      </button>
      <span id={`${id}-hint`} role="tooltip" data-part="tooltip">
        {text}
      </span>
    </span>
  )
}
