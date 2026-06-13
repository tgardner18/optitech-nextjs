import { cn } from '@/lib/utils'
import type {
  DividerStyleOptions,
  DividerTone,
  DividerOrnament,
} from '@/cms/styling/OT_DividerBlock.styling'

export type DividerBlockProps = {
  label?:        string
  styleOptions?: Partial<DividerStyleOptions>
}

// ─── Spacing → responsive vertical padding ─────────────────────────────────────
// Symmetric padding-block is the gap the divider opens between the sections it
// sits between. clamp() scales the breathing room down on narrow viewports so a
// divider never eats half a phone screen.

const SPACE_PAD: Record<NonNullable<DividerStyleOptions['space']>, string> = {
  sm: 'clamp(1.5rem, 3vw, 2rem)',
  md: 'clamp(2.5rem, 5vw, 4rem)',
  lg: 'clamp(4rem, 7vw, 6rem)',
  xl: 'clamp(5.5rem, 9vw, 8rem)',
}

// ─── Tone → token-resolved colors ──────────────────────────────────────────────
// Never a literal. Neutral derives a low-alpha line straight from --ot-fg via
// relative color syntax; brand/accent reference the committed tokens so the
// divider recalibrates under a CMS theme override like everything else.

const LINE_COLOR: Record<DividerTone, string> = {
  neutral: 'oklch(from var(--ot-fg) l c h / 0.20)',
  brand:   'var(--ot-brand)',
  accent:  'var(--ot-accent)',
}

// Soft wedge fill under the slope (brand / accent only — neutral stays a pure line).
const SLOPE_FILL: Record<DividerTone, string | null> = {
  neutral: null,
  brand:   'var(--ot-brand)',
  accent:  'var(--ot-accent)',
}

// Two-stop bloom band for the gradient bleed.
const BLEED: Record<DividerTone, { core: string; halo: string }> = {
  neutral: { core: 'oklch(from var(--ot-fg) l c h / 0.16)',    halo: 'oklch(from var(--ot-fg) l c h / 0.05)' },
  brand:   { core: 'oklch(from var(--ot-brand) l c h / 0.30)', halo: 'oklch(from var(--ot-brand) l c h / 0.07)' },
  accent:  { core: 'oklch(from var(--ot-accent) l c h / 0.26)',halo: 'oklch(from var(--ot-accent) l c h / 0.06)' },
}

const MARK_TEXT: Record<DividerTone, string> = {
  neutral: 'text-fg-muted',
  brand:   'text-brand',
  accent:  'text-accent',
}

const ORNAMENT_GLYPH: Record<Exclude<DividerOrnament, 'none'>, string> = {
  pendant:  '❧',
  asterism: '⁂',
  dot:      '•',
}

export default function DividerBlock({ label, styleOptions = {} }: DividerBlockProps) {
  const {
    style    = 'slope',
    space    = 'lg',
    tone     = 'neutral',
    slant    = 'rise',
    ornament = 'pendant',
  } = styleOptions as DividerStyleOptions

  const trimmedLabel = label?.trim() || ''
  const lineColor    = LINE_COLOR[tone]

  let inner: React.ReactNode = null

  // ── Angled slope ────────────────────────────────────────────────────────────
  if (style === 'slope') {
    const y1 = slant === 'rise' ? 80 : 20
    const y2 = slant === 'rise' ? 20 : 80
    const fill = SLOPE_FILL[tone]
    inner = (
      <svg
        className="ot-divider-line block w-full"
        style={{ height: 'clamp(28px, 5vw, 56px)' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        {fill && (
          <defs>
            <linearGradient id={`ot-slope-${tone}-${slant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={fill} stopOpacity={0.14} />
              <stop offset="100%" stopColor={fill} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        {fill && (
          <polygon
            points={`0,${y1} 100,${y2} 100,100 0,100`}
            fill={`url(#ot-slope-${tone}-${slant})`}
          />
        )}
        <line
          x1="0" y1={y1} x2="100" y2={y2}
          stroke={lineColor}
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  // ── Centered text mark ────────────────────────────────────────────────────────
  else if (style === 'mark') {
    const hasMark = trimmedLabel !== '' || ornament !== 'none'
    const glyph   = ornament !== 'none' ? ORNAMENT_GLYPH[ornament] : null

    if (!hasMark) {
      // Graceful fallback: a single continuous centered hairline, never a broken gap.
      inner = (
        <span
          className="ot-divider-line block w-full"
          style={{ height: '1px', background: lineColor, transformOrigin: 'center' }}
        />
      )
    } else {
      inner = (
        <div className="flex items-center gap-md w-full">
          <span
            className="ot-divider-line flex-1"
            style={{ height: '1px', background: lineColor, transformOrigin: 'right' }}
          />
          <span className={cn('ot-divider-mark flex items-baseline', MARK_TEXT[tone])}>
            {trimmedLabel ? (
              <span className="text-label tracking-label uppercase font-semibold">{trimmedLabel}</span>
            ) : (
              <span
                aria-hidden
                className="leading-none select-none"
                style={{ fontSize: '1.5rem', lineHeight: 1, opacity: 0.9 }}
              >
                {glyph}
              </span>
            )}
          </span>
          <span
            className="ot-divider-line flex-1"
            style={{ height: '1px', background: lineColor, transformOrigin: 'left' }}
          />
        </div>
      )
    }
  }

  // ── Gradient bleed ────────────────────────────────────────────────────────────
  else {
    const { core, halo } = BLEED[tone]
    inner = (
      <span
        className="ot-divider-bleed block w-full"
        aria-hidden
        style={{
          height: 'clamp(72px, 11vw, 132px)',
          transformOrigin: 'center',
          background: [
            `radial-gradient(62% 88% at 50% 50%, ${core}, transparent 70%)`,
            `radial-gradient(130% 72% at 50% 50%, ${halo}, transparent 76%)`,
          ].join(', '),
        }}
      />
    )
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
