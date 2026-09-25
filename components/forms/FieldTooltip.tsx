import { Info } from 'lucide-react'

type Props = {
  id: string
  text: string
}

/**
 * A small info icon next to a field's label that reveals its help text as a
 * floating popover on hover or keyboard focus — CSS-only (:hover /
 * :focus-within), so this stays a plain server-renderable leaf like the
 * rest of FieldWrapper; no click handler, no outside-click/Escape wiring to
 * get wrong.
 *
 * The popover text is only visually hidden (opacity + pointer-events, never
 * `hidden`/display:none), so it stays in the accessibility tree and gets
 * announced via `aria-describedby` on focus regardless of hover state —
 * unlike an unmount-based popover, which would go silent for anyone
 * navigating by keyboard alone.
 */
export default function FieldTooltip({ id, text }: Props) {
  return (
    <span className="relative inline-flex group/tooltip">
      <button
        type="button"
        aria-describedby={`${id}-hint`}
        className="flex items-center justify-center text-fg-muted/50 hover:text-fg-muted focus-visible:text-fg-muted focus-visible:outline-none transition-colors duration-150 ease-quick"
      >
        <Info size={13} aria-hidden="true" />
        <span className="sr-only">More info</span>
      </button>
      <span
        id={`${id}-hint`}
        role="tooltip"
        className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-xs w-max max-w-64 rounded-input bg-surface border border-fg/10 px-sm py-xs text-label text-fg-muted leading-snug shadow-[0_8px_24px_var(--ot-bloom-brand-faint)] opacity-0 scale-95 pointer-events-none transition-[opacity,transform] duration-150 ease-quick group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100"
      >
        {text}
      </span>
    </span>
  )
}
