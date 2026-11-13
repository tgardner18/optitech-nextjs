'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FieldWrapper, { describedBy } from './FieldWrapper'

type Option = { caption: string; value: string; checked: boolean }

type Props = {
  id: string
  name: string
  label?: string
  placeholder?: string
  tooltip?: string
  options: Option[]
  /** Visual asterisk only — a checkbox group has no native "at least one
   *  required" constraint, and every form on this site sets noValidate anyway. */
  required?: boolean
}

/**
 * The multi-select counterpart to SelectionField's single-select <select>.
 *
 * A native <select multiple> isn't actually a dropdown — every option is
 * always visible in a fixed-height listbox — and it only adds to the
 * selection on a modifier-held click, which isn't discoverable. This closes
 * by default like a real dropdown, and every option is a real checkbox, so
 * clicking one just checks it; no modifier key, no surprise.
 *
 * Real <input type="checkbox"> elements inside the popover mean this needs
 * no synthetic submission wiring — each checked box contributes a FormData
 * entry under `name` on submit, exactly like ChoiceField's multi-select.
 * This is only a collapsible presentation over that same mechanism.
 *
 * The panel stays mounted (`hidden`, not a conditional `open && <div>`) for
 * the same reason FormWrapper keeps every step mounted across the whole
 * form: a submit reads the live DOM via FormData, so a checkbox that isn't
 * in the tree when the panel is closed wouldn't submit at all, even if it
 * was checked before closing. Checked state is also fully controlled from
 * `selected` rather than `defaultChecked`, so re-showing the (never-
 * unmounted, but previously hidden) panel can't drift from it either.
 */
export default function MultiSelectDropdown({ id, name, label, placeholder, tooltip, options, required }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(() => options.filter(o => o.checked).map(o => o.value))
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = `${id}-panel`

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggleValue(value: string, checked: boolean) {
    setSelected(prev => (checked ? [...prev, value] : prev.filter(v => v !== value)))
  }

  const selectedCaptions = options.filter(o => selected.includes(o.value)).map(o => o.caption)
  const summary =
    selectedCaptions.length === 0 ? (placeholder ?? 'Select options')
    : selectedCaptions.length <= 2 ? selectedCaptions.join(', ')
    : `${selectedCaptions.length} selected`

  return (
    <FieldWrapper id={id} label={label} tooltip={tooltip} required={required}>
      <div data-part="select" ref={rootRef}>
        <button
          type="button"
          id={id}
          data-part="input"
          data-empty={selectedCaptions.length === 0 ? '' : undefined}
          aria-expanded={open}
          aria-controls={panelId}
          aria-describedby={describedBy(id, tooltip)}
          onClick={() => setOpen(o => !o)}
        >
          {summary}
        </button>
        <ChevronDown data-part="chev" aria-hidden="true" />
        <div id={panelId} hidden={!open} role="group" aria-label={label} data-part="menu">
          {options.map((opt, i) => {
            const optId = `${id}-${i}`
            return (
              <label key={optId} data-part="option">
                <input
                  type="checkbox"
                  id={optId}
                  name={name}
                  value={opt.value}
                  checked={selected.includes(opt.value)}
                  onChange={e => toggleValue(opt.value, e.target.checked)}
                  data-part="check"
                />
                <span>{opt.caption}</span>
              </label>
            )
          })}
        </div>
      </div>
    </FieldWrapper>
  )
}
