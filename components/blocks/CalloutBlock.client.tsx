'use client'

import { useState, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { useTokens }         from '@/components/providers/TokenProvider'
import { cn }                from '@/lib/utils'
import { ICON_REGISTRY }     from '@/components/icons/iconRegistry'
import { X, ArrowRight }     from 'lucide-react'
import type { CalloutStyleOptions, CalloutIntent, CalloutMaxWidth } from '@/cms/styling/OT_CalloutBlock.styling'
import type { CalloutBlockProps } from './CalloutBlock'

// All visual styling lives in callout.css (imported from app/globals.css).
// This component only sets data attributes and markup.

// ─── Intent icons ─────────────────────────────────────────────────────────────
// Icons come from the project's ICON_REGISTRY. Each intent has a default so the
// callout always reads at a glance; the editor's Icon setting overrides it.

const DEFAULT_ICON: Record<CalloutIntent, string> = {
  neutral: 'messageSquare',
  info:    'lightbulb',
  success: 'checkCircle',
  warning: 'timer',
  danger:  'shield',
  brand:   'sparkles',
}

// English defaults; a site can translate them via Token Manager keys
// `callout-label-<intent>` (e.g. callout-label-warning).
const DEFAULT_LABELS: Record<CalloutIntent, string> = {
  neutral: 'Notice', info: 'Update', success: 'Good news', warning: 'Heads up', danger: 'Urgent', brand: 'New',
}

function Glyph({ intent, custom }: { intent: CalloutIntent; custom: string }) {
  const key  = custom && custom !== 'none' ? custom : DEFAULT_ICON[intent]
  const Icon = ICON_REGISTRY[key] ?? ICON_REGISTRY[DEFAULT_ICON.info]
  return <Icon data-callout-icon aria-hidden />
}

// ─── ARIA role ────────────────────────────────────────────────────────────────

function ariaRole(intent: CalloutIntent): 'alert' | 'status' | 'note' {
  if (intent === 'danger' || intent === 'warning') return 'alert'
  if (intent === 'info'   || intent === 'success') return 'status'
  return 'note'
}

// Named Tailwind sizes (max-w-sm, max-w-xl) are avoided because this project's
// @theme inline maps --spacing-sm/xl to 8px/64px, collapsing those utilities.
const MAX_WIDTH_WRAPPER: Record<CalloutMaxWidth, string> = {
  full:    '',
  wide:    'max-w-[768px] mx-auto',
  default: 'max-w-[560px] mx-auto',
  narrow:  'max-w-[400px] mx-auto',
}

type DismissPhase = 'visible' | 'sweeping' | 'collapsing' | 'gone'

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalloutBlockClient({
  heading,
  body,
  ctaLabel,
  ctaUrl,
  styleOptions = {},
}: CalloutBlockProps) {
  const {
    intent       = 'info',
    variant      = 'filled',
    size         = 'default',
    alignment    = 'left',
    dismissible  = false,
    sticky       = false,
    icon         = 'none',
    maxWidth     = 'full',
    label        = true,
    nativeMotion = true,
  } = styleOptions as CalloutStyleOptions

  const [phase, setPhase] = useState<DismissPhase>('visible')
  const rootRef   = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const reducedMotion = usePrefersReducedMotion()
  const tokens        = useTokens()

  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  // Entrance: arm on mount, reveal when 20% visible.
  useEffect(() => {
    const el = rootRef.current
    if (!nativeMotion || !el) return
    if (typeof IntersectionObserver === 'undefined') return   // never armed → content stays visible
    // Set on the DOM directly (not React state): data-animate hides the surface until
    // data-in is added, and only exists on the client so server HTML is never hidden.
    el.setAttribute('data-animate', '')
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [nativeMotion, phase])

  function handleDismiss() {
    if (reducedMotion) { setPhase('gone'); return }
    setPhase('sweeping')
    timersRef.current = [
      setTimeout(() => setPhase('collapsing'), 220),
      setTimeout(() => setPhase('gone'),       510),
    ]
  }

  if (phase === 'gone') return null

  const isBar     = variant === 'bar'
  const labelText = tokens[`callout-label-${intent}`]?.trim() || DEFAULT_LABELS[intent] || ''
  const hasBody   = !!body && !isBar

  // ── Dismiss animation wrappers (two-phase exit: sweep right + fade, then collapse) ──
  const outerWrapStyle: React.CSSProperties = dismissible ? {
    display:          'grid',
    gridTemplateRows: phase === 'collapsing' ? '0fr' : '1fr',
    // Only clip while exiting, so the glow shadow isn't cut off at rest.
    ...(phase !== 'visible' && { overflow: 'hidden' }),
    ...(phase === 'collapsing' && {
      transition: 'grid-template-rows 280ms cubic-bezier(0.25, 1, 0.5, 1)',
    }),
  } : {}

  const sweepStyle: React.CSSProperties = phase === 'sweeping' ? {
    opacity:    0,
    transform:  'translateX(1.5rem)',
    transition: 'opacity 220ms cubic-bezier(0.25, 1, 0.5, 1), transform 220ms cubic-bezier(0.25, 1, 0.5, 1)',
  } : {}

  // ── Parts ─────────────────────────────────────────────────────────────────
  const glyph = (
    <span data-part="icon" aria-hidden="true">
      <span data-part="glyph"><Glyph intent={intent} custom={icon} /></span>
    </span>
  )

  const ctaEl = ctaLabel && ctaUrl ? (
    <a data-part="cta" href={ctaUrl}>
      {ctaLabel}
      <ArrowRight aria-hidden />
    </a>
  ) : null

  const dismissBtn = dismissible ? (
    <button type="button" data-part="dismiss" aria-label="Dismiss" onClick={handleDismiss}>
      <X aria-hidden />
    </button>
  ) : null

  const labelEl = label && !isBar && labelText ? (
    <p data-part="label"><span data-part="dot" />{labelText}</p>
  ) : null

  const root = (
    <div
      ref={rootRef}
      className={cn('ot-callout w-full', !isBar && 'my-xl', MAX_WIDTH_WRAPPER[maxWidth] ?? '')}
      data-block={isBar ? 'callout-bar' : 'callout'}
      data-intent={intent}
      data-variant={variant}
      data-size={size}
      data-align={alignment}
      data-body={hasBody ? 'yes' : 'no'}
      data-label={label ? 'yes' : 'no'}
      data-dismissible={dismissible ? 'yes' : 'no'}
      data-sticky={isBar && sticky ? 'yes' : undefined}
    >
      <div data-part="surface" role={ariaRole(intent)}>
        {isBar ? <span data-part="tag">{glyph}{label && labelText}</span> : glyph}
        {variant === 'filled' && (
          <span data-part="watermark" aria-hidden="true"><Glyph intent={intent} custom={icon} /></span>
        )}
        <div data-part="content">
          {labelEl}
          <p data-part="heading">{heading}</p>
          {hasBody && <p data-part="body">{body}</p>}
          {ctaEl}
        </div>
        {dismissBtn}
      </div>
    </div>
  )

  if (!dismissible) return root
  return (
    <div style={outerWrapStyle}>
      <div style={{ minHeight: 0 }}>
        <div style={sweepStyle}>{root}</div>
      </div>
    </div>
  )
}
