import type { Metadata } from 'next'
import { notFound }       from 'next/navigation'
import { SectionLabel }   from '../../components'

// ─── Static params ────────────────────────────────────────────────────────────

const FEATURE_SLUGS = ['row-rhythm'] as const
type FeatureSlug    = typeof FEATURE_SLUGS[number]

const LABELS: Record<FeatureSlug, string> = {
  'row-rhythm': 'Row Rhythm',
}

export function generateStaticParams() {
  return FEATURE_SLUGS.map(feature => ({ feature }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feature: string }>
}): Promise<Metadata> {
  const { feature } = await params
  const label = LABELS[feature as FeatureSlug]
  if (!label) return {}
  return { title: `${label} — Layout — Showcase — OptiTech` }
}

// ─── Demo primitives ──────────────────────────────────────────────────────────

type RhythmLevel = 'gentle' | 'moderate' | 'bold'
type ColVariant  = 'brand' | 'surface' | 'accent'

const LEVEL_OFFSETS: Record<RhythmLevel, string[]> = {
  gentle:   ['0',     '8px',  '16px', '32px'],
  moderate: ['0',    '16px',  '32px', '64px'],
  bold:     ['0',    '32px',  '64px', '128px'],
}

const COL_VARIANTS: ColVariant[] = ['brand', 'surface', 'accent']

function colBg(v: ColVariant) {
  if (v === 'brand')   return 'bg-brand'
  if (v === 'surface') return 'bg-surface border border-fg/10'
  return 'bg-accent'
}

function colFg(v: ColVariant) {
  if (v === 'brand')   return 'text-fg-on-brand'
  if (v === 'surface') return 'text-fg'
  return 'text-fg-on-accent'
}

function ColPlaceholder({
  index,
  variant,
  label,
}: {
  index: number
  variant: ColVariant
  label: string
}) {
  return (
    <div
      className={`flex-1 min-w-0 flex flex-col gap-sm p-md ${colBg(variant)}`}
      style={{ minHeight: '9rem' }}
    >
      <span className={`text-label tracking-label uppercase font-semibold ${colFg(variant)} opacity-60`}>
        Column {index}
      </span>
      <p className={`text-title font-semibold leading-title ${colFg(variant)}`}>
        {label}
      </p>
    </div>
  )
}

function RhythmDemo({ level }: { level: RhythmLevel }) {
  const offsets = LEVEL_OFFSETS[level]
  const cols    = ['Editorial lead', 'Supporting voice', 'Third perspective', 'Trailing note']

  return (
    <div className="space-y-xl">
      {/* 3-column row */}
      <div>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-md">
          3 columns — offsets 0 / {offsets[1]} / {offsets[2]}
        </p>
        <div
          className="flex flex-col md:flex-row gap-md"
          data-rhythm={level}
          data-bp="md"
        >
          <ColPlaceholder index={1} variant="brand"   label={cols[0]} />
          <ColPlaceholder index={2} variant="surface" label={cols[1]} />
          <ColPlaceholder index={3} variant="accent"  label={cols[2]} />
        </div>
      </div>

      {/* 4-column row */}
      <div>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-md">
          4 columns — offsets 0 / {offsets[1]} / {offsets[2]} / {offsets[3]}
        </p>
        <div
          className="flex flex-col md:flex-row gap-md"
          data-rhythm={level}
          data-bp="md"
        >
          <ColPlaceholder index={1} variant="brand"   label={cols[0]} />
          <ColPlaceholder index={2} variant="surface" label={cols[1]} />
          <ColPlaceholder index={3} variant="accent"  label={cols[2]} />
          <ColPlaceholder index={4} variant="surface" label={cols[3]} />
        </div>
      </div>
    </div>
  )
}

function NudgeDemo() {
  return (
    <div>
      <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-md">
        Moderate cascade — col 2 nudged +lg (32px extra), col 3 nudged −md (16px back)
      </p>
      <div
        className="flex flex-col md:flex-row gap-md"
        data-rhythm="moderate"
        data-bp="md"
      >
        {/* col 1: no nudge, offset = 0 */}
        <div className="flex-1 min-w-0 flex flex-col gap-sm p-md bg-brand" style={{ minHeight: '9rem' }}>
          <span className="text-label tracking-label uppercase font-semibold text-fg-on-brand opacity-60">Column 1</span>
          <p className="text-title font-semibold leading-title text-fg-on-brand">No nudge</p>
          <code className="text-label font-mono text-fg-on-brand opacity-50">offset: 0</code>
        </div>
        {/* col 2: nudge +lg → offset md + lg = 48px */}
        <div className="flex-1 min-w-0 flex flex-col gap-sm p-md bg-surface border border-fg/10" data-nudge="down_lg" style={{ minHeight: '9rem' }}>
          <span className="text-label tracking-label uppercase font-semibold text-fg opacity-60">Column 2</span>
          <p className="text-title font-semibold leading-title text-fg">Nudge + lg</p>
          <code className="text-label font-mono text-fg-muted">offset: md + lg</code>
        </div>
        {/* col 3: nudge up_md → offset lg - md = 16px */}
        <div className="flex-1 min-w-0 flex flex-col gap-sm p-md bg-accent" data-nudge="up_md" style={{ minHeight: '9rem' }}>
          <span className="text-label tracking-label uppercase font-semibold text-fg-on-accent opacity-60">Column 3</span>
          <p className="text-title font-semibold leading-title text-fg-on-accent">Nudge −md</p>
          <code className="text-label font-mono text-fg-on-accent opacity-60">offset: lg − md</code>
        </div>
      </div>
    </div>
  )
}

// ─── Row Rhythm showcase ───────────────────────────────────────────────────────

function RowRhythmShowcase() {
  return (
    <div className="space-y-2xl">

      {/* Intro */}
      <div className="max-w-[640px]">
        <p className="text-body leading-body text-fg-muted">
          A Row-level display setting that applies deliberate staircase offsets to child
          columns — an editorial cascade where the eye steps down the page as it scans
          left to right. Three levels map to the spacing token scale. Offsets are static
          transforms that zero out when columns stack below the row's breakpoint.
          When paired with a slide-up entrance animation, the offset becomes the resting
          position the animation settles into.
        </p>
      </div>

      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
          Setting: <code className="font-mono normal-case text-fg">columnRhythm</code>
          {' '}on OT_LandingRow display template
        </p>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
          Escape hatch: <code className="font-mono normal-case text-fg">columnRhythmNudge</code>
          {' '}on OT_LandingColumn — adds or subtracts from the base offset per column
        </p>
      </div>

      {/* Gentle */}
      <div>
        <SectionLabel index="01" title="Gentle cascade" />
        <div className="mb-md">
          <p className="text-body text-fg-muted">
            Step size: sm / md / lg (8 / 16 / 32px). For rows where content is closely
            related and the cascade should feel like breathing room rather than drama.
          </p>
        </div>
        <RhythmDemo level="gentle" />
      </div>

      {/* Moderate */}
      <div>
        <SectionLabel index="02" title="Moderate cascade" />
        <div className="mb-md">
          <p className="text-body text-fg-muted">
            Step size: md / lg / xl (16 / 32 / 64px). The primary editorial choice —
            pronounced enough to read as intentional composition, measured enough to keep
            content in easy scanning range.
          </p>
        </div>
        <RhythmDemo level="moderate" />
      </div>

      {/* Bold */}
      <div>
        <SectionLabel index="03" title="Bold cascade" />
        <div className="mb-md">
          <p className="text-body text-fg-muted">
            Step size: lg / xl / 2xl (32 / 64 / 128px). Magazine-spread intensity.
            Each column occupies a distinct vertical register. Reserve for hero-style
            rows with short content blocks; add extra row bottom padding to prevent
            overflow on the deepest column.
          </p>
        </div>
        <RhythmDemo level="bold" />
      </div>

      {/* Nudge escape hatch */}
      <div>
        <SectionLabel index="04" title="Per-column nudge" />
        <div className="mb-md">
          <p className="text-body text-fg-muted">
            The <code className="font-mono text-fg">columnRhythmNudge</code> setting on
            OT_LandingColumn adds or subtracts one spacing step from a column's base
            rhythm offset. Useful for asymmetric compositions where one column should
            break the regular staircase — a portrait image that reads better slightly
            raised, or a stat block that anchors lower than its neighbors.
          </p>
        </div>
        <NudgeDemo />
      </div>

      {/* Token reference */}
      <div>
        <SectionLabel index="05" title="Token reference" />
        <div className="bg-surface p-lg space-y-md font-mono text-label text-fg-muted">
          <p className="text-title font-semibold text-fg mb-md">CSS custom properties</p>
          <div className="space-y-sm">
            <div className="flex gap-xl">
              <span className="text-fg w-[220px] flex-none">--ot-rhythm-offset</span>
              <span>Per-column base offset (set by row rhythm + nth-child). Default 0px.</span>
            </div>
            <div className="flex gap-xl">
              <span className="text-fg w-[220px] flex-none">--ot-rhythm-nudge</span>
              <span>Per-column correction (set by columnRhythmNudge). Default 0px.</span>
            </div>
          </div>
          <p className="text-title font-semibold text-fg mt-lg mb-md">Ramp values</p>
          <div className="grid grid-cols-4 gap-md text-center">
            {[
              { level: 'gentle',   c2: 'sm (8px)',   c3: 'md (16px)',   c4: 'lg (32px)'   },
              { level: 'moderate', c2: 'md (16px)',  c3: 'lg (32px)',   c4: 'xl (64px)'   },
              { level: 'bold',     c2: 'lg (32px)',  c3: 'xl (64px)',   c4: '2xl (128px)' },
            ].map(r => (
              <div key={r.level} className="col-span-4 grid grid-cols-4 gap-md items-baseline">
                <span className="text-fg text-left">{r.level}</span>
                <span>col1 → 0</span>
                <span>col2 → {r.c2}</span>
                <span>col3 → {r.c3}</span>
              </div>
            ))}
          </div>
          <p className="mt-sm text-fg-muted">col4 and beyond: one step above col3 (capped at 2xl for bold)</p>
        </div>
      </div>

    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShowcaseLayoutFeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>
}) {
  const { feature } = await params
  if (!FEATURE_SLUGS.includes(feature as FeatureSlug)) notFound()

  return (
    <div className="py-xl px-lg space-y-2xl">
      <div>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-sm">
          Layout
        </p>
        <h1 className="text-headline font-bold leading-headline tracking-headline text-fg">
          {LABELS[feature as FeatureSlug]}
        </h1>
      </div>

      {feature === 'row-rhythm' && <RowRhythmShowcase />}
    </div>
  )
}
