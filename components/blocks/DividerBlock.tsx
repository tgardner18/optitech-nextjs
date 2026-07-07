import { cn } from '@/lib/utils'
import type {
  DividerStyleOptions,
  DividerTone,
  DividerOrnament,
  DividerWeight,
} from '@/cms/styling/OT_DividerBlock.styling'

export type DividerBlockProps = {
  label?:        string
  styleOptions?: Partial<DividerStyleOptions>
}

// ─── Spacing → responsive vertical padding ─────────────────────────────────────
// Symmetric padding-block is the gap the divider opens between the sections it
// sits between. clamp() scales the breathing room down on narrow viewports so a
// divider never eats half a phone screen.

const SPACE_PAD: Record<DividerStyleOptions['space'], string> = {
  sm: 'clamp(1.5rem, 3vw, 2rem)',
  md: 'clamp(2.5rem, 5vw, 4rem)',
  lg: 'clamp(4rem, 7vw, 6rem)',
  xl: 'clamp(5.5rem, 9vw, 8rem)',
}

// ─── Tone → token-resolved color ───────────────────────────────────────────────
// Never a literal. Neutral derives a low-alpha line from --ot-fg via relative
// color syntax; brand / accent reference the committed tokens; spectrum and
// aurora blend the two. Everything recalibrates under a CMS theme override.

// Line / hairline fill for the text mark — solid for single tones, a horizontal
// gradient for the blends. (mark style — unchanged.)
function lineBg(tone: DividerTone): string {
  switch (tone) {
    case 'brand':    return 'var(--ot-brand)'
    case 'accent':   return 'var(--ot-accent)'
    case 'spectrum': return 'linear-gradient(to right, var(--ot-brand), var(--ot-accent))'
    case 'aurora':   return 'linear-gradient(to right, var(--ot-brand), var(--ot-accent), var(--ot-brand))'
    case 'neutral':
    default:         return 'oklch(from var(--ot-fg) l c h / 0.22)'
  }
}

const MARK_TEXT: Record<DividerTone, string> = {
  neutral:  'text-fg-muted',
  brand:    'text-brand',
  accent:   'text-accent',
  spectrum: 'text-brand',
  aurora:   'text-accent',
}

const ORNAMENT_GLYPH: Record<Exclude<DividerOrnament, 'none'>, string> = {
  pendant:  '❧',
  asterism: '⁂',
  dot:      '•',
}

// ─── Glow style — luminous chromatic rule ──────────────────────────────────────
// A precisely placed line of light: a 1–2px horizontal rule whose color fades to
// transparent at the outer 15% of the width, with a soft vertical bloom above and
// below — light emanating from the line, like a neon tube. No stripes, no facets.

// Crisp rule gradient: transparent → tone → transparent (full-strength color).
function glowLine(tone: DividerTone): string {
  switch (tone) {
    case 'brand':    return 'linear-gradient(to right, transparent 0%, var(--ot-brand) 15%, var(--ot-brand) 85%, transparent 100%)'
    case 'accent':   return 'linear-gradient(to right, transparent 0%, var(--ot-accent) 15%, var(--ot-accent) 85%, transparent 100%)'
    case 'spectrum': return 'linear-gradient(to right, transparent 0%, var(--ot-brand) 15%, var(--ot-accent) 85%, transparent 100%)'
    case 'aurora':   return 'linear-gradient(to right, transparent 0%, var(--ot-brand) 15%, var(--ot-accent) 50%, var(--ot-brand) 85%, transparent 100%)'
    case 'neutral':
    default:         return 'linear-gradient(to right, transparent 0%, oklch(from var(--ot-fg-muted) l c h / 0.30) 15%, oklch(from var(--ot-fg-muted) l c h / 0.30) 85%, transparent 100%)'
  }
}

// Bloom gradient: same horizontal shape. Brand/accent use the system bloom tokens
// so they follow CMS theme overrides. Spectrum/aurora blend both hues at a fixed
// alpha — no single token covers the multi-stop mix, so they stay hand-crafted.
function glowBloom(tone: DividerTone): string {
  switch (tone) {
    case 'brand':    return 'linear-gradient(to right, transparent 0%, var(--ot-bloom-brand-faint) 15%, var(--ot-bloom-brand-faint) 85%, transparent 100%)'
    case 'accent':   return 'linear-gradient(to right, transparent 0%, var(--ot-bloom-accent-faint) 15%, var(--ot-bloom-accent-faint) 85%, transparent 100%)'
    case 'spectrum': return 'linear-gradient(to right, transparent 0%, oklch(from var(--ot-brand) l c h / 0.28) 15%, oklch(from var(--ot-accent) l c h / 0.28) 85%, transparent 100%)'
    case 'aurora':   return 'linear-gradient(to right, transparent 0%, oklch(from var(--ot-brand) l c h / 0.28) 15%, oklch(from var(--ot-accent) l c h / 0.28) 50%, oklch(from var(--ot-brand) l c h / 0.28) 85%, transparent 100%)'
    case 'neutral':
    default:         return 'linear-gradient(to right, transparent 0%, oklch(from var(--ot-fg-muted) l c h / 0.12) 15%, oklch(from var(--ot-fg-muted) l c h / 0.12) 85%, transparent 100%)'
  }
}

// Vertical bloom shape: brightest at the line (center), fading above and below.
const GLOW_BLOOM_MASK = 'linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)'

const GLOW_LINE_PX:  Record<DividerWeight, string> = { slim: '1px', bold: '2px' }
const GLOW_BLOOM_PX: Record<DividerWeight, string> = { slim: '24px', bold: '40px' }

// ─── Bleed style — atmospheric radial light seam ────────────────────────────────
// A soft elliptical glow sitting at the top edge: brightest at the horizontal
// center, fading to transparent at the sides and the bottom. Reads as a light
// source just above the boundary, not a colored bar. Peak alpha is baked into the
// fill so the reveal can fade opacity 0 → 1.

function bleedFill(tone: DividerTone, peak: number): string {
  switch (tone) {
    case 'brand':    return `oklch(from var(--ot-brand) l c h / ${peak})`
    case 'accent':   return `oklch(from var(--ot-accent) l c h / ${peak})`
    case 'spectrum': return `linear-gradient(to right, oklch(from var(--ot-brand) l c h / ${peak}), oklch(from var(--ot-accent) l c h / ${peak}))`
    case 'aurora':   return `linear-gradient(to right, oklch(from var(--ot-brand) l c h / ${peak}), oklch(from var(--ot-accent) l c h / ${peak}), oklch(from var(--ot-brand) l c h / ${peak}))`
    case 'neutral':
    default:         return 'oklch(from var(--ot-fg-muted) l c h / 0.15)'   // capped — a barely-there seam
  }
}

// Elliptical shape anchored at top-center: 60% wide, full height, fading out.
const BLEED_RADIAL_MASK = 'radial-gradient(ellipse 60% 100% at 50% 0%, black 0%, transparent 100%)'

const BLEED_HEIGHT: Record<DividerWeight, string> = { slim: '60px', bold: '80px' }
const BLEED_PEAK:   Record<DividerWeight, number> = { slim: 0.25, bold: 0.35 }

export default function DividerBlock({ label, styleOptions = {} }: DividerBlockProps) {
  const {
    style    = 'mark',
    space    = 'lg',
    tone     = 'neutral',
    ornament = 'pendant',
    weight   = 'slim',
  } = styleOptions as DividerStyleOptions

  const trimmedLabel = label?.trim() || ''

  let inner: React.ReactNode = null

  // ── Gradient bleed · atmospheric radial light seam ──────────────────────────────
  if (style === 'bleed') {
    inner = (
      <span
        className="ot-divider-bleed block w-full"
        aria-hidden
        style={{
          height: BLEED_HEIGHT[weight],
          background: bleedFill(tone, BLEED_PEAK[weight]),
          WebkitMaskImage: BLEED_RADIAL_MASK,
          maskImage: BLEED_RADIAL_MASK,
        }}
      />
    )
  }

  // ── Glow · luminous chromatic rule ──────────────────────────────────────────────
  else if (style === 'glow') {
    const grad = glowLine(tone)
    inner = (
      <div className="relative flex w-full items-center justify-center" style={{ height: '56px' }} aria-hidden>
        {/* Soft bloom behind the rule — light emanating from the line. */}
        <span
          className="ot-divider-bloom pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{
            height: GLOW_BLOOM_PX[weight],
            background: glowBloom(tone),
            WebkitMaskImage: GLOW_BLOOM_MASK,
            maskImage: GLOW_BLOOM_MASK,
            filter: 'blur(6px)',
          }}
        />
        {/* The crisp rule itself. */}
        <span
          className="ot-divider-line relative block w-full"
          style={{ height: GLOW_LINE_PX[weight], background: grad, transformOrigin: 'center' }}
        />
      </div>
    )
  }

  // ── Centered text mark — unchanged ──────────────────────────────────────────────
  // Default branch: also the graceful fallback for unknown / legacy style values
  // (e.g. the removed 'prism'), which getDividerStyles normalizes to 'mark'.
  else {
    const hasMark = trimmedLabel !== '' || ornament !== 'none'
    const glyph   = ornament !== 'none' ? ORNAMENT_GLYPH[ornament] : null
    const bg      = lineBg(tone)

    if (!hasMark) {
      // Graceful fallback: a single continuous centered hairline, never a broken gap.
      inner = (
        <span
          className="ot-divider-line block w-full"
          style={{ height: '1px', background: bg, transformOrigin: 'center' }}
        />
      )
    } else {
      inner = (
        <div className="flex items-center gap-md w-full">
          <span className="ot-divider-line flex-1" style={{ height: '1px', background: bg, transformOrigin: 'right' }} />
          <span className={cn('ot-divider-mark flex items-baseline', MARK_TEXT[tone])}>
            {trimmedLabel ? (
              <span className="text-label tracking-label uppercase font-semibold">{trimmedLabel}</span>
            ) : (
              <span aria-hidden className="select-none" style={{ fontSize: '1.5rem', lineHeight: 1, opacity: 0.9 }}>
                {glyph}
              </span>
            )}
          </span>
          <span className="ot-divider-line flex-1" style={{ height: '1px', background: bg, transformOrigin: 'left' }} />
        </div>
      )
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={style === 'mark' && trimmedLabel ? trimmedLabel : undefined}
      className="flex w-full items-center justify-center"
      style={{ paddingBlock: SPACE_PAD[space] }}
    >
      {inner}
    </div>
  )
}
