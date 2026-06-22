'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

// ─── MultiSelect ────────────────────────────────────────────────────────────
//
// An accessible, token-driven multi-select used by the practitioner directory
// facets (Specialty / Location / Language). Trigger shows the facet label plus
// a brand count badge once values are chosen; the popover is a listbox of
// toggleable options with an optional in-popover filter for long lists.
//
// Semantics: trigger is aria-haspopup="listbox" + aria-expanded; the panel is
// role="listbox" aria-multiselectable; each option is role="option" aria-selected.
// Keyboard: Enter/Space/↓ opens, ↑/↓ move, Enter/Space toggle, Esc closes and
// returns focus to the trigger, click-outside dismisses. All motion is
// motion-safe and degrades under prefers-reduced-motion.

type Props = {
  label:        string
  options:      string[]
  selected:     string[]
  onChange:     (next: string[]) => void
  /** Page background the control sits on — picks the elevated panel contrast. */
  onSurface?:   boolean
  /** Show the in-popover filter input once options exceed this count. */
  searchThreshold?: number
  /** Placeholder for the in-popover filter. */
  searchPlaceholder?: string
}

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  onSurface = false,
  searchThreshold = 12,
  searchPlaceholder,
}: Props) {
  const [open, setOpen]       = useState(false)
  const [active, setActive]   = useState(-1)   // keyboard-focused option index
  const [filter, setFilter]   = useState('')

  const listId       = useId()
  const rootRef      = useRef<HTMLDivElement>(null)
  const triggerRef   = useRef<HTMLButtonElement>(null)
  const filterRef    = useRef<HTMLInputElement>(null)
  const optionRefs   = useRef<(HTMLLIElement | null)[]>([])

  const count        = selected.length
  const showFilter   = options.length > searchThreshold

  const selectedSet = useMemo(
    () => new Set(selected.map(s => s.toLowerCase())),
    [selected],
  )

  // Options narrowed by the in-popover filter (case-insensitive substring).
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.toLowerCase().includes(q))
  }, [options, filter])

  const close = useCallback(() => {
    setOpen(false)
    setActive(-1)
    setFilter('')
  }, [])

  // Opening seeds the keyboard-active index: long lists focus the filter input
  // (active stays -1), short lists highlight the first option.
  const openMenu = useCallback(() => {
    setOpen(true)
    setActive(showFilter ? -1 : (options.length ? 0 : -1))
  }, [showFilter, options.length])

  const toggleValue = useCallback(
    (value: string) => {
      const has = selectedSet.has(value.toLowerCase())
      onChange(
        has
          ? selected.filter(s => s.toLowerCase() !== value.toLowerCase())
          : [...selected, value],
      )
    },
    [onChange, selected, selectedSet],
  )

  // Click / focus outside dismisses.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open, close])

  // On open, move focus into the panel: the filter input for long lists, else
  // the first option (its index was seeded by openMenu).
  useEffect(() => {
    if (open && showFilter) filterRef.current?.focus()
  }, [open, showFilter])

  // Keep the keyboard-active option focused and in view.
  useEffect(() => {
    if (open && active >= 0) optionRefs.current[active]?.focus()
  }, [open, active])

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        triggerRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setActive(a => Math.min(a + 1, visible.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive(a => Math.max(a - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActive(visible.length ? 0 : -1)
        break
      case 'End':
        e.preventDefault()
        setActive(visible.length - 1)
        break
      case 'Enter':
      case ' ':
        if (active >= 0 && active < visible.length) {
          e.preventDefault()
          toggleValue(visible[active])
        }
        break
    }
  }

  // Elevated panel: surface tint + blur reads as one step above the page in
  // both modes; near-opaque so option labels stay legible over the results
  // grid beneath. Token-derived, so it follows CMS theme overrides.
  const panelStyle: React.CSSProperties = {
    background: 'oklch(from var(--ot-surface) l c h / 0.93)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  }

  const idle =
    onSurface ? 'bg-canvas' : 'bg-surface'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={
          `${idle} inline-flex h-12 items-center gap-sm border px-md ` +
          'text-label uppercase tracking-label font-semibold ' +
          'motion-safe:transition-colors duration-150 ' +
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
          (count > 0
            ? 'border-brand text-fg'
            : 'border-fg/15 text-fg-muted hover:text-fg hover:border-fg/35')
        }
      >
        <span>{label}</span>
        {count > 0 && (
          <span
            aria-hidden
            className="inline-flex min-w-5 h-5 items-center justify-center bg-brand px-1 text-fg-on-brand text-[0.6875rem] leading-none font-bold tabular-nums"
          >
            {count}
          </span>
        )}
        <ChevronDown
          size={15}
          strokeWidth={2}
          aria-hidden
          className={`text-fg-muted motion-safe:transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {count > 0 && <span className="sr-only">, {count} selected</span>}
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(20rem,calc(100vw-2rem))] border border-fg/15 shadow-[0_12px_40px_var(--ot-bloom-brand-faint),0_2px_8px_var(--ot-bloom-brand-faint)] motion-safe:animate-[multiselect-in_160ms_var(--ot-ease-kinetic)]"
          style={panelStyle}
        >
          {showFilter && (
            <div className="relative border-b border-fg/10 p-2">
              <Search
                size={15}
                strokeWidth={1.75}
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted"
              />
              <input
                ref={filterRef}
                type="text"
                value={filter}
                onChange={e => { setFilter(e.target.value); setActive(-1) }}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    close()
                    triggerRef.current?.focus()
                  } else if (e.key === 'ArrowDown' && visible.length) {
                    e.preventDefault()
                    setActive(0)
                  }
                }}
                placeholder={searchPlaceholder ?? `Filter ${label.toLowerCase()}`}
                aria-label={searchPlaceholder ?? `Filter ${label.toLowerCase()}`}
                className="h-9 w-full bg-transparent pl-7 pr-2 text-sm text-fg placeholder:text-fg-muted/60 focus:outline-none"
              />
            </div>
          )}

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            onKeyDown={onListKeyDown}
            className="max-h-72 overflow-y-auto overscroll-contain py-1"
          >
            {visible.length === 0 ? (
              <li className="px-md py-sm text-sm text-fg-muted/70" role="presentation">
                No matches
              </li>
            ) : (
              visible.map((opt, i) => {
                const isSel = selectedSet.has(opt.toLowerCase())
                return (
                  <li
                    key={opt}
                    ref={el => { optionRefs.current[i] = el }}
                    role="option"
                    aria-selected={isSel}
                    tabIndex={active === i ? 0 : -1}
                    onClick={() => { setActive(i); toggleValue(opt) }}
                    onMouseEnter={() => setActive(i)}
                    className={
                      'flex cursor-pointer items-center gap-sm px-md py-2 text-sm ' +
                      'motion-safe:transition-colors duration-100 ' +
                      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ' +
                      (active === i ? 'bg-brand/12 text-fg' : 'text-fg-muted') +
                      (isSel ? ' text-fg' : '')
                    }
                  >
                    <span
                      aria-hidden
                      className={
                        'flex h-4 w-4 flex-none items-center justify-center border ' +
                        (isSel ? 'border-brand bg-brand text-fg-on-brand' : 'border-fg/30')
                      }
                    >
                      {isSel && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 wrap-break-word">{opt}</span>
                  </li>
                )
              })
            )}
          </ul>

          {count > 0 && (
            <div className="border-t border-fg/10 p-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="inline-flex items-center gap-xs px-2 py-1 text-label uppercase tracking-label font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X size={13} strokeWidth={2} aria-hidden />
                Clear {label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
