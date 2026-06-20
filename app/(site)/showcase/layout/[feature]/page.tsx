import type { Metadata } from 'next'
import { notFound }       from 'next/navigation'
import { SectionLabel }   from '../../components'

// ─── Static params ────────────────────────────────────────────────────────────

const FEATURE_SLUGS = ['row-rhythm', 'section-overlap'] as const
type FeatureSlug    = typeof FEATURE_SLUGS[number]

const LABELS: Record<FeatureSlug, string> = {
  'row-rhythm':      'Row Rhythm',
  'section-overlap': 'Section Overlap',
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

// ─── Section Overlap showcase ─────────────────────────────────────────────────

type OverlapLevel = 'shallow' | 'mid' | 'deep' | 'full'

const OVERLAP_LEVELS: { level: OverlapLevel; token: string; px: string; label: string; desc: string }[] = [
  { level: 'shallow', token: 'md',  px: '16px',  label: 'Shallow', desc: 'Barely a tuck — the seam clips together. Works best when a subtle shift in background is enough to signal depth.' },
  { level: 'mid',     token: 'lg',  px: '32px',  label: 'Mid',     desc: 'The primary editorial choice. Clear interlock without drama — the upper section\'s background is visibly encroached.' },
  { level: 'deep',    token: 'xl',  px: '64px',  label: 'Deep',    desc: 'Dramatic fold-over. Use for immersive hero-to-content transitions where the lower section asserts strong presence.' },
  { level: 'full',    token: '2xl', px: '128px', label: 'Full',    desc: 'Maximum pull. The lower section consumes a full 128px of the one above. Reserve for poster-scale moments.' },
]

function OverlapPair({ level, token, px, label, desc }: typeof OVERLAP_LEVELS[number]) {
  return (
    <div>
      <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-md">
        {label} — <code className="font-mono normal-case text-fg">--ot-space-{token}</code> ({px})
      </p>
      <div className="relative overflow-visible">
        {/* Section above — canvas ground, simulates the preceding section */}
        <div className="bg-canvas border border-fg/10 flex flex-col" style={{ minHeight: '7rem', padding: '2rem' }}>
          <span className="text-label tracking-label uppercase text-fg-muted font-semibold opacity-60">Section above</span>
          <p className="text-title font-semibold text-fg mt-sm">The preceding section ends here</p>
        </div>
        {/* Overlapping section — surface background pulls up */}
        <div
          className="bg-surface border border-fg/10 flex flex-col"
          data-overlap={level}
          style={{ minHeight: '6rem', padding: '2rem' }}
        >
          <span className="text-label tracking-label uppercase text-fg-muted font-semibold opacity-60">
            Overlapping section — {label.toLowerCase()} ({px})
          </span>
          <p className="text-body text-fg-muted mt-sm">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function ColumnBleedDemo() {
  return (
    <div>
      <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-md">
        Column bleed right — <code className="font-mono normal-case text-fg">--ot-space-lg</code> (32px)
      </p>
      <div className="flex gap-md overflow-visible" data-bp="md">
        {/* Left column — brand fill, bleeds right */}
        <div
          className="flex-1 min-w-0 bg-brand flex flex-col justify-between"
          data-col-bleed="right"
          style={{ minHeight: '10rem', padding: '2rem' }}
        >
          <span className="text-label tracking-label uppercase text-fg-on-brand font-semibold opacity-70">Column 1</span>
          <p className="text-title font-semibold text-fg-on-brand">This column bleeds 32px into the right neighbor</p>
        </div>
        {/* Right column — surface, partially overlapped */}
        <div
          className="flex-1 min-w-0 bg-surface border border-fg/10 flex flex-col justify-center"
          style={{ minHeight: '10rem', padding: '2rem' }}
        >
          <span className="text-label tracking-label uppercase text-fg-muted font-semibold opacity-70">Column 2</span>
          <p className="text-body text-fg-muted mt-sm">
            The brand column's background overlaps 32px into this column's left edge.
            Use for image-to-text pairings where the visual panel dominates.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionOverlapShowcase() {
  return (
    <div className="space-y-2xl">

      {/* Intro */}
      <div className="max-w-[640px]">
        <p className="text-body leading-body text-fg-muted">
          A Section-level display setting that pulls the section up into the one above it
          via negative margin-top — seams that interlock rather than bands that stack flush.
          The section's background intrudes upward; content inside stays padded as authored.
          Requires the overlapping section to have its own background.
        </p>
      </div>

      <div className="space-y-md">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
          Setting: <code className="font-mono normal-case text-fg">sectionOverlap</code>
          {' '}on OT_LandingSection display template
        </p>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
          Dependency: set <code className="font-mono normal-case text-fg">backgroundColor</code>{' '}
          on the overlapping section. A transparent section produces no visible seam.
        </p>
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
          Mobile: overlap zeroes out below 640px — sections stack flush on narrow viewports.
        </p>
      </div>

      {/* Four overlap levels */}
      {OVERLAP_LEVELS.map(o => (
        <div key={o.level}>
          <SectionLabel index={({ shallow: '01', mid: '02', deep: '03', full: '04' } as const)[o.level]} title={`${o.label} overlap`} />
          <OverlapPair {...o} />
        </div>
      ))}

      {/* Column bleed */}
      <div>
        <SectionLabel index="05" title="Column bleed" />
        <div className="mb-md max-w-[640px]">
          <p className="text-body text-fg-muted">
            A Column-level variant controlled by{' '}
            <code className="font-mono text-fg">columnBleed</code>{' '}
            on OT_LandingColumn. Extends one column's content area 32px into its neighbor's
            space via negative margin. The bleeding column sits on top (z-index 1). Use
            for image-to-text pairings, stat panels asserting dominance, or any moment
            where a column should break its own boundary.
          </p>
        </div>
        <ColumnBleedDemo />
      </div>

      {/* Token reference */}
      <div>
        <SectionLabel index="06" title="Token reference" />
        <div className="bg-surface p-lg space-y-md font-mono text-label text-fg-muted">
          <p className="text-title font-semibold text-fg mb-md">Overlap amounts</p>
          <div className="space-y-sm">
            {OVERLAP_LEVELS.map(o => (
              <div key={o.level} className="flex gap-xl">
                <span className="text-fg w-[100px] flex-none">{o.level}</span>
                <span className="w-[160px] flex-none">--ot-space-{o.token} ({o.px})</span>
                <span>margin-top: calc(-1 * {o.px})</span>
              </div>
            ))}
          </div>
          <p className="text-title font-semibold text-fg mt-lg mb-md">Column bleed</p>
          <div className="space-y-sm">
            <div className="flex gap-xl">
              <span className="text-fg w-[100px] flex-none">right</span>
              <span className="w-[160px] flex-none">--ot-space-lg (32px)</span>
              <span>margin-right: −32px · z-index 1</span>
            </div>
            <div className="flex gap-xl">
              <span className="text-fg w-[100px] flex-none">left</span>
              <span className="w-[160px] flex-none">--ot-space-lg (32px)</span>
              <span>margin-left: −32px · z-index 1</span>
            </div>
          </div>
          <p className="mt-md text-fg-muted">
            Stacking: position relative + z-index 1 on the overlapping element.
            Multiple overlapping sections resolve via DOM order — later in DOM = higher stack.
          </p>
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

      {feature === 'row-rhythm'      && <RowRhythmShowcase />}
      {feature === 'section-overlap' && <SectionOverlapShowcase />}
    </div>
  )
}
