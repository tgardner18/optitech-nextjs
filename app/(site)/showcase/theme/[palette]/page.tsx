import type { Metadata } from 'next'
import { notFound }       from 'next/navigation'
import { CopyButton }     from './CopyButton'
import { PRIMARY_FONTS, type PrimaryFontKey } from '@/lib/theme-axes'

// ─── Palette definitions ──────────────────────────────────────────────────────

type PaletteField = {
  key:   string
  label: string
  value: string
  cssVar: string
}

type Palette = {
  slug:        string
  name:        string
  codename:    string
  vertical:    string
  description: string
  brandRationale: string
  accentRationale: string
  cornerStyle: string
  primaryFont: string
  motionIntensity: string
  colors:      PaletteField[]
}

function makeColors(vals: Record<string, string>): PaletteField[] {
  const MAP: { key: string; label: string; cssVar: string }[] = [
    { key: 'colorBrand',        label: 'Brand',              cssVar: '--ot-brand'           },
    { key: 'colorBrandHover',   label: 'Brand hover',        cssVar: '--ot-brand-hover'     },
    { key: 'colorAccent',       label: 'Accent',             cssVar: '--ot-accent'          },
    { key: 'colorAccentHover',  label: 'Accent hover',       cssVar: '--ot-accent-hover'    },
    { key: 'colorFgOnAccent',   label: 'Fg on accent',       cssVar: '--ot-fg-on-accent'    },
    { key: 'colorCanvas',       label: 'Canvas (dark)',      cssVar: '--ot-canvas'          },
    { key: 'colorSurface',      label: 'Surface (dark)',     cssVar: '--ot-surface'         },
    { key: 'colorCanvasLight',  label: 'Canvas (light)',     cssVar: '--ot-canvas-light'    },
    { key: 'colorSurfaceLight', label: 'Surface (light)',    cssVar: '--ot-surface-light'   },
    { key: 'colorFgOnBrand',    label: 'Fg on brand',        cssVar: '--ot-fg-on-brand'     },
    { key: 'colorFg',           label: 'Fg (dark)',          cssVar: '--ot-fg'              },
    { key: 'colorFgLight',      label: 'Fg (light)',         cssVar: '--ot-fg-light'        },
    { key: 'colorFgMuted',      label: 'Fg muted (dark)',    cssVar: '--ot-fg-muted'        },
    { key: 'colorFgMutedLight', label: 'Fg muted (light)',   cssVar: '--ot-fg-muted-light'  },
  ]
  return MAP.map(m => ({ ...m, value: vals[m.key] ?? '' }))
}

const PALETTES: Palette[] = [
  {
    slug:     'atelier',
    name:     'Atelier',
    codename: 'Clay & Ultraviolet',
    vertical: 'Creative & Content Platforms',
    description: 'Warm clay brand on a paper-light canvas, with a single jolt of ultraviolet for interactive moments. A light, editorial register that reads as a tool made by people with taste — the deliberate opposite of the dark-SaaS reflex.',
    brandRationale:  'Clay-terracotta (hue 40, 56% lightness) is warm and material rather than corporate. It fills large surfaces with confidence and carries its hue into the light grounds, so the whole palette feels like one substance.',
    accentRationale: 'Ultraviolet (hue 295) sits almost opposite clay on the wheel — maximum hue contrast for a single, surprising accent. Kept deep (62% lightness) so it punctuates rather than glows, and takes light text for AA contrast.',
    cornerStyle:    'soft',
    primaryFont:    'bricolage',
    motionIntensity: 'calm',
    colors: makeColors({
      colorBrand:        'oklch(56% 0.15 40)',
      colorBrandHover:   'oklch(44% 0.14 40)',
      colorAccent:       'oklch(62% 0.23 295)',
      colorAccentHover:  'oklch(52% 0.21 295)',
      colorFgOnAccent:   'oklch(97% 0.01 295)',
      colorCanvas:       'oklch(18% 0.02 40)',
      colorSurface:      'oklch(25% 0.03 40)',
      colorCanvasLight:  'oklch(97% 0.012 50)',
      colorSurfaceLight: 'oklch(99% 0.008 50)',
      colorFgOnBrand:    'oklch(98% 0.01 50)',
      colorFg:           'oklch(96% 0.008 50)',
      colorFgLight:      'oklch(22% 0.03 40)',
      colorFgMuted:      'oklch(70% 0.05 50)',
      colorFgMutedLight: 'oklch(45% 0.05 45)',
    }),
  },
  {
    slug:     'reactor',
    name:     'Reactor',
    codename: 'Aubergine & Molten',
    vertical: 'Developer Infrastructure & AI Compute',
    description: 'Electric-violet brand on a deep aubergine-black canvas, sparked by molten amber. The dark theme done without the indigo-plus-green SaaS cliché: sharp corners and energetic motion read as raw compute throughput.',
    brandRationale:  'Electric violet (hue 300, 60% lightness) is saturated enough to carry hero surfaces and CTAs while staying off the over-used SaaS-blue track. It tints the aubergine grounds, keeping the depth chromatic, never grey.',
    accentRationale: 'Molten amber (hue 65, 78% lightness) is the high-energy spark against the cool violet — a wide hue gap for unmistakable signal. It takes dark text and reads as heat and motion rather than neon.',
    cornerStyle:    'sharp',
    primaryFont:    'sora',
    motionIntensity: 'energetic',
    colors: makeColors({
      colorBrand:        'oklch(60% 0.19 300)',
      colorBrandHover:   'oklch(48% 0.17 300)',
      colorAccent:       'oklch(78% 0.17 65)',
      colorAccentHover:  'oklch(66% 0.16 65)',
      colorFgOnAccent:   'oklch(20% 0.03 65)',
      colorCanvas:       'oklch(17% 0.022 305)',
      colorSurface:      'oklch(24% 0.032 305)',
      colorCanvasLight:  'oklch(97% 0.008 305)',
      colorSurfaceLight: 'oklch(93% 0.012 305)',
      colorFgOnBrand:    'oklch(98% 0.006 305)',
      colorFg:           'oklch(96% 0.006 305)',
      colorFgLight:      'oklch(18% 0.022 305)',
      colorFgMuted:      'oklch(68% 0.06 305)',
      colorFgMutedLight: 'oklch(42% 0.05 305)',
    }),
  },
  {
    slug:     'tonic',
    name:     'Tonic',
    codename: 'Slate & Chartreuse',
    vertical: 'Productivity & Analytics',
    description: 'A restrained, near-neutral slate carrying the surface on a cool porcelain canvas, with one chartreuse jolt reserved for interactive moments. Rounded corners and a clean grotesque make it the calm-productive counterweight to Reactor.',
    brandRationale:  'Slate (hue 250, 42% lightness, low chroma) is a tinted near-neutral, never flat grey — it grounds the interface with quiet authority and lets a single accent do the talking, the Restrained color strategy in practice.',
    accentRationale: 'Chartreuse (hue 125, 85% lightness) is a fresh, high-energy signal against the cool slate — modern and unexpected for analytics, where teal or blue would be the reflex. It takes dark text for crisp AA contrast.',
    cornerStyle:    'rounded',
    primaryFont:    'hankenGrotesk',
    motionIntensity: 'default',
    colors: makeColors({
      colorBrand:        'oklch(42% 0.04 250)',
      colorBrandHover:   'oklch(32% 0.04 250)',
      colorAccent:       'oklch(85% 0.20 125)',
      colorAccentHover:  'oklch(74% 0.19 125)',
      colorFgOnAccent:   'oklch(22% 0.04 125)',
      colorCanvas:       'oklch(16% 0.012 255)',
      colorSurface:      'oklch(23% 0.018 255)',
      colorCanvasLight:  'oklch(98% 0.004 250)',
      colorSurfaceLight: 'oklch(95% 0.006 250)',
      colorFgOnBrand:    'oklch(98% 0.004 250)',
      colorFg:           'oklch(96% 0.005 250)',
      colorFgLight:      'oklch(24% 0.02 255)',
      colorFgMuted:      'oklch(66% 0.05 255)',
      colorFgMutedLight: 'oklch(40% 0.04 255)',
    }),
  },
]

const PALETTE_MAP = Object.fromEntries(PALETTES.map(p => [p.slug, p]))

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return PALETTES.map(p => ({ palette: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ palette: string }>
}): Promise<Metadata> {
  const { palette } = await params
  const p = PALETTE_MAP[palette]
  if (!p) return {}
  return { title: `${p.name} — Sample Themes — Showcase — OptiTech` }
}

// ─── Color swatch grid ────────────────────────────────────────────────────────

function SwatchGrid({ colors }: { colors: PaletteField[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-sm">
      {colors.map(c => (
        <div key={c.key} className="space-y-sm">
          <div
            className="w-full border border-fg/10"
            style={{ backgroundColor: c.value, height: '3.5rem' }}
          />
          <p className="text-label font-semibold text-fg leading-none">{c.label}</p>
          <p className="text-label font-mono text-fg-muted leading-none" style={{ fontSize: '0.65rem' }}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Live mini preview ────────────────────────────────────────────────────────

function MiniPreview({ palette: p }: { palette: Palette }) {
  const fontVar = PRIMARY_FONTS[p.primaryFont as PrimaryFontKey]?.var ?? PRIMARY_FONTS.poppins.var
  const vars = {
    ...Object.fromEntries(p.colors.map(c => [c.cssVar, c.value])),
    // Demonstrate the theme's primary font — children inherit this fontFamily.
    fontFamily: `${fontVar}, system-ui, sans-serif`,
  } as React.CSSProperties

  return (
    <div style={vars} className="border border-fg/10 overflow-hidden">
      {/* Hero strip */}
      <div
        className="flex flex-col gap-sm p-xl"
        style={{ backgroundColor: 'var(--ot-brand)', color: 'var(--ot-fg-on-brand)' }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.6 }}>
          {p.vertical}
        </span>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15 }}>
          {p.name} theme preview
        </p>
        <p style={{ opacity: 0.75, fontSize: '0.9rem', maxWidth: '32rem' }}>
          {p.description.split('.')[0]}.
        </p>
        <div className="flex gap-sm mt-sm">
          <span
            className="px-md py-sm text-label font-semibold"
            style={{ backgroundColor: 'var(--ot-accent)', color: 'var(--ot-fg-on-accent)' }}
          >
            Primary CTA
          </span>
          <span
            className="px-md py-sm text-label font-semibold"
            style={{ border: '1px solid var(--ot-fg-on-brand)', color: 'var(--ot-fg-on-brand)', opacity: 0.8 }}
          >
            Secondary
          </span>
        </div>
      </div>

      {/* Cards strip */}
      <div
        className="flex gap-md p-lg"
        style={{ backgroundColor: 'var(--ot-canvas)' }}
      >
        {[
          { heading: 'Core capability',    body: 'The foundational layer of everything we build — precision at every level.' },
          { heading: 'Extended platform',  body: 'Composable modules that adapt to how your teams actually work.' },
          { heading: 'Scale and support',  body: 'Infrastructure that grows without you noticing, supported 24/7.' },
        ].map((card, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col gap-sm p-md"
            style={{ backgroundColor: 'var(--ot-surface)', border: '1px solid color-mix(in oklch, var(--ot-fg) 10%, transparent)' }}
          >
            <p style={{ fontWeight: 700, color: 'var(--ot-fg)', fontSize: '0.95rem' }}>{card.heading}</p>
            <p style={{ color: 'var(--ot-fg-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{card.body}</p>
            <span
              className="text-label font-semibold mt-auto"
              style={{ color: 'var(--ot-accent)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Learn more →
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Copy block ───────────────────────────────────────────────────────────────

function buildCmsFieldString(p: Palette): string {
  const lines = p.colors.map(c => `${c.key.padEnd(20)} ${c.value}`)
  lines.push('')
  lines.push(`cornerStyle          ${p.cornerStyle}`)
  lines.push(`primaryFont          ${p.primaryFont}`)
  lines.push(`motionIntensity      ${p.motionIntensity}`)
  return lines.join('\n')
}

function buildCssString(p: Palette): string {
  const lines = p.colors.map(c => `  ${c.cssVar.padEnd(24)} ${c.value};`)
  return `/* ${p.name} — ${p.vertical} */\n:root {\n${lines.join('\n')}\n}`
}

function CopyBlock({ palette: p }: { palette: Palette }) {
  const cmsText = buildCmsFieldString(p)
  const cssText = buildCssString(p)

  return (
    <div className="space-y-lg">

      {/* CMS fields */}
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            ThemeManager field values
          </p>
          <CopyButton text={cmsText} label="Copy fields" />
        </div>
        <div className="bg-surface p-lg font-mono text-label text-fg-muted overflow-x-auto">
          {p.colors.map(c => (
            <div key={c.key} className="flex gap-xl">
              <span className="text-fg w-[180px] flex-none">{c.key}</span>
              <span>{c.value}</span>
            </div>
          ))}
          <div className="mt-md pt-md border-t border-fg/10 space-y-sm">
            <div className="flex gap-xl">
              <span className="text-fg w-[180px] flex-none">cornerStyle</span>
              <span>{p.cornerStyle}</span>
            </div>
            <div className="flex gap-xl">
              <span className="text-fg w-[180px] flex-none">primaryFont</span>
              <span>{p.primaryFont}</span>
            </div>
            <div className="flex gap-xl">
              <span className="text-fg w-[180px] flex-none">motionIntensity</span>
              <span>{p.motionIntensity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS variables */}
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Raw CSS custom properties
          </p>
          <CopyButton text={cssText} label="Copy CSS" />
        </div>
        <div className="bg-surface p-lg font-mono text-label text-fg-muted overflow-x-auto">
          <div className="text-fg-muted">{`/* ${p.name} — ${p.vertical} */`}</div>
          <div className="text-fg-muted">{`:root {`}</div>
          {p.colors.map(c => (
            <div key={c.key} className="pl-lg flex gap-xl">
              <span className="text-fg w-[200px] flex-none">{c.cssVar}</span>
              <span>{c.value};</span>
            </div>
          ))}
          <div className="text-fg-muted">{`}`}</div>
        </div>
      </div>

    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PalettePage({
  params,
}: {
  params: Promise<{ palette: string }>
}) {
  const { palette: slug } = await params
  const p = PALETTE_MAP[slug]
  if (!p) notFound()

  return (
    <div className="py-xl px-lg space-y-2xl">

      {/* Header */}
      <div className="max-w-[640px]">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-sm">
          Sample Themes — {p.vertical}
        </p>
        <h1 className="text-headline font-bold leading-headline tracking-headline text-fg mb-md">
          {p.name}
        </h1>
        <p className="text-body leading-body text-fg-muted">{p.description}</p>
      </div>

      {/* Design rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl max-w-[56rem]">
        <div className="space-y-sm">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Brand color</p>
          <p className="text-body leading-body text-fg-muted">{p.brandRationale}</p>
        </div>
        <div className="space-y-sm">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Accent color</p>
          <p className="text-body leading-body text-fg-muted">{p.accentRationale}</p>
        </div>
      </div>

      {/* Swatch grid */}
      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Color tokens</p>
        <SwatchGrid colors={p.colors} />
      </div>

      {/* Live preview */}
      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Live preview</p>
        <MiniPreview palette={p} />
      </div>

      {/* Axis recommendations */}
      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Recommended axes</p>
        <div className="flex flex-wrap gap-md font-mono text-label">
          <div className="bg-surface px-md py-sm border border-fg/10">
            <span className="text-fg-muted">cornerStyle</span>
            <span className="text-fg ml-md">{p.cornerStyle}</span>
          </div>
          <div className="bg-surface px-md py-sm border border-fg/10">
            <span className="text-fg-muted">primaryFont</span>
            <span className="text-fg ml-md">{p.primaryFont}</span>
          </div>
          <div className="bg-surface px-md py-sm border border-fg/10">
            <span className="text-fg-muted">motionIntensity</span>
            <span className="text-fg ml-md">{p.motionIntensity}</span>
          </div>
        </div>
      </div>

      {/* Copy block */}
      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Export values</p>
        <CopyBlock palette={p} />
      </div>

    </div>
  )
}
