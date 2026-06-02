import type { Metadata }            from 'next'
import Image                         from 'next/image'
import { notFound }                  from 'next/navigation'
import { SectionLabel }              from '../../components'
import OT_HeroBlock                  from '@/cms/components/OT_HeroBlock'
import OT_ButtonBlock                from '@/cms/components/OT_ButtonBlock'
import OT_PrimaryTextBlock           from '@/cms/components/OT_PrimaryTextBlock'
import OT_RichTextBlock              from '@/cms/components/OT_RichTextBlock'
import OT_QuoteBlock                 from '@/cms/components/OT_QuoteBlock'
import OT_ImageBlock                 from '@/cms/components/OT_ImageBlock'
import OT_VideoBlock                 from '@/cms/components/OT_VideoBlock'
import OT_CardBlock                  from '@/cms/components/OT_CardBlock'
import OT_StatBlock                  from '@/cms/components/OT_StatBlock'
import OT_FeatureGridBlock           from '@/cms/components/OT_FeatureGridBlock'
import OT_AccordionBlock             from '@/cms/components/OT_AccordionBlock'
import OT_TabsBlock                  from '@/cms/components/OT_TabsBlock'
import OT_ChartBlock                 from '@/cms/components/OT_ChartBlock'
import OT_BannerBlock                from '@/cms/components/OT_BannerBlock'
import JsonCopyBlock                 from '@/components/blocks/chart/JsonCopyBlock'
import TrustRail                     from '@/components/blocks/TrustRail'
import Button                        from '@/components/ui/Button'
import BlogFeedBlock                 from '@/components/blocks/BlogFeedBlock'
import {
  ArrowRight, Zap, ChevronRight, Play, Download,
  Sparkles, Send, Rocket, Star, Plus,
} from 'lucide-react'
import type { BlogFeedPost }         from '@/lib/blogFeed'

// ─── Static params ──────────────────────────────────────────────────────────

const BLOCK_SLUGS = [
  'hero', 'card', 'primary-text', 'quote', 'rich-text',
  'image', 'video', 'stat', 'feature-grid', 'trust-rail',
  'accordion', 'tabs', 'blog-feed', 'button', 'chart', 'banner',
] as const

type BlockSlug = typeof BLOCK_SLUGS[number]

const BLOCK_META: Record<BlockSlug, { label: string; cmsKey: string; description: string }> = {
  'hero':         { label: 'HeroBlock',        cmsKey: 'OT_HeroBlock',        description: 'Full-bleed split layout with a text panel and an optional visual panel. When no visual is provided the text panel expands to full width. Layout, color, and entrance animation are display settings.' },
  'card':         { label: 'CardBlock',         cmsKey: 'OT_CardBlock',        description: 'A single composable card: eyebrow, heading, description, optional image, optional CTA. Fill and border are independently controlled. All display settings map 1:1 to CMS display template choices.' },
  'primary-text': { label: 'PrimaryTextBlock',  cmsKey: 'OT_PrimaryTextBlock', description: 'Typographic accent block for section openers, pacing moments, and statement callouts. Eyebrow label and headline only — Poppins throughout.' },
  'quote':        { label: 'QuoteBlock',         cmsKey: 'OT_QuoteBlock',       description: 'Typographic anchor moment for customer social proof and editorial pull quotes. The large quotation mark is a Poppins 800 letterform, not an icon.' },
  'rich-text':    { label: 'RichTextBlock',      cmsKey: 'OT_RichTextBlock',    description: 'Full-width prose section rendering TinyMCE WYSIWYG HTML output: headings, paragraphs, lists, blockquotes, and inline elements.' },
  'image':        { label: 'ImageBlock',         cmsKey: 'OT_ImageBlock',       description: 'Flexible image block with two frame modes, teal brand overlay, inset or below caption, chromatic shadow bloom, and a scroll-triggered wipe reveal.' },
  'video':        { label: 'VideoBlock',         cmsKey: 'OT_VideoBlock',       description: 'YouTube and Vimeo embeds with a branded poster state. Platform thumbnails are auto-fetched; a teal play button replaces the iframe until clicked.' },
  'stat':         { label: 'StatBlock',          cmsKey: 'OT_StatBlock',        description: 'Horizontal row of metric callouts. Numbers animate on scroll with a staggered entrance and easeOutQuart count-up. Three color schemes and two layout modes.' },
  'feature-grid': { label: 'FeatureGridBlock',   cmsKey: 'OT_FeatureGridBlock', description: 'Grid of feature tiles with optional eyebrow, heading, and CTA. Supports grid and ruled layouts, 2–4 columns, optional icon slots, and stagger entrance animation.' },
  'trust-rail':   { label: 'TrustRail',          cmsKey: 'OT_TrustRail',        description: 'Logo trust strip with seamless marquee, staggered fade, or static grid. Mono grayscale + color-on-hover treatment. Logos are CMS-managed content references.' },
  'accordion':    { label: 'AccordionBlock',      cmsKey: 'OT_AccordionBlock',   description: 'Expandable FAQ or content section. Three border styles, three color schemes, single or multiple open mode, and optional default-open first item.' },
  'tabs':         { label: 'TabsBlock',           cmsKey: 'OT_TabsBlock',        description: 'Tabbed content block with underline, pill, or button-group triggers. Top or side tab position. Optional image panel and auto-play.' },
  'blog-feed':    { label: 'BlogFeedBlock',       cmsKey: 'OT_BlogFeedBlock',    description: 'CMS-driven blog post grid. Posts are fetched at render time from the connected article root. Three color schemes, 2- or 3-column layout, and three heading sizes.' },
  'button':       { label: 'Button',              cmsKey: 'OT_ButtonBlock',      description: 'Six button variants, three sizes, optional icon slots (leading/trailing). Polymorphic — renders as <button> or <Link> based on the href prop.' },
  'chart':        { label: 'ChartBlock',          cmsKey: 'OT_ChartBlock',       description: 'CMS-driven data visualization block. Five chart types: line, area, bar, bar stacked, and radial gauge. Four color variants, five series color palettes, fully responsive via Recharts.' },
  'banner':       { label: 'BannerBlock',         cmsKey: 'OT_BannerBlock',      description: 'Full-bleed background image with layered content: eyebrow, headline, optional body, and up to two CTAs. Two overlay modes: scrim (color overlay over the image) and glass (content inside a frosted panel). Three color variants, two alignment options, two height sizes, and two image blend modes.' },
}

export function generateStaticParams() {
  return BLOCK_SLUGS.map(slug => ({ block: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ block: string }>
}): Promise<Metadata> {
  const { block } = await params
  const meta = BLOCK_META[block as BlockSlug]
  if (!meta) return {}
  return { title: `${meta.label} — Blocks — Showcase — OptiTech` }
}

type DS = Record<string, string | boolean>

// ─── Shared layout helpers ────────────────────────────────────────────────────

function BlockHeader({ slug }: { slug: BlockSlug }) {
  const meta = BLOCK_META[slug]
  return (
    <div className="px-md pt-xl pb-lg lg:px-lg">
      <SectionLabel index={`Blocks · ${meta.cmsKey}`} title={meta.label} />
      <p className="text-body leading-body text-fg-muted max-w-[65ch]">{meta.description}</p>
    </div>
  )
}

function VariantGroup({ label, note }: { label: string; note?: string }) {
  return (
    <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
      <p className="text-label tracking-label uppercase text-fg-muted font-semibold">{label}</p>
      {note && <p className="text-label text-fg-muted/60 mt-xs">{note}</p>}
    </div>
  )
}

function VariantLabel({ label, note }: { label: string; note?: string }) {
  return (
    <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
      <span className="font-mono text-label text-fg-muted/50">{label}</span>
      {note && <span className="text-label text-fg-muted/40">{note}</span>}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HERO_IMG = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop'
const HERO_ALT = 'Glass skyscrapers in a modern city financial district'

function HeroShowcase() {
  const colorSchemes = [
    {
      label: 'Brand · Image Right (default)',
      content: {
        eyebrow: 'Introducing OptiTech', headline: 'Move at the speed of certainty.',
        body: 'OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.',
        primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' },
        visual: HERO_IMG, visualAlt: HERO_ALT,
      },
      displaySettings: { layout: 'imageRight', color: 'brand', animation: 'none' },
    },
    {
      label: 'Canvas · Image Left',
      content: {
        eyebrow: 'The platform', headline: 'Built for teams who ship daily.',
        body: 'Feature flags, experiment data, and deployment telemetry in one platform. OptiTech closes the gap between shipping and knowing.',
        primaryCtaLabel: 'View the platform', primaryCtaUrl: { default: '#' },
        visual: HERO_IMG, visualAlt: HERO_ALT,
      },
      displaySettings: { layout: 'imageLeft', color: 'canvas', animation: 'none' },
    },
    {
      label: 'Surface · Image Right',
      content: {
        eyebrow: 'The method', headline: 'Precision at every layer.',
        body: 'From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.',
        primaryCtaLabel: 'See how it works', primaryCtaUrl: { default: '#' },
        visual: HERO_IMG, visualAlt: HERO_ALT,
      },
      displaySettings: { layout: 'imageRight', color: 'surface', animation: 'none' },
    },
  ]

  const noImage = [
    {
      label: 'Brand · No image',
      content: {
        eyebrow: 'Introducing OptiTech', headline: 'Move at the speed of certainty.',
        body: 'OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.',
        primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', animation: 'none' },
    },
    {
      label: 'Canvas · No image',
      content: {
        eyebrow: 'The platform', headline: 'Built for teams who ship daily.',
        body: 'Feature flags, experiment data, and deployment telemetry in one platform.',
        primaryCtaLabel: 'View the platform', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', animation: 'none' },
    },
    {
      label: 'Surface · No image',
      content: {
        eyebrow: 'The method', headline: 'Precision at every layer.',
        body: 'From the first feature flag to the thousandth experiment, OptiTech tracks what matters.',
        primaryCtaLabel: 'See how it works', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'surface', animation: 'none' },
    },
  ]

  const animations = [
    {
      label: 'Fade', note: 'motion-safe: fade entrance on section mount',
      content: { eyebrow: 'Animation', headline: 'Fade entrance.', primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { color: 'brand', animation: 'fade' },
    },
    {
      label: 'Slide', note: 'motion-safe: slide-up entrance — expo ease-out',
      content: { eyebrow: 'Animation', headline: 'Slide entrance.', primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { color: 'canvas', animation: 'slide' },
    },
  ]

  return (
    <>
      <BlockHeader slug="hero" />

      <VariantGroup label="Color schemes · layout variants" />
      {colorSchemes.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="No image · full-width text panel" note="When no visual is provided the text panel expands to full width." />
      {noImage.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Entrance animations · motion-safe" note="Entrances fire on mount. All degrade to instant display when prefers-reduced-motion is set." />
      {animations.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
            <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
            <span className="text-label text-fg-muted/60">{item.note}</span>
          </div>
          <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const CARD_IMG_A     = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop'
const CARD_IMG_A_ALT = 'Glass skyscrapers in a modern city financial district'
const CARD_IMG_B     = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop'
const CARD_IMG_B_ALT = 'Electronic circuit board close-up showing components'
const CARD_IMG_C     = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop'
const CARD_IMG_C_ALT = 'Data analytics charts on a laptop screen'

function CardShowcase() {
  return (
    <>
      <BlockHeader slug="card" />

      <VariantGroup label="Fill variants · no image · with CTA" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <OT_CardBlock content={{ Heading: 'Targeted Rollouts', Eyebrow: 'Deployment', Description: 'Deploy to any user segment with a single API call. Real-time, without a redeploy.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'ghost', border: 'subtle' }} />
          <OT_CardBlock content={{ Heading: 'Experiment Engine', Eyebrow: 'Analytics', Description: 'Concurrent A/B tests with automatic interaction detection. Results in hours, not weeks.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface' }} />
          <OT_CardBlock content={{ Heading: 'Statistical Confidence', Eyebrow: 'Insights', Description: 'Power calculations and confidence intervals are built into the platform. No spreadsheets.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'brand' }} />
          <OT_CardBlock content={{ Heading: 'Instant Rollback', Eyebrow: 'Safety', Description: 'One flag, one API call. Revert any change across every deployment in seconds.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'light' }} />
        </div>
      </div>

      <VariantGroup label="Border variants · no image" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div>
            <span className="font-mono text-label text-fg-muted/50">surface · border: none</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'No Border', Eyebrow: 'Surface', Description: 'Surface fill with no border. Content is defined by background contrast, not a frame.', ctaLabel: 'Explore', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', border: 'none' }} /></div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">surface · border: subtle</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Subtle Border', Eyebrow: 'Surface', Description: '1px at 10% foreground opacity. Barely-there definition for cards that float over dark grounds.', ctaLabel: 'Explore', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', border: 'subtle' }} /></div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">ghost · border: brand</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Brand Border', Eyebrow: 'Ghost', Description: '1px teal border signals selection or attention. Works best on ghost fill over a dark section.', ctaLabel: 'Explore', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'ghost', border: 'brand' }} /></div>
          </div>
        </div>
      </div>

      <VariantGroup label="Image: top · 4:3 aspect · surface fill" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Feature Flags at Scale', Eyebrow: 'Platform', Description: 'Ship to any segment with a kill switch on every flag. The safest way to deploy at velocity.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Precision-Grade Telemetry', Eyebrow: 'Infrastructure', Description: 'Every signal, every layer. OptiTech ingests data from flag changes, deploys, and user events in real time.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Results You Can Act On', Eyebrow: 'Analytics', Description: 'Statistical significance checks, interaction effects, and automatic stopping rules. No guesswork.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
        </div>
      </div>

      <VariantGroup label="Image: background · scrim · content at bottom" note="Dark gradient from bottom. Text always press-white regardless of fill." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Ship with confidence.', Eyebrow: 'Deployment', Description: 'Every flag tracked. Every change reversible.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'Get started', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
          <OT_CardBlock content={{ Heading: 'Measure what matters.', Eyebrow: 'Analytics', Description: 'Real signals, not approximations.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT }} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
          <OT_CardBlock content={{ Heading: 'Iterate faster.', Eyebrow: 'Velocity', Description: 'From hypothesis to result in hours.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See the platform', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
        </div>
      </div>

      <VariantGroup label="Image: side · imageSide left and right" note="Stacks vertically on mobile. At md+, image occupies 40% of card width; content fills the rest." />
      <div className="px-md pb-xl lg:px-lg flex flex-col gap-lg">
        <div>
          <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;left&rdquo;</span>
          <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Infrastructure built for continuous delivery.', Eyebrow: 'Platform', Description: 'OptiTech gives engineering teams the tooling to ship incrementally, measure precisely, and respond in real time.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'View the platform', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'side', imageSide: 'left' }} /></div>
        </div>
        <div>
          <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;right&rdquo;</span>
          <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Statistical confidence at every decision point.', Eyebrow: 'Analytics', Description: 'Every experiment runs with power calculations, automatic stopping rules, and interaction effect detection.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Explore analytics', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'side', imageSide: 'right' }} /></div>
        </div>
      </div>

      <VariantGroup label="fill:glass · dark glass panels over imagery" note="Dark glass requires something interesting beneath it — imagery, a teal section, a layered background." />
      <div className="relative overflow-hidden">
        <Image src={CARD_IMG_A} alt="" fill className="object-cover object-center" sizes="100vw" aria-hidden />
        <div className="absolute inset-0 bg-canvas/40" />
        <div className="relative z-10 px-md py-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <OT_CardBlock content={{ Heading: 'Edges computed at the edge.', Eyebrow: 'Edge Network', Description: 'OptiTech routes intelligence to where your users are — 200ms becomes 20ms without changing a line of application code.', ctaLabel: 'See coverage', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'glass', hover: 'glow' }} />
            <OT_CardBlock content={{ Heading: 'Flags ship features safely.', Eyebrow: 'Feature Flags', Description: 'Controlled rollouts, instant kill-switches, and audience targeting — all without a deployment cycle.', ctaLabel: 'Read the docs', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'glass', hover: 'glow' }} />
            <OT_CardBlock content={{ Heading: 'Every experiment tells a story.', Eyebrow: 'Experimentation', Description: 'Statistical rigor built in. Run A/B tests and multivariate experiments with automatic significance detection.', ctaLabel: 'Start experimenting', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'glass', hover: 'glow' }} />
          </div>
        </div>
      </div>

      <VariantGroup label="image:float · content slides up over the image bottom" note="Content box overlaps the lower portion of the image with the card's fill background." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Infrastructure that never sleeps.', Eyebrow: 'Platform', Description: '99.99% uptime across every region, backed by automated failover.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'View SLA', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'float' }} />
          <OT_CardBlock content={{ Heading: 'Signal in the noise.', Eyebrow: 'Analytics', Description: 'Our engine sifts millions of events per second so your team sees what matters.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See the dashboard', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'brand', imageStyle: 'float' }} />
          <OT_CardBlock content={{ Heading: 'Hardware meets intelligence.', Eyebrow: 'Edge compute', Description: 'Push logic to the edge. OptiTech runs where your users are, cutting round-trip latency by 80%.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Explore edge', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'float', border: 'subtle' }} />
        </div>
      </div>

      <VariantGroup label="Hover interactions · lift · glow · image zoom" note="Depth appears in motion, not at rest. All effects use transform and box-shadow only." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Lift on hover.', Eyebrow: 'hover:lift', Description: 'Card rises 4px with a faint teal ambient shadow.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'lift' }} />
          <OT_CardBlock content={{ Heading: 'Glow on hover.', Eyebrow: 'hover:glow', Description: 'Teal shadow blooms beneath the card on hover — no translate, pure atmospheric depth.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'glow' }} />
          <OT_CardBlock content={{ Heading: 'Float + lift.', Eyebrow: 'float · hover:lift', Description: 'Float layout with lift interaction — the content overlap and the hover rise compound.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'float', hover: 'lift' }} />
        </div>
      </div>

      <VariantGroup label="Isometric tilt · hover:tilt" note="Solid two-layer offset shadow creates a visible isometric back-face at rest. Perspective rotation activates on hover. prefers-reduced-motion: shadow depth only, no transform." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Raised by design.', Eyebrow: 'hover:tilt · surface', Description: 'The isometric shadow is visible at rest — depth is structural, not just interactive.', ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', border: 'subtle', hover: 'tilt' }} />
          <OT_CardBlock content={{ Heading: 'Volume from conviction.', Eyebrow: 'hover:tilt · image', Description: 'Top image card with perspective tilt. The 3D rotation compounds with the solid iso shadow on hover.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'tilt' }} />
          <OT_CardBlock content={{ Heading: 'Brand depth.', Eyebrow: 'hover:tilt · brand', Description: 'Brand fill with tilt interaction. The dark offset shadow reads as the back face of a raised brand slab.', ctaLabel: 'Interact', ctaUrl: { default: '#' } }} displaySettings={{ fill: 'brand', hover: 'tilt' }} />
        </div>
      </div>

      <VariantGroup label="Detail options · accent line · noise texture" note="Accent line: 3px top edge using --ot-accent. Noise: SVG feTurbulence grain at 7% overlay opacity." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Top accent, surface fill.', Eyebrow: 'accentLine:top', Description: 'A 3px brand-teal rule on the top edge anchors the card\'s hierarchy.' }} displaySettings={{ fill: 'surface', accentLine: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Top accent, brand fill.', Eyebrow: 'accentLine:top · fill:brand', Description: 'On brand panels the accent shifts to press-white at 40% — still readable.' }} displaySettings={{ fill: 'brand', accentLine: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Noise on dark.', Eyebrow: 'noise:true · fill:surface', Description: 'Grain overlay at 7% via mix-blend-mode: overlay. Tactile mineral depth.' }} displaySettings={{ fill: 'surface', border: 'subtle', noise: true }} />
        </div>
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Primary Text ─────────────────────────────────────────────────────────────

function PrimaryTextShowcase() {
  const sizes = [
    { content: { eyebrow: 'The platform', headline: 'Speed that compounds.' }, displaySettings: { size: 'display', color: 'canvas', alignment: 'left', gradient: 'none' } },
    { content: { eyebrow: 'Integrations', headline: 'Connect everything you already use.' }, displaySettings: { size: 'headline', color: 'canvas', alignment: 'left', gradient: 'none' } },
    { content: { eyebrow: 'Customers', headline: 'Trusted by teams who ship fast.' }, displaySettings: { size: 'title', color: 'canvas', alignment: 'left', gradient: 'none' } },
    { content: { headline: 'Section tag · Supporting context' }, displaySettings: { size: 'label', color: 'canvas', alignment: 'left', gradient: 'none' } },
  ]

  const colors = [
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'brand',   alignment: 'left', gradient: 'none' } },
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'canvas',  alignment: 'left', gradient: 'none' } },
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'surface', alignment: 'left', gradient: 'none' } },
  ]

  const depths = [
    { content: { eyebrow: 'Brand — Primary',             headline: 'Kinetic by design.'     }, displaySettings: { size: 'display', color: 'canvas', alignment: 'center', gradient: 'brand'    } },
    { content: { eyebrow: 'Brand — Extended',            headline: 'Heat meets precision.'  }, displaySettings: { size: 'display', color: 'canvas', alignment: 'center', gradient: 'warm'     } },
    { content: { eyebrow: 'Luminous — Carved from Light',headline: 'Lit from within.'       }, displaySettings: { size: 'display', color: 'canvas', alignment: 'center', gradient: 'luminous' } },
    { content: { eyebrow: 'Accent — Ember',              headline: 'Burn bright.'           }, displaySettings: { size: 'display', color: 'canvas', alignment: 'center', gradient: 'ember'    } },
    { content: { eyebrow: 'Brand — Isometric Extrude',   headline: 'Depth is a statement.'  }, displaySettings: { size: 'display', color: 'canvas', alignment: 'left',   gradient: 'extrude'  } },
    { content: { eyebrow: 'Mono — Silver & Fog',         headline: 'Pure signal.'           }, displaySettings: { size: 'display', color: 'canvas', alignment: 'center', gradient: 'mono'     } },
  ]

  return (
    <>
      <BlockHeader slug="primary-text" />

      <VariantGroup label="Sizes · canvas · left" />
      {sizes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`size: "${item.displaySettings.size}"`} />
          <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Color schemes · headline · left · same copy" />
      {colors.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`color: "${item.displaySettings.color}"`} />
          <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Display gradients · display scale only · canvas" note='Gradient fires only when size is "display" — enforced by CVA compound variant. Mono: silver chrome in dark mode, charcoal in light mode.' />
      {depths.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`gradient: "${item.displaySettings.gradient}"`} />
          <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteShowcase() {
  const colors = [
    { content: { quote: 'OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.', attributionName: 'Sarah Chen', attributionTitle: 'VP Engineering, Meridian' }, displaySettings: { color: 'brand',   alignment: 'left', size: 'large' } },
    { content: { quote: 'OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.', attributionName: 'Sarah Chen', attributionTitle: 'VP Engineering, Meridian' }, displaySettings: { color: 'canvas',  alignment: 'left', size: 'large' } },
    { content: { quote: 'OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.', attributionName: 'Sarah Chen', attributionTitle: 'VP Engineering, Meridian' }, displaySettings: { color: 'surface', alignment: 'left', size: 'large' } },
  ]

  const sizes = [
    { content: { quote: 'We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.', attributionName: 'Marcus Reid', attributionTitle: 'CTO, Folio' }, displaySettings: { size: 'large', color: 'canvas', alignment: 'left' } },
    { content: { quote: 'We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.', attributionName: 'Marcus Reid', attributionTitle: 'CTO, Folio' }, displaySettings: { size: 'small', color: 'canvas', alignment: 'left' } },
  ]

  const alignments = [
    { content: { quote: 'The only platform that keeps up with how fast we move.', attributionName: 'Priya Nair', attributionTitle: 'Head of Product, Vertex' }, displaySettings: { alignment: 'left',   color: 'canvas', size: 'large' } },
    { content: { quote: 'The only platform that keeps up with how fast we move.', attributionName: 'Priya Nair', attributionTitle: 'Head of Product, Vertex' }, displaySettings: { alignment: 'center', color: 'canvas', size: 'large' } },
  ]

  return (
    <>
      <BlockHeader slug="quote" />

      <VariantGroup label="Color schemes · large · left · same copy" />
      {colors.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`color: "${item.displaySettings.color}"`} />
          <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Sizes · canvas · left · same copy" />
      {sizes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`size: "${item.displaySettings.size}"`} />
          <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Alignment · canvas · large · same copy" />
      {alignments.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`alignment: "${item.displaySettings.alignment}"`} />
          <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Rich Text ────────────────────────────────────────────────────────────────

const RT_FULL = `
<h2>Platform intelligence, accelerated.</h2>
<p>OptiTech was built for teams who move faster than quarterly roadmaps. We identified a gap between the pace at which modern software ships and the tools available to measure, refine, and respond to it. We closed it.</p>
<p>The platform ingests signals from every layer of the stack: feature flags, experiment data, user behaviour telemetry, and deployment events. It surfaces the patterns that matter before they become problems.</p>
<h3>Statistical confidence, not gut instinct</h3>
<p>Decisions are made at the edges of your system, not in a committee room three weeks later. OptiTech gives your engineering and product teams a shared language for running experiments with <strong>statistical confidence</strong> backed by real signal.</p>
<ul>
  <li>Deploy changes to targeted segments in minutes, not sprints.</li>
  <li>Run concurrent experiments without interaction effects.</li>
  <li>Roll back any flag with a single API call.</li>
</ul>
<blockquote><p>We moved from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.</p></blockquote>
`

const RT_PROSE = `
<p>OptiTech was built for teams who move faster than quarterly roadmaps. We identified a gap between the pace at which modern software ships and the tools available to measure, refine, and respond to it.</p>
<p>The platform ingests signals from every layer of the stack: feature flags, experiment data, user behaviour telemetry, and deployment events. It surfaces the patterns that matter before they become problems.</p>
<p>Decisions are made at the edges of your system. OptiTech gives your engineering and product teams a shared language for running experiments with statistical confidence backed by real signal.</p>
`

const RT_STRUCTURED = `
<h2>Why OptiTech</h2>
<p>Speed that compounds. The faster you can measure, the faster you can iterate.</p>
<h3>For engineering teams</h3>
<p>Feature flags with a full audit trail. Targeted rollouts. Statistical validity checks built into the platform.</p>
<h3>For product teams</h3>
<p>Experiment design tools that connect directly to your data. No more waiting three weeks for results from a release you've already moved past.</p>
`

function RichTextShowcase() {
  const colorSchemes: Array<{ content: any; displaySettings: DS }> = [
    { content: { content: { html: RT_FULL } }, displaySettings: { color: 'canvas',  size: 'editorial', alignment: 'left', treatment: 'standard', ruledHeadings: false } },
    { content: { content: { html: RT_FULL } }, displaySettings: { color: 'surface', size: 'editorial', alignment: 'left', treatment: 'standard', ruledHeadings: false } },
    { content: { content: { html: RT_FULL } }, displaySettings: { color: 'brand',   size: 'editorial', alignment: 'left', treatment: 'standard', ruledHeadings: false } },
  ]

  const treatments = [
    { label: 'Standard',           note: 'Faithful prose rendering (default)',                           content: { content: { html: RT_PROSE } }, displaySettings: { color: 'canvas', treatment: 'standard', size: 'editorial', alignment: 'left', ruledHeadings: false } },
    { label: 'Lead — p first',     note: 'First paragraph as editorial deck: larger, weight 300, teal',  content: { content: { html: RT_PROSE } }, displaySettings: { color: 'canvas', treatment: 'lead',     size: 'editorial', alignment: 'left', ruledHeadings: false } },
    { label: 'Lead — h2 first',    note: 'Same treatment when content starts with a heading',            content: { content: { html: RT_FULL  } }, displaySettings: { color: 'canvas', treatment: 'lead',     size: 'editorial', alignment: 'left', ruledHeadings: false } },
    { label: 'Dropcap — p first',  note: 'Oversized first letter in brand teal with chromatic glow',     content: { content: { html: RT_PROSE } }, displaySettings: { color: 'canvas', treatment: 'dropcap',  size: 'editorial', alignment: 'left', ruledHeadings: false } },
    { label: 'Dropcap — h2 first', note: 'Same treatment when content starts with a heading',            content: { content: { html: RT_FULL  } }, displaySettings: { color: 'canvas', treatment: 'dropcap',  size: 'editorial', alignment: 'left', ruledHeadings: false } },
  ]

  const options: Array<{ label: string; note: string; content: any; displaySettings: DS }> = [
    { label: 'Ruled headings',  note: '1px teal rule above h2 and h3',                            content: { content: { html: RT_STRUCTURED } }, displaySettings: { color: 'canvas',  size: 'editorial', ruledHeadings: true,  alignment: 'left',   treatment: 'standard' } },
    { label: 'Compact + ruled', note: 'Tighter scale for shorter sections',                        content: { content: { html: RT_STRUCTURED } }, displaySettings: { color: 'surface', size: 'compact',   ruledHeadings: true,  alignment: 'left',   treatment: 'standard' } },
    { label: 'Center aligned',  note: 'Column centred within the section, for opening statements', content: { content: { html: RT_PROSE    } }, displaySettings: { color: 'canvas',  size: 'editorial', ruledHeadings: false, alignment: 'center', treatment: 'lead'     } },
  ]

  return (
    <>
      <BlockHeader slug="rich-text" />

      <VariantGroup label="Color schemes · editorial · left · same copy" />
      {colorSchemes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`color: "${item.displaySettings.color}"`} />
          <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Treatments · canvas · editorial · same copy" note="Treatment affects the first paragraph only." />
      {treatments.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
            <span className="font-mono text-label text-fg-muted/50">treatment: &ldquo;{item.displaySettings.treatment}&rdquo;</span>
            <span className="text-label text-fg-muted/40">{item.note}</span>
          </div>
          <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Options · ruled headings · compact · center aligned" />
      {options.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
            <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
            <span className="text-label text-fg-muted/60">{item.note}</span>
          </div>
          <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Image ────────────────────────────────────────────────────────────────────

const IMG_SRC = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop'
const IMG_ALT = 'Business professionals walking past glass skyscrapers in a modern city financial district'

function ImageShowcase() {
  const treatments: Array<{ label: string; note: string; content: any; displaySettings: DS }> = [
    { label: 'Clean',           note: 'No treatments — baseline',                                      content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9' } },
    { label: 'Frame: offset',   note: 'Bold teal backing block — 12px mounting-board strip',           content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', frame: 'offset' } },
    { label: 'Frame: glow',     note: 'Inset teal ring + outer ambient bloom — image appears backlit', content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', frame: 'glow' } },
    { label: 'Overlay',         note: 'Brand teal at 40% opacity, multiply blend',                     content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', overlay: true } },
    { label: 'Glow + Overlay',  note: 'Atmospheric — teal wash unifies tone, glow defines edge',       content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', frame: 'glow', overlay: true } },
    { label: 'Offset + Overlay',note: 'Bold — teal backing anchors image; wash pulls palette through',  content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', frame: 'offset', overlay: true } },
  ]

  const shadows: Array<{ label: string; note: string; content: any; displaySettings: DS }> = [
    { label: 'Shadow only',             note: 'Teal left, signal green right — chromatic halo',                     content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', shadow: true } },
    { label: 'Shadow + Glow',           note: 'Inset glow defines the image boundary; shadow bloom radiates below', content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', shadow: true, frame: 'glow' } },
    { label: 'Shadow + Overlay',        note: 'Teal wash unifies image tone; shadow amplifies it',                  content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', shadow: true, overlay: true } },
    { label: 'Shadow + Glow + Overlay', note: 'Full atmospheric stack — wash, edge glow, and bloom',                content: { image: IMG_SRC, alt: IMG_ALT }, displaySettings: { ratio: 'r16_9', shadow: true, frame: 'glow', overlay: true } },
  ]

  return (
    <>
      <BlockHeader slug="image" />

      <VariantGroup label="Treatments" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {treatments.map(item => (
            <div key={item.label}>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                <span className="text-label text-fg-muted/60">{item.note}</span>
              </div>
              <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
            </div>
          ))}
        </div>
      </div>

      <VariantGroup label="Captions" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Caption inset</span>
              <span className="text-label text-fg-muted/60">Badge floats over bottom-left corner</span>
            </div>
            <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'Precision-manufactured circuit board — OptiTech hardware layer.' }} displaySettings={{ ratio: 'r16_9', captionPosition: 'inset' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Caption below</span>
              <span className="text-label text-fg-muted/60">Label-scale text beneath the image</span>
            </div>
            <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'Precision-manufactured circuit board — OptiTech hardware layer.' }} displaySettings={{ ratio: 'r16_9', captionPosition: 'below' }} />
          </div>
        </div>
      </div>

      <VariantGroup label="Aspect ratios" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {(['r16_9', 'r4_3', 'r3_2', 'r1_1'] as const).map(ratio => (
            <div key={ratio}>
              <p className="text-label tracking-label uppercase text-brand font-semibold mb-sm">{ratio.replace('r', '').replace('_', ':')}</p>
              <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT }} displaySettings={{ ratio }} />
            </div>
          ))}
        </div>
      </div>

      <VariantGroup label="Shadow · chromatic bloom" note="Dual radial gradient: brand teal pools bottom-left, signal green bottom-right." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {shadows.map(item => (
            <div key={item.label}>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                <span className="text-label text-fg-muted/60">{item.note}</span>
              </div>
              <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
            </div>
          ))}
        </div>
      </div>

      <VariantGroup label="Animate · scroll-triggered wipe reveal" note="Teal bar sweeps right; image follows on its heels via clip-path. Fires once on IntersectionObserver entry. Respects prefers-reduced-motion." />
      <div className="px-md pb-xl lg:px-lg">
        <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'OptiTech. Precision at every layer.' }} displaySettings={{ ratio: 'r16_9', animate: true, frame: 'offset', captionPosition: 'inset' }} />
      </div>
    </>
  )
}

// ─── Video ────────────────────────────────────────────────────────────────────

const VIDEO_YT  = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const VIDEO_VM  = 'https://vimeo.com/148751763'

function VideoShowcase() {
  const treatments: Array<{ label: string; note: string; content: any; displaySettings: DS }> = [
    { label: 'Clean',           note: 'No treatments — baseline',                                  content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9' } },
    { label: 'Frame: offset',   note: 'Bold teal backing block',                                   content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'offset' } },
    { label: 'Frame: glow',     note: 'Inset teal ring + outer ambient bloom',                    content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'glow' } },
    { label: 'Overlay',         note: 'Brand teal at 40% opacity, multiply blend',                content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9', overlay: true } },
    { label: 'Glow + Overlay',  note: 'Atmospheric — teal wash unifies tone, glow defines edge',  content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'glow', overlay: true } },
    { label: 'Offset + Overlay',note: 'Bold — teal backing anchors frame',                        content: { src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'offset', overlay: true } },
  ]

  return (
    <>
      <BlockHeader slug="video" />

      <VariantGroup label="Platform support · YouTube and Vimeo · auto-fetched thumbnails" note="Platform is detected from the URL. Vimeo thumbnails are fetched client-side from the oEmbed API." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">YouTube</span>
              <span className="text-label text-fg-muted/60">Platform thumbnail + branded play button</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview' }} displaySettings={{ ratio: 'r16_9' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Vimeo</span>
              <span className="text-label text-fg-muted/60">oEmbed thumbnail fetched on mount — shimmer while loading</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_VM }, title: 'OptiTech Case Study: Meridian Engineering' }} displaySettings={{ ratio: 'r16_9' }} />
          </div>
        </div>
      </div>

      <VariantGroup label="Treatments" note="Same frame options as ImageBlock — all treatments apply to the poster and the live embed equally." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {treatments.map(item => (
            <div key={item.label}>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                <span className="text-label text-fg-muted/60">{item.note}</span>
              </div>
              <OT_VideoBlock content={item.content} displaySettings={item.displaySettings} />
            </div>
          ))}
        </div>
      </div>

      <VariantGroup label="Captions" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Inset</span>
              <span className="text-label text-fg-muted/60">Badge floats over bottom-left corner of the poster</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview', caption: 'OptiTech. Precision at every layer.' }} displaySettings={{ ratio: 'r16_9', captionPosition: 'inset' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Below</span>
              <span className="text-label text-fg-muted/60">Label-scale text beneath the video</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'OptiTech Platform Overview', caption: 'OptiTech. Precision at every layer.' }} displaySettings={{ ratio: 'r16_9', captionPosition: 'below' }} />
          </div>
        </div>
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

function StatShowcase() {
  const THREE_STATS = [
    { value: '40%',    label: 'Faster deployment',  context: 'vs. baseline'        },
    { value: '99.99%', label: 'Uptime SLA',          context: 'across all regions'  },
    { value: '2M+',    label: 'Active users',        context: 'and growing'         },
  ]

  return (
    <>
      <BlockHeader slug="stat" />

      <VariantGroup label="Color schemes · 3 columns · static" note="Brand is the committed default. Canvas and surface for lighter editorial contexts." />
      {(['brand', 'canvas', 'surface'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_StatBlock content={{ items: THREE_STATS }} displaySettings={{ color, columns: '3', animate: false }} />
        </div>
      ))}

      <VariantGroup label="Column counts · brand · static" note="2-col uses the full display scale — heroic presence for anchor stat moments." />
      <div className="border-t border-fg/5">
        <VariantLabel label='columns: "2"' />
        <OT_StatBlock content={{ items: [{ value: '$6.4B', label: 'Total loan volume', context: 'originated this year' }, { value: '312K', label: 'Member accounts', context: 'across all regions' }] }} displaySettings={{ color: 'brand', columns: '2', animate: false }} />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='columns: "4"' />
        <OT_StatBlock content={{ items: [{ value: '1.2M', label: 'Claims processed', context: 'last 12 months' }, { value: '98.3%', label: 'Satisfaction rate', context: 'post-claim survey' }, { value: '4.8hr', label: 'Avg. resolution', context: 'from first contact' }, { value: '340+', label: 'Partner carriers', context: 'in our network' }] }} displaySettings={{ color: 'brand', columns: '4', animate: false }} />
      </div>

      <VariantGroup label="With icons · brand · 3 columns" note="Icons sit above the value at 28px / strokeWidth 1.5. Muted to 55% opacity on brand surfaces." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ items: [{ value: '40%', label: 'Faster deployment', context: 'vs. baseline', icon: 'zap' }, { value: '99.99%', label: 'Uptime SLA', context: 'across all regions', icon: 'shield' }, { value: '2M+', label: 'Active users', context: 'and growing', icon: 'users' }] }} displaySettings={{ color: 'brand', columns: '3', showIcons: true, animate: false }} />
      </div>

      <VariantGroup label="Animated · brand · 3 columns · icons on" note="Scroll into view to trigger. Sequence: stagger slide-up → dividers draw in → numbers count 0→target over 1.4s → completion pulse." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ items: [{ value: '40%', label: 'Faster deployment', context: 'vs. baseline', icon: 'zap' }, { value: '99.99%', label: 'Uptime SLA', context: 'across all regions', icon: 'shield' }, { value: '2M+', label: 'Active users', context: 'and growing', icon: 'users' }] }} displaySettings={{ color: 'brand', columns: '3', showIcons: true, animate: true }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Feature Grid ─────────────────────────────────────────────────────────────

const FG_ITEMS = [
  { headline: 'Sub-millisecond evaluation',   body: 'Every flag decision is made in memory on evaluation nodes pre-loaded with your full flag state. No database round-trips on the hot path.' },
  { headline: 'Edge-distributed state',       body: 'Flag configuration is pushed to evaluation nodes within 200ms of a save in the CMS. Strong-consistency mode available for kill switches.' },
  { headline: 'Targeting rule compilation',   body: 'Rules are pre-compiled into a bytecode decision tree on flag save, not at evaluation time. Direct interpretation against a pre-indexed user context.' },
  { headline: 'Concurrent experiments',       body: 'Run multiple A/B tests simultaneously with automatic interaction effect detection. No manual exclusion groups required.' },
  { headline: 'Statistical confidence built-in', body: 'Power calculations and stopping rules are wired into the platform. Know when your experiment has reached significance without a spreadsheet.' },
  { headline: 'Instant rollback',             body: 'One flag, one API call. Revert any change across every deployment in seconds. Full audit trail included.' },
]

function FeatureGridShowcase() {
  return (
    <>
      <BlockHeader slug="feature-grid" />

      <VariantGroup label="Color schemes · 3 columns · grid layout · no icons" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_FeatureGridBlock content={{ items: FG_ITEMS }} displaySettings={{ color, layout: 'grid', columns: 'col3', iconStyle: 'none', animate: false }} />
        </div>
      ))}

      <VariantGroup label="Ruled layout · canvas · 2 columns" note="Ruled — 2-col with horizontal divider lines between items." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock content={{ items: FG_ITEMS }} displaySettings={{ color: 'canvas', layout: 'ruled', columns: 'col2', iconStyle: 'none', animate: false }} />
      </div>

      <VariantGroup label="With icons · structural style · 3 columns · brand" note="Icons sit above the headline in the structural position." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock
          content={{ items: FG_ITEMS.map((item, i) => ({ ...item })) }}
          displaySettings={{ color: 'brand', layout: 'grid', columns: 'col3', iconStyle: 'structural', feature1Icon: 'zap', feature2Icon: 'globe', feature3Icon: 'bar-chart', feature4Icon: 'sparkles', feature5Icon: 'shield', feature6Icon: 'check-circle', animate: false }}
        />
      </div>

      <VariantGroup label="4 columns · canvas · icon: accent · animated" note="Scroll into view to trigger stagger entrance." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock
          content={{ items: FG_ITEMS }}
          displaySettings={{ color: 'canvas', layout: 'grid', columns: 'col4', iconStyle: 'accent', feature1Icon: 'zap', feature2Icon: 'globe', feature3Icon: 'bar-chart', feature4Icon: 'sparkles', feature5Icon: 'shield', feature6Icon: 'check-circle', animate: true }}
        />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Trust Rail (simplified) ──────────────────────────────────────────────────

function makeSvgLogo(text: string): string {
  const w    = text.length * 9 + 24
  const svg  = `<svg viewBox="0 0 ${w} 32" xmlns="http://www.w3.org/2000/svg" width="${w}" height="32"><text x="${w / 2}" y="22" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="700" font-size="15" letter-spacing="0.04em" fill="currentColor">${text}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const TRUST_LOGOS = [
  { imageUrl: makeSvgLogo('MERIDIAN'), altText: 'Meridian' },
  { imageUrl: makeSvgLogo('FOLIO'),    altText: 'Folio'    },
  { imageUrl: makeSvgLogo('VERTEX'),   altText: 'Vertex'   },
  { imageUrl: makeSvgLogo('NEXUS'),    altText: 'Nexus'    },
  { imageUrl: makeSvgLogo('PRISM'),    altText: 'Prism'    },
  { imageUrl: makeSvgLogo('APEX'),     altText: 'Apex'     },
  { imageUrl: makeSvgLogo('ORBIT'),    altText: 'Orbit'    },
  { imageUrl: makeSvgLogo('STRATA'),   altText: 'Strata'   },
]

function TrustRailShowcase() {
  return (
    <>
      <BlockHeader slug="trust-rail" />

      <VariantGroup label="Scroll · mono treatment · canvas · compact" note="Seamless CSS marquee with doubled track. Grayscale at rest, color-on-hover. Respects prefers-reduced-motion." />
      <div className="border-t border-fg/5">
        <TrustRail
          headline="Trusted by teams who move fast"
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'scroll', treatment: 'mono', background: 'canvas', density: 'compact', size: 'md', glass: false }}
        />
      </div>

      <VariantGroup label="Fade · color treatment · surface" note="Staggered scroll-reveal entrance. Logos appear at full color." />
      <div className="border-t border-fg/5">
        <TrustRail
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'fade', treatment: 'color', background: 'surface', density: 'comfortable', size: 'lg', glass: false }}
        />
      </div>

      <VariantGroup label="Static · brand · glass overlay" note="Plain grid, no animation. Glass panel sits over the brand fill." />
      <div className="border-t border-fg/5">
        <TrustRail
          headline="Built on trust. Proven at scale."
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'static', treatment: 'mono', background: 'brand', density: 'spacious', size: 'md', glass: true }}
        />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

const ACCORDION_ITEMS = [
  { question: 'How does OptiTech handle sub-millisecond evaluation?', answer: 'Flag state is kept in memory on evaluation nodes. There are no database round-trips on the hot path. Changes are pushed within 200ms of a CMS save. The evaluation engine walks a pre-compiled bytecode decision tree in a single pass.' },
  { question: 'Can I run concurrent experiments without interaction effects?', answer: 'Yes. The platform detects interaction effects automatically. You can run multiple A/B tests simultaneously and the system isolates results per experiment, flagging any significant cross-experiment interactions for review.' },
  { question: 'What happens when a flag configuration change propagates to the edge?', answer: 'Evaluation nodes receive flag updates via WebSocket push with a polling fallback. The propagation window is under 200ms for most deployments. Kill-switch flags support a strong-consistency mode that adds one round-trip for guaranteed freshness.' },
  { question: 'How are experiment results calculated?', answer: 'OptiTech computes power calculations and stopping rules directly in the platform. Confidence intervals and p-values are updated in real time. The platform flags when statistical significance is reached and prevents early stopping unless the stopping rule threshold is met.' },
  { question: 'What is the rollback process?', answer: 'One flag, one API call. Flipping a flag to its fallback state propagates to all evaluation nodes within the standard 200ms window. A full audit trail records every change, including the initiating user and timestamp.' },
]

function AccordionShowcase() {
  return (
    <>
      <BlockHeader slug="accordion" />

      <VariantGroup label="Border styles · canvas · same content" />
      {(['ruled', 'boxed', 'clean'] as const).map(borderStyle => (
        <div key={borderStyle} className="border-t border-fg/5">
          <VariantLabel label={`borderStyle: "${borderStyle}"`} />
          <OT_AccordionBlock content={{ items: ACCORDION_ITEMS.slice(0, 3) }} displaySettings={{ color: 'canvas', borderStyle, openMode: 'single', defaultOpen: false }} />
        </div>
      ))}

      <VariantGroup label="Color schemes · ruled · first item open" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_AccordionBlock content={{ items: ACCORDION_ITEMS.slice(0, 3) }} displaySettings={{ color, borderStyle: 'ruled', openMode: 'single', defaultOpen: true }} />
        </div>
      ))}

      <VariantGroup label="Multiple open mode · boxed · canvas" note="Items open and close independently — multiple can be open at once." />
      <div className="border-t border-fg/5">
        <OT_AccordionBlock content={{ headline: 'Frequently asked questions', items: ACCORDION_ITEMS }} displaySettings={{ color: 'canvas', borderStyle: 'boxed', openMode: 'multiple', defaultOpen: false }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS_CONTENT = [
  { tabLabel: 'Evaluation', heading: 'Sub-millisecond flag evaluation', body: 'Flag state lives in memory on evaluation nodes. The evaluation engine walks a pre-compiled bytecode decision tree in a single pass — no database round-trips on the hot path.', imageSrc: IMG_SRC, imageAlt: IMG_ALT },
  { tabLabel: 'Experiments', heading: 'Concurrent A/B testing with automatic confidence', body: 'Run multiple experiments simultaneously. Interaction effects are detected automatically. Power calculations and stopping rules are built into the platform — no spreadsheets required.' },
  { tabLabel: 'Rollout',     heading: 'Targeted rollouts at any granularity', body: 'Deploy to any user segment with a single API call. Feature flags can target by user attribute, cohort, geography, or any combination. Kill switches propagate to all evaluation nodes within 200ms.' },
  { tabLabel: 'Observability', heading: 'Full audit trail and deployment telemetry', body: 'Every flag change, experiment result, and deployment event is logged with timestamp, user, and context. Real-time dashboards surface the patterns that matter before they become incidents.' },
]

function TabsShowcase() {
  return (
    <>
      <BlockHeader slug="tabs" />

      <VariantGroup label="Tab styles · canvas · top position · text only" />
      {(['underline', 'pill', 'buttonGroup'] as const).map(tabStyle => (
        <div key={tabStyle} className="border-t border-fg/5">
          <VariantLabel label={`tabStyle: "${tabStyle}"`} />
          <OT_TabsBlock content={{ tabs: TABS_CONTENT }} displaySettings={{ tabStyle, tabPosition: 'top', color: 'canvas', contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
        </div>
      ))}

      <VariantGroup label="Color schemes · underline · top · text only" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_TabsBlock content={{ tabs: TABS_CONTENT.slice(0, 3) }} displaySettings={{ tabStyle: 'underline', tabPosition: 'top', color, contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
        </div>
      ))}

      <VariantGroup label="Image right · underline · canvas" note="Content layout with image panel on the right side of the tab panel." />
      <div className="border-t border-fg/5">
        <OT_TabsBlock content={{ tabs: TABS_CONTENT }} displaySettings={{ tabStyle: 'underline', tabPosition: 'top', color: 'canvas', contentLayout: 'imageRight', triggerAlign: 'left', autoPlay: 'off' }} />
      </div>

      <VariantGroup label="Side position · pill · canvas" note="Tab triggers stack vertically on the left side of the panel." />
      <div className="border-t border-fg/5">
        <OT_TabsBlock content={{ tabs: TABS_CONTENT }} displaySettings={{ tabStyle: 'pill', tabPosition: 'side', color: 'canvas', contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Blog Feed (simplified) ───────────────────────────────────────────────────

const MOCK_POSTS: BlogFeedPost[] = [
  { _metadata: { key: 'sc-post-1', published: '2026-05-15T09:00:00Z', url: { default: '/blog/architecture-sub-millisecond-delivery' } }, headline: 'How OptiTech Builds for Speed: Architecture Behind Sub-Millisecond Feature Delivery', topic: 'insights', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop' } }, authorRef: { name: 'Nadia Okafor' }, readTime: '8 min read' },
  { _metadata: { key: 'sc-post-2', published: '2026-05-10T08:00:00Z', url: { default: '/blog/future-of-personalization' } }, headline: 'The Future of Personalization: How AI Is Reshaping User Experiences', topic: 'innovation', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop' } }, authorRef: { name: 'Marcus Webb' }, readTime: '5 min read' },
  { _metadata: { key: 'sc-post-3', published: '2026-05-06T10:30:00Z', url: { default: '/blog/zero-downtime-deployments' } }, headline: 'Why Feature Flags Are the Foundation of Modern Product Development', topic: 'resources', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop' } }, authorRef: { name: 'Priya Nair' }, readTime: '6 min read' },
  { _metadata: { key: 'sc-post-4', published: '2026-04-28T14:00:00Z', url: { default: '/blog/observability-trends-2026' } }, headline: 'Observability in 2026: Five Trends Redefining How Teams Monitor Production', topic: 'news', featuredImage: undefined, authorRef: { name: 'James Okonkwo' }, readTime: '4 min read' },
  { _metadata: { key: 'sc-post-5', published: '2026-04-20T11:00:00Z', url: { default: '/blog/experiment-design' } }, headline: 'Experiment Design That Actually Works: A Practical Guide for Product Teams', topic: 'leadership', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop' } }, authorRef: { name: 'Nadia Okafor' }, readTime: '7 min read' },
  { _metadata: { key: 'sc-post-6', published: '2026-04-14T09:30:00Z', url: { default: '/blog/sdk-internals' } }, headline: 'Inside the OptiTech SDK: How We Cut Evaluation Latency by 60%', topic: 'stories', featuredImage: undefined, authorRef: { name: 'Marcus Webb' }, readTime: '9 min read' },
]

function BlogFeedShowcase() {
  return (
    <>
      <BlockHeader slug="blog-feed" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, posts are fetched at render time from the CMS article root. The showcase uses static mock posts to demonstrate the display template settings independently of CMS content.
        </p>
      </div>

      <VariantGroup label="Color schemes · 3 columns · headline size" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <BlogFeedBlock posts={MOCK_POSTS} topics={['insights', 'innovation', 'resources', 'news', 'leadership', 'stories']} pageSize={6} styleOptions={{ color, columns: 'col3', headingSize: 'headline' }} />
        </div>
      ))}

      <VariantGroup label="2 columns · canvas · display heading" />
      <div className="border-t border-fg/5">
        <BlogFeedBlock posts={MOCK_POSTS.slice(0, 4)} topics={['insights', 'resources']} pageSize={4} styleOptions={{ color: 'canvas', columns: 'col2', headingSize: 'display' }} />
      </div>

      <VariantGroup label="Topic filter locked · innovation · surface" note="When topicFilter is set in the CMS, posts are pre-filtered server-side and the chip UI is replaced by a static topic label." />
      <div className="border-t border-fg/5">
        <BlogFeedBlock
          posts={MOCK_POSTS.filter(p => p.topic === 'innovation')}
          topics={['innovation']}
          topicFilter="innovation"
          pageSize={3}
          styleOptions={{ color: 'surface', columns: 'col3', headingSize: 'headline' }}
        />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

function ButtonShowcase() {
  return (
    <>
      <BlockHeader slug="button" />

      <VariantGroup label="Variants · md · on canvas" />
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
        {(['brand', 'accent', 'ghost', 'signal', 'hover-fill', 'glass'] as const).map(v => (
          <div key={v} className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">{v}</span>
            <Button variant={v} href="#">{v === 'brand' ? 'Get started' : v === 'accent' ? 'Explore features' : v === 'ghost' ? 'Learn more' : v === 'signal' ? 'See it in action' : v === 'hover-fill' ? 'Start free trial' : 'View the platform'}</Button>
          </div>
        ))}
      </div>

      <VariantGroup label="Sizes · brand variant" />
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-end">
        {(['sm', 'md', 'lg'] as const).map(s => (
          <div key={s} className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">{s}</span>
            <Button variant="brand" size={s} href="#">Get started</Button>
          </div>
        ))}
      </div>

      <VariantGroup label="Icon slots · leading · trailing" />
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">brand · leading</span><Button variant="brand" href="#" leadingIcon={<Zap />}>Deploy now</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">brand · trailing arrowRight</span><Button variant="brand" href="#" trailingIcon={<ArrowRight />}>Get started</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">accent · trailing rocket</span><Button variant="accent" href="#" trailingIcon={<Rocket />}>Launch now</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">ghost · trailing chevron</span><Button variant="ghost" href="#" trailingIcon={<ChevronRight />}>Learn more</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">signal · trailing arrow</span><Button variant="signal" href="#" trailingIcon={<ArrowRight />}>See it live</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">hover-fill · trailing play</span><Button variant="hover-fill" href="#" trailingIcon={<Play />}>Watch demo</Button></div>
        <div className="flex flex-col gap-sm items-start"><span className="font-mono text-label text-fg-muted/50">glass · trailing download</span><Button variant="glass" href="#" trailingIcon={<Download />}>Download report</Button></div>
      </div>

      <VariantGroup label="Signal · kinetic fill sweep" note="Hover to trigger. Brand color fills left-to-right. Reduced-motion: instant background swap." />
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-lg items-end">
        {(['sm', 'md', 'lg'] as const).map(s => (
          <div key={s} className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">{s}</span>
            <Button variant="signal" size={s} href="#" trailingIcon={<ArrowRight />}>{s === 'sm' ? 'Start free' : s === 'md' ? 'Start your trial' : 'Start your free trial'}</Button>
          </div>
        ))}
      </div>

      <VariantGroup label="Hover-fill · glow border → brand fill" note="Ambient glow border at rest. On hover: brand color floods in with intensified glow bloom." />
      <div className="bg-canvas px-md py-xl lg:px-lg flex flex-wrap gap-lg items-end">
        {(['sm', 'md', 'lg'] as const).map(s => (
          <div key={s} className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">{s}</span>
            <Button variant="hover-fill" size={s} href="#" trailingIcon={<ArrowRight />}>{s === 'sm' ? 'Start free' : s === 'md' ? 'Start your trial' : 'Start your free trial'}</Button>
          </div>
        ))}
      </div>

      <VariantGroup label="Glass · frosted backdrop blur" note="Adapts text to the surface — white on dark, near-black on light." />
      <div className="relative overflow-hidden px-md py-xl lg:px-lg flex flex-wrap gap-md items-center" style={{ background: 'linear-gradient(135deg, oklch(0.25 0.04 230), oklch(0.18 0.06 260))' }}>
        <Button variant="glass" href="#">View the platform</Button>
        <Button variant="glass" href="#" trailingIcon={<ArrowRight />}>Get started</Button>
        <Button variant="glass" href="#" leadingIcon={<Star />}>Featured release</Button>
      </div>

      <VariantGroup label="Disabled · all variants" />
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
        <Button variant="brand" disabled>Get started</Button>
        <Button variant="accent" disabled>Explore features</Button>
        <Button variant="ghost" disabled>Learn more</Button>
        <Button variant="signal" disabled>See it in action</Button>
        <Button variant="hover-fill" disabled>Start free trial</Button>
        <Button variant="glass" disabled>View the platform</Button>
      </div>

      <VariantGroup label="ButtonBlock (CMS) · variant · size · icon · alignment" />
      <div className="px-md pb-md lg:px-lg">
        <p className="text-label text-fg-muted/60">CMS-managed button with a link field. Same variant and size options as the UI Button, plus alignment and fullWidth.</p>
      </div>
      <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md">
        {(['brand', 'accent', 'ghost', 'signal', 'hover-fill', 'glass'] as const).map(v => (
          <div key={v} className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">{v}</span>
            <OT_ButtonBlock content={{ label: v === 'brand' ? 'Get started' : v === 'accent' ? 'Explore' : v === 'ghost' ? 'Learn more' : v === 'signal' ? 'See it' : v === 'hover-fill' ? 'Free trial' : 'Platform', url: { default: '#' } }} displaySettings={{ variant: v }} />
          </div>
        ))}
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Chart ────────────────────────────────────────────────────────────────────


// Variant 1 JSON — Line / Mortgage Rates
const LINE_JSON = JSON.stringify({
  series: [
    { name: '30-Year Fixed', data: [6.62, 6.71, 6.94, 6.99, 7.09, 6.86, 6.73, 6.65, 6.20, 6.08, 6.78, 6.85] },
    { name: '15-Year Fixed', data: [5.89, 5.96, 6.17, 6.29, 6.38, 6.16, 5.99, 5.90, 5.48, 5.41, 5.99, 6.00] },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}, null, 2)

// Variant 2 JSON — Area / API Volume
const AREA_JSON = JSON.stringify({
  series: [
    { name: 'Requests (M)', data: [18.2, 21.4, 19.8, 24.1, 27.6, 31.2, 29.8, 33.4, 38.1, 42.7, 39.9, 47.3] },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}, null, 2)

// Variant 3 JSON — Bar / Patient Satisfaction
const BAR_JSON = JSON.stringify({
  series: [
    { name: 'Satisfaction Score', data: [87, 92, 78, 95, 83, 89] },
  ],
  labels: ['Emergency', 'Cardiology', 'Oncology', 'Maternity', 'Orthopedics', 'Neurology'],
}, null, 2)

// Variant 4 JSON — Bar Stacked / Loan Portfolio
const BAR_STACKED_JSON = JSON.stringify({
  series: [
    { name: 'Mortgage', data: [42, 44, 41, 45] },
    { name: 'Auto',     data: [28, 26, 29, 27] },
    { name: 'Personal', data: [30, 30, 30, 28] },
  ],
  labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
}, null, 2)

// Variant 5 JSON — Radial / Patient Satisfaction Index
const RADIAL_JSON = JSON.stringify({
  series: [
    { name: 'Satisfaction Index', data: [84] },
  ],
  labels: ['Score'],
  max: 100,
}, null, 2)

function ChartShowcase() {
  return (
    <>
      <BlockHeader slug="chart" />

      {/* ── Variant 1: Line / canvas / brand palette ──────────────────────── */}
      <VariantGroup
        label="Line — Trend over time · canvas · brand palette"
        note="Multi-series. Monotone curves, no dots at rest, activeDot on hover. Source: Freddie Mac 2024."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartType: line · color: canvas · seriesColors: brand · showLegend: true · height: md · valueSuffix: %" />
        <OT_ChartBlock
          content={{
            heading:      'Mortgage Rate Trends',
            subtext:      'Source: Freddie Mac, 2024',
            chartType:    'line',
            chartData:    LINE_JSON,
            seriesColors: 'brand',
            valueSuffix:  '%',
            showLegend:   true,
            showGrid:     true,
          }}
          displaySettings={{ color: 'canvas', height: 'md', aspectRatio: 'wide' }}
        />
        <div className="px-lg pb-xl">
          <JsonCopyBlock json={LINE_JSON} />
        </div>
      </div>

      {/* ── Variant 2: Area / surface / cool palette ──────────────────────── */}
      <VariantGroup
        label="Area — Volume or growth · surface · cool palette"
        note="Single series with gradient fill. Fills from 30% → 0% opacity for depth without noise."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartType: area · color: surface · seriesColors: cool · showLegend: false · height: md · valueSuffix: M" />
        <OT_ChartBlock
          content={{
            heading:      'API Request Volume',
            subtext:      'Trailing 12 months — all environments',
            chartType:    'area',
            chartData:    AREA_JSON,
            seriesColors: 'cool',
            valueSuffix:  'M',
            showLegend:   false,
            showGrid:     true,
          }}
          displaySettings={{ color: 'surface', height: 'md', aspectRatio: 'wide' }}
        />
        <div className="px-lg pb-xl">
          <JsonCopyBlock json={AREA_JSON} />
        </div>
      </div>

      {/* ── Variant 3: Bar single-series / canvas / warm palette ──────────── */}
      <VariantGroup
        label="Bar — Comparison · canvas · warm palette · multi-color cells"
        note="Single-series bars get per-category Cell coloring. Warm palette uses OKLCH amber-gold tones, harmonious with the brand but offering hue contrast."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartType: bar · color: canvas · seriesColors: warm · height: md · valueSuffix: /100" />
        <OT_ChartBlock
          content={{
            heading:      'Patient Satisfaction by Department',
            subtext:      'Q4 2024 — Press Ganey scores',
            chartType:    'bar',
            chartData:    BAR_JSON,
            seriesColors: 'warm',
            valueSuffix:  '/100',
            showLegend:   false,
            showGrid:     true,
          }}
          displaySettings={{ color: 'canvas', height: 'md', aspectRatio: 'wide' }}
        />
        <div className="px-lg pb-xl">
          <JsonCopyBlock json={BAR_JSON} />
        </div>
      </div>

      {/* ── Variant 4: Bar Stacked / surface / diverging ──────────────────── */}
      <VariantGroup
        label="Bar Stacked — Composition · surface · diverging palette"
        note="Rounded top corners on the topmost series only. Each series gets its own palette color."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartType: barStacked · color: surface · seriesColors: diverging · showLegend: true · height: lg · valueSuffix: %" />
        <OT_ChartBlock
          content={{
            heading:      'Loan Portfolio Mix',
            subtext:      'By product type — quarterly 2024',
            chartType:    'barStacked',
            chartData:    BAR_STACKED_JSON,
            seriesColors: 'diverging',
            valueSuffix:  '%',
            showLegend:   true,
            showGrid:     true,
          }}
          displaySettings={{ color: 'surface', height: 'lg', aspectRatio: 'wide' }}
        />
        <div className="px-lg pb-xl">
          <JsonCopyBlock json={BAR_STACKED_JSON} />
        </div>
      </div>

      {/* ── Variant 5: Radial / brand / mono — the visual hero ────────────── */}
      {/*
        The mono palette is specifically designed for brand and glass backgrounds.
        White arcs on teal are the most visually striking chart variant in the framework.
        The count-up animation on mount is deliberate: 800ms expo-out, matching the gauge sweep.
      */}
      <VariantGroup
        label="Radial — Single score or KPI · brand · mono palette (showcase hero)"
        note="White gauge arc on brand background. 280° arc. Count-up animation on mount (expo-out, 800ms). Skipped under prefers-reduced-motion."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartType: radial · color: brand · seriesColors: mono · height: md" />
        <OT_ChartBlock
          content={{
            heading:      'Patient Satisfaction Index',
            subtext:      'System-wide composite — FY2024',
            chartType:    'radial',
            chartData:    RADIAL_JSON,
            seriesColors: 'mono',
            valueSuffix:  '/100',
            showLegend:   false,
            showGrid:     false,
          }}
          displaySettings={{ color: 'brand', height: 'md', aspectRatio: 'wide' }}
        />
        <div className="px-lg pb-xl" style={{ background: 'var(--ot-brand)' }}>
          <JsonCopyBlock json={RADIAL_JSON} />
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      <VariantGroup
        label="Empty state — invalid or missing JSON"
        note="Renders when parseChartData returns null. Sized to match configured height. Never collapses the layout."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label="chartData: null · color: canvas · height: md" />
        <OT_ChartBlock
          content={{
            heading:   'Chart data unavailable',
            chartType: 'bar',
            chartData: null,
            showGrid:  true,
            showLegend: false,
          }}
          displaySettings={{ color: 'canvas', height: 'md', aspectRatio: 'wide' }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────

type Props = { params: Promise<{ block: string }> }

// ─── Banner ───────────────────────────────────────────────────────────────────

const BANNER_IMG_A     = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop'
const BANNER_IMG_B     = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&fit=crop'

function BannerShowcase() {
  const scrimVariants = [
    {
      label: 'Canvas · Center · Scrim · Large',
      content: {
        heading: 'Move at the speed of certainty.',
        eyebrow: 'Ready when you are',
        body: { html: '<p>OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.</p>' },
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'See pricing', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Center · Scrim · Large',
      content: {
        heading: 'Every experiment. Every answer. One platform.',
        eyebrow: 'The OptiTech advantage',
        body: { html: '<p>Feature flags, A/B tests, and deployment telemetry unified so your team closes the loop between shipping and knowing.</p>' },
        backgroundImage: BANNER_IMG_B,
        primaryCtaLabel: 'Start free trial', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'View docs', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', treatment: 'scrim', alignment: 'center', size: 'large', imageBlend: 'multiply' },
    },
    {
      label: 'Surface · Left · Scrim · Large',
      content: {
        heading: 'Precision at every layer.',
        eyebrow: 'The method',
        body: { html: '<p>From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.</p>' },
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'See how it works', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'surface', treatment: 'scrim', alignment: 'left', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Canvas · Center · Scrim · Compact',
      content: {
        heading: 'Ship faster. Know sooner.',
        eyebrow: 'Built for velocity',
        backgroundImage: BANNER_IMG_B,
        primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'compact', imageBlend: 'multiply' },
    },
  ]

  const glassVariants = [
    {
      label: 'Canvas · Center · Glass · Large',
      content: {
        heading: 'Confidence is a competitive advantage.',
        eyebrow: 'OptiTech platform',
        body: { html: '<p>Stop shipping and hoping. Start shipping and knowing. Real-time experiment data means every decision is an informed one.</p>' },
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'See pricing', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'glass', alignment: 'center', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Center · Glass · Large',
      content: {
        heading: 'The platform your engineers have been asking for.',
        eyebrow: 'Enterprise ready',
        body: { html: '<p>SOC 2 Type II, 99.99% uptime SLA, and SDK support for every major language. Built for teams that can\'t afford to guess.</p>' },
        backgroundImage: BANNER_IMG_B,
        primaryCtaLabel: 'Talk to sales', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Security overview', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', treatment: 'glass', alignment: 'center', size: 'large', imageBlend: 'multiply' },
    },
    {
      label: 'Canvas · Left · Glass · Large',
      content: {
        heading: 'From flag to finding in under an hour.',
        eyebrow: 'Speed of certainty',
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Start experimenting', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'glass', alignment: 'left', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Left · Glass · Compact',
      content: {
        heading: 'Deploy once. Learn forever.',
        eyebrow: 'Continuous delivery',
        backgroundImage: BANNER_IMG_B,
        primaryCtaLabel: 'See a live demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Read the docs', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', treatment: 'glass', alignment: 'left', size: 'compact', imageBlend: 'multiply' },
    },
  ]

  const noImageVariants = [
    {
      label: 'Canvas · No image · Scrim · Center',
      content: {
        heading: 'The clearest signal in the room.',
        eyebrow: 'Data-driven teams',
        primaryCtaLabel: 'Start free', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'View pricing', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'compact', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · No image · Scrim · Center',
      content: {
        heading: 'Ready when you are.',
        eyebrow: 'Get started today',
        primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Talk to sales', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', treatment: 'scrim', alignment: 'center', size: 'compact', imageBlend: 'overlay' },
    },
  ]

  return (
    <>
      <BlockHeader slug="banner" />

      <VariantGroup label="Scrim treatment · color variants · with background image" note="Full-bleed color overlay pressed directly over the image. Opacity scales with imageBlend: overlay is lighter (image reads as texture), multiply is heavier (image becomes an underpainting)." />
      {scrimVariants.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_BannerBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Glass treatment · color variants · with background image" note="Lighter scrim lets the image breathe. Content sits inside a frosted glass panel. Brand variant uses teal-tinted glass." />
      {glassVariants.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_BannerBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="No image · flat color fallback" note="When no backgroundImage is provided the scrim fills the section as a flat color. Fully intentional — works as a standalone CTA section." />
      {noImageVariants.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_BannerBlock content={item.content} displaySettings={item.displaySettings} />
        </div>
      ))}

      <div className="pb-xl" />
    </>
  )
}

export default async function ShowcaseBlockPage({ params }: Props) {
  const { block } = await params

  switch (block as BlockSlug) {
    case 'hero':         return <HeroShowcase />
    case 'card':         return <CardShowcase />
    case 'primary-text': return <PrimaryTextShowcase />
    case 'quote':        return <QuoteShowcase />
    case 'rich-text':    return <RichTextShowcase />
    case 'image':        return <ImageShowcase />
    case 'video':        return <VideoShowcase />
    case 'stat':         return <StatShowcase />
    case 'feature-grid': return <FeatureGridShowcase />
    case 'trust-rail':   return <TrustRailShowcase />
    case 'accordion':    return <AccordionShowcase />
    case 'tabs':         return <TabsShowcase />
    case 'blog-feed':    return <BlogFeedShowcase />
    case 'button':       return <ButtonShowcase />
    case 'chart':        return <ChartShowcase />
    case 'banner':       return <BannerShowcase />
    default:             return notFound()
  }
}
