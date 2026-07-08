'use client'

import { useState, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cn }            from '@/lib/utils'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import { X, ArrowRight } from 'lucide-react'
import type { CalloutStyleOptions, CalloutIntent, CalloutMaxWidth } from '@/cms/styling/OT_CalloutBlock.styling'
import type { CalloutBlockProps } from './CalloutBlock'

// ─── Intent token helpers ─────────────────────────────────────────────────────

function iVar(intent: CalloutIntent, suffix: string): string {
  return `var(--ot-intent-${intent}-${suffix})`
}

// Derives an alpha variant directly from the base intent color.
// Used for bar bg/border where we want a different opacity than the
// -bg/-border tokens (which are set for filled/bordered variants).
function iAlpha(intent: CalloutIntent, alpha: number): string {
  return `oklch(from var(--ot-intent-${intent}) l c h / ${alpha})`
}

// ─── ARIA role ────────────────────────────────────────────────────────────────

function ariaRole(intent: CalloutIntent): 'alert' | 'status' | undefined {
  if (intent === 'danger' || intent === 'warning') return 'alert'
  if (intent === 'info'   || intent === 'success') return 'status'
  return undefined
}

// ─── Max-width wrapper classes ────────────────────────────────────────────────
// Applied to a separate BLOCK wrapper div (not the flex container) so that
// mx-auto centering is reliable. Named Tailwind sizes (max-w-sm, max-w-xl) are
// avoided because this project's @theme inline maps --spacing-sm/xl to 8px/64px,
// making those utilities collapse to single-digit pixel widths.

const MAX_WIDTH_WRAPPER: Record<CalloutMaxWidth, string> = {
  full:    '',
  wide:    'max-w-[768px] mx-auto',
  default: 'max-w-[560px] mx-auto',
  narrow:  'max-w-[400px] mx-auto',
}

// ─── Dismiss phase ────────────────────────────────────────────────────────────

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
    intent      = 'info',
    variant     = 'filled',
    size        = 'default',
    alignment   = 'left',
    dismissible = false,
    sticky      = false,
    icon        = 'none',
    maxWidth    = 'full',
  } = styleOptions as CalloutStyleOptions

  const [phase,         setPhase]         = useState<DismissPhase>('visible')
  const reducedMotion = usePrefersReducedMotion()
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  function handleDismiss() {
    if (reducedMotion) { setPhase('gone'); return }
    setPhase('sweeping')
    timersRef.current = [
      setTimeout(() => setPhase('collapsing'), 220),
      setTimeout(() => setPhase('gone'),       510),
    ]
  }

  if (phase === 'gone') return null

  const IconComp     = (icon && icon !== 'none') ? ICON_REGISTRY[icon] : null
  const isBrand      = intent === 'brand'
  const isBar        = variant === 'bar'
  const role         = ariaRole(intent)
  const maxWidthWrapper = MAX_WIDTH_WRAPPER[maxWidth] ?? ''

  const fg        = iVar(intent, 'fg')
  const bg        = iVar(intent, 'bg')
  const border    = iVar(intent, 'border')
  const iconColor = isBrand ? 'var(--ot-fg-on-brand)' : fg

  // ── Dismiss animation wrappers ────────────────────────────────────────────
  // Two-phase exit: content sweeps right+fades (220ms), then height collapses (280ms).
  const outerWrapStyle: React.CSSProperties = dismissible ? {
    display:          'grid',
    gridTemplateRows: phase === 'collapsing' ? '0fr' : '1fr',
    overflow:         'hidden',
    ...(phase === 'collapsing' && {
      transition: 'grid-template-rows 280ms cubic-bezier(0.25, 1, 0.5, 1)',
    }),
  } : {}

  const sweepStyle: React.CSSProperties = phase === 'sweeping' ? {
    opacity:    0,
    transform:  'translateX(1.5rem)',
    transition: 'opacity 220ms cubic-bezier(0.25, 1, 0.5, 1), transform 220ms cubic-bezier(0.25, 1, 0.5, 1)',
  } : {}

  // ── Root visual styles ────────────────────────────────────────────────────
  let rootStyle: React.CSSProperties = {}
  let rootClass = ''

  if (isBar) {
    // Bar: faint intent tint + a full 1px perimeter border in the intent color.
    // No side-stripe accent — DESIGN.md §11 bans a colored border >1px on a single
    // edge. Intent still reads through the tint, the uniform frame, and the colored
    // icon. bg/border use iAlpha so bar opacity is independent of the filled tokens.
    const barBg     = iAlpha(intent, 0.10)
    const barBorder = iAlpha(intent, 0.30)
    if (isBrand) {
      rootClass = 'bg-brand-fill'
      rootStyle = { border: `1px solid ${barBorder}` }
    } else {
      rootStyle = {
        background: barBg,
        border:     `1px solid ${barBorder}`,
      }
    }
  } else if (variant === 'filled') {
    if (isBrand) {
      rootClass = 'bg-brand-fill'
    } else {
      rootStyle = { background: bg, border: `1px solid ${border}` }
    }
  } else {
    // bordered
    rootStyle = { background: 'var(--ot-surface)', borderTop: `3px solid ${fg}` }
  }

  // ── Padding ───────────────────────────────────────────────────────────────
  // Bar uses generous py-md for enough visual mass to register during a page scan.
  const padClass = isBar
    ? 'px-md py-md'
    : (size === 'compact' ? 'px-md py-sm' : 'px-md py-md')

  // ── Text colors ───────────────────────────────────────────────────────────
  const headingClass = isBrand ? 'text-fg-on-brand' : 'text-fg'
  const bodyClass    = isBrand ? 'text-fg-on-brand/80' : 'text-fg-muted'

  // ── Dismiss button ────────────────────────────────────────────────────────
  const dismissBtn = dismissible ? (
    <button
      onClick={handleDismiss}
      aria-label="Dismiss"
      style={{ color: fg, borderColor: border } as React.CSSProperties}
      className={cn(
        'shrink-0 rounded-ot-control border flex items-center justify-center cursor-pointer',
        'transition-colors hover:bg-fg/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 outline-none',
        // Brand-intent bar resolves dark tokens; a brand ring would vanish on the
        // brand fill, so switch the focus ring to fg-on-brand there.
        isBrand ? 'focus-visible:ring-fg-on-brand' : 'focus-visible:ring-brand',
        isBar ? 'size-6' : 'size-7',
      )}
    >
      <X size={isBar ? 12 : 14} strokeWidth={2} aria-hidden />
    </button>
  ) : null

  // ── CTA ───────────────────────────────────────────────────────────────────
  const ctaEl = ctaLabel && ctaUrl ? (
    <a
      href={ctaUrl}
      style={{ color: fg }}
      className={cn(
        'flex items-center gap-xs text-label font-semibold hover:underline underline-offset-2 shrink-0',
        alignment === 'center' && !isBar ? 'self-center' : 'self-start',
      )}
    >
      {ctaLabel}
      <ArrowRight size={isBar ? 12 : 13} strokeWidth={2} aria-hidden />
    </a>
  ) : null

  // ── Bar variant ───────────────────────────────────────────────────────────
  if (isBar) {
    const barInner = (
      <div
        className={cn(
          'w-full flex items-center gap-sm',
          padClass,
          rootClass,
          sticky && 'fixed top-0 left-0 right-0 z-50',
        )}
        style={rootStyle}
        role={role}
        data-theme={isBrand ? 'dark' : undefined}
      >
        {/* Left: icon (18px inline) + heading */}
        <div className={cn('flex items-center gap-sm flex-1 min-w-0', alignment === 'center' && 'justify-center')}>
          {IconComp && (
            <IconComp size={18} strokeWidth={1.75} aria-hidden style={{ color: iconColor, flexShrink: 0 }} />
          )}
          <p className={cn('text-[15px] font-semibold leading-snug', headingClass)}>{heading}</p>
        </div>
        {/* Right: cta + dismiss */}
        {(ctaEl || dismissBtn) && (
          <div className="flex items-center gap-sm shrink-0">
            {ctaEl}
            {dismissBtn}
          </div>
        )}
      </div>
    )

    // Outer block wrapper handles max-width centering (separate from sticky flex container)
    const barContent = (
      <div className={cn('w-full', maxWidthWrapper)}>{barInner}</div>
    )

    if (!dismissible) return barContent
    return (
      <div style={outerWrapStyle}>
        <div style={{ minHeight: 0 }}>
          <div style={sweepStyle}>{barContent}</div>
        </div>
      </div>
    )
  }

  // ── Filled / Bordered variants ────────────────────────────────────────────
  // When an icon is set, it renders as a 28px left column vertically centered
  // with the text column — a category signal, not inline text decoration.
  const isCompactRow = size === 'compact' && !body

  const innerContent = isCompactRow ? (
    // Compact single row: [heading] ·· [cta]
    <div className={cn('flex items-center gap-sm', alignment === 'center' && 'justify-center')}>
      <p className={cn('text-body font-semibold leading-snug flex-1', headingClass)}>{heading}</p>
      {ctaEl && <div className="ml-auto pl-sm shrink-0">{ctaEl}</div>}
    </div>
  ) : (
    // Stacked: heading, body, cta
    <div className="flex flex-col gap-xs">
      <p className={cn('text-body font-semibold leading-snug', headingClass, alignment === 'center' && 'text-center')}>{heading}</p>
      {body && (
        <p className={cn('text-body leading-body text-pretty', bodyClass, alignment === 'center' && 'text-center')}>
          {body}
        </p>
      )}
      {ctaEl && (
        <div className={cn('mt-xs', alignment === 'center' && 'flex justify-center')}>
          {ctaEl}
        </div>
      )}
    </div>
  )

  // Outer block wrapper handles max-width centering separately from the flex container
  // so that mx-auto is reliable regardless of the parent's layout context.
  const calloutInner = (
    <div
      className={cn(
        'w-full flex gap-md rounded-ot-surface',
        padClass,
        rootClass,
        isCompactRow ? 'items-center' : 'items-start',
      )}
      style={rootStyle}
      role={role}
      data-theme={isBrand ? 'dark' : undefined}
    >
      {/* Icon column: 32px, left-anchored, vertically centered with text column */}
      {IconComp && (
        <div className="shrink-0 self-center" style={{ color: iconColor }}>
          <IconComp size={32} strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <div className="flex-1 min-w-0">{innerContent}</div>
      {dismissBtn && <div className={cn('shrink-0', !isCompactRow && 'mt-[2px]')}>{dismissBtn}</div>}
    </div>
  )

  const calloutContent = (
    <div className={cn('w-full', maxWidthWrapper)}>{calloutInner}</div>
  )

  if (!dismissible) return calloutContent
  return (
    <div style={outerWrapStyle}>
      <div style={{ minHeight: 0 }}>
        <div style={sweepStyle}>{calloutContent}</div>
      </div>
    </div>
  )
}
