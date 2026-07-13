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
import ResourceLibraryBlock         from '@/components/blocks/ResourceLibraryBlock'
import CalloutBlock                  from '@/components/blocks/CalloutBlock'
import OT_DividerBlock               from '@/cms/components/OT_DividerBlock'
import JsonCopyBlock                 from '@/components/blocks/chart/JsonCopyBlock'
import TrustRail                     from '@/components/blocks/TrustRail'
import Button                        from '@/components/ui/Button'
import BlogFeedBlock                 from '@/components/blocks/BlogFeedBlock'
import EventListingBlock             from '@/components/blocks/EventListingBlock'
import PractitionerListingBlock      from '@/components/blocks/PractitionerListingBlock'
import LocationListingBlock          from '@/components/blocks/LocationListingBlock'
import ContentRecommendationsBlock    from '@/components/blocks/ContentRecommendationsBlock'
import type { ContentRecItem }         from '@/components/blocks/ContentRecommendationsBlock'
import ProductRecommendationsBlock     from '@/components/blocks/ProductRecommendationsBlock'
import type { ProductRec }             from '@/components/blocks/ProductRecommendationsBlock'
import OT_ComparisonTableBlock         from '@/cms/components/OT_ComparisonTableBlock'
import {
  ArrowRight, Zap, ChevronRight, Play, Download,
  Sparkles, Send, Rocket, Star, Plus,
} from 'lucide-react'
import type { BlogFeedPost }         from '@/lib/blogFeed'
import type { EventCardData }        from '@/lib/events'
import type { PractitionerCardData } from '@/lib/practitioners'
import type { LocationData }          from '@/lib/locations'
import HeroPlayground        from '../hero-playground'
import DividerPlayground     from '../divider-playground'
import CardPlayground        from '../card-playground'
import PrimaryTextPlayground from '../primary-text-playground'
import QuotePlayground       from '../quote-playground'
import ImagePlayground       from '../image-playground'
import VideoPlayground       from '../video-playground'
import StatPlayground        from '../stat-playground'
import FeatureGridPlayground from '../feature-grid-playground'
import AccordionPlayground   from '../accordion-playground'
import TabsPlayground        from '../tabs-playground'
import BannerPlayground      from '../banner-playground'
import CalloutPlayground     from '../callout-playground'
import ButtonPlayground      from '../button-playground'
import TrustRailPlayground   from '../trust-rail-playground'

// ─── Static params ──────────────────────────────────────────────────────────

const BLOCK_SLUGS = [
  'hero', 'card', 'primary-text', 'quote', 'rich-text',
  'image', 'video', 'stat', 'feature-grid', 'trust-rail',
  'accordion', 'tabs', 'blog-feed', 'button', 'chart', 'banner', 'resource-library',
  'callout', 'divider', 'event-listing', 'practitioner-listing', 'location-listing',
  'content-recommendations', 'product-recommendations',
  'comparison-table',
] as const

type BlockSlug = typeof BLOCK_SLUGS[number]

const BLOCK_META: Record<BlockSlug, { label: string; cmsKey: string; description: string }> = {
  'hero':         { label: 'HeroBlock',        cmsKey: 'OT_HeroBlock',        description: 'Full-bleed split layout with a text panel and an optional visual panel. When no visual is provided the text panel expands to full width. Layout, color, and entrance animation are display settings.' },
  'card':         { label: 'CardBlock',         cmsKey: 'OT_CardBlock',        description: 'A single composable card: eyebrow, heading, description, optional image, optional CTA. Fill and border are independently controlled. All display settings map 1:1 to CMS display template choices.' },
  'primary-text': { label: 'PrimaryTextBlock',  cmsKey: 'OT_PrimaryTextBlock', description: 'Typographic accent block for section openers, pacing moments, and statement callouts. Eyebrow label and headline only — Poppins throughout.' },
  'quote':        { label: 'QuoteBlock',         cmsKey: 'OT_QuoteBlock',       description: 'Typographic anchor moment for customer social proof and editorial pull quotes. The large quotation mark is a Poppins 800 letterform, not an icon.' },
  'rich-text':    { label: 'RichTextBlock',      cmsKey: 'OT_RichTextBlock',    description: 'Full-width prose section rendering TinyMCE WYSIWYG HTML output: headings, paragraphs, lists, blockquotes, and inline elements.' },
  'image':        { label: 'ImageBlock',         cmsKey: 'OT_ImageBlock',       description: 'Flexible image block with two frame modes, teal brand overlay, inset or below caption, chromatic shadow bloom, and a scroll-triggered wipe reveal. Populate any editorial field (eyebrow, heading, body, CTA) to auto-enable a 55/45 two-column editorial layout with configurable media side.' },
  'video':        { label: 'VideoBlock',         cmsKey: 'OT_VideoBlock',       description: 'YouTube and Vimeo embeds with a branded poster state. Platform thumbnails are auto-fetched; a teal play button replaces the iframe until clicked. Populate any editorial field to auto-enable a 55/45 two-column editorial layout with configurable media side.' },
  'stat':         { label: 'StatBlock',          cmsKey: 'OT_StatBlock',        description: 'Horizontal row of metric callouts. Numbers animate on scroll with a staggered entrance and easeOutQuart count-up. Three color schemes and two layout modes.' },
  'feature-grid': { label: 'FeatureGridBlock',   cmsKey: 'OT_FeatureGridBlock', description: 'Grid of feature tiles with optional eyebrow, heading, and CTA. Supports grid and ruled layouts, 2–4 columns, optional icon slots, and stagger entrance animation.' },
  'trust-rail':   { label: 'TrustRail',          cmsKey: 'OT_TrustRail',        description: 'Logo trust strip with seamless marquee, staggered fade, or static grid. Mono grayscale + color-on-hover treatment. Logos are CMS-managed content references.' },
  'accordion':    { label: 'AccordionBlock',      cmsKey: 'OT_AccordionBlock',   description: 'Expandable FAQ or content section. Three border styles, three color schemes, single or multiple open mode, and optional default-open first item.' },
  'tabs':         { label: 'TabsBlock',           cmsKey: 'OT_TabsBlock',        description: 'Tabbed content block with underline, pill, or button-group triggers. Top or side tab position. Optional image panel and auto-play.' },
  'blog-feed':    { label: 'BlogFeedBlock',       cmsKey: 'OT_BlogFeedBlock',    description: 'CMS-driven blog post grid. Posts are fetched at render time from the connected article root. Three color schemes, 2- or 3-column layout, and three heading sizes.' },
  'button':       { label: 'Button',              cmsKey: 'OT_ButtonBlock',      description: 'Six button variants, three sizes, optional icon slots (leading/trailing). Polymorphic — renders as <button> or <Link> based on the href prop.' },
  'chart':        { label: 'ChartBlock',          cmsKey: 'OT_ChartBlock',       description: 'CMS-driven data visualization block. Five chart types: line, area, bar, bar stacked, and radial gauge. Four color variants, five series color palettes, fully responsive via Recharts.' },
  'banner':           { label: 'BannerBlock',          cmsKey: 'OT_BannerBlock',          description: 'Full-bleed background image with layered content: eyebrow, headline, optional body, and up to two CTAs. Two overlay modes: scrim (color overlay over the image) and glass (content inside a frosted panel). Three color variants, two alignment options, two height sizes, and two image blend modes.' },
  'resource-library': { label: 'ResourceLibraryBlock', cmsKey: 'OT_ResourceLibraryBlock', description: 'DAM-connected asset download list. The editor picks a single DAM asset as a collection anchor; the block fetches all assets in that collection via Optimizely Graph and renders them as a dense list or card grid with Lucide file-type iconography and native download links.' },
  'callout':          { label: 'CalloutBlock',          cmsKey: 'OT_CalloutBlock',          description: 'Compact semantic inline notification. Six intent types: neutral, info, success, warning, danger, brand. Three variants: filled, bordered, bar. Dismissible with a two-phase kinetic exit — content sweeps right and fades, then the container height collapses.' },
  'divider':          { label: 'DividerBlock',          cmsKey: 'OT_DividerBlock',          description: 'Structural section divider that opens deliberate breathing room between stacked sections. Three treatments: mark (a hairline broken by an editable label or an editorial ornament), glow (a precise luminous rule — a chromatic line of light with a soft bloom above and below), and bleed (atmospheric luminance — an elliptical light seam rising from the boundary). One Tone control spans all three — neutral, brand, accent, spectrum, aurora — plus editor-controlled spacing, weight, and an optional draw-in reveal that rides the shared scroll observer.' },
  'event-listing':    { label: 'EventListingBlock',     cmsKey: 'OT_EventListingBlock',     description: 'CMS-driven listing of Event Pages with three toggleable views: card grid, list (calendar-style date blocks), and a monthly calendar with day agenda. A segmented icon control switches views; type-filter chips and a past-events toggle refine the set. Works across technology, healthcare, legal, and financial events on both canvas and surface grounds. In production, events are fetched at render time from published Event Pages; the showcase uses static fixtures.' },
  'practitioner-listing': { label: 'PractitionerListingBlock', cmsKey: 'OT_PractitionerListingBlock', description: 'CMS-driven, vertical-agnostic people directory pulled from Practitioner Profiles. Grid (cards) or list (rows) layout, client-side search across name / credentials / specialty, and three multi-select filters — specialty, location, and language — derived dynamically from the loaded set, never a fixed list. Values OR within a filter and AND across filters. Scope it to one vertical with the Group Tag Filter (e.g. "medical"). Squared portraits with a chromatic brand bloom and a designed initials fallback. In production, practitioners are fetched at render time; the showcase uses static fixtures spanning medical, legal, and technology verticals.' },
  'location-listing': { label: 'LocationListingBlock', cmsKey: 'OT_LocationListingBlock', description: 'CMS-driven, vertical-agnostic location directory pulled from Location Profiles. Three toggleable views: a Mapbox dark map paired with a synchronized scrollable location rail (click a marker or rail card to fly + open its popup), an image-plate card grid, and a compact list. Client-side search across name / label / address, and a single-select label filter derived dynamically from the loaded set — never a fixed list, "All" always first. Scope it to one vertical with the Group Tag Filter (e.g. "optimedical"). Custom brand-beacon markers and fully-restyled dark-glass popups. In production, addresses are geocoded via the Mapbox API at render time (24h ISR cache); the showcase uses static fixtures with pre-resolved coordinates, so it makes no API calls.' },
  'content-recommendations': { label: 'ContentRecommendationsBlock', cmsKey: 'OT_ContentRecommendationsBlock', description: 'Personalized content grid from Optimizely Content Recommendations (Idio). The ia.js tracker builds a per-visitor profile and the block fetches recommendations server-side at render time using the delivery key configured on the ThemeManager. Three color schemes. In production, items are personalized per visitor; the showcase uses static sample articles to demonstrate the layout.' },
  'product-recommendations': { label: 'ProductRecommendationsBlock', cmsKey: 'OT_ProductRecommendationsBlock', description: 'Live product recommendations from Optimizely Product Recommendations (Peerius). The engine returns recommendations client-side (via the peerius:recs event) for the configured widget position; the widget renders a card grid with a "Show all" expand. When the engine returns nothing it shows an empty state. In production, recs are live and personalized; the showcase uses static sample products.' },
  'comparison-table': { label: 'ComparisonTableBlock', cmsKey: 'OT_ComparisonTableBlock', description: 'Side-by-side comparison of plans, tiers, or account types. Grouped rows divide the table into named sections. Cells support a Lucide icon, short text, or both — an empty cell renders a dash. One column can be marked as featured to receive the brand-color treatment and a badge. On mobile a column-selector tab bar replaces the full grid, with swipe gesture support.' },
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
  return { title: `${meta.label} — Blocks — Showcase — Site Accelerator` }
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
        eyebrow: 'A better way to work', headline: 'Move at the speed of certainty.',
        body: 'Everything your team needs to launch faster, work smarter, and see what is working in real time.',
        primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' },
        visual: HERO_IMG, visualAlt: HERO_ALT,
      },
      displaySettings: { layout: 'imageRight', color: 'brand', animation: 'none' },
    },
    {
      label: 'Canvas · Image Left',
      content: {
        eyebrow: 'The platform', headline: 'Built for teams who move daily.',
        body: 'Plan, launch, and measure in one place. The platform closes the gap between doing the work and knowing it worked.',
        primaryCtaLabel: 'View the platform', primaryCtaUrl: { default: '#' },
        visual: HERO_IMG, visualAlt: HERO_ALT,
      },
      displaySettings: { layout: 'imageLeft', color: 'canvas', animation: 'none' },
    },
    {
      label: 'Surface · Image Right',
      content: {
        eyebrow: 'The method', headline: 'Precision at every layer.',
        body: 'From the first idea to the thousandth iteration, the platform tracks what matters and surfaces it when you need it.',
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
        eyebrow: 'A better way to work', headline: 'Move at the speed of certainty.',
        body: 'Everything your team needs to launch faster, work smarter, and see what is working in real time.',
        primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', animation: 'none' },
    },
    {
      label: 'Canvas · No image',
      content: {
        eyebrow: 'The platform', headline: 'Built for teams who move daily.',
        body: 'Plan, launch, and measure in one place, so every team works from the same picture.',
        primaryCtaLabel: 'View the platform', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', animation: 'none' },
    },
    {
      label: 'Surface · No image',
      content: {
        eyebrow: 'The method', headline: 'Precision at every layer.',
        body: 'From the first idea to the thousandth iteration, the platform tracks what matters.',
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
    {
      label: 'Parallax', note: 'motion-safe: frame fades while the visual pushes in (scale 1.08 → 1) — depth entrance, no scroll listener',
      content: { eyebrow: 'Animation', headline: 'Parallax entrance.', primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { color: 'surface', animation: 'parallax' },
    },
  ]

  const directions = [
    {
      label: 'Spotlight Bloom · Brand · image right',
      note: 'Text leads; the visual floats as a framed object on a chromatic brand-bloom halo. Not a full-bleed backdrop (that is the Banner).',
      content: { direction: 'spotlight', eyebrow: 'Spotlight', headline: 'A product worth the stage.', body: 'The visual reads as a lit object, not a backdrop, with the headline carrying the fold beside it.', primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' }, secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageRight', color: 'brand', animation: 'none' },
    },
    {
      label: 'Spotlight Bloom · Canvas · image left',
      note: 'Same direction on the canvas ground, visual on the left.',
      content: { direction: 'spotlight', eyebrow: 'Spotlight', headline: 'Lit from within.', body: 'A brand-bloom halo and chromatic shadow lift the framed visual off the ground.', primaryCtaLabel: 'See how', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageLeft', color: 'canvas', animation: 'none' },
    },
    {
      label: 'Editorial Overlap · Surface · image right',
      note: 'A solid headline plate overlaps the contained image edge with a chromatic depth shadow and a number + accent-rule index marker. Image height is capped to keep it compact.',
      content: { direction: 'overlap', eyebrow: 'Feature 01', headline: 'Layers that read as depth.', body: 'The type plate occludes the image edge, separated by a brand-hued shadow.', primaryCtaLabel: 'Explore', primaryCtaUrl: { default: '#' }, secondaryCtaLabel: 'Docs', secondaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageRight', color: 'surface', animation: 'none' },
    },
    {
      label: 'Editorial Overlap · Brand · image left',
      note: 'Plate on the brand ground overlapping a left-aligned image.',
      content: { direction: 'overlap', eyebrow: 'Feature 02', headline: 'Composed, not stacked.', body: 'An asymmetric, magazine-style interlock of type and a contained image.', primaryCtaLabel: 'Explore', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageLeft', color: 'brand', animation: 'none' },
    },
    {
      label: 'Diagonal Split · Brand · image right',
      note: 'A sharp diagonal seam between the brand panel and a contained image; the diagonal edge is accent-lit and the image reveals with a motion-safe slide. Not a full-bleed backdrop (that is the Banner).',
      content: { direction: 'diagonal', eyebrow: 'Introducing', headline: 'Cut a sharper line.', body: 'The color panel meets the image along a lit diagonal seam, energetic but height-stable.', primaryCtaLabel: 'Get started', primaryCtaUrl: { default: '#' }, secondaryCtaLabel: 'Learn more', secondaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageRight', color: 'brand', animation: 'none' },
    },
    {
      label: 'Diagonal Split · Canvas · image left',
      note: 'Mirrored seam on the canvas ground, image on the left.',
      content: { direction: 'diagonal', eyebrow: 'Introducing', headline: 'Angle into the story.', body: 'The accent-lit diagonal follows the clip silhouette automatically, recoloring with the theme.', primaryCtaLabel: 'See how', primaryCtaUrl: { default: '#' }, visual: HERO_IMG, visualAlt: HERO_ALT },
      displaySettings: { layout: 'imageLeft', color: 'canvas', animation: 'none' },
    },
  ]

  return (
    <>
      <BlockHeader slug="hero" />

      <VariantGroup label="Design directions · content field" note="The Hero's Design Direction content field restyles the same content into four distinct compositions. Background color still applies within each. None mimic the Banner (full-bleed photo + scrim/glass overlay)." />
      {directions.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} note={item.note} />
          <OT_HeroBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Color schemes · layout variants" />
      {colorSchemes.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_HeroBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="No image · full-width text panel" note="When no visual is provided the text panel expands to full width." />
      {noImage.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_HeroBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Entrance animations · motion-safe" note="Entrances fire on mount. All degrade to instant display when prefers-reduced-motion is set." />
      {animations.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
            <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
            <span className="text-label text-fg-muted/60">{item.note}</span>
          </div>
          <OT_HeroBlock content={item.content as any} displaySettings={item.displaySettings} />
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
          <OT_CardBlock content={{ Heading: 'Reach the Right People', Eyebrow: 'Targeting', Description: 'Tailor every message to the right audience in a few clicks. No technical help required.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'ghost', border: 'subtle' }} />
          <OT_CardBlock content={{ Heading: 'Test and Learn', Eyebrow: 'Optimization', Description: 'Compare versions side by side and let the results pick the winner. Answers in days, not weeks.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface' }} />
          <OT_CardBlock content={{ Heading: 'Clear Confidence', Eyebrow: 'Insights', Description: 'See what is driving results with metrics that explain themselves. No spreadsheets.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'brand' }} />
          <OT_CardBlock content={{ Heading: 'Easy to Undo', Eyebrow: 'Peace of mind', Description: 'Roll back any change in seconds. Try things boldly, knowing nothing is permanent.', ctaLabel: 'Learn more', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'light' }} />
        </div>
      </div>

      <VariantGroup label="Border variants · no image" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div>
            <span className="font-mono text-label text-fg-muted/50">surface · border: none</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'No Border', Eyebrow: 'Surface', Description: 'Surface fill with no border. Content is defined by background contrast, not a frame.', ctaLabel: 'Explore', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', border: 'none' }} /></div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">surface · border: subtle</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Subtle Border', Eyebrow: 'Surface', Description: '1px at 10% foreground opacity. Barely-there definition for cards that float over dark grounds.', ctaLabel: 'Explore', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', border: 'subtle' }} /></div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">ghost · border: brand</span>
            <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Brand Border', Eyebrow: 'Ghost', Description: '1px teal border signals selection or attention. Works best on ghost fill over a dark section.', ctaLabel: 'Explore', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'ghost', border: 'brand' }} /></div>
          </div>
        </div>
      </div>

      <VariantGroup label="Image: top · 4:3 aspect · surface fill" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Built to Scale', Eyebrow: 'Platform', Description: 'Grow from your first launch to your busiest season without missing a beat. Reliable at any size.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Everything in One View', Eyebrow: 'Insights', Description: 'Every signal in one place. The platform brings your activity, audience, and outcomes together in real time.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Results You Can Act On', Eyebrow: 'Analytics', Description: 'Clear answers, not raw numbers. See what changed, why it mattered, and what to do next. No guesswork.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See how it works', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top' }} />
        </div>
      </div>

      <VariantGroup label="Image: background · scrim · content at bottom" note="Dark gradient from bottom. Text always press-white regardless of fill." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Launch with confidence.', Eyebrow: 'Delivery', Description: 'Every change tracked. Every change reversible.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'Get started', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
          <OT_CardBlock content={{ Heading: 'Measure what matters.', Eyebrow: 'Analytics', Description: 'Real signals, not approximations.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT } as any} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
          <OT_CardBlock content={{ Heading: 'Iterate faster.', Eyebrow: 'Momentum', Description: 'From idea to result in hours.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See the platform', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'background' }} />
        </div>
      </div>

      <VariantGroup label="Image: side · imageSide left and right" note="Stacks vertically on mobile. At md+, image occupies 40% of card width; content fills the rest." />
      <div className="px-md pb-xl lg:px-lg flex flex-col gap-lg">
        <div>
          <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;left&rdquo;</span>
          <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Built for the way you work.', Eyebrow: 'Platform', Description: 'The platform gives your team the tools to move step by step, measure precisely, and respond in real time.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'View the platform', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'side', imageSide: 'left' }} /></div>
        </div>
        <div>
          <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;right&rdquo;</span>
          <div className="mt-sm"><OT_CardBlock content={{ Heading: 'Confidence at every decision point.', Eyebrow: 'Analytics', Description: 'Every test runs with clear measurement, sensible defaults, and results you can trust at a glance.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Explore analytics', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'side', imageSide: 'right' }} /></div>
        </div>
      </div>

      <VariantGroup label="image:float · content slides up over the image bottom" note="Content box overlaps the lower portion of the image with the card's fill background." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Always on, always ready.', Eyebrow: 'Reliability', Description: '99.99% uptime across every region, backed by automatic failover.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'View uptime', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'float' }} />
          <OT_CardBlock content={{ Heading: 'Signal in the noise.', Eyebrow: 'Analytics', Description: 'The platform sifts through the noise so your team sees only what matters.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'See the dashboard', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'brand', imageStyle: 'float' }} />
          <OT_CardBlock content={{ Heading: 'Fast, everywhere.', Eyebrow: 'Performance', Description: 'The platform runs close to your audience wherever they are, keeping every experience quick and responsive.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Explore performance', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'float', border: 'subtle' }} />
        </div>
      </div>

      <VariantGroup label="Hover interactions · lift · glow · image zoom" note="Depth appears in motion, not at rest. All effects use transform and box-shadow only." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Lift on hover.', Eyebrow: 'hover:lift', Description: 'Card rises 4px with a faint teal ambient shadow.', image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'lift' }} />
          <OT_CardBlock content={{ Heading: 'Glow on hover.', Eyebrow: 'hover:glow', Description: 'Teal shadow blooms beneath the card on hover — no translate, pure atmospheric depth.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'glow' }} />
          <OT_CardBlock content={{ Heading: 'Float + lift.', Eyebrow: 'float · hover:lift', Description: 'Float layout with lift interaction — the content overlap and the hover rise compound.', image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'float', hover: 'lift' }} />
        </div>
      </div>

      <VariantGroup label="Isometric tilt · hover:tilt" note="Solid two-layer offset shadow creates a visible isometric back-face at rest. Perspective rotation activates on hover. prefers-reduced-motion: shadow depth only, no transform." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Raised by design.', Eyebrow: 'hover:tilt · surface', Description: 'The isometric shadow is visible at rest — depth is structural, not just interactive.', ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', border: 'subtle', hover: 'tilt' }} />
          <OT_CardBlock content={{ Heading: 'Volume from conviction.', Eyebrow: 'hover:tilt · image', Description: 'Top image card with perspective tilt. The 3D rotation compounds with the solid iso shadow on hover.', image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'surface', imageStyle: 'top', hover: 'tilt' }} />
          <OT_CardBlock content={{ Heading: 'Brand depth.', Eyebrow: 'hover:tilt · brand', Description: 'Brand fill with tilt interaction. The dark offset shadow reads as the back face of a raised brand slab.', ctaLabel: 'Interact', ctaUrl: { default: '#' } } as any} displaySettings={{ fill: 'brand', hover: 'tilt' }} />
        </div>
      </div>

      <VariantGroup label="Detail options · accent line · noise texture" note="Accent line: 3px top edge using --ot-accent. Noise: SVG feTurbulence grain at 7% overlay opacity." />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <OT_CardBlock content={{ Heading: 'Top accent, surface fill.', Eyebrow: 'accentLine:top', Description: 'A 3px brand-teal rule on the top edge anchors the card\'s hierarchy.' } as any} displaySettings={{ fill: 'surface', accentLine: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Top accent, brand fill.', Eyebrow: 'accentLine:top · fill:brand', Description: 'On brand panels the accent shifts to press-white at 40% — still readable.' } as any} displaySettings={{ fill: 'brand', accentLine: 'top' }} />
          <OT_CardBlock content={{ Heading: 'Noise on dark.', Eyebrow: 'noise:true · fill:surface', Description: 'Grain overlay at 7% via mix-blend-mode: overlay. Tactile mineral depth.' } as any} displaySettings={{ fill: 'surface', border: 'subtle', noise: true }} />
        </div>
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Primary Text ─────────────────────────────────────────────────────────────

function PrimaryTextShowcase() {
  const sizes = [
    { content: { eyebrow: 'The platform', headline: 'Speed that compounds.' }, displaySettings: { size: 'display', color: 'canvas', alignment: 'left', headerEffect: 'none' } },
    { content: { eyebrow: 'Integrations', headline: 'Connect everything you already use.' }, displaySettings: { size: 'headline', color: 'canvas', alignment: 'left', headerEffect: 'none' } },
    { content: { eyebrow: 'Customers', headline: 'Trusted by teams who ship fast.' }, displaySettings: { size: 'title', color: 'canvas', alignment: 'left', headerEffect: 'none' } },
    { content: { headline: 'Section tag · Supporting context' }, displaySettings: { size: 'label', color: 'canvas', alignment: 'left', headerEffect: 'none' } },
  ]

  const colors = [
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'brand',   alignment: 'left', headerEffect: 'none' } },
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'canvas',  alignment: 'left', headerEffect: 'none' } },
    { content: { eyebrow: 'The method', headline: 'Precision at every layer.' }, displaySettings: { size: 'headline', color: 'surface', alignment: 'left', headerEffect: 'none' } },
  ]

  // The consolidated Header Effect set — one dropdown, all token-derived and
  // mode-robust (work on any color scheme, in dark and light).
  const effects = [
    { content: { eyebrow: 'Gradient',         headline: 'Build once, ship everywhere.' }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'gradient' } },
    { content: { eyebrow: 'Animated Gradient', headline: 'Momentum you can see.'        }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'animatedGradient' } },
    { content: { eyebrow: '3D Depth',          headline: 'Depth is a statement.'       }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'depth3d' } },
    { content: { eyebrow: 'Glitch',            headline: 'Interrupt the signal.'       }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'glitch' } },
    { content: { eyebrow: 'Outline',           headline: 'Drawn in wire.'              }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'outline' } },
    { content: { eyebrow: 'Neon',              headline: 'After hours.'                }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'neon' } },
    { content: { eyebrow: 'Highlight',         headline: 'Call it out.'                }, displaySettings: { size: 'headline', color: 'canvas', alignment: 'left', headerEffect: 'highlight' } },
    { content: { eyebrow: 'Glow',              headline: 'Lit from within.'            }, displaySettings: { size: 'display',  color: 'canvas', alignment: 'left', headerEffect: 'glow' } },
  ]

  return (
    <>
      <BlockHeader slug="primary-text" />

      <VariantGroup label="Sizes · canvas · left" />
      {sizes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`size: "${item.displaySettings.size}"`} />
          <OT_PrimaryTextBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Color schemes · headline · left · same copy" />
      {colors.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`color: "${item.displaySettings.color}"`} />
          <OT_PrimaryTextBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Header effects · one dropdown · canvas" note="Every effect is token-derived (works on any brand/accent scheme) and handles both dark and light mode. Toggle the showcase theme to see each adapt. Animated Gradient and Glitch animate; both degrade under prefers-reduced-motion." />
      {effects.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`effect: "${item.displaySettings.headerEffect}"`} />
          <OT_PrimaryTextBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Heading level · H1 vs H2" note="Set headingLevel to H1 when this block is the primary heading on the page. Visually identical — the semantic tag changes for SEO and accessibility." />
      <div className="border-t border-fg/5">
        <VariantLabel label='headingLevel: "h2" (default)' />
        <OT_PrimaryTextBlock content={{ eyebrow: 'The platform', headline: 'Speed that compounds into advantage.' } as any} displaySettings={{ size: 'headline', color: 'canvas', alignment: 'left' }} />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='headingLevel: "h1" — page title' />
        <OT_PrimaryTextBlock content={{ eyebrow: 'The platform', headline: 'Speed that compounds into advantage.', headingLevel: 'h1' } as any} displaySettings={{ size: 'headline', color: 'canvas', alignment: 'left' }} />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteShowcase() {
  const colors = [
    { content: { quote: 'The platform gave us the confidence to move faster without second-guessing every decision. We went from monthly launches to weekly.', attributionName: 'Sarah Chen', attributionTitle: 'VP Operations, Meridian' }, displaySettings: { color: 'brand',   alignment: 'left', size: 'large' } },
    { content: { quote: 'The platform gave us the confidence to move faster without second-guessing every decision. We went from monthly launches to weekly.', attributionName: 'Sarah Chen', attributionTitle: 'VP Operations, Meridian' }, displaySettings: { color: 'canvas',  alignment: 'left', size: 'large' } },
    { content: { quote: 'The platform gave us the confidence to move faster without second-guessing every decision. We went from monthly launches to weekly.', attributionName: 'Sarah Chen', attributionTitle: 'VP Operations, Meridian' }, displaySettings: { color: 'surface', alignment: 'left', size: 'large' } },
  ]

  const sizes = [
    { content: { quote: 'We went from reviewing results once a quarter to improving continuously. The platform is what made that possible.', attributionName: 'Marcus Reid', attributionTitle: 'COO, Folio' }, displaySettings: { size: 'large', color: 'canvas', alignment: 'left' } },
    { content: { quote: 'We went from reviewing results once a quarter to improving continuously. The platform is what made that possible.', attributionName: 'Marcus Reid', attributionTitle: 'COO, Folio' }, displaySettings: { size: 'small', color: 'canvas', alignment: 'left' } },
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
          <OT_QuoteBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Sizes · canvas · left · same copy" />
      {sizes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`size: "${item.displaySettings.size}"`} />
          <OT_QuoteBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Alignment · canvas · large · same copy" />
      {alignments.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`alignment: "${item.displaySettings.alignment}"`} />
          <OT_QuoteBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Rich Text ────────────────────────────────────────────────────────────────
//
// RichText renders Slate.js JSON ({ type:'richText', children:[…] }), NOT an HTML
// string — passing { html } leaves the preview blank. These small builders keep
// the dummy content readable while producing the exact node shape the SDK expects.
// (See cms/components/OT_RichTextBlock.tsx → content.content?.json.)

type RTText = { text: string; bold?: boolean; italic?: boolean }
type RTNode = { type: string; children: Array<RTNode | RTText> }
const txt  = (text: string): RTText => ({ text })
const bold = (text: string): RTText => ({ text, bold: true })
const para = (...kids: Array<RTText | string>): RTNode => ({ type: 'paragraph',     children: kids.map(k => (typeof k === 'string' ? txt(k) : k)) })
const h1   = (s: string): RTNode => ({ type: 'heading-one',   children: [txt(s)] })
const h2   = (s: string): RTNode => ({ type: 'heading-two',   children: [txt(s)] })
const h3   = (s: string): RTNode => ({ type: 'heading-three', children: [txt(s)] })
const ul   = (...items: string[]): RTNode => ({ type: 'bulleted-list', children: items.map(s => ({ type: 'list-item', children: [txt(s)] })) })
const quote = (s: string): RTNode => ({ type: 'quote', children: [{ type: 'paragraph', children: [txt(s)] }] })
const rule = (): RTNode => ({ type: 'hr', children: [txt('')] })
const doc  = (...nodes: RTNode[]) => ({ type: 'richText', children: nodes })

const RT_FULL = doc(
  h2('Clarity, accelerated.'),
  para('The platform was built for teams who move faster than the quarterly plan. We saw a gap between the pace at which modern teams work and the tools available to measure, refine, and respond to it. We closed it.'),
  para('The platform brings together signals from every part of your work: what you launch, how your audience responds, and what changes along the way. It surfaces the patterns that matter before they become problems.'),
  h3('Confidence, not guesswork'),
  para('Decisions are made where the work happens, not in a meeting three weeks later. The platform gives your whole team a shared language for testing ideas with ', bold('real confidence'), ' backed by real evidence.'),
  ul(
    'Reach the right audience in minutes, not weeks.',
    'Run several tests at once without them interfering.',
    'Undo any change with a single click.',
  ),
  quote('We moved from reviewing results once a quarter to improving continuously. The platform is what made that possible.'),
)

const RT_PROSE = doc(
  para('The platform was built for teams who move faster than the quarterly plan. We saw a gap between the pace at which modern teams work and the tools available to measure, refine, and respond to it.'),
  para('The platform brings together signals from every part of your work: what you launch, how your audience responds, and what changes along the way. It surfaces the patterns that matter before they become problems.'),
  para('Decisions are made where the work happens. The platform gives your whole team a shared language for testing ideas with real confidence backed by real evidence.'),
)

const RT_STRUCTURED = doc(
  h2('Why the platform'),
  para('Speed that compounds. The faster you can measure, the faster you can improve.'),
  h3('For delivery teams'),
  para('A full history of every change. Targeted launches. Quality checks built right in.'),
  h3('For planning teams'),
  para('Tools that connect directly to your data. No more waiting three weeks for results from work you have already moved past.'),
)

// Long-form article with H1 title — feeds the TOC treatment demo.
// The TOC panel auto-inserts after the first heading (Option B).
const RT_TOC_ARTICLE = doc(
  h1('A Practical Guide to Continuous Improvement'),
  para('Continuous improvement gives teams a clear way to decide what to change and when. This guide covers the habits, tradeoffs, and tooling choices that matter most as you grow.'),
  h2('What is continuous improvement?'),
  para('Continuous improvement is the practice of making small, measured changes and learning from each one, rather than betting everything on a single big launch. You make a change, watch how it lands, and decide what to do next.'),
  para('At their simplest, these are ', bold('small bets you can reverse'), '. At scale, they become the foundation for targeted launches, gradual rollouts, side-by-side tests, and quick recoveries.'),
  h2('Audiences and segments'),
  para('The power of the approach comes from targeting — the ability to show a change to a specific audience before everyone sees it. You can target by location, behaviour, or any detail you already know about your audience.'),
  para('Segments are reusable groups: "new customers", "early adopters", "returning visitors". Once defined, the same segment is available everywhere, keeping your decisions consistent.'),
  h2('Testing and confidence'),
  para('Side-by-side tests are how you learn what works. A control group and a test group run at the same time, each seeing a different version, so you can compare results fairly.'),
  para('Confidence requires enough responses before you read the results. Start early, let the data build, and resist the urge to call a winner before you have enough to be sure.'),
  h2('Rollout strategies'),
  para('A gradual rollout starts with a small share of your audience and expands as confidence grows. The platform lets you set the share with a slider and update it in real time — no waiting, no help needed.'),
  para('A staged rollout pairs a change with a checkpoint: the group that sees the new version is watched closely before it reaches everyone. The same control becomes your way to step back.'),
  h2('Quick recovery'),
  para('Every change is reversible. If something is not landing the way you hoped, switch it off: the change is removed in seconds, with no scramble, no freeze, and no late-night escalation.'),
)

const RT_CALLOUT = doc(
  h2('Before you call a winner'),
  para('Calling a test too early is the most common experimentation mistake. A result that looks significant at 200 sessions often disappears by 2,000.'),
  ul(
    '95% confidence threshold eliminates most false positives.',
    'Run tests across at least two full business cycles.',
    'Aim for 1,000+ sessions per variant before drawing conclusions.',
  ),
)

const RT_GLOW_FRAME_CONTENT = doc(
  h2('The case for continuous improvement'),
  para('We believe the next era of digital experience belongs to the teams that can test, learn, and move faster than the competition, without sacrificing the quality their audience expects.'),
  para('The platform is built around one question: ', bold('how do we help your team act on evidence faster?'), ' Every change has a record, every decision is reversible, and every result builds toward the next experiment.'),
)

const RT_OFFSET_STORY = doc(
  h2('Built for teams that move fast'),
  para('Most tools slow you down at the moment that matters most. You have a signal, you need to act, and the platform you rely on puts three forms and a meeting between you and the change.'),
  para('We closed that gap. From insight to change in minutes, with a full history of every decision and the ability to reverse any of them in a single click.'),
)

function RichTextShowcase() {
  const colorSchemes: Array<{ content: any; displaySettings: DS }> = [
    { content: { content: { json: RT_FULL } }, displaySettings: { color: 'canvas',  size: 'editorial', alignment: 'left', treatment: 'standard' } },
    { content: { content: { json: RT_FULL } }, displaySettings: { color: 'surface', size: 'editorial', alignment: 'left', treatment: 'standard' } },
    { content: { content: { json: RT_FULL } }, displaySettings: { color: 'brand',   size: 'editorial', alignment: 'left', treatment: 'standard' } },
  ]

  const leadTreatments = [
    { label: 'Standard',        note: 'Faithful prose rendering (default)',                     content: { content: { json: RT_PROSE } }, displaySettings: { color: 'canvas', treatment: 'standard', size: 'editorial', alignment: 'left' } },
    { label: 'Lead — p first',  note: 'First paragraph promoted to deck scale, weight 500',    content: { content: { json: RT_PROSE } }, displaySettings: { color: 'canvas', treatment: 'lead',     size: 'editorial', alignment: 'left' } },
    { label: 'Lead — h2 first', note: 'Same treatment when content starts with a heading',     content: { content: { json: RT_FULL  } }, displaySettings: { color: 'canvas', treatment: 'lead',     size: 'editorial', alignment: 'left' } },
  ]

  return (
    <>
      <BlockHeader slug="rich-text" />

      <VariantGroup label="Background Color · same copy across three grounds" />
      {colorSchemes.map((item, i) => (
        <div key={i} className="border-t border-fg/5">
          <VariantLabel label={`color: "${item.displaySettings.color}"`} />
          <OT_RichTextBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Lead treatment · first paragraph as editorial deck" note="Promotes the opening paragraph to deck scale before the body begins." />
      {leadTreatments.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
            <span className="font-mono text-label text-fg-muted/50">treatment: &ldquo;{item.displaySettings.treatment}&rdquo;</span>
            <span className="text-label text-fg-muted/40">{item.note}</span>
          </div>
          <OT_RichTextBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup
        label="Contents — section navigator"
        note="treatment: &ldquo;toc&rdquo; — h2 headings auto-generate a navigable Contents panel. Each h2 in the body gets an anchor id and a back-to-Contents arrow."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "toc" · canvas' note="H1 title → Contents panel → body with 5 anchored H2s" />
        <OT_RichTextBlock
          content={{ content: { json: RT_TOC_ARTICLE } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'toc' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "toc" · surface' note="Surface ground — same content" />
        <OT_RichTextBlock
          content={{ content: { json: RT_TOC_ARTICLE } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'toc' }}
        />
      </div>

      <VariantGroup
        label="3D Layers Extrude"
        note="treatment: &ldquo;layers_3d&rdquo; — hard multi-layer 45° box-shadow extrude. Mirrors the ot-depth-extrude text effect as a container. Dark mode: brand shadows darken to near-black. Light mode: shadows lift to lighter brand tones."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "layers_3d" · canvas' />
        <OT_RichTextBlock
          content={{ content: { json: RT_CALLOUT } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'layers_3d' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "layers_3d" · surface' />
        <OT_RichTextBlock
          content={{ content: { json: RT_CALLOUT } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'layers_3d' }}
        />
      </div>

      <VariantGroup
        label="Gradient Border Glow Frame"
        note="treatment: &ldquo;glow_frame&rdquo; — brand → accent gradient border + blurred chromatic halo glow behind the card via ::before. For vision statements, strategic highlights, and premium featured content."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "glow_frame" · canvas' />
        <OT_RichTextBlock
          content={{ content: { json: RT_GLOW_FRAME_CONTENT } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'glow_frame' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "glow_frame" · surface' note="Inner panel always bg-canvas regardless of section ground" />
        <OT_RichTextBlock
          content={{ content: { json: RT_GLOW_FRAME_CONTENT } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'glow_frame' }}
        />
      </div>

      <VariantGroup
        label="Layered Depth Offset"
        note="treatment: &ldquo;layered_depth&rdquo; — brand depth panel offset lower-right behind the content card. Depth through layering without complexity. Desktop only; collapses gracefully on mobile."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "layered_depth" · canvas' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'layered_depth' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "layered_depth" · surface' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'layered_depth' }}
        />
      </div>

      <VariantGroup
        label="Premium Float Elevation"
        note="treatment: &ldquo;float_elevation&rdquo; — compound multi-layer chromatic elevation shadow. No background panel; depth is expressed purely through shadow, rendering the card as a hovering object above the surface."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "float_elevation" · canvas' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'float_elevation' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "float_elevation" · surface' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'float_elevation' }}
        />
      </div>

      <VariantGroup
        label="Sidebar Accent Rail"
        note="treatment: &ldquo;sidebar_accent&rdquo; — brand-colored structural rail anchored to the left of the content card, extending slightly above and below. Implemented as a positioned element, not a border. Desktop only."
      />
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "sidebar_accent" · canvas' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'canvas', size: 'editorial', alignment: 'left', treatment: 'sidebar_accent' }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='treatment: "sidebar_accent" · surface' />
        <OT_RichTextBlock
          content={{ content: { json: RT_OFFSET_STORY } } as any}
          displaySettings={{ color: 'surface', size: 'editorial', alignment: 'left', treatment: 'sidebar_accent' }}
        />
      </div>

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
              <OT_ImageBlock content={item.content as any} displaySettings={item.displaySettings} />
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
            <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'A close look at the systems that power the platform.' } as any} displaySettings={{ ratio: 'r16_9', captionPosition: 'inset' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Caption below</span>
              <span className="text-label text-fg-muted/60">Label-scale text beneath the image</span>
            </div>
            <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'A close look at the systems that power the platform.' } as any} displaySettings={{ ratio: 'r16_9', captionPosition: 'below' }} />
          </div>
        </div>
      </div>

      <VariantGroup label="Aspect ratios" />
      <div className="px-md pb-xl lg:px-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {(['r16_9', 'r4_3', 'r3_2', 'r1_1'] as const).map(ratio => (
            <div key={ratio}>
              <p className="text-label tracking-label uppercase text-brand font-semibold mb-sm">{ratio.replace('r', '').replace('_', ':')}</p>
              <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT } as any} displaySettings={{ ratio }} />
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
              <OT_ImageBlock content={item.content as any} displaySettings={item.displaySettings} />
            </div>
          ))}
        </div>
      </div>

      <VariantGroup label="Animate · scroll-triggered wipe reveal" note="Teal bar sweeps right; image follows on its heels via clip-path. Fires once on IntersectionObserver entry. Respects prefers-reduced-motion." />
      <div className="px-md pb-xl lg:px-lg">
        <OT_ImageBlock content={{ image: IMG_SRC, alt: IMG_ALT, caption: 'Precision at every layer.' } as any} displaySettings={{ ratio: 'r16_9', animate: true, frame: 'offset', captionPosition: 'inset' }} />
      </div>

      <VariantGroup label="Editorial layout · 2-column" note="Populate any editorial field (eyebrow, heading, body, CTA) and the block auto-switches to a 55/45 two-column grid. All frame and overlay treatments still apply. Text always stacks above media on mobile." />
      <div className="px-md pb-xl lg:px-lg flex flex-col gap-2xl">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Media right (Default)</span>
            <span className="text-label text-fg-muted/60">mediaSide: right · frame: glow · shadow</span>
          </div>
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: IMG_ALT, eyebrow: 'Infrastructure', heading: 'Precision at every layer, at any scale.', ctaUrl: { default: '#' }, ctaLabel: 'View architecture' } as any}
            displaySettings={{ ratio: 'r16_9', frame: 'glow', shadow: true, mediaSide: 'right' }}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Media left</span>
            <span className="text-label text-fg-muted/60">mediaSide: left · frame: offset</span>
          </div>
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: IMG_ALT, eyebrow: 'Platform', heading: 'Visual quality that validates itself.', ctaUrl: { default: '#' }, ctaLabel: 'See the platform' } as any}
            displaySettings={{ ratio: 'r16_9', frame: 'offset', mediaSide: 'left' }}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Eyebrow + heading only · no CTA</span>
            <span className="text-label text-fg-muted/60">Minimal editorial — CTA is optional</span>
          </div>
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: IMG_ALT, eyebrow: 'Analytics', heading: 'Every signal. Every layer. Real time.' } as any}
            displaySettings={{ ratio: 'r16_9', mediaSide: 'left' }}
          />
        </div>
      </div>

      <VariantGroup label="Lightbox · click to expand" note="A zoom cursor and expand icon appear on hover. Clicking opens a full-screen modal with backdrop blur. Ideal for architecture diagrams and detail-rich images. Closes on Escape, backdrop click, or the × button." />
      <div className="px-md pb-xl lg:px-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Lightbox + glow</span>
            <span className="text-label text-fg-muted/60">lightbox: true · frame: glow · ratio: 16:9</span>
          </div>
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: 'Platform architecture diagram', caption: 'Click to view at full resolution' } as any}
            displaySettings={{ ratio: 'r16_9', frame: 'glow', shadow: true, captionPosition: 'below', lightbox: true }}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Lightbox + animate</span>
            <span className="text-label text-fg-muted/60">lightbox: true · animate: true · ratio: 16:9</span>
          </div>
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: 'Content pipeline performance metrics', caption: 'Scroll to reveal, click to zoom' } as any}
            displaySettings={{ ratio: 'r16_9', animate: true, captionPosition: 'below', lightbox: true }}
          />
        </div>
      </div>
    </>
  )
}

// ─── Video ────────────────────────────────────────────────────────────────────

const VIDEO_YT  = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const VIDEO_VM  = 'https://vimeo.com/148751763'

function VideoShowcase() {
  const treatments: Array<{ label: string; note: string; content: any; displaySettings: DS }> = [
    { label: 'Clean',           note: 'No treatments — baseline',                                  content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9' } },
    { label: 'Frame: offset',   note: 'Bold teal backing block',                                   content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'offset' } },
    { label: 'Frame: glow',     note: 'Inset teal ring + outer ambient bloom',                    content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'glow' } },
    { label: 'Overlay',         note: 'Brand teal at 40% opacity, multiply blend',                content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9', overlay: true } },
    { label: 'Glow + Overlay',  note: 'Atmospheric — teal wash unifies tone, glow defines edge',  content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'glow', overlay: true } },
    { label: 'Offset + Overlay',note: 'Bold — teal backing anchors frame',                        content: { src: { default: VIDEO_YT }, title: 'Platform Overview' }, displaySettings: { ratio: 'r16_9', frame: 'offset', overlay: true } },
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
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'Platform Overview' } as any} displaySettings={{ ratio: 'r16_9' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Vimeo</span>
              <span className="text-label text-fg-muted/60">oEmbed thumbnail fetched on mount — shimmer while loading</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_VM }, title: 'Customer Story: Meridian' } as any} displaySettings={{ ratio: 'r16_9' }} />
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
              <OT_VideoBlock content={item.content as any} displaySettings={item.displaySettings} />
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
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'Platform Overview', caption: 'Precision at every layer.' } as any} displaySettings={{ ratio: 'r16_9', captionPosition: 'inset' }} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
              <span className="text-label tracking-label uppercase text-brand font-semibold">Below</span>
              <span className="text-label text-fg-muted/60">Label-scale text beneath the video</span>
            </div>
            <OT_VideoBlock content={{ src: { default: VIDEO_YT }, title: 'Platform Overview', caption: 'Precision at every layer.' } as any} displaySettings={{ ratio: 'r16_9', captionPosition: 'below' }} />
          </div>
        </div>
      </div>
      <div className="pb-xl" />

      <VariantGroup label="Editorial layout · 2-column" note="Populate any editorial field and the block switches to a 55/45 two-column grid. The video thumbnail, play button, and frame treatments all apply unchanged. Text stacks above media on mobile." />
      <div className="px-md pb-xl lg:px-lg flex flex-col gap-2xl">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Media left</span>
            <span className="text-label text-fg-muted/60">mediaSide: left · frame: offset</span>
          </div>
          <OT_VideoBlock
            content={{ videoUrl: VIDEO_YT, title: 'Platform Overview', eyebrow: 'Platform', heading: 'See it in motion, not just on paper.', ctaUrl: { default: '#' }, ctaLabel: 'Watch overview' } as any}
            displaySettings={{ ratio: 'r16_9', frame: 'offset', mediaSide: 'left' }}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-md">
            <span className="text-label tracking-label uppercase text-brand font-semibold">Media right</span>
            <span className="text-label text-fg-muted/60">mediaSide: right · overlay · glow</span>
          </div>
          <OT_VideoBlock
            content={{ videoUrl: VIDEO_YT, title: 'Platform Overview', eyebrow: 'Customer Story', heading: 'How Meridian cut launch time by 40%.', ctaUrl: { default: '#' }, ctaLabel: 'Read the story' } as any}
            displaySettings={{ ratio: 'r16_9', frame: 'glow', overlay: true, mediaSide: 'right' }}
          />
        </div>
      </div>
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

      <VariantGroup label="With header · brand · 4 columns" note="Optional eyebrow + heading sit above the stat row for a full editorial section. Both are optional — omit them for a bare metric row." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ eyebrow: 'By the numbers', heading: 'Built for teams that move fast.', stats: [{ value: '70%', label: 'Less time to publish', context: 'vs. their previous CMS' }, { value: '5x', label: 'More reuse of content', context: 'across channels & markets' }, { value: '40+', label: 'Locales supported', context: 'from one content model' }, { value: '99.99%', label: 'Delivery uptime', context: 'edge-distributed API' }] } as any} displaySettings={{ color: 'brand', columns: '4', animate: false }} />
      </div>

      <VariantGroup label="Color schemes · 3 columns · static" note="Brand is the committed default. Canvas and surface for lighter editorial contexts." />
      {(['brand', 'canvas', 'surface'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_StatBlock content={{ stats: THREE_STATS } as any} displaySettings={{ color, columns: '3', animate: false }} />
        </div>
      ))}

      <VariantGroup label="Column counts · brand · static" note="2-col uses the full display scale — heroic presence for anchor stat moments." />
      <div className="border-t border-fg/5">
        <VariantLabel label='columns: "2"' />
        <OT_StatBlock content={{ stats: [{ value: '$6.4B', label: 'Total loan volume', context: 'originated this year' }, { value: '312K', label: 'Member accounts', context: 'across all regions' }] } as any} displaySettings={{ color: 'brand', columns: '2', animate: false }} />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='columns: "4"' />
        <OT_StatBlock content={{ stats: [{ value: '1.2M', label: 'Claims processed', context: 'last 12 months' }, { value: '98.3%', label: 'Satisfaction rate', context: 'post-claim survey' }, { value: '4.8hr', label: 'Avg. resolution', context: 'from first contact' }, { value: '340+', label: 'Partner carriers', context: 'in our network' }] } as any} displaySettings={{ color: 'brand', columns: '4', animate: false }} />
      </div>

      <VariantGroup label="With icons · brand · 3 columns" note="Icons sit beside the label at 34px / strokeWidth 1.5, muted on brand surfaces." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ stats: [{ value: '40%', label: 'Faster deployment', context: 'vs. baseline', icon: 'zap' }, { value: '99.99%', label: 'Uptime SLA', context: 'across all regions', icon: 'shield' }, { value: '2M+', label: 'Active users', context: 'and growing', icon: 'users' }] } as any} displaySettings={{ color: 'brand', columns: '3', showIcons: true, animate: false }} />
      </div>

      <VariantGroup label="Glass · per-item cards · brand · 4 columns" note="Glass overlay frosts each stat into its own card with a gap between them — the section color shows through. Dividers are dropped in favour of the gaps." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ eyebrow: 'By the numbers', heading: 'Built for teams that move fast.', stats: [{ value: '70%', label: 'Less time to publish', context: 'vs. their previous CMS' }, { value: '5x', label: 'More reuse of content', context: 'across channels & markets' }, { value: '40+', label: 'Locales supported', context: 'from one content model' }, { value: '99.99%', label: 'Delivery uptime', context: 'edge-distributed API' }] } as any} displaySettings={{ color: 'brand', columns: '4', glass: true, animate: false }} />
      </div>

      <VariantGroup label="Animated · brand · 3 columns · icons on" note="Scroll into view to trigger. Sequence: stagger slide-up → dividers draw in → numbers count 0→target over 1.4s → completion pulse." />
      <div className="border-t border-fg/5">
        <OT_StatBlock content={{ stats: [{ value: '40%', label: 'Faster deployment', context: 'vs. baseline', icon: 'zap' }, { value: '99.99%', label: 'Uptime SLA', context: 'across all regions', icon: 'shield' }, { value: '2M+', label: 'Active users', context: 'and growing', icon: 'users' }] } as any} displaySettings={{ color: 'brand', columns: '3', showIcons: true, animate: true }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Feature Grid ─────────────────────────────────────────────────────────────

const FG_ITEMS = [
  { headline: 'Fast by default',           body: 'Every experience loads quickly for your audience, wherever they are. Speed is built in, not bolted on.' },
  { headline: 'Always up to date',         body: 'Changes go live the moment you publish them, with no waiting and no technical help required.' },
  { headline: 'Reach the right people',    body: 'Tailor what each audience sees in a few clicks. Target by location, behaviour, or any detail you already know.' },
  { headline: 'Test several ideas at once', body: 'Run multiple tests side by side and the platform keeps the results clean, with no overlap to untangle.' },
  { headline: 'Confidence built in',       body: 'Clear measurement and sensible defaults tell you when a result is ready to act on, with no spreadsheet needed.' },
  { headline: 'Easy to undo',              body: 'One click reverts any change in seconds, with a full history of who changed what and when.' },
]

function FeatureGridShowcase() {
  return (
    <>
      <BlockHeader slug="feature-grid" />

      <VariantGroup label="Color schemes · 3 columns · grid layout · no icons" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_FeatureGridBlock content={{ features: FG_ITEMS } as any} displaySettings={{ color, layout: 'grid', columns: 'col3', iconStyle: 'none', animate: false }} />
        </div>
      ))}

      <VariantGroup label="Ruled layout · canvas · 2 columns" note="Ruled — 2-col with horizontal divider lines between items." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock content={{ features: FG_ITEMS } as any} displaySettings={{ color: 'canvas', layout: 'ruled', columns: 'col2', iconStyle: 'none', animate: false }} />
      </div>

      <VariantGroup label="With icons · structural style · 3 columns · brand" note="Icons sit above the headline in the structural position." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock
          content={{ features: FG_ITEMS.map((item) => ({ ...item })) } as any}
          displaySettings={{ color: 'brand', layout: 'grid', columns: 'col3', iconStyle: 'structural', feature1Icon: 'zap', feature2Icon: 'globe', feature3Icon: 'bar-chart', feature4Icon: 'sparkles', feature5Icon: 'shield', feature6Icon: 'check-circle', animate: false }}
        />
      </div>

      <VariantGroup label="4 columns · canvas · icon: accent · animated" note="Scroll into view to trigger stagger entrance." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock
          content={{ features: FG_ITEMS } as any}
          displaySettings={{ color: 'canvas', layout: 'grid', columns: 'col4', iconStyle: 'accent', feature1Icon: 'zap', feature2Icon: 'globe', feature3Icon: 'bar-chart', feature4Icon: 'sparkles', feature5Icon: 'shield', feature6Icon: 'check-circle', animate: true }}
        />
      </div>

      <VariantGroup label="With CTAs · ruled layout · canvas" note="Per-feature 'Learn more' links plus a section CTA. Each link carries a 44px min touch target and a focus ring that adapts to the surface color." />
      <div className="border-t border-fg/5">
        <OT_FeatureGridBlock
          content={{
            eyebrow: 'Platform',
            heading: 'Everything in one place',
            subheading: 'Plan, launch, and measure without switching tools.',
            features: FG_ITEMS.slice(0, 4).map(item => ({ ...item, ctaLabel: 'Learn more', ctaUrl: { default: '#' } })),
            ctaLabel: 'See all features',
            ctaUrl: { default: '#' },
          } as any}
          displaySettings={{ color: 'canvas', layout: 'ruled', columns: 'col2', iconStyle: 'none', animate: false }}
        />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Trust Rail (simplified) ──────────────────────────────────────────────────

const TRUST_LOGOS = [
  { imageUrl: '/SVG/northwind.svg',      altText: 'Northwind'      },
  { imageUrl: '/SVG/quanta.svg',         altText: 'Quanta'         },
  { imageUrl: '/SVG/vantage.svg',        altText: 'Vantage'        },
  { imageUrl: '/SVG/mosey-bank.svg',     altText: 'Mosey Bank'     },
  { imageUrl: '/SVG/forge-company.svg',  altText: 'Forge & Company'},
  { imageUrl: '/SVG/atlas-retail.svg',   altText: 'Atlas Retail'   },
  { imageUrl: '/SVG/bloom.svg',          altText: 'Bloom'          },
]

function TrustRailShowcase() {
  return (
    <>
      <BlockHeader slug="trust-rail" />

      <VariantGroup label="Scroll · auto treatment · canvas · compact" note="Seamless CSS marquee with doubled track. Auto forces a theme-matched silhouette (white here, on the dark canvas default). Hover a logo: it grows and the rest dim. Respects prefers-reduced-motion." />
      <div className="border-t border-fg/5">
        <TrustRail
          headline="Trusted by teams who move fast"
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'scroll', treatment: 'auto', background: 'canvas', density: 'compact', size: 'md', glass: false }}
        />
      </div>

      <VariantGroup label="Fade · color treatment · surface" note="Staggered scroll-reveal entrance. Color treatment shows each logo's own hues undimmed — reserve it for a white/light surface." />
      <div className="border-t border-fg/5">
        <TrustRail
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'fade', treatment: 'color', background: 'surface', density: 'comfortable', size: 'lg', glass: false }}
        />
      </div>

      <VariantGroup label="Static · brand · glass overlay" note="Plain grid, no animation. Brand always forces the white silhouette regardless of the treatment setting — full color never reads against a saturated brand fill." />
      <div className="border-t border-fg/5">
        <TrustRail
          headline="Built on trust. Proven at scale."
          logos={TRUST_LOGOS}
          styleOptions={{ motion: 'static', treatment: 'auto', background: 'brand', density: 'spacious', size: 'md', glass: true }}
        />
      </div>

      <VariantGroup label="Logo size ladder · auto · canvas" note="Five size steps (xs–xl) for quick, no-slider size control." />
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <div key={size} className="border-t border-fg/5">
          <VariantLabel label={`size: "${size}"`} />
          <TrustRail
            logos={TRUST_LOGOS}
            styleOptions={{ motion: 'static', treatment: 'auto', background: 'canvas', density: 'compact', size }}
          />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

const ACCORDION_ITEMS = [
  { question: 'How quickly can we get started?', answer: 'Most teams are up and running the same day. There is nothing to install — you sign in, connect your content, and start making changes right away. Our onboarding guide walks you through the first steps in under an hour.' },
  { question: 'Can we run more than one test at a time?', answer: 'Yes. You can run several tests side by side and the platform keeps the results clean, so you always know which change drove which result. There is no manual setup needed to keep them from overlapping.' },
  { question: 'How fast do changes go live?', answer: 'Changes appear the moment you publish them. There is no waiting and no technical help required — what you see in the editor is what your audience sees, almost instantly.' },
  { question: 'How do you decide when a result is ready?', answer: 'The platform watches each test as responses come in and tells you when you have enough to be confident. It guides you away from calling a winner too early, so the decisions you make hold up.' },
  { question: 'What if we need to undo a change?', answer: 'One click reverts any change in seconds. The platform keeps a full history of who changed what and when, so you can always step back to a known good state.' },
]

function AccordionShowcase() {
  return (
    <>
      <BlockHeader slug="accordion" />

      <VariantGroup label="Border styles · canvas · same content" />
      {(['ruled', 'boxed', 'clean'] as const).map(borderStyle => (
        <div key={borderStyle} className="border-t border-fg/5">
          <VariantLabel label={`borderStyle: "${borderStyle}"`} />
          <OT_AccordionBlock content={{ items: ACCORDION_ITEMS.slice(0, 3) } as any} displaySettings={{ color: 'canvas', borderStyle, openMode: 'single', defaultOpen: false }} />
        </div>
      ))}

      <VariantGroup label="Color schemes · ruled · first item open" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_AccordionBlock content={{ items: ACCORDION_ITEMS.slice(0, 3) } as any} displaySettings={{ color, borderStyle: 'ruled', openMode: 'single', defaultOpen: true }} />
        </div>
      ))}

      <VariantGroup label="Multiple open mode · boxed · canvas" note="Items open and close independently — multiple can be open at once." />
      <div className="border-t border-fg/5">
        <OT_AccordionBlock content={{ headline: 'Frequently asked questions', items: ACCORDION_ITEMS } as any} displaySettings={{ color: 'canvas', borderStyle: 'boxed', openMode: 'multiple', defaultOpen: false }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS_CONTENT = [
  { tabLabel: 'Speed', heading: 'Fast for everyone, everywhere', body: 'Every experience loads quickly for your audience, wherever they are. Speed is built into the platform, so you never have to choose between rich content and a fast page.', imageSrc: IMG_SRC, imageAlt: IMG_ALT },
  { tabLabel: 'Testing', heading: 'Test ideas side by side with confidence', body: 'Run multiple tests at once. The platform keeps the results clean and tells you when each one is ready to act on — no spreadsheets required.' },
  { tabLabel: 'Targeting',   heading: 'Reach the right audience every time', body: 'Tailor what each audience sees in a few clicks. Target by location, behaviour, or any detail you already know, and the right experience reaches the right people instantly.' },
  { tabLabel: 'Insights', heading: 'A full history and clear reporting', body: 'Every change, result, and update is recorded with the time, the person, and the context. Real-time dashboards surface the patterns that matter before they become problems.' },
]

function TabsShowcase() {
  return (
    <>
      <BlockHeader slug="tabs" />

      <VariantGroup label="Tab styles · canvas · top position · text only" />
      {(['underline', 'pill', 'buttonGroup'] as const).map(tabStyle => (
        <div key={tabStyle} className="border-t border-fg/5">
          <VariantLabel label={`tabStyle: "${tabStyle}"`} />
          <OT_TabsBlock content={{ tabs: TABS_CONTENT } as any} displaySettings={{ tabStyle, tabPosition: 'top', color: 'canvas', contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
        </div>
      ))}

      <VariantGroup label="Color schemes · underline · top · text only" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <OT_TabsBlock content={{ tabs: TABS_CONTENT.slice(0, 3) } as any} displaySettings={{ tabStyle: 'underline', tabPosition: 'top', color, contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
        </div>
      ))}

      <VariantGroup label="Image right · underline · canvas" note="Content layout with image panel on the right side of the tab panel." />
      <div className="border-t border-fg/5">
        <OT_TabsBlock content={{ tabs: TABS_CONTENT } as any} displaySettings={{ tabStyle: 'underline', tabPosition: 'top', color: 'canvas', contentLayout: 'imageRight', triggerAlign: 'left', autoPlay: 'off' }} />
      </div>

      <VariantGroup label="Side position · pill · canvas" note="Tab triggers stack vertically on the left side of the panel." />
      <div className="border-t border-fg/5">
        <OT_TabsBlock content={{ tabs: TABS_CONTENT } as any} displaySettings={{ tabStyle: 'pill', tabPosition: 'side', color: 'canvas', contentLayout: 'textOnly', triggerAlign: 'left', autoPlay: 'off' }} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Blog Feed (simplified) ───────────────────────────────────────────────────

const MOCK_POSTS: BlogFeedPost[] = [
  { _metadata: { key: 'sc-post-1', published: '2026-05-15T09:00:00Z', url: { default: '/blog/architecture-sub-millisecond-delivery' } }, headline: 'Built for Speed: How We Keep Every Experience Fast at Any Scale', topic: 'insights', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop' } }, authorRef: { name: 'Nadia Okafor' }, readTime: '8 min read' },
  { _metadata: { key: 'sc-post-2', published: '2026-05-10T08:00:00Z', url: { default: '/blog/future-of-personalization' } }, headline: 'The Future of Personalization: How AI Is Reshaping Customer Experiences', topic: 'innovation', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop' } }, authorRef: { name: 'Marcus Webb' }, readTime: '5 min read' },
  { _metadata: { key: 'sc-post-3', published: '2026-05-06T10:30:00Z', url: { default: '/blog/zero-downtime-deployments' } }, headline: 'Why Continuous Improvement Is the Foundation of Modern Teams', topic: 'resources', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop' } }, authorRef: { name: 'Priya Nair' }, readTime: '6 min read' },
  { _metadata: { key: 'sc-post-4', published: '2026-04-28T14:00:00Z', url: { default: '/blog/observability-trends-2026' } }, headline: 'Measurement in 2026: Five Trends Redefining How Teams Track What Works', topic: 'news', featuredImage: undefined, authorRef: { name: 'James Okonkwo' }, readTime: '4 min read' },
  { _metadata: { key: 'sc-post-5', published: '2026-04-20T11:00:00Z', url: { default: '/blog/experiment-design' } }, headline: 'Testing That Actually Works: A Practical Guide for Every Team', topic: 'leadership', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop' } }, authorRef: { name: 'Nadia Okafor' }, readTime: '7 min read' },
  { _metadata: { key: 'sc-post-6', published: '2026-04-14T09:30:00Z', url: { default: '/blog/sdk-internals' } }, headline: 'Behind the Scenes: How We Made the Platform 60% Faster', topic: 'stories', featuredImage: undefined, authorRef: { name: 'Marcus Webb' }, readTime: '9 min read' },
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

      <VariantGroup label="Pagination · canvas · pageSize 3" note="6 posts at 3 per page → 2 pages. The result count is an aria-live region (announced on page/filter change) and the pagination controls meet the 44px touch target." />
      <div className="border-t border-fg/5">
        <BlogFeedBlock posts={MOCK_POSTS} topics={['insights', 'innovation', 'resources', 'news', 'leadership', 'stories']} pageSize={3} styleOptions={{ color: 'canvas', columns: 'col3', headingSize: 'headline' }} />
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
            <OT_ButtonBlock content={{ label: v === 'brand' ? 'Get started' : v === 'accent' ? 'Explore' : v === 'ghost' ? 'Learn more' : v === 'signal' ? 'See it' : v === 'hover-fill' ? 'Free trial' : 'Platform', url: { default: '#' } } as any} displaySettings={{ variant: v }} />
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
          } as any}
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
          } as any}
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
          } as any}
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
          } as any}
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
          } as any}
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
          } as any}
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
        body: { html: '<p>Everything your team needs to launch faster, work smarter, and see what is working in real time.</p>' },
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'See pricing', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Center · Scrim · Large',
      content: {
        heading: 'Every idea. Every answer. One platform.',
        eyebrow: 'The platform advantage',
        body: { html: '<p>Planning, testing, and measurement in one place, so your team closes the loop between doing the work and knowing it worked.</p>' },
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
        body: { html: '<p>From the first idea to the thousandth iteration, the platform tracks what matters and surfaces it when you need it.</p>' },
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
        eyebrow: 'The platform',
        body: { html: '<p>Stop launching and hoping. Start launching and knowing. Real-time data means every decision is an informed one.</p>' },
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'See pricing', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'glass', alignment: 'center', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Center · Glass · Large',
      content: {
        heading: 'The platform your team has been asking for.',
        eyebrow: 'Enterprise ready',
        body: { html: '<p>SOC 2 Type II, a 99.99% uptime guarantee, and support built for scale. Made for teams that can\'t afford to guess.</p>' },
        backgroundImage: BANNER_IMG_B,
        primaryCtaLabel: 'Talk to sales', primaryCtaUrl: { default: '#' },
        secondaryCtaLabel: 'Security overview', secondaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'brand', treatment: 'glass', alignment: 'center', size: 'large', imageBlend: 'multiply' },
    },
    {
      label: 'Canvas · Left · Glass · Large',
      content: {
        heading: 'From idea to insight in under an hour.',
        eyebrow: 'Speed of certainty',
        backgroundImage: BANNER_IMG_A,
        primaryCtaLabel: 'Start testing', primaryCtaUrl: { default: '#' },
      },
      displaySettings: { color: 'canvas', treatment: 'glass', alignment: 'left', size: 'large', imageBlend: 'overlay' },
    },
    {
      label: 'Brand · Left · Glass · Compact',
      content: {
        heading: 'Launch once. Learn forever.',
        eyebrow: 'Continuous improvement',
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
          <OT_BannerBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Glass treatment · color variants · with background image" note="Lighter scrim lets the image breathe. Content sits inside a frosted glass panel. Brand variant uses teal-tinted glass." />
      {glassVariants.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_BannerBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="No image · flat color fallback" note="When no backgroundImage is provided the scrim fills the section as a flat color. Fully intentional — works as a standalone CTA section." />
      {noImageVariants.map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_BannerBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}

      <VariantGroup label="Heading level · H1 vs H2" note="Set headingLevel to H1 when the banner is the first and only heading on the page (e.g. a campaign landing page). Visually identical — only the semantic tag changes." />
      <div className="border-t border-fg/5">
        <VariantLabel label='headingLevel: "h2" (default)' />
        <OT_BannerBlock content={{ heading: 'Move at the speed of certainty.', eyebrow: 'Section heading', backgroundImage: BANNER_IMG_A, primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' } } as any} displaySettings={{ color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'large', imageBlend: 'overlay' }} />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label='headingLevel: "h1" — page title' />
        <OT_BannerBlock content={{ heading: 'Move at the speed of certainty.', eyebrow: 'Page title', headingLevel: 'h1', backgroundImage: BANNER_IMG_A, primaryCtaLabel: 'Book a demo', primaryCtaUrl: { default: '#' } } as any} displaySettings={{ color: 'canvas', treatment: 'scrim', alignment: 'center', size: 'large', imageBlend: 'overlay' }} />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Resource Library ─────────────────────────────────────────────────────────

const MOCK_ASSETS = [
  { title: 'Platform Overview and Getting Started Guide',  url: '#', extension: 'pdf',  fileSize: 2_412_000, description: 'A complete introduction for new teams.', tags: ['Guide', 'Platform'] },
  { title: 'Q4 2024 Analyst Report',                  url: '#', extension: 'pdf',  fileSize: 890_000,   description: null, tags: ['Finance', 'Report'] },
  { title: 'Integration Guide — Connecting Your Tools', url: '#', extension: 'docx', fileSize: 345_000,   description: null, tags: ['Developer', 'Integrations'] },
  { title: 'Enterprise Pitch Deck',                   url: '#', extension: 'pptx', fileSize: 7_800_000, description: 'Slides for executive stakeholder presentations.', tags: ['Sales'] },
  { title: 'Compliance & Security Datasheet',         url: '#', extension: 'pdf',  fileSize: 512_000,   description: null, tags: null },
  { title: 'Brand Asset Package',                     url: '#', extension: 'zip',  fileSize: 24_600_000, description: 'Logos, colour swatches, and typeface files.', tags: ['Brand', 'Design'] },
]

function ResourceLibraryShowcase() {
  return (
    <>
      <BlockHeader slug="resource-library" />

      <VariantGroup
        label="Dense list · canvas · all files · pagination 3"
        note='Default layout. File-type icon chip, smaller title with hover tooltip, extension badge, tags, download arrow. View toggle switches to grid.'
      />
      <ResourceLibraryBlock
        eyebrow="Download Center"
        title="Resources"
        assets={MOCK_ASSETS}
        styleOptions={{ layout: 'list', color: 'canvas', showFileSize: false, filterType: 'all', pageSize: 3 }}
      />

      <VariantGroup label="Dense list · file size visible" />
      <ResourceLibraryBlock
        eyebrow="Download Center"
        title="Resources"
        assets={MOCK_ASSETS}
        styleOptions={{ layout: 'list', color: 'canvas', showFileSize: true, filterType: 'all', pageSize: 12 }}
      />

      <VariantGroup label="Dense list · surface background" />
      <ResourceLibraryBlock
        eyebrow="Documentation"
        title="Technical Library"
        assets={MOCK_ASSETS.slice(0, 4)}
        styleOptions={{ layout: 'list', color: 'surface', showFileSize: true, filterType: 'all', pageSize: 12 }}
      />

      <VariantGroup
        label="Card grid · canvas · all files · pagination 3"
        note='Grid layout default. Brand-fill header band with oversized icon, smaller title with tooltip, tags, full-width download CTA.'
      />
      <ResourceLibraryBlock
        eyebrow="Downloads"
        title="Resource Center"
        assets={MOCK_ASSETS}
        styleOptions={{ layout: 'grid', color: 'canvas', showFileSize: true, filterType: 'all', pageSize: 3 }}
      />

      <VariantGroup label="Card grid · surface background" />
      <ResourceLibraryBlock
        eyebrow="Press Kit"
        title="Media Assets"
        assets={MOCK_ASSETS.slice(0, 3)}
        styleOptions={{ layout: 'grid', color: 'surface', showFileSize: false, filterType: 'all', pageSize: 12 }}
      />

      <VariantGroup label="Empty states" />
      <div className="border-t border-fg/5">
        <VariantLabel label="assets: null (anchor not configured)" />
        <ResourceLibraryBlock
          title="Resources"
          assets={null}
          styleOptions={{ layout: 'list', color: 'canvas', showFileSize: false, filterType: 'all', pageSize: 12 }}
        />
      </div>
      <div className="border-t border-fg/5">
        <VariantLabel label="assets: [] (empty collection)" />
        <ResourceLibraryBlock
          title="Resources"
          assets={[]}
          styleOptions={{ layout: 'list', color: 'canvas', showFileSize: false, filterType: 'all', pageSize: 12 }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────

const CALLOUT_INTENTS = ['neutral', 'info', 'success', 'warning', 'danger', 'brand'] as const
type CalloutIntent = typeof CALLOUT_INTENTS[number]

const CALLOUT_HEADINGS: Record<CalloutIntent, string> = {
  neutral: 'Scheduled maintenance window',
  info:    'API rate limits increased',
  success: 'Deployment successful',
  warning: 'Trial ending in 3 days',
  danger:  'Action required: API key expiring',
  brand:   'New analytics dashboard now available',
}

const CALLOUT_BODIES: Record<CalloutIntent, string> = {
  neutral: 'Platform maintenance is scheduled for Sunday, 2:00–4:00 AM UTC. No action required.',
  info:    'Enterprise plans now support 10,000 requests per minute. Read the docs for updated rate limit headers.',
  success: 'Release 4.2.1 is live in production. All health checks are passing and telemetry looks normal.',
  warning: 'Your 30-day trial expires in 3 days. Upgrade now to prevent service interruption.',
  danger:  'Your primary API key expires in 24 hours. Rotate it immediately to avoid authentication failures.',
  brand:   'Our new analytics dashboard is now available to all plans. Turn it on in your account settings.',
}

const CALLOUT_CTAS: Record<CalloutIntent, string> = {
  neutral: 'View schedule',
  info:    'Read the docs',
  success: 'View release notes',
  warning: 'Upgrade now',
  danger:  'Rotate key',
  brand:   'Configure now',
}

const CALLOUT_BAR_HEADINGS: Record<CalloutIntent, string> = {
  neutral: 'Platform maintenance scheduled Sunday 2:00 AM UTC.',
  info:    'New: enterprise API rate limits increased to 10,000 req/min.',
  success: 'Release 4.2.1 deployed successfully. All systems nominal.',
  warning: 'Your trial expires in 3 days. Upgrade to prevent interruption.',
  danger:  'API key expires in 24 hours. Rotate it immediately.',
  brand:   'Our new analytics dashboard is now available to all plans.',
}

const CALLOUT_ICONS: Record<CalloutIntent, string> = {
  neutral: 'clock',
  info:    'lightbulb',
  success: 'checkCircle',
  warning: 'timer',
  danger:  'lock',
  brand:   'sparkles',
}

function CalloutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-sm px-md lg:px-lg pb-lg">
      {children}
    </div>
  )
}

function CalloutShowcase() {
  return (
    <>
      <BlockHeader slug="callout" />

      {/* ── Filled · all 6 intents ──────────────────────────────────────── */}
      <VariantGroup label="Filled variant · all 6 intents" note="18% alpha tint + 40% alpha full border in dark mode — each intent reads as a distinct color, not just a lighter surface. Heading and body use standard text tokens." />
      <CalloutGrid>
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_HEADINGS[intent]}
            body={CALLOUT_BODIES[intent]}
            styleOptions={{ intent, variant: 'filled' }}
          />
        ))}
      </CalloutGrid>

      {/* ── Bordered · all 6 intents ────────────────────────────────────── */}
      <VariantGroup label="Bordered variant · all 6 intents" note="Surface background + 3px top accent rule in the intent foreground color. Subdued but categorically distinct." />
      <CalloutGrid>
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_HEADINGS[intent]}
            body={CALLOUT_BODIES[intent]}
            styleOptions={{ intent, variant: 'bordered' }}
          />
        ))}
      </CalloutGrid>

      {/* ── Icon layout · 28px left column ──────────────────────────────── */}
      <VariantGroup label="Icon layout · filled · all 6 intents" note="When an icon is selected, it anchors the left as a 28px category signal — vertically centered with the text column. The icon communicates semantic type at a glance rather than decorating the heading inline." />
      <CalloutGrid>
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_HEADINGS[intent]}
            body={CALLOUT_BODIES[intent]}
            ctaLabel={CALLOUT_CTAS[intent]}
            ctaUrl="#"
            styleOptions={{ intent, variant: 'filled', icon: CALLOUT_ICONS[intent] }}
          />
        ))}
      </CalloutGrid>
      <VariantGroup label="Icon layout · bordered · all 6 intents" />
      <CalloutGrid>
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_HEADINGS[intent]}
            body={CALLOUT_BODIES[intent]}
            ctaLabel={CALLOUT_CTAS[intent]}
            ctaUrl="#"
            styleOptions={{ intent, variant: 'bordered', icon: CALLOUT_ICONS[intent] }}
          />
        ))}
      </CalloutGrid>

      {/* ── Bar · all 6 intents ─────────────────────────────────────────── */}
      <VariantGroup label="Bar variant · all 6 intents" note="Full intent-colored perimeter border + faint background tint separate the bar from the page; the colored icon carries the category; generous padding gives it enough mass to register at a glance. Designed for system notices and site-wide announcements." />
      <div className="flex flex-col px-md lg:px-lg pb-lg gap-xs">
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_BAR_HEADINGS[intent]}
            ctaLabel={CALLOUT_CTAS[intent]}
            ctaUrl="#"
            styleOptions={{ intent, variant: 'bar', icon: CALLOUT_ICONS[intent] }}
          />
        ))}
      </div>

      {/* ── Max width ────────────────────────────────────────────────────── */}
      <VariantGroup label="Max width" note="Use Full for in-column placements. Constrain width when placing the callout as a standalone section so it does not stretch awkwardly to 1200px container width." />
      <div className="flex flex-col px-md lg:px-lg pb-lg gap-sm">
        {(['full', 'wide', 'default', 'narrow'] as const).map(mw => (
          <div key={mw}>
            <VariantLabel label={`maxWidth: "${mw}"`} />
            <CalloutBlock
              heading="Platform maintenance scheduled Sunday 2:00–4:00 AM UTC."
              body="Read operations will continue without interruption. Write operations may have increased latency during this window."
              ctaLabel="View schedule"
              ctaUrl="#"
              styleOptions={{ intent: 'neutral', variant: 'filled', icon: 'clock', maxWidth: mw }}
            />
          </div>
        ))}
      </div>

      {/* ── Compact size ────────────────────────────────────────────────── */}
      <VariantGroup label="Compact size" note="Heading and CTA collapse to a single row when no body text is present. Reduced vertical padding for dense layouts." />
      <div className="flex flex-col px-md lg:px-lg pb-lg gap-xs">
        <VariantLabel label="default size" />
        <CalloutBlock
          heading="New feature: the analytics dashboard is now available to all plans."
          ctaLabel="Configure now"
          ctaUrl="#"
          styleOptions={{ intent: 'brand', variant: 'filled', size: 'default', icon: 'sparkles' }}
        />
        <VariantLabel label="compact size — heading + CTA on one row" />
        <CalloutBlock
          heading="New feature: the analytics dashboard is now available to all plans."
          ctaLabel="Configure now"
          ctaUrl="#"
          styleOptions={{ intent: 'brand', variant: 'filled', size: 'compact', icon: 'sparkles' }}
        />
        <VariantLabel label="compact with body — falls back to stacked layout" />
        <CalloutBlock
          heading="The new analytics dashboard is now available."
          body="Turn on richer reporting, scheduled exports, and shared views in your account settings."
          ctaLabel="Configure now"
          ctaUrl="#"
          styleOptions={{ intent: 'brand', variant: 'filled', size: 'compact', icon: 'sparkles' }}
        />
      </div>

      {/* ── Bordered + center alignment ─────────────────────────────────── */}
      <VariantGroup label="Center alignment · bordered" />
      <div className="px-md lg:px-lg pb-lg">
        <CalloutBlock
          heading="Scheduled maintenance window"
          body="Platform maintenance is scheduled for Sunday, 2:00–4:00 AM UTC. No downtime expected for read operations."
          ctaLabel="View schedule"
          ctaUrl="#"
          styleOptions={{ intent: 'neutral', variant: 'bordered', alignment: 'center', icon: 'clock' }}
        />
      </div>

      {/* ── Dismissible · live demo ──────────────────────────────────────── */}
      <VariantGroup
        label="Dismissible · live demo"
        note="Click the × button to trigger the two-phase exit: content sweeps right + fades out (220ms ease-out-quart), then the container height collapses (280ms ease-out-quart). Refresh to reset. prefers-reduced-motion: skips the sweep, collapses instantly."
      />
      <CalloutGrid>
        {CALLOUT_INTENTS.map(intent => (
          <CalloutBlock
            key={intent}
            heading={CALLOUT_HEADINGS[intent]}
            body={CALLOUT_BODIES[intent]}
            styleOptions={{ intent, variant: 'filled', dismissible: true, icon: CALLOUT_ICONS[intent] }}
          />
        ))}
      </CalloutGrid>

      {/* ── Dismissible bar ─────────────────────────────────────────────── */}
      <VariantGroup label="Dismissible bar" />
      <div className="flex flex-col px-md lg:px-lg pb-lg gap-xs">
        <CalloutBlock
          heading="Release 4.2.1 is live. All health checks passing."
          ctaLabel="View release notes"
          ctaUrl="#"
          styleOptions={{ intent: 'success', variant: 'bar', dismissible: true }}
        />
        <CalloutBlock
          heading="Your API key expires in 24 hours. Rotate it immediately."
          ctaLabel="Rotate key"
          ctaUrl="#"
          styleOptions={{ intent: 'danger', variant: 'bar', dismissible: true }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Divider ────────────────────────────────────────────────────────────────────

// A faux content band, so the divider can be read for what it is: the deliberate
// breath between two sections, not a line floating in isolation.
function SectionBand({ eyebrow, children, ground = 'canvas' }: { eyebrow: string; children: string; ground?: 'canvas' | 'surface' }) {
  return (
    <div className={ground === 'surface' ? 'bg-surface' : 'bg-canvas'}>
      <div className="px-md lg:px-lg py-lg max-w-[65ch]">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-xs">{eyebrow}</p>
        <p className="text-body leading-body text-fg text-pretty">{children}</p>
      </div>
    </div>
  )
}

function DividerShowcase() {
  return (
    <>
      <BlockHeader slug="divider" />

      {/* ── In context ──────────────────────────────────────────────────── */}
      <VariantGroup
        label="In context · between two sections"
        note="The divider's job: open a measured gap so one section reads as finished and the next as a fresh start. Placed in its own full-width row in Visual Builder."
      />
      <SectionBand eyebrow="The platform" ground="surface">
        The platform gives your team the tools to move step by step, measure precisely, and respond in real time. Every change carries a full history; every launch is reversible.
      </SectionBand>
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'lg' }} />
      <SectionBand eyebrow="The method">
        Decisions are made where the work happens, not in a meeting three weeks later. The result is a shorter loop between an idea and the evidence that settles it.
      </SectionBand>

      {/* ── The three styles ────────────────────────────────────────────── */}
      <VariantGroup label="Styles · large spacing" note="Three ways to close a section. Mark is editorial punctuation; glow is a precise line of light; bleed is atmospheric luminance. One tone control and the same spacing scale behind each." />

      <VariantLabel label='style: "mark"' note="A hairline broken by an editable label or an editorial ornament. Use when the break deserves a word." />
      <OT_DividerBlock content={{ label: 'Continue' } as any} displaySettings={{ style: 'mark', tone: 'neutral', ornament: 'pendant', space: 'lg' }} />

      <VariantLabel label='style: "glow"' note="A precise line of light: a chromatic rule with a soft bloom above and below, fading at the edges. The confident, crisp break." />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'lg' }} />

      <VariantLabel label='style: "bleed"' note="Atmospheric luminance: an elliptical glow rising from the boundary, brightest at center, dissolving at the edges. The quiet, ambient break." />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'spectrum', space: 'lg' }} />

      {/* ── Text mark · label + ornaments ───────────────────────────────── */}
      <VariantGroup label="Centered text mark · label and ornaments" note="A label takes precedence; with no label the mark falls back to the chosen ornament, never a broken gap. Spectrum and aurora tones turn the hairlines into gradients." />
      <VariantLabel label='label: "New chapter" · tone: "brand"' />
      <OT_DividerBlock content={{ label: 'New chapter' } as any} displaySettings={{ style: 'mark', tone: 'brand', ornament: 'pendant', space: 'md' }} />
      <VariantLabel label='label: "Continue reading" · tone: "spectrum" — gradient hairlines' />
      <OT_DividerBlock content={{ label: 'Continue reading' } as any} displaySettings={{ style: 'mark', tone: 'spectrum', ornament: 'none', space: 'md' }} />
      <VariantLabel label='ornament: "pendant" ❧ · no label' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'mark', tone: 'neutral', ornament: 'pendant', space: 'md' }} />
      <VariantLabel label='ornament: "asterism" ⁂ · tone: "accent"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'mark', tone: 'accent', ornament: 'asterism', space: 'md' }} />
      <VariantLabel label='ornament: "dot" • · no label' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'mark', tone: 'neutral', ornament: 'dot', space: 'md' }} />

      {/* ── Glow · chromatic rule · tones ───────────────────────────────── */}
      <VariantGroup label="Glow · chromatic rule · tones" note="A precise line of light between two sections. The rule carries the tone and fades to transparent at the outer edges; a soft bloom emanates above and below. Use when you want a confident, luminous seam." />
      <VariantLabel label='tone: "neutral" — a quiet rule of light' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'neutral', weight: 'slim', space: 'md' }} />
      <VariantLabel label='tone: "brand"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'brand', weight: 'slim', space: 'md' }} />
      <VariantLabel label='tone: "accent"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'accent', weight: 'slim', space: 'md' }} />
      <VariantLabel label='tone: "spectrum" — brand → accent' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'md' }} />
      <VariantLabel label='tone: "aurora" — brand · accent · brand' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'aurora', weight: 'slim', space: 'md' }} />

      {/* ── Glow · weight ───────────────────────────────────────────────── */}
      <VariantGroup label="Glow · weight" note="Slim is a 1px rule with a tight 24px bloom; bold is a 2px rule with a 40px bloom for a stronger line of light." />
      <VariantLabel label='weight: "slim" · tone: "spectrum"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'md' }} />
      <VariantLabel label='weight: "bold" · tone: "spectrum"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'bold', space: 'md' }} />

      {/* ── Bleed · atmospheric radial seam · tones ─────────────────────── */}
      <VariantGroup label="Bleed · atmospheric light seam · tones" note="Atmospheric luminance, not a colored bar: an elliptical glow rising from the boundary, brightest at the horizontal center, dissolving at the sides and the bottom. Peak opacity is held low on purpose — at arm's length it should read as a subtle seam of light." />
      <VariantLabel label='tone: "brand"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'brand', space: 'sm' }} />
      <VariantLabel label='tone: "accent"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'accent', space: 'sm' }} />
      <VariantLabel label='tone: "spectrum" — brand → accent' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'spectrum', space: 'sm' }} />
      <VariantLabel label='tone: "aurora" — brand · accent · brand' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'aurora', space: 'sm' }} />
      <VariantLabel label='tone: "neutral" — barely a seam' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'neutral', space: 'sm' }} />

      {/* ── Bleed · weight ──────────────────────────────────────────────── */}
      <VariantGroup label="Bleed · weight" note="Slim is a 60px seam at 25% peak; bold is an 80px seam at 35% peak — more presence, still atmospheric." />
      <VariantLabel label='weight: "slim" · tone: "spectrum"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'spectrum', weight: 'slim', space: 'sm' }} />
      <VariantLabel label='weight: "bold" · tone: "spectrum"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'spectrum', weight: 'bold', space: 'sm' }} />

      {/* ── Spacing scale ───────────────────────────────────────────────── */}
      <VariantGroup label="Spacing scale · sm → xl" note="Symmetric vertical padding, clamped so it scales down on narrow viewports. Bands above and below mark the gap each value opens." />
      {(['sm', 'md', 'lg', 'xl'] as const).map(space => (
        <div key={space}>
          <VariantLabel label={`space: "${space}"`} />
          <SectionBand eyebrow="Above" ground="surface">The section before the break.</SectionBand>
          <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'mark', tone: 'neutral', ornament: 'dot', space }} />
          <SectionBand eyebrow="Below">The section after the break.</SectionBand>
        </div>
      ))}

      {/* ── Reveal ──────────────────────────────────────────────────────── */}
      <VariantGroup label="Reveal on scroll · draw in" note="reveal: draw rides the shared MotionObserver. The mark and glow rule draw out from center, the glow bloom and mark label fade in just behind, the bleed seam fades up. Scroll each into view to retrigger. prefers-reduced-motion: renders the final state instantly, no shift." />
      <VariantLabel label='style: "glow" · reveal: "draw"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'md', reveal: 'draw' }} />
      <VariantLabel label='style: "mark" · reveal: "draw"' />
      <OT_DividerBlock content={{ label: 'Drawn in' } as any} displaySettings={{ style: 'mark', tone: 'accent', ornament: 'pendant', space: 'md', reveal: 'draw' }} />
      <VariantLabel label='style: "bleed" · reveal: "draw"' />
      <OT_DividerBlock content={{ label: '' } as any} displaySettings={{ style: 'bleed', tone: 'spectrum', space: 'md', reveal: 'draw' }} />

      <div className="pb-xl" />
    </>
  )
}

// ─── Event Listing ──────────────────────────────────────────────────────────────

// Static fixtures — a cross-vertical mix of types, in-person/virtual, with and
// without featured images, with and without credit, spread across May–August 2026
// (a couple in the past to exercise the past-events toggle; the rest distributed
// so the calendar view shows events across multiple weeks).
const EVENT_IMG_A = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop'   // conference stage
const EVENT_IMG_B = 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80&fit=crop'   // webinar / screen
const EVENT_IMG_C = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80&fit=crop'   // community gathering
const EVENT_IMG_D = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&fit=crop'   // healthcare

const MOCK_EVENTS: EventCardData[] = [
  {
    key: 'e-webinar-1', title: 'Shipping Faster with Feature Flags: A Live Webinar', url: '#',
    eventType: 'webinar', startDate: '2026-06-25T16:00:00Z', endDate: '2026-06-25T17:00:00Z',
    locationType: 'virtual', venueName: 'Zoom Webinar', summary: 'A practical walkthrough of progressive delivery.',
    imageUrl: EVENT_IMG_B,
  },
  {
    key: 'e-community-1', title: 'Acme Community Meetup: Austin', url: '#',
    eventType: 'community', startDate: '2026-06-20T17:30:00Z',
    locationType: 'inPerson', venueName: 'Capital Factory', city: 'Austin, TX',
    imageUrl: EVENT_IMG_C,
  },
  {
    key: 'e-conference-1', title: 'Acme Summit 2026', url: '#',
    eventType: 'conference', startDate: '2026-07-14T09:00:00Z', endDate: '2026-07-16T17:00:00Z',
    locationType: 'inPerson', venueName: 'Javits Center', city: 'New York, NY',
    imageUrl: EVENT_IMG_A,
  },
  {
    key: 'e-workshop-1', title: 'Hands-on Workshop: Building Audit-Ready Pipelines', url: '#',
    eventType: 'workshop', startDate: '2026-07-09T14:00:00Z', endDate: '2026-07-09T18:00:00Z',
    locationType: 'inPerson', venueName: 'Merchandise Mart', city: 'Chicago, IL',
    creditType: 'CPE', creditHours: 4,
  },
  {
    key: 'e-screening-1', title: 'Free Community Health Screening', url: '#',
    eventType: 'screening', startDate: '2026-07-22T09:00:00Z', endDate: '2026-07-22T15:00:00Z',
    locationType: 'inPerson', venueName: 'Lakewood Civic Center', city: 'Cleveland, OH',
  },
  {
    key: 'e-seminar-1', title: 'CLE Seminar: Data Privacy in Practice', url: '#',
    eventType: 'seminar', startDate: '2026-08-05T12:00:00Z', endDate: '2026-08-05T14:30:00Z',
    locationType: 'inPerson', venueName: 'Boston Bar Association', city: 'Boston, MA',
    creditType: 'CLE', creditHours: 1.5,
  },
  {
    key: 'e-training-1', title: 'Investor Briefing & Platform Training', url: '#',
    eventType: 'training', startDate: '2026-08-18T15:00:00Z', endDate: '2026-08-18T17:00:00Z',
    locationType: 'virtual', venueName: 'Acme Live', creditType: 'CE', creditHours: 2,
    imageUrl: EVENT_IMG_D,
  },
  {
    key: 'e-webinar-past', title: 'Past Webinar: Q1 Product Roadmap', url: '#',
    eventType: 'webinar', startDate: '2026-05-28T16:00:00Z', endDate: '2026-05-28T17:00:00Z',
    locationType: 'virtual', venueName: 'Zoom Webinar',
  },
  {
    key: 'e-conf-past', title: 'Past Conference: DevWorld 2026', url: '#',
    eventType: 'conference', startDate: '2026-05-10T09:00:00Z', endDate: '2026-05-11T17:00:00Z',
    locationType: 'inPerson', venueName: 'Moscone Center', city: 'San Francisco, CA',
    imageUrl: EVENT_IMG_A,
  },
]

function EventListingShowcase() {
  return (
    <>
      <BlockHeader slug="event-listing" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, events are fetched at render time from published Event Pages. The showcase uses static fixtures (May–August 2026, mixed verticals) to demonstrate the views and display-template settings independently of CMS content.
        </p>
      </div>

      <VariantGroup label="Card grid · canvas · type filter on · past-events toggle" note="Default view. Chips show only the event types present. Toggle the 'Show past events' control to reveal the de-emphasized past rows under a divider; switch views with the segmented control." />
      <div className="border-t border-fg/5">
        <EventListingBlock
          heading="Upcoming events"
          subtext="Webinars, conferences, workshops, and community events across our network."
          events={MOCK_EVENTS}
          styleOptions={{ defaultView: 'card', color: 'canvas', showViewToggle: true, showTypeFilter: true, showPastEvents: 'toggle' }}
        />
      </div>

      <VariantGroup label="List · surface" note="Compact rows anchored by a calendar-style date block. Multi-day events show a range; the date block scales down on narrow viewports." />
      <div className="border-t border-fg/5">
        <EventListingBlock
          heading="Event schedule"
          events={MOCK_EVENTS}
          styleOptions={{ defaultView: 'list', color: 'surface', showViewToggle: true, showTypeFilter: true, showPastEvents: 'toggle' }}
        />
      </div>

      <VariantGroup label="Calendar · canvas" note="Monthly grid with prev/next + Today. Days with events are interactive — selecting one opens that day's agenda below the grid. Multiple events per day collapse to chips with a '+N more' count. Below the sm breakpoint the grid becomes a month agenda list." />
      <div className="border-t border-fg/5">
        <EventListingBlock
          heading="Events calendar"
          events={MOCK_EVENTS}
          styleOptions={{ defaultView: 'calendar', color: 'canvas', showViewToggle: true, showTypeFilter: true, showPastEvents: 'show' }}
        />
      </div>

      <VariantGroup label="Locked single view · type pre-filtered (webinars)" note="showViewToggle off + filterByType: 'webinar' — the 'embed on a product page' use case. The view is locked to cards, the type chips are suppressed, and only webinars load." />
      <div className="border-t border-fg/5">
        <EventListingBlock
          heading="Upcoming webinars"
          events={MOCK_EVENTS}
          filterByType="webinar"
          styleOptions={{ defaultView: 'card', color: 'canvas', showViewToggle: false, showTypeFilter: true, showPastEvents: 'hide' }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Practitioner Listing ─────────────────────────────────────────────────────

// Portrait IDs are real Unsplash photos; several records intentionally omit a
// headshot to exercise the designed initials fallback.
const HS = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`

const MOCK_PRACTITIONERS: PractitionerCardData[] = [
  // ── Medical ──────────────────────────────────────────────────────────────────
  {
    key: 'pr-vargas', firstName: 'Elena', lastName: 'Vargas', suffix: 'MD', credentials: 'MD, FACC',
    title: 'Chief of Cardiology',
    headshotUrl: HS('1594824476967-48c8b964273f'),
    bio: { html: '<p>Dr. Vargas leads the cardiovascular service line, with a clinical focus on structural heart disease and interventional procedures. She has published widely on minimally invasive valve repair and mentors the interventional fellowship.</p>' },
    practiceAreas: [
      { areaName: 'Cardiology', facility: 'Memorial Heart Center', isPrimary: true },
      { areaName: 'Interventional Procedures', facility: 'Memorial Heart Center' },
    ],
    phone: '(312) 555-0142', email: 'e.vargas@example.com', officeLocation: 'Chicago, IL',
    languages: 'English, Spanish', linkedIn: 'https://www.linkedin.com/in/example',
    groupTag: 'medical', url: '/practitioners/elena-vargas',
  },
  {
    key: 'pr-bell', firstName: 'Marcus', lastName: 'Bell', suffix: 'MD', credentials: 'MD',
    title: 'Director, Medical Oncology',
    headshotUrl: HS('1612349317150-e413f6a5b16d'),
    bio: { html: '<p>Dr. Bell specializes in hematologic malignancies and leads the institute’s clinical trials program, with an emphasis on immunotherapy and precision treatment planning.</p>' },
    practiceAreas: [{ areaName: 'Oncology', facility: 'Lakeside Cancer Institute', isPrimary: true }],
    phone: '(312) 555-0188', email: 'm.bell@example.com', officeLocation: 'Chicago, IL',
    languages: 'English', groupTag: 'medical', url: '/practitioners/marcus-bell',
  },
  {
    key: 'pr-nair', firstName: 'Priya', lastName: 'Nair', suffix: 'MD', credentials: 'MD, FACEP',
    title: 'Attending Physician, Emergency Medicine',
    // No headshot — exercises the initials fallback.
    bio: { html: '<p>Dr. Nair practices emergency medicine and serves as the department’s simulation education lead, building rapid-response protocols for high-acuity presentations.</p>' },
    practiceAreas: [{ areaName: 'Emergency Medicine', facility: 'Central Hospital', isPrimary: true }],
    phone: '(312) 555-0203', email: 'p.nair@example.com', officeLocation: 'Evanston, IL',
    languages: 'English, Hindi, Mandarin', groupTag: 'medical', url: '/practitioners/priya-nair',
  },

  // ── Legal ──────────────────────────────────────────────────────
  {
    key: 'pr-reese', firstName: 'Jonathan', lastName: 'Reese', suffix: 'JD', credentials: 'JD',
    title: 'Senior Partner',
    headshotUrl: HS('1560250097-0b93528c311a'),
    bio: { html: '<p>Jonathan advises closely held businesses and high-net-worth individuals on federal and state tax strategy, succession planning, and IRS controversy matters.</p>' },
    practiceAreas: [{ areaName: 'Tax Law', facility: 'Chicago Office', isPrimary: true }],
    phone: '(312) 555-0310', email: 'j.reese@example.com', officeLocation: 'Chicago, IL',
    languages: 'English', linkedIn: 'https://www.linkedin.com/in/example',
    groupTag: 'legal', url: '/practitioners/jonathan-reese',
  },
  {
    key: 'pr-marchetti', firstName: 'Sofia', lastName: 'Marchetti', suffix: 'JD', credentials: 'JD, LLM',
    title: 'Partner',
    // No headshot — initials fallback.
    bio: { html: '<p>Sofia represents plaintiffs in complex personal injury and product liability litigation, with a track record of trial verdicts in catastrophic-injury cases.</p>' },
    practiceAreas: [{ areaName: 'Personal Injury', facility: 'Milan Office', isPrimary: true }],
    phone: '(312) 555-0355', email: 's.marchetti@example.com', officeLocation: 'New York, NY',
    languages: 'English, Italian', groupTag: 'legal', url: '/practitioners/sofia-marchetti',
  },
  {
    key: 'pr-okafor', firstName: 'David', lastName: 'Okafor', suffix: 'Esq.', credentials: 'JD',
    title: 'Managing Partner',
    headshotUrl: HS('1507003211169-0a1dd7228f2d'),
    bio: { html: '<p>David leads the corporate practice, advising on mergers and acquisitions, private equity transactions, and cross-border joint ventures for technology and manufacturing clients.</p>' },
    practiceAreas: [{ areaName: 'Corporate Law', facility: 'Chicago Office', isPrimary: true }],
    phone: '(312) 555-0399', email: 'd.okafor@example.com', officeLocation: 'Chicago, IL',
    languages: 'English, French', groupTag: 'legal', url: '/practitioners/david-okafor',
  },

  // ── Technology ───────────────────────────────────────────────────────────────────
  {
    key: 'pr-lindqvist', firstName: 'Ava', lastName: 'Lindqvist', credentials: '',
    title: 'Principal Platform Engineer',
    headshotUrl: HS('1573496359142-b8d87734a5a2'),
    bio: { html: '<p>Ava designs the distributed systems behind the platform’s delivery layer, focusing on multi-region resilience, observability, and developer experience.</p>' },
    practiceAreas: [{ areaName: 'Platform Engineering', facility: 'Stockholm', isPrimary: true }],
    email: 'ava@example.com', officeLocation: 'Stockholm, SE',
    languages: 'English, Swedish', linkedIn: 'https://www.linkedin.com/in/example',
    groupTag: 'technology', url: '/practitioners/ava-lindqvist',
  },
  {
    key: 'pr-park', firstName: 'Theo', lastName: 'Park', credentials: '',
    title: 'VP, Product Strategy',
    // No headshot — initials fallback.
    bio: { html: '<p>Theo shapes the product roadmap across the experimentation and content suites, partnering with go-to-market teams to translate platform capability into customer outcomes.</p>' },
    practiceAreas: [{ areaName: 'Product Strategy', facility: 'Seoul', isPrimary: true }],
    email: 'theo@example.com', officeLocation: 'Seoul, KR',
    languages: 'English, Korean', groupTag: 'technology', url: '/practitioners/theo-park',
  },
]

function PractitionerListingShowcase() {
  const medical = MOCK_PRACTITIONERS.filter(p => p.groupTag === 'medical')
  const tech    = MOCK_PRACTITIONERS.filter(p => p.groupTag === 'technology')
  return (
    <>
      <BlockHeader slug="practitioner-listing" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, practitioners are fetched at render time from Practitioner Profiles, scoped by the Group Tag Filter. The showcase uses static fixtures across three verticals so every filter and empty state is exercisable. Search by a name (“Vargas”) or a specialty (“tax”); the specialty, location, and language dropdowns list only values present in the loaded set, with multiple selections allowed per filter.
        </p>
      </div>

      <VariantGroup label="Grid · 3 columns · canvas · search + filters" note="The full directory experience. All eight practitioners loaded with no group-tag scope; the specialty, location, and language dropdowns are derived from the data. Portrait-first cards: the headshot (or its branded-abstract initials plate) fills a 3:4 plate. Hover a card to lift it and slide the glass footer up, revealing a bio excerpt." />
      <div className="border-t border-fg/5">
        <PractitionerListingBlock
          heading="Find a practitioner"
          subtext="Search our directory by name or specialty, or filter by specialty, location, and language."
          practitioners={MOCK_PRACTITIONERS}
          styleOptions={{ layout: 'grid', color: 'canvas', columns: 3, showSearchFilters: true, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="Grid · 4 columns · surface · no search / no filters · scoped to medical" note="The curated “Meet the Team” use case on a vertical page: Group Tag Filter restricts the set to one group and the filter UI is suppressed." />
      <div className="border-t border-fg/5">
        <PractitionerListingBlock
          heading="Meet our doctors"
          practitioners={medical}
          styleOptions={{ layout: 'grid', color: 'surface', columns: 4, showSearchFilters: false, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="List · canvas · search + filters" note="The compact list layout: a circular portrait thumbnail with a chromatic brand ring, name + credentials as one unit, title · primary area beneath, inline contact, and a chevron link affordance. Hover a row to bring its border to brand with a faint brand wash and slide the chevron right." />
      <div className="border-t border-fg/5">
        <PractitionerListingBlock
          heading="Our team"
          practitioners={MOCK_PRACTITIONERS}
          styleOptions={{ layout: 'list', color: 'canvas', columns: 3, showSearchFilters: true, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="Grid · 2 columns · surface · no search / no filters · scoped to technology" note="The “Leadership Team” / “Executive Bios” use case on a brand or about page. Two columns give each portrait more width, so the plate reads at its most dramatic — and the glass footer and initials gradient stay legible on the surface ground. One headshot, one initials plate." />
      <div className="border-t border-fg/5">
        <PractitionerListingBlock
          heading="Leadership team"
          subtext="The people setting product direction across the platform."
          practitioners={tech}
          styleOptions={{ layout: 'grid', color: 'surface', columns: 2, showSearchFilters: false, density: 'comfortable' }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Location Listing ─────────────────────────────────────────────────────────

// Static fixtures with PRE-RESOLVED coordinates — the showcase never calls the
// Mapbox Geocoding API (the server wrapper only geocodes locations missing
// coordinates). A few carry verified, thematically-matched Unsplash imagery; the
// rest intentionally omit an image to exercise the designed branded-fallback plate.
const LOC_IMG_HOSPITAL = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&fit=crop'
const LOC_IMG_HQ       = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop'

const MOCK_LOCATIONS: LocationData[] = [
  // ── OptiMedical ────────────────────────────────────────────────────────────────
  {
    key: 'loc-memorial', locationName: 'Memorial Medical Center', locationLabel: 'Hospital',
    imageUrl: LOC_IMG_HOSPITAL,
    address: '1 Gustave L. Levy Pl, New York, NY 10029',
    details: { html: '<p>Level I trauma center. Emergency department open 24/7. Visitor parking on-site; valet at the main entrance.</p>' },
    groupTag: 'optimedical', url: '/locations/memorial-medical-center',
    coordinates: { lat: 40.7900, lon: -73.9526 },
  },
  {
    key: 'loc-downtown-clinic', locationName: 'Downtown Health Clinic', locationLabel: 'Clinic',
    address: '462 First Ave, New York, NY 10016',
    details: { html: '<p>Primary and urgent care, Mon–Sat 8am–8pm. Walk-ins welcome. Wheelchair accessible.</p>' },
    groupTag: 'optimedical', url: '/locations/downtown-health-clinic',
    coordinates: { lat: 40.7397, lon: -73.9754 },
  },
  {
    key: 'loc-brooklyn-pharmacy', locationName: 'Brooklyn Pharmacy', locationLabel: 'Pharmacy',
    address: '150 55th St, Brooklyn, NY 11220',
    details: { html: '<p>Full-service pharmacy with same-day prescription pickup and immunizations. Drive-through available.</p>' },
    groupTag: 'optimedical', url: '/locations/brooklyn-pharmacy',
    coordinates: { lat: 40.6360, lon: -74.0170 },
  },

  // ── OptiTech offices ─────────────────────────────────────────────────────────────
  {
    key: 'loc-boston-hq', locationName: 'Boston Headquarters', locationLabel: 'Headquarters',
    imageUrl: LOC_IMG_HQ,
    address: '1 Financial Center, Boston, MA 02111',
    details: { html: '<p>Global headquarters. Reception on the 12th floor; visitor badges required. Steps from South Station.</p>' },
    groupTag: 'optitech-offices', url: '/locations/boston-headquarters',
    coordinates: { lat: 42.3553, lon: -71.0557 },
  },
  {
    key: 'loc-ny-office', locationName: 'New York Office', locationLabel: 'Office',
    address: '429 11th Ave, New York, NY 10001',
    details: { html: '<p>Sales and customer success teams. Hudson Yards / West Side. By appointment.</p>' },
    groupTag: 'optitech-offices', url: '/locations/new-york-office',
    coordinates: { lat: 40.7550, lon: -74.0020 },
  },
]

function LocationListingShowcase() {
  const medical = MOCK_LOCATIONS.filter(l => l.groupTag === 'optimedical')
  const offices = MOCK_LOCATIONS.filter(l => l.groupTag === 'optitech-offices')
  return (
    <>
      <BlockHeader slug="location-listing" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, locations are fetched at render time from Location Profiles, scoped by the Group Tag Filter, and their addresses geocoded via the Mapbox API (cached 24h). The showcase uses static fixtures with pre-resolved coordinates across two groups, so every view, filter, and empty state is exercisable with no API calls. Switch views with the segmented control; in the map view, click a marker or a rail card to fly to it and open its popup. The label chips list only the labels present in the loaded set.
        </p>
      </div>

      <VariantGroup label="Map · canvas · search + label filter" note="The signature view. A dark Mapbox map paired with a synchronized location rail: selecting a rail card flies the map and opens a restyled dark-glass popup; clicking a marker highlights its rail card. All five locations across both groups; the rail scrolls beside the map on desktop and stacks beneath it on mobile. Memorial and Boston carry imagery; the rest use the designed brand-fallback plate." />
      <div className="border-t border-fg/5">
        <LocationListingBlock
          heading="Find a location"
          subtext="Search by name, label, or address, or filter by location type."
          locations={MOCK_LOCATIONS}
          styleOptions={{ defaultView: 'map', showViewToggle: true, mapHeight: 'standard', color: 'canvas', columns: 3, showSearch: true, showLabelFilter: true, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="Grid · 3 columns · canvas · search + label filter" note="The editorial card view. Landscape image plates with an accent label badge; hover a card to lift it and slide the glass footer up, revealing the address and a details excerpt. Two cards show imagery, three show the branded fallback plate." />
      <div className="border-t border-fg/5">
        <LocationListingBlock
          heading="Our locations"
          locations={MOCK_LOCATIONS}
          styleOptions={{ defaultView: 'grid', showViewToggle: true, mapHeight: 'standard', color: 'canvas', columns: 3, showSearch: true, showLabelFilter: true, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="List · surface · search + label filter" note="The dense list view on the surface ground: a flush square plate, name + soft label badge, address, and a chevron link affordance. Hover a row to bring its border to brand with a faint brand wash and slide the chevron right." />
      <div className="border-t border-fg/5">
        <LocationListingBlock
          heading="All offices &amp; facilities"
          locations={MOCK_LOCATIONS}
          styleOptions={{ defaultView: 'list', showViewToggle: true, mapHeight: 'standard', color: 'surface', columns: 3, showSearch: true, showLabelFilter: true, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="Map · tall · surface · no controls · scoped to OptiMedical" note="The curated single-vertical use case on a brand page: the Group Tag Filter restricts the set to one group, the view toggle and controls are suppressed, and the map opens taller. Three medical locations frame to a tight bounds." />
      <div className="border-t border-fg/5">
        <LocationListingBlock
          heading="Where to find OptiMedical"
          locations={medical}
          styleOptions={{ defaultView: 'map', showViewToggle: false, mapHeight: 'tall', color: 'surface', columns: 3, showSearch: false, showLabelFilter: false, density: 'comfortable' }}
        />
      </div>

      <VariantGroup label="Grid · 2 columns · surface · compact · no controls · scoped to offices" note="The “Our offices” presentation on an about page. Two columns give each plate more width; compact density tightens the footer. One image plate, one fallback." />
      <div className="border-t border-fg/5">
        <LocationListingBlock
          heading="Our offices"
          subtext="Visit us in Boston or New York."
          locations={offices}
          styleOptions={{ defaultView: 'grid', showViewToggle: false, mapHeight: 'standard', color: 'surface', columns: 2, showSearch: false, showLabelFilter: false, density: 'compact' }}
        />
      </div>

      <div className="pb-xl" />
    </>
  )
}

// ─── Content Recommendations ────────────────────────────────────────────────

const SAMPLE_CONTENT_RECS: ContentRecItem[] = [
  { title: 'How editorial teams ship faster with a headless CMS', abstract: 'A field guide to decoupling content from presentation without losing the WYSIWYG comfort editors expect.', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80&fit=crop', topic: 'Insights', source: 'OptiTech Journal', author: 'Dana Okafor' },
  { title: 'Personalization that respects the reader', abstract: 'Relevance beats volume. Here is how to tune content recommendations so every visit feels considered, not creepy.', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&fit=crop', topic: 'Strategy', source: 'OptiTech Journal', author: 'Marcus Lee' },
  { title: 'Measuring what a recommendation is worth', abstract: 'Click-through is a vanity metric. Tie recommendations to downstream conversion to know their real lift.', linkUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&fit=crop', topic: 'Analytics', source: 'OptiTech Journal', author: 'Priya Nair' },
]

function ContentRecommendationsShowcase() {
  return (
    <>
      <BlockHeader slug="content-recommendations" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, items are fetched server-side per visitor using the Content Recommendations delivery key on the ThemeManager. The showcase uses static sample articles to demonstrate the layout across color schemes.
        </p>
      </div>

      <VariantGroup label="Color schemes" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <ContentRecommendationsBlock
            heading="Recommended for you"
            subheading="Handpicked reading based on what you have been exploring."
            items={SAMPLE_CONTENT_RECS}
            color={color}
          />
        </div>
      ))}

      <VariantGroup label="Empty state" note="Rendered when the delivery API returns no items for the visitor." />
      <div className="border-t border-fg/5">
        <ContentRecommendationsBlock heading="Recommended for you" items={[]} color="canvas" />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Product Recommendations ─────────────────────────────────────────────────

const SAMPLE_PRODUCT_RECS: ProductRec[] = [
  { id: 1, title: 'OptiTech Analytics Cloud', url: '#', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&fit=crop', description: 'Real-time product analytics with warehouse-native modeling and no sampling.', price: 'From $499/mo' },
  { id: 2, title: 'OptiTech Edge CDN', url: '#', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&fit=crop', description: 'Sub-20ms global delivery with programmable edge functions.', price: 'From $99/mo' },
  { id: 3, title: 'OptiTech Identity', url: '#', img: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&q=80&fit=crop', description: 'Passwordless auth, SSO, and fine-grained authorization in one SDK.', price: 'From $199/mo' },
  { id: 4, title: 'OptiTech Data Pipeline', url: '#', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80&fit=crop', description: 'Streaming ETL with schema enforcement and one-click connectors.', price: 'From $299/mo' },
]

function ProductRecommendationsShowcase() {
  return (
    <>
      <BlockHeader slug="product-recommendations" />

      <div className="px-md pb-sm lg:px-lg pt-md">
        <p className="text-label text-fg-muted/60 leading-body max-w-[65ch]">
          In production, recommendations arrive live from the Peerius engine via the <code className="font-mono">peerius:recs</code> event. The showcase passes static sample products so the card grid and &ldquo;Show all&rdquo; behavior render without a live engine.
        </p>
      </div>

      <VariantGroup label="Color schemes · initial count 3" />
      {(['canvas', 'surface', 'brand'] as const).map(color => (
        <div key={color} className="border-t border-fg/5">
          <VariantLabel label={`color: "${color}"`} />
          <ProductRecommendationsBlock
            heading="You might also like"
            subheading="Recommended for teams like yours."
            initialCount={3}
            showAllLabel="Show all"
            color={color}
            initialRecs={SAMPLE_PRODUCT_RECS}
          />
        </div>
      ))}

      <VariantGroup label="Show-all expand · initialCount 3 of 4" note="When the engine returns more than the initial count, a Show-all control reveals the rest." />
      <div className="border-t border-fg/5">
        <ProductRecommendationsBlock initialCount={3} showAllLabel="Show all 4" color="canvas" initialRecs={SAMPLE_PRODUCT_RECS} />
      </div>
      <div className="pb-xl" />
    </>
  )
}

// ─── Comparison Table ─────────────────────────────────────────────────────────

const ACCOUNTS_CONTENT = {
  eyebrow:     'Checking Accounts',
  headline:    'Find the account that fits your life.',
  subHeadline: 'All accounts include a debit card, mobile deposit, and 24/7 account access.',
  columns: [
    {
      label:    'Essential',
      subLabel: '$0 / month',
      ctaLabel: 'Open Account',
      ctaUrl:   { default: '#' },
    },
    {
      label:     'Select',
      subLabel:  '$9 / month',
      badgeText: 'Most Popular',
      ctaLabel:  'Open Account',
      ctaUrl:    { default: '#' },
    },
    {
      label:    'Premium',
      subLabel: '$25 / month',
      ctaLabel: 'Open Account',
      ctaUrl:   { default: '#' },
    },
  ],
  rows: [
    { rowType: 'group', label: 'Core',         cells: [] },
    { rowType: 'row', label: 'Monthly fee',          tooltip: 'Monthly service fee. May be waived with qualifying activity.', cells: [{ text: 'Free' }, { text: '$9' }, { text: '$25' }] },
    { rowType: 'row', label: 'Minimum opening deposit', cells: [{ text: '$25' }, { text: '$100' }, { text: '$250' }] },
    { rowType: 'row', label: 'Overdraft protection',    cells: [{ icon: 'minus' }, { icon: 'check' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Free wire transfers',     cells: [{ icon: 'minus' }, { text: '2 / month' }, { icon: 'infinity' }] },
    { rowType: 'group', label: 'Interest & Rewards',   cells: [] },
    { rowType: 'row', label: 'Interest-bearing',        cells: [{ icon: 'minus' }, { icon: 'check' }, { icon: 'check' }] },
    { rowType: 'row', label: 'APY',                     cells: [{ icon: 'minus' }, { text: '0.15%' }, { text: '0.40%' }] },
    { rowType: 'row', label: 'Cash-back debit rewards', cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'check' }] },
    { rowType: 'group', label: 'Support & Access',     cells: [] },
    { rowType: 'row', label: 'ATM fee refunds',         tooltip: 'Domestic ATM surcharge refunds per statement cycle.', cells: [{ icon: 'minus' }, { text: 'Up to $10' }, { text: 'Unlimited' }] },
    { rowType: 'row', label: 'Priority phone support',  cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Dedicated relationship manager', cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'check' }] },
  ],
}

const SUPPORT_CONTENT = {
  eyebrow:  'Support Plans',
  headline: 'Enterprise-grade support, calibrated to your team.',
  columns: [
    {
      label:    'Standard',
      subLabel: 'Included',
      ctaLabel: 'Get Started',
      ctaUrl:   { default: '#' },
    },
    {
      label:     'Professional',
      subLabel:  '$499 / month',
      badgeText: 'Most Chosen',
      ctaLabel:  'Get Started',
      ctaUrl:    { default: '#' },
    },
    {
      label:    'Enterprise',
      subLabel: 'Custom pricing',
      ctaLabel: 'Contact Sales',
      ctaUrl:   { default: '#' },
    },
  ],
  rows: [
    { rowType: 'group', label: 'Response Times',         cells: [] },
    { rowType: 'row', label: 'Critical incidents',        cells: [{ text: '8 hours' }, { text: '2 hours' }, { text: '30 minutes' }] },
    { rowType: 'row', label: 'High-severity issues',      cells: [{ text: 'Next day' }, { text: '4 hours' }, { text: '2 hours' }] },
    { rowType: 'row', label: 'General questions',         cells: [{ text: '3 business days' }, { text: '1 business day' }, { text: '4 hours' }] },
    { rowType: 'group', label: 'Access & Coverage',      cells: [] },
    { rowType: 'row', label: 'Support hours',             cells: [{ text: '9am – 5pm ET' }, { text: '7am – 9pm ET' }, { icon: 'clock', text: '24 / 7' }] },
    { rowType: 'row', label: 'Phone support',             cells: [{ icon: 'minus' }, { icon: 'check' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Dedicated Slack channel',   cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Named support engineer',    cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'users' }] },
    { rowType: 'group', label: 'Guidance',               cells: [] },
    { rowType: 'row', label: 'Quarterly business review', cells: [{ icon: 'minus' }, { icon: 'check' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Architecture guidance',     cells: [{ icon: 'minus' }, { icon: 'minus' }, { icon: 'check' }] },
    { rowType: 'row', label: 'Onboarding workshop',       cells: [{ icon: 'minus' }, { icon: 'check' }, { icon: 'check' }] },
  ],
}

function ComparisonTableShowcase() {
  return (
    <>
      <BlockHeader slug="comparison-table" />

      <VariantGroup label="Style: Clean · Canvas" note="Subtle brand tinting on the featured column. Group headers use a light brand wash. Cells are centered; row labels are semibold." />
      <div className="border-t border-fg/5">
        <OT_ComparisonTableBlock content={{ ...ACCOUNTS_CONTENT, tableStyle: 'clean' } as any} displaySettings={{ color: 'canvas' }} />
      </div>

      <VariantGroup label="Style: Elevated · Surface" note="Featured column renders as a continuous brand-fill card with chromatic bloom shadow on sides and bottom — same color in light and dark mode." />
      <div className="border-t border-fg/5">
        <OT_ComparisonTableBlock content={{ ...ACCOUNTS_CONTENT, tableStyle: 'elevated' } as any} displaySettings={{ color: 'surface' }} />
      </div>

      <VariantGroup label="Style: Bold · Canvas" note="Full brand fill across the featured column — diagonal gradient header, solid brand body cells, and inverted (fg-on-brand) icons and text." />
      <div className="border-t border-fg/5">
        <OT_ComparisonTableBlock content={{ ...ACCOUNTS_CONTENT, tableStyle: 'bold' } as any} displaySettings={{ color: 'canvas' }} />
      </div>

      <VariantGroup label="Style: Elevated · Surface · Tech support tiers" note="Three support plans demonstrating icon + text cells (24/7 clock), icon-only checks and dashes, and the Elevated style on a surface background." />
      <div className="border-t border-fg/5">
        <OT_ComparisonTableBlock content={{ ...SUPPORT_CONTENT, tableStyle: 'elevated' } as any} displaySettings={{ color: 'surface' }} />
      </div>

      <div className="pb-xl" />
    </>
  )
}

export default async function ShowcaseBlockPage({ params }: Props) {
  const { block } = await params

  switch (block as BlockSlug) {
    case 'hero':         return <><BlockHeader slug="hero" /><HeroPlayground /></>
    case 'card':         return <><BlockHeader slug="card" /><CardPlayground /></>
    case 'primary-text': return <><BlockHeader slug="primary-text" /><PrimaryTextPlayground /></>
    case 'quote':        return <><BlockHeader slug="quote" /><QuotePlayground /></>
    case 'rich-text':    return <RichTextShowcase />
    case 'image':        return <><BlockHeader slug="image" /><ImagePlayground /></>
    case 'video':        return <><BlockHeader slug="video" /><VideoPlayground /></>
    case 'stat':         return <><BlockHeader slug="stat" /><StatPlayground /></>
    case 'feature-grid': return <><BlockHeader slug="feature-grid" /><FeatureGridPlayground /></>
    case 'trust-rail':   return <><BlockHeader slug="trust-rail" /><TrustRailPlayground /></>
    case 'accordion':    return <><BlockHeader slug="accordion" /><AccordionPlayground /></>
    case 'tabs':         return <><BlockHeader slug="tabs" /><TabsPlayground /></>
    case 'blog-feed':    return <BlogFeedShowcase />
    case 'button':       return <><BlockHeader slug="button" /><ButtonPlayground /></>
    case 'chart':        return <ChartShowcase />
    case 'banner':            return <><BlockHeader slug="banner" /><BannerPlayground /></>
    case 'resource-library': return <ResourceLibraryShowcase />
    case 'callout':          return <><BlockHeader slug="callout" /><CalloutPlayground /></>
    case 'divider':          return <><BlockHeader slug="divider" /><DividerPlayground /></>
    case 'event-listing':    return <EventListingShowcase />
    case 'practitioner-listing': return <PractitionerListingShowcase />
    case 'location-listing':     return <LocationListingShowcase />
    case 'content-recommendations': return <ContentRecommendationsShowcase />
    case 'product-recommendations': return <ProductRecommendationsShowcase />
    case 'comparison-table':        return <ComparisonTableShowcase />
    default:                 return notFound()
  }
}
