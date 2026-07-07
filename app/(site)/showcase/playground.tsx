'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ControlState = Record<string, string>

export type ButtonsControl = {
  type: 'buttons'
  key: string
  label: string
  options: { label: string; value: string }[]
  visible?: (state: ControlState) => boolean
}

export type SelectControl = {
  type: 'select'
  key: string
  label: string
  options: { label: string; value: string }[]
  visible?: (state: ControlState) => boolean
}

export type ControlDef = ButtonsControl | SelectControl

export interface BlockPlaygroundProps {
  controls: ControlDef[]
  defaults: ControlState
  children: (state: ControlState) => React.ReactNode
}

// ─── BlockPlayground ──────────────────────────────────────────────────────────

export function BlockPlayground({ controls, defaults, children }: BlockPlaygroundProps) {
  const [state, setState] = useState<ControlState>(defaults)

  function set(key: string, value: string) {
    setState(prev => ({ ...prev, [key]: value }))
  }

  function reset() {
    setState(defaults)
  }

  const isDirty = controls.some(c => state[c.key] !== defaults[c.key])

  const visibleControls = controls.filter(c => c.visible?.(state) !== false)

  const stateLabel = visibleControls
    .map(c => `${c.key}: "${state[c.key]}"`)
    .join(' · ')

  return (
    <div>
      {/* ── Controls bar ──────────────────────────────────────────────────── */}
      <div className="px-md pt-md pb-sm lg:px-lg border-t border-fg/10 flex flex-wrap items-center gap-x-lg gap-y-sm">
        {visibleControls.map(control => (
          <div key={control.key} className="flex items-center gap-sm">
            <span className="text-label tracking-label uppercase text-fg-muted/50 font-semibold shrink-0 select-none">
              {control.label}
            </span>

            {control.type === 'select' ? (
              <select
                value={state[control.key]}
                onChange={e => set(control.key, e.target.value)}
                className="bg-canvas border border-fg/15 text-label text-fg font-semibold px-2 py-1 outline-none focus:border-brand/50 transition-colors duration-100 cursor-pointer"
              >
                {control.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-stretch divide-x divide-fg/10 border border-fg/10 overflow-hidden">
                {control.options.map(opt => {
                  const isActive = state[control.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set(control.key, opt.value)}
                      className={[
                        'px-2.5 py-1 text-label font-semibold tracking-label uppercase whitespace-nowrap',
                        'transition-colors duration-100 ease-quick',
                        isActive
                          ? 'bg-brand text-fg-on-brand'
                          : 'text-fg-muted hover:text-fg hover:bg-fg/5 bg-transparent',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {isDirty && (
          <button
            onClick={reset}
            className="flex items-center gap-xs text-label text-fg-muted/50 hover:text-fg-muted transition-colors duration-100 ml-auto"
            aria-label="Reset to defaults"
          >
            <RotateCcw size={11} />
            <span className="tracking-label uppercase font-semibold">Reset</span>
          </button>
        )}
      </div>

      {/* ── State readout ─────────────────────────────────────────────────── */}
      <div className="px-md pb-sm lg:px-lg">
        <span className="font-mono text-label text-fg-muted/30 select-none">{stateLabel}</span>
      </div>

      {/* ── Block preview ─────────────────────────────────────────────────── */}
      <div className="border-t border-fg/5">
        {children(state)}
      </div>
    </div>
  )
}
