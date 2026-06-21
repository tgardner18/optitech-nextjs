'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  CORNER_STYLES,
  PRIMARY_FONTS,
  MOTION_INTENSITIES,
  type CornerStyleKey,
  type PrimaryFontKey,
  type MotionIntensityKey,
} from '@/lib/theme-axes'
import { ColorControl } from './ColorControl'
import { PreviewSurface } from './PreviewSurface'
import type { Axes, ColorState, Grounds } from './model'

const CORNER_LABELS: Record<CornerStyleKey, string> = { sharp: 'Sharp', soft: 'Soft', rounded: 'Rounded' }
const MOTION_LABELS: Record<MotionIntensityKey, string> = { calm: 'Calm', default: 'Default', energetic: 'Energetic' }

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'text-label tracking-label uppercase font-semibold px-3 py-1.5 border transition-colors duration-150 ease-quick',
        active ? 'bg-brand text-fg-on-brand border-brand' : 'bg-transparent text-fg-muted border-fg/20 hover:border-fg/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-label tracking-label uppercase text-fg-muted/70 font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-label tracking-label uppercase text-fg-muted/50 font-semibold">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export default function ThemePlayground({
  initialColors,
  initialAxes,
}: {
  initialColors: ColorState
  initialAxes: Axes
}) {
  const { theme: mode, toggle } = useTheme()

  const [colors, setColors] = useState<ColorState>(initialColors)
  const [corner, setCorner] = useState<CornerStyleKey>(
    (initialAxes.cornerStyle as CornerStyleKey) in CORNER_STYLES ? (initialAxes.cornerStyle as CornerStyleKey) : 'sharp',
  )
  const [font, setFont] = useState<PrimaryFontKey>(
    (initialAxes.primaryFont as PrimaryFontKey) in PRIMARY_FONTS ? (initialAxes.primaryFont as PrimaryFontKey) : 'poppins',
  )
  const [motion, setMotion] = useState<MotionIntensityKey>(
    (initialAxes.motionIntensity as MotionIntensityKey) in MOTION_INTENSITIES
      ? (initialAxes.motionIntensity as MotionIntensityKey)
      : 'default',
  )

  // Mode-invariant color setter
  const setTop = (key: keyof ColorState) => (v: string) => setColors((p) => ({ ...p, [key]: v }))
  // Active-mode ground setter
  const setGround = (key: keyof Grounds) => (v: string) =>
    setColors((p) => ({ ...p, [mode]: { ...p[mode], [key]: v } }))

  const reset = () => {
    setColors(initialColors)
    setCorner((initialAxes.cornerStyle as CornerStyleKey) in CORNER_STYLES ? (initialAxes.cornerStyle as CornerStyleKey) : 'sharp')
    setFont((initialAxes.primaryFont as PrimaryFontKey) in PRIMARY_FONTS ? (initialAxes.primaryFont as PrimaryFontKey) : 'poppins')
    setMotion(
      (initialAxes.motionIntensity as MotionIntensityKey) in MOTION_INTENSITIES
        ? (initialAxes.motionIntensity as MotionIntensityKey)
        : 'default',
    )
  }

  const g = colors[mode]
  const previewStyle = {
    '--ot-brand': colors.brand,
    '--ot-brand-hover': colors.brandHover,
    '--ot-accent': colors.accent,
    '--ot-accent-hover': colors.accentHover,
    '--ot-fg-on-brand': colors.fgOnBrand,
    '--ot-fg-on-accent': colors.fgOnAccent,
    '--ot-canvas': g.canvas,
    '--ot-surface': g.surface,
    '--ot-fg': g.fg,
    '--ot-fg-muted': g.fgMuted,
    '--ot-radius-surface': CORNER_STYLES[corner].surface,
    '--ot-radius-control': CORNER_STYLES[corner].control,
    '--ot-font-sans': `${PRIMARY_FONTS[font].var}, system-ui, sans-serif`,
    '--ot-motion-scale': String(MOTION_INTENSITIES[motion]),
    // Re-declare font-family on the wrapper so the overridden --ot-font-sans is
    // actually re-resolved here; descendants inherit it. (Inheriting from <body>
    // alone wouldn't work — body already resolved the var to the default font.)
    fontFamily: 'var(--ot-font-sans)',
  } as CSSProperties

  return (
    <div className="px-md lg:px-lg py-lg">
      {/* Intro */}
      <div className="max-w-[42rem] mb-lg">
        <h1 className="text-headline font-bold leading-headline tracking-headline text-fg mb-sm">Theme Playground</h1>
        <p className="text-body leading-body text-fg-muted">
          Tune the live theme and watch every token respond. Adjust the primary font, corner style, motion,
          and any color, then read the result across type, components, and surfaces on the right.
          Changes are previewed locally only — they never save to the CMS.
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-lg items-start">
        {/* ── Controls (inspector) ──────────────────────────────────────────── */}
        <aside className="bg-surface border border-fg/10 rounded-ot-surface p-md space-y-lg lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-label tracking-label uppercase text-fg font-semibold">Controls</p>
            <button
              type="button"
              onClick={reset}
              className="text-label tracking-label uppercase text-fg-muted hover:text-fg transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Foundations */}
          <div className="space-y-md">
            <Field label="Primary Font">
              {(Object.keys(PRIMARY_FONTS) as PrimaryFontKey[]).map((k) => (
                <Pill key={k} active={font === k} onClick={() => setFont(k)}>
                  {PRIMARY_FONTS[k].label.replace(' (default)', '')}
                </Pill>
              ))}
            </Field>
            <Field label="Corner Style">
              {(Object.keys(CORNER_STYLES) as CornerStyleKey[]).map((k) => (
                <Pill key={k} active={corner === k} onClick={() => setCorner(k)}>
                  {CORNER_LABELS[k]}
                </Pill>
              ))}
            </Field>
            <Field label="Motion">
              {(Object.keys(MOTION_INTENSITIES) as MotionIntensityKey[]).map((k) => (
                <Pill key={k} active={motion === k} onClick={() => setMotion(k)}>
                  {MOTION_LABELS[k]}
                </Pill>
              ))}
            </Field>
          </div>

          {/* Mode */}
          <div className="flex items-center justify-between border-t border-fg/10 pt-md">
            <p className="text-label tracking-label uppercase text-fg-muted/70 font-semibold">
              Editing {mode} mode
            </p>
            <button
              type="button"
              onClick={toggle}
              className="text-label tracking-label uppercase font-semibold px-3 py-1.5 border border-fg/20 text-fg-muted hover:border-fg/40 transition-colors"
            >
              Switch to {mode === 'dark' ? 'light' : 'dark'}
            </button>
          </div>

          {/* Colors */}
          <div className="space-y-md">
            <Group label="Brand">
              <ColorControl label="Brand" value={colors.brand} onChange={setTop('brand')} />
              <ColorControl label="Brand hover" value={colors.brandHover} onChange={setTop('brandHover')} />
            </Group>
            <Group label="Accent">
              <ColorControl label="Accent" value={colors.accent} onChange={setTop('accent')} />
              <ColorControl label="Accent hover" value={colors.accentHover} onChange={setTop('accentHover')} />
            </Group>
            <Group label={`Grounds · ${mode}`}>
              <ColorControl label="Canvas" value={g.canvas} onChange={setGround('canvas')} />
              <ColorControl label="Surface" value={g.surface} onChange={setGround('surface')} />
            </Group>
            <Group label={`Text · ${mode}`}>
              <ColorControl label="Foreground" value={g.fg} onChange={setGround('fg')} />
              <ColorControl label="Foreground muted" value={g.fgMuted} onChange={setGround('fgMuted')} />
            </Group>
            <Group label="On fills">
              <ColorControl label="Fg on brand" value={colors.fgOnBrand} onChange={setTop('fgOnBrand')} />
              <ColorControl label="Fg on accent" value={colors.fgOnAccent} onChange={setTop('fgOnAccent')} />
            </Group>
          </div>
        </aside>

        {/* ── Live preview ──────────────────────────────────────────────────── */}
        <PreviewSurface style={previewStyle} mode={mode} colors={colors} />
      </div>
    </div>
  )
}
