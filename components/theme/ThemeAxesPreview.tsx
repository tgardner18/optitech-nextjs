'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CORNER_STYLES,
  PRIMARY_FONTS,
  MOTION_INTENSITIES,
  DEFAULT_CORNER_STYLE,
  DEFAULT_PRIMARY_FONT,
  DEFAULT_MOTION_INTENSITY,
  type CornerStyleKey,
  type PrimaryFontKey,
  type MotionIntensityKey,
} from '@/lib/theme-axes'

// Live, in-page demonstration of the three non-color theme axes. Each control
// writes the SAME CSS custom properties buildThemeCSS() emits (--ot-radius-*,
// --ot-font-sans, --ot-motion-scale) onto a scoped preview wrapper, so what
// you see here is exactly what ThemeManager produces site-wide.

const CORNER_LABELS: Record<CornerStyleKey, string> = {
  sharp: 'Sharp', soft: 'Soft', rounded: 'Rounded',
}
const MOTION_LABELS: Record<MotionIntensityKey, string> = {
  calm: 'Calm', default: 'Default', energetic: 'Energetic',
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'text-label tracking-label uppercase font-semibold px-4 py-2 border transition-colors duration-150 ease-quick',
        active
          ? 'bg-brand text-fg-on-brand border-brand'
          : 'bg-transparent text-fg-muted border-fg/20 hover:border-fg/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function ThemeAxesPreview({
  activeCorner,
  activeFont,
  activeMotion,
}: {
  activeCorner?: string
  activeFont?: string
  activeMotion?: string
}) {
  const [corner, setCorner] = useState<CornerStyleKey>((activeCorner as CornerStyleKey) in CORNER_STYLES ? (activeCorner as CornerStyleKey) : DEFAULT_CORNER_STYLE)
  const [font, setFont]     = useState<PrimaryFontKey>((activeFont as PrimaryFontKey) in PRIMARY_FONTS ? (activeFont as PrimaryFontKey) : DEFAULT_PRIMARY_FONT)
  const [motion, setMotion] = useState<MotionIntensityKey>((activeMotion as MotionIntensityKey) in MOTION_INTENSITIES ? (activeMotion as MotionIntensityKey) : DEFAULT_MOTION_INTENSITY)

  // The exact override set buildThemeCSS() would emit, scoped to this wrapper.
  const previewVars = {
    '--ot-radius-surface': CORNER_STYLES[corner].surface,
    '--ot-radius-control': CORNER_STYLES[corner].control,
    '--ot-font-sans':      `${PRIMARY_FONTS[font].var}, system-ui, sans-serif`,
    '--ot-motion-scale':   String(MOTION_INTENSITIES[motion]),
  } as CSSProperties

  return (
    <section id="axes" className="px-md py-xl lg:px-lg">
      <div className="mb-lg pb-md border-b border-fg/10">
        <p className="text-label tracking-label uppercase text-fg-muted mb-xs font-semibold">06 · Theme</p>
        <h2 className="text-headline font-bold leading-headline tracking-headline text-fg">Personality Axes</h2>
        <p className="text-sm text-fg-muted leading-body mt-sm max-w-2xl">
          Corner Style, Primary Font, and Motion Intensity. Defaults (Sharp · Poppins · Default)
          render identically to today. Primary Font sets the whole type hierarchy — display headers
          down to body and labels. Selecting a value here previews exactly what the matching
          ThemeManager field produces — these toggles write the same CSS variables. Your visitor&rsquo;s
          OS &ldquo;reduce motion&rdquo; setting always wins over Motion Intensity.
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col gap-md mb-lg">
        <div className="flex flex-wrap items-center gap-sm">
          <span className="text-label text-fg-muted/70 w-28 shrink-0">Corner Style</span>
          {(Object.keys(CORNER_STYLES) as CornerStyleKey[]).map(k => (
            <Pill key={k} active={corner === k} onClick={() => setCorner(k)}>{CORNER_LABELS[k]}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <span className="text-label text-fg-muted/70 w-28 shrink-0">Primary Font</span>
          {(Object.keys(PRIMARY_FONTS) as PrimaryFontKey[]).map(k => (
            <Pill key={k} active={font === k} onClick={() => setFont(k)}>{PRIMARY_FONTS[k].label}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <span className="text-label text-fg-muted/70 w-28 shrink-0">Motion</span>
          {(Object.keys(MOTION_INTENSITIES) as MotionIntensityKey[]).map(k => (
            <Pill key={k} active={motion === k} onClick={() => setMotion(k)}>{MOTION_LABELS[k]}</Pill>
          ))}
        </div>
      </div>

      {/* ── Live preview — scoped CSS vars ── */}
      <div style={previewVars} className="grid grid-cols-1 lg:grid-cols-2 gap-lg">

        {/* Primary font (whole hierarchy) + card surface radius */}
        <div className="bg-surface border border-fg/10 rounded-ot-surface overflow-hidden p-lg flex flex-col gap-md">
          <p className="text-label tracking-label uppercase text-brand font-semibold">Primary type — full hierarchy</p>
          <p className="text-[clamp(2rem,5vw,3.25rem)] leading-none text-fg" style={{ fontWeight: 800 }}>
            Forward&nbsp;Motion.
          </p>
          <p className="text-sm text-fg-muted leading-body">
            The primary font drives the entire hierarchy — this display line at weight 800 and this body
            copy both follow the axis. Syne stays reserved for select accent areas. This card uses
            <code className="font-mono text-fg"> rounded-ot-surface</code>.
          </p>
        </div>

        {/* Control radius + motion scale */}
        <div className="bg-surface border border-fg/10 rounded-ot-surface p-lg flex flex-col gap-md">
          <p className="text-label tracking-label uppercase text-brand font-semibold">Controls &amp; motion</p>
          <div className="flex flex-wrap items-center gap-md">
            <span className="bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-7 py-3 rounded-ot-control">
              Primary
            </span>
            <span className="bg-transparent border border-brand text-brand text-label font-semibold tracking-label uppercase px-7 py-3 rounded-ot-control">
              Secondary
            </span>
          </div>
          {/* Motion: hover the tile — its transition reads var(--ot-dur-base), which scales with --ot-motion-scale */}
          <div className="mt-sm">
            <p className="text-label text-fg-muted/70 mb-xs">Hover the tile — transition timing scales with Motion Intensity</p>
            <div
              className="group inline-block"
              style={{ perspective: '600px' }}
            >
              <div
                className="w-28 h-16 bg-brand rounded-ot-control motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105"
                style={{ transition: 'transform var(--ot-dur-base) var(--ot-ease-quick)' }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Resolved values readout ── */}
      <div className="mt-lg bg-canvas/60 border border-fg/10 rounded-ot-surface px-md py-md">
        <p className="text-label tracking-label uppercase text-fg-muted/70 font-semibold mb-sm">Emitted overrides</p>
        <pre className="font-mono text-label text-fg-muted overflow-x-auto whitespace-pre-wrap">{`--ot-radius-surface: ${CORNER_STYLES[corner].surface};  --ot-radius-control: ${CORNER_STYLES[corner].control};
--ot-font-sans: ${PRIMARY_FONTS[font].var}, system-ui, sans-serif;
--ot-motion-scale: ${MOTION_INTENSITIES[motion]};`}</pre>
      </div>
    </section>
  )
}
