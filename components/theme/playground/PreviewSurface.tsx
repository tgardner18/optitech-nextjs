'use client'

import type { CSSProperties } from 'react'
import type { ColorState, Mode } from './model'

// The live preview. Every --ot-* override is scoped to the wrapper via inline
// style, so Tailwind utilities (bg-brand, text-fg, …) and the relative-color
// bloom/gradient tokens all recalibrate inside this region without touching the
// surrounding tool chrome. Content is intentionally generic — a stand-in product,
// not a specific brand — so the theme is what you read, not the copy.

function SwatchRow({ items }: { items: { label: string; value: string; onFg?: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-sm">
      {items.map((c) => (
        <div key={c.label} className="border border-fg/10 rounded-ot-surface overflow-hidden">
          <div
            className="h-16 flex items-end p-2"
            style={{ backgroundColor: c.value, color: c.onFg ?? 'var(--ot-fg-on-brand)' }}
          >
            {c.onFg && <span className="text-[0.7rem] font-semibold">Aa</span>}
          </div>
          <div className="px-2 py-1.5 bg-surface">
            <p className="text-label font-semibold text-fg leading-none">{c.label}</p>
            <p className="font-mono text-fg-muted leading-none mt-1" style={{ fontSize: '0.6rem' }}>
              {c.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Block({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-36 space-y-md">
      <div className="flex items-baseline gap-sm border-b border-fg/10 pb-2">
        <span className="text-label font-mono text-fg-muted/50">{n}</span>
        <h3 className="text-title font-semibold text-fg">{title}</h3>
      </div>
      {children}
    </section>
  )
}

const WEIGHTS = [
  { w: 300, name: 'Light' },
  { w: 400, name: 'Regular' },
  { w: 500, name: 'Medium' },
  { w: 600, name: 'SemiBold' },
  { w: 700, name: 'Bold' },
  { w: 800, name: 'ExtraBold' },
]

const HEADER_EFFECTS = [
  { cls: 'ot-fx-gradient', label: 'Gradient' },
  { cls: 'ot-depth-extrude', label: '3D Depth' },
  { cls: 'ot-fx-neon', label: 'Neon' },
  { cls: 'ot-fx-glow', label: 'Glow' },
]

const SPACING = [
  { token: 'xs', value: '4px' },
  { token: 'sm', value: '8px' },
  { token: 'md', value: '16px' },
  { token: 'lg', value: '32px' },
  { token: 'xl', value: '64px' },
  { token: '2xl', value: '128px' },
]

export function PreviewSurface({
  style,
  mode,
  colors,
}: {
  style: CSSProperties
  mode: Mode
  colors: ColorState
}) {
  const g = colors[mode]

  return (
    <div
      data-theme={mode}
      style={style}
      className="bg-canvas text-fg border border-fg/10 rounded-ot-surface overflow-hidden"
    >
      <div className="p-lg sm:p-xl space-y-2xl">

        {/* ── A composed surface, so the theme reads in context first ───────── */}
        <section id="surfaces" className="scroll-mt-36 space-y-lg">
          <div className="space-y-sm max-w-[34rem]">
            <p className="text-label tracking-label uppercase text-accent font-semibold">In context</p>
            <h2 className="text-headline font-bold leading-headline tracking-headline">
              Build once, ship to every brand.
            </h2>
            <p className="text-body leading-body text-fg-muted">
              A single component library, re-themed through tokens. This panel renders with the
              settings on the left, so any change you make appears here first.
            </p>
            <div className="flex flex-wrap gap-sm pt-1">
              <button className="btn-signal bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-6 py-3 rounded-ot-control">
                Get started
              </button>
              <button className="border border-fg/25 text-fg text-label font-semibold tracking-label uppercase px-6 py-3 rounded-ot-control hover:border-fg/50 transition-colors">
                View docs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            {[
              { t: 'Composable', b: 'Mix blocks into any layout without touching the component code.' },
              { t: 'Token-driven', b: 'Color, type, shape, and motion all flow from one variable set.' },
              { t: 'Accessible', b: 'Contrast and focus states hold up in both light and dark modes.' },
            ].map((card) => (
              <div
                key={card.t}
                className="card-hover-lift bg-surface border border-fg/10 rounded-ot-surface p-md space-y-sm"
              >
                <p className="text-title font-semibold">{card.t}</p>
                <p className="text-sm text-fg-muted leading-body">{card.b}</p>
                <span className="inline-block text-label font-semibold tracking-label uppercase text-accent pt-1">
                  Learn more →
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Colors ────────────────────────────────────────────────────────── */}
        <Block id="colors" n="01" title="Color tokens">
          <p className="text-sm text-fg-muted">Brand &amp; accent (constant across modes)</p>
          <SwatchRow
            items={[
              { label: 'Brand', value: colors.brand, onFg: colors.fgOnBrand },
              { label: 'Brand hover', value: colors.brandHover, onFg: colors.fgOnBrand },
              { label: 'Accent', value: colors.accent, onFg: colors.fgOnAccent },
              { label: 'Accent hover', value: colors.accentHover, onFg: colors.fgOnAccent },
            ]}
          />
          <p className="text-sm text-fg-muted pt-2">Grounds &amp; text ({mode} mode)</p>
          <SwatchRow
            items={[
              { label: 'Canvas', value: g.canvas },
              { label: 'Surface', value: g.surface },
              { label: 'Foreground', value: g.fg },
              { label: 'Foreground muted', value: g.fgMuted },
            ]}
          />
        </Block>

        {/* ── Typography ────────────────────────────────────────────────────── */}
        <Block id="typography" n="02" title="Typography">
          <div className="space-y-md">
            <div>
              <p className="text-label font-mono text-fg-muted/50 mb-1">Display · 800</p>
              <p className="text-display font-extrabold leading-display tracking-display text-balance">
                Adapts to any brand.
              </p>
            </div>
            <div>
              <p className="text-label font-mono text-fg-muted/50 mb-1">Headline · 700</p>
              <p className="text-headline font-bold leading-headline tracking-headline">
                Precision at every level.
              </p>
            </div>
            <div>
              <p className="text-label font-mono text-fg-muted/50 mb-1">Title · 600 &nbsp;·&nbsp; Body · 400</p>
              <p className="text-title font-semibold">A considered type system</p>
              <p className="text-body leading-body text-fg-muted max-w-[60ch]">
                The quick brown fox jumps over the lazy dog. Body copy holds a comfortable measure and
                the weight ladder keeps a clear step between every level of the hierarchy.
              </p>
            </div>
            <p className="text-label tracking-label uppercase text-fg-muted">Label · 600 · uppercase</p>
          </div>

          {/* Weight ladder */}
          <div className="flex flex-wrap gap-x-lg gap-y-sm pt-2 border-t border-fg/10">
            {WEIGHTS.map((wt) => (
              <div key={wt.w}>
                <span className="text-[1.6rem] leading-none" style={{ fontWeight: wt.w }}>
                  Ag
                </span>
                <p className="text-label font-mono text-fg-muted/60 mt-1">
                  {wt.w} {wt.name}
                </p>
              </div>
            ))}
          </div>

          {/* Header effects */}
          <div className="pt-2 border-t border-fg/10 space-y-sm">
            <p className="text-label tracking-label uppercase text-fg-muted">Header effects</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
              {HEADER_EFFECTS.map((fx) => (
                <div key={fx.cls}>
                  <p className={`${fx.cls} text-[2rem] font-extrabold leading-none`}>Aa</p>
                  <p className="text-label font-mono text-fg-muted/60 mt-1">{fx.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Syne accent — fixed, not themed */}
          <div className="pt-2 border-t border-fg/10">
            <p className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-none" style={{ fontWeight: 500 }}>
              Accent typography.
            </p>
            <p className="text-label font-mono text-fg-muted/60 mt-2">
              Syne — fixed accent font for select areas; not affected by the primary-font control.
            </p>
          </div>
        </Block>

        {/* ── Buttons ───────────────────────────────────────────────────────── */}
        <Block id="buttons" n="03" title="Buttons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {/* On canvas */}
            <div className="bg-canvas border border-fg/10 rounded-ot-surface p-md space-y-sm">
              <p className="text-label tracking-label uppercase text-fg-muted/70">On canvas</p>
              <div className="flex flex-wrap items-center gap-sm">
                <button className="bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control hover:bg-brand-hover transition-colors">
                  Primary
                </button>
                <button className="border border-brand text-brand text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control hover:bg-brand hover:text-fg-on-brand transition-colors">
                  Secondary
                </button>
                <button className="text-fg-muted text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control hover:text-fg transition-colors">
                  Ghost
                </button>
                <button
                  disabled
                  className="bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control opacity-40 cursor-not-allowed"
                >
                  Disabled
                </button>
              </div>
            </div>
            {/* On brand */}
            <div className="bg-brand rounded-ot-surface p-md space-y-sm">
              <p className="text-label tracking-label uppercase text-fg-on-brand/70">On brand</p>
              <div className="flex flex-wrap items-center gap-sm">
                <button className="bg-accent text-fg-on-accent text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control hover:bg-accent-hover transition-colors">
                  Accent
                </button>
                <button className="border border-fg-on-brand/60 text-fg-on-brand text-label font-semibold tracking-label uppercase px-5 py-2.5 rounded-ot-control hover:border-fg-on-brand transition-colors">
                  Outline
                </button>
              </div>
            </div>
          </div>
        </Block>

        {/* ── Form elements ─────────────────────────────────────────────────── */}
        <Block id="inputs" n="04" title="Form elements">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md max-w-[48rem]">
            <label className="space-y-1.5">
              <span className="text-label font-semibold text-fg-muted block">Default</span>
              <input
                placeholder="you@example.com"
                className="w-full bg-canvas border border-fg/15 rounded-input px-sm py-2 text-sm text-fg placeholder:text-fg-muted/50 focus:border-brand focus:outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-label font-semibold text-fg-muted block">Focus</span>
              <input
                defaultValue="acme-workspace"
                className="w-full bg-canvas border border-brand rounded-input px-sm py-2 text-sm text-fg focus:outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-label font-semibold text-fg-muted block">Error</span>
              <input
                defaultValue="not-an-email"
                aria-invalid
                className="w-full bg-canvas rounded-input px-sm py-2 text-sm text-fg focus:outline-none"
                style={{ border: '1px solid oklch(60% 0.2 28)' }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-lg pt-1">
            <label className="flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" defaultChecked className="accent-[var(--ot-brand)] h-4 w-4" />
              Email updates
            </label>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input type="radio" name="pg-plan" defaultChecked className="accent-[var(--ot-brand)] h-4 w-4" />
              Monthly
            </label>
            <label className="flex items-center gap-2 text-sm text-fg-muted">
              <input type="radio" name="pg-plan" className="accent-[var(--ot-brand)] h-4 w-4" />
              Annual
            </label>
          </div>
        </Block>

        {/* ── Spacing ───────────────────────────────────────────────────────── */}
        <Block id="spacing" n="05" title="Spacing scale">
          <div className="space-y-2">
            {SPACING.map((sp) => (
              <div key={sp.token} className="flex items-center gap-md">
                <span className="font-mono text-label text-fg-muted w-12 shrink-0">{sp.token}</span>
                <span className="bg-accent h-3 rounded-sm" style={{ width: sp.value }} />
                <span className="font-mono text-label text-fg-muted/60">{sp.value}</span>
              </div>
            ))}
          </div>
        </Block>

        {/* ── Motion ────────────────────────────────────────────────────────── */}
        <Block id="motion" n="06" title="Motion">
          <p className="text-sm text-fg-muted max-w-[60ch]">
            Hover a tile — the transition duration reads <code className="font-mono text-fg">--ot-dur-base</code>,
            which scales with Motion Intensity. Your OS &ldquo;reduce motion&rdquo; setting always wins.
          </p>
          <div className="flex flex-wrap gap-md pt-1">
            {['Lift', 'Glow', 'Slide'].map((m) => (
              <div key={m} className="group" style={{ perspective: '600px' }}>
                <div
                  className="h-20 w-28 bg-surface border border-fg/10 rounded-ot-surface flex items-center justify-center text-label font-semibold text-fg-muted motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:border-brand"
                  style={{ transition: 'transform var(--ot-dur-base) var(--ot-ease-kinetic), border-color var(--ot-dur-base) var(--ot-ease-kinetic)' }}
                >
                  {m}
                </div>
              </div>
            ))}
          </div>
        </Block>

      </div>
    </div>
  )
}
