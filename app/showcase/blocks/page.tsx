import type { Metadata } from "next";
import Image from "next/image";
import { SectionLabel } from "../components";
import HeroBlock from "@/components/blocks/HeroBlock";
import type { HeroBlockProps } from "@/components/blocks/HeroBlock";
import PrimaryTextBlock from "@/components/blocks/PrimaryTextBlock";
import type { PrimaryTextBlockProps } from "@/components/blocks/PrimaryTextBlock";
import RichTextBlock from "@/components/blocks/RichTextBlock";
import type { RichTextBlockProps } from "@/components/blocks/RichTextBlock";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import type { QuoteBlockProps } from "@/components/blocks/QuoteBlock";
import ImageBlock from "@/components/blocks/ImageBlock";
import type { ImageBlockProps } from "@/components/blocks/ImageBlock";
import CardBlock from "@/components/blocks/CardBlock";
import Button from "@/components/ui/Button";
import { ArrowRight, Zap, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Components — Design System — OptiTech",
};

// ─── Group header ─────────────────────────────────────────────────────────────

function BlockGroup({
  id,
  label,
  description,
}: {
  id: string;
  label: string;
  description: string;
}) {
  return (
    <div id={id} className="px-md pt-xl pb-lg lg:px-lg bg-surface/30">
      <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">
        {label}
      </p>
      <p className="text-body leading-body text-fg-muted max-w-[65ch]">{description}</p>
    </div>
  );
}

// ─── Hero data ────────────────────────────────────────────────────────────────

const HERO_IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop";
const HERO_ALT = "Glass skyscrapers in a modern city financial district";

const HERO_COLORS: Array<{ label: string; props: HeroBlockProps }> = [
  {
    label: "Brand · Image Right (default)",
    props: {
      eyebrow: "Introducing OptiTech",
      headline: "Move at the speed of certainty.",
      body: "OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.",
      primaryCta:   { label: "Get started",  href: "#" },
      secondaryCta: { label: "Learn more",   href: "#" },
      visualSrc: HERO_IMG,
      visualAlt: HERO_ALT,
      styleOptions: { layout: "imageRight", color: "brand" },
    },
  },
  {
    label: "Canvas · Image Left",
    props: {
      eyebrow: "The platform",
      headline: "Built for teams who ship daily.",
      body: "Feature flags, experiment data, and deployment telemetry in one platform. OptiTech closes the gap between shipping and knowing.",
      primaryCta: { label: "View the platform", href: "#" },
      visualSrc: HERO_IMG,
      visualAlt: HERO_ALT,
      styleOptions: { layout: "imageLeft", color: "canvas" },
    },
  },
  {
    label: "Surface · Image Right",
    props: {
      eyebrow: "The method",
      headline: "Precision at every layer.",
      body: "From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.",
      primaryCta: { label: "See how it works", href: "#" },
      visualSrc: HERO_IMG,
      visualAlt: HERO_ALT,
      styleOptions: { layout: "imageRight", color: "surface" },
    },
  },
];

const HERO_NO_IMAGE: Array<{ label: string; props: HeroBlockProps }> = [
  {
    label: "Brand · No image",
    props: {
      eyebrow: "Introducing OptiTech",
      headline: "Move at the speed of certainty.",
      body: "OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.",
      primaryCta:   { label: "Get started",  href: "#" },
      secondaryCta: { label: "Learn more",   href: "#" },
      styleOptions: { color: "brand" },
    },
  },
  {
    label: "Canvas · No image",
    props: {
      eyebrow: "The platform",
      headline: "Built for teams who ship daily.",
      body: "Feature flags, experiment data, and deployment telemetry in one platform. OptiTech closes the gap between shipping and knowing.",
      primaryCta: { label: "View the platform", href: "#" },
      styleOptions: { color: "canvas" },
    },
  },
  {
    label: "Surface · No image",
    props: {
      eyebrow: "The method",
      headline: "Precision at every layer.",
      body: "From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.",
      primaryCta: { label: "See how it works", href: "#" },
      styleOptions: { color: "surface" },
    },
  },
];

const HERO_ANIMATIONS: Array<{ label: string; note: string; props: HeroBlockProps }> = [
  {
    label: "Fade",
    note: "motion-safe: fade entrance on section mount",
    props: {
      eyebrow: "Animation",
      headline: "Fade entrance.",
      primaryCta: { label: "Get started", href: "#" },
      visualSrc: HERO_IMG,
      visualAlt: HERO_ALT,
      styleOptions: { color: "brand", animation: "fade" },
    },
  },
  {
    label: "Slide",
    note: "motion-safe: slide-up entrance — expo ease-out",
    props: {
      eyebrow: "Animation",
      headline: "Slide entrance.",
      primaryCta: { label: "Get started", href: "#" },
      visualSrc: HERO_IMG,
      visualAlt: HERO_ALT,
      styleOptions: { color: "canvas", animation: "slide" },
    },
  },
];

// ─── PrimaryTextBlock data ────────────────────────────────────────────────────

const PRIMARY_TEXT_SIZES: PrimaryTextBlockProps[] = [
  {
    eyebrow: "The platform",
    headline: "Speed that compounds.",
    styleOptions: { size: "display", color: "canvas", alignment: "left" },
  },
  {
    eyebrow: "Integrations",
    headline: "Connect everything you already use.",
    styleOptions: { size: "headline", color: "canvas", alignment: "left" },
  },
  {
    eyebrow: "Customers",
    headline: "Trusted by teams who ship fast.",
    styleOptions: { size: "title", color: "canvas", alignment: "left" },
  },
  {
    headline: "Section tag · Supporting context",
    styleOptions: { size: "label", color: "canvas", alignment: "left" },
  },
];

const PRIMARY_TEXT_COLORS: PrimaryTextBlockProps[] = [
  {
    eyebrow: "The method",
    headline: "Precision at every layer.",
    styleOptions: { size: "headline", color: "brand", alignment: "left" },
  },
  {
    eyebrow: "The method",
    headline: "Precision at every layer.",
    styleOptions: { size: "headline", color: "canvas", alignment: "left" },
  },
  {
    eyebrow: "The method",
    headline: "Precision at every layer.",
    styleOptions: { size: "headline", color: "surface", alignment: "left" },
  },
];

const PRIMARY_TEXT_GRADIENTS: PrimaryTextBlockProps[] = [
  {
    eyebrow: "Brand Sweep",
    headline: "Kinetic by design.",
    styleOptions: { size: "display", color: "canvas", alignment: "center", gradient: "brand" },
  },
  {
    eyebrow: "Warm to Cool",
    headline: "Heat meets precision.",
    styleOptions: { size: "display", color: "canvas", alignment: "center", gradient: "warm" },
  },
  {
    eyebrow: "Luminous",
    headline: "Lit from within.",
    styleOptions: { size: "display", color: "canvas", alignment: "center", gradient: "luminous" },
  },
  {
    eyebrow: "Ember",
    headline: "Burn bright.",
    styleOptions: { size: "display", color: "canvas", alignment: "center", gradient: "ember" },
  },
];

// ─── RichTextBlock data ───────────────────────────────────────────────────────

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
<p>The result is a flywheel: faster experiments produce better data, better data produces more confident decisions, more confident decisions produce faster experiments.</p>
`;

const RT_PROSE = `
<p>OptiTech was built for teams who move faster than quarterly roadmaps. We identified a gap between the pace at which modern software ships and the tools available to measure, refine, and respond to it.</p>
<p>The platform ingests signals from every layer of the stack: feature flags, experiment data, user behaviour telemetry, and deployment events. It surfaces the patterns that matter before they become problems.</p>
<p>Decisions are made at the edges of your system. OptiTech gives your engineering and product teams a shared language for running experiments with statistical confidence backed by real signal.</p>
`;

const RT_STRUCTURED = `
<h2>Why OptiTech</h2>
<p>Speed that compounds. The faster you can measure, the faster you can iterate. OptiTech shortens the loop between shipping code and knowing whether it worked.</p>
<h3>For engineering teams</h3>
<p>Feature flags with a full audit trail. Targeted rollouts. Statistical validity checks built into the platform so you don't have to re-derive them in a spreadsheet the morning after launch.</p>
<h3>For product teams</h3>
<p>Experiment design tools that connect directly to your data. No more waiting three weeks for results from a release you've already moved past.</p>
`;

const RICH_TEXT_COLORS: RichTextBlockProps[] = [
  { content: RT_FULL, styleOptions: { color: "canvas", size: "editorial" } },
  { content: RT_FULL, styleOptions: { color: "surface", size: "editorial" } },
  { content: RT_FULL, styleOptions: { color: "brand",   size: "editorial" } },
];

const RICH_TEXT_TREATMENTS: Array<{ label: string; note: string; props: RichTextBlockProps }> = [
  {
    label: "Standard",
    note: "Faithful prose rendering (default)",
    props: { content: RT_PROSE, styleOptions: { color: "canvas", treatment: "standard" } },
  },
  {
    label: "Lead",
    note: "First paragraph promoted to deck size in Blueprint color",
    props: { content: RT_PROSE, styleOptions: { color: "canvas", treatment: "lead" } },
  },
  {
    label: "Dropcap",
    note: "First letter enlarged in brand teal, floated left",
    props: { content: RT_PROSE, styleOptions: { color: "canvas", treatment: "dropcap" } },
  },
];

const RICH_TEXT_OPTIONS: Array<{ label: string; note: string; props: RichTextBlockProps }> = [
  {
    label: "Ruled headings",
    note: "1px teal rule above h2 and h3: editorial chapter dividers",
    props: { content: RT_STRUCTURED, styleOptions: { color: "canvas", ruledHeadings: true } },
  },
  {
    label: "Compact + ruled",
    note: "Tighter scale for shorter sections; ruled headings still apply",
    props: { content: RT_STRUCTURED, styleOptions: { color: "surface", size: "compact", ruledHeadings: true } },
  },
  {
    label: "Center aligned",
    note: "Column centred within the section, for opening statements",
    props: { content: RT_PROSE, styleOptions: { color: "canvas", alignment: "center", treatment: "lead" } },
  },
];

// ─── QuoteBlock data ──────────────────────────────────────────────────────────

const QUOTE_COLOR_SCHEMES: QuoteBlockProps[] = [
  {
    quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.",
    attribution: { name: "Sarah Chen", title: "VP Engineering, Meridian" },
    styleOptions: { color: "brand", alignment: "left", size: "large" },
  },
  {
    quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.",
    attribution: { name: "Sarah Chen", title: "VP Engineering, Meridian" },
    styleOptions: { color: "canvas", alignment: "left", size: "large" },
  },
  {
    quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.",
    attribution: { name: "Sarah Chen", title: "VP Engineering, Meridian" },
    styleOptions: { color: "surface", alignment: "left", size: "large" },
  },
];

const QUOTE_SIZES: QuoteBlockProps[] = [
  {
    quote: "We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.",
    attribution: { name: "Marcus Reid", title: "CTO, Folio" },
    styleOptions: { size: "large", color: "canvas", alignment: "left" },
  },
  {
    quote: "We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.",
    attribution: { name: "Marcus Reid", title: "CTO, Folio" },
    styleOptions: { size: "small", color: "canvas", alignment: "left" },
  },
];

const QUOTE_ALIGNMENTS: QuoteBlockProps[] = [
  {
    quote: "The only platform that keeps up with how fast we move.",
    attribution: { name: "Priya Nair", title: "Head of Product, Vertex" },
    styleOptions: { alignment: "left", color: "canvas", size: "large" },
  },
  {
    quote: "The only platform that keeps up with how fast we move.",
    attribution: { name: "Priya Nair", title: "Head of Product, Vertex" },
    styleOptions: { alignment: "center", color: "canvas", size: "large" },
  },
];

// ─── ImageBlock data ──────────────────────────────────────────────────────────

const IMAGE_SRC = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop";
const IMAGE_ALT = "Business professionals walking past glass skyscrapers in a modern city financial district";

const IMAGE_TREATMENTS: Array<{ label: string; note: string; props: ImageBlockProps }> = [
  {
    label: "Clean",
    note: "No treatments — baseline",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9" } },
  },
  {
    label: "Frame: offset",
    note: "Bold teal backing block — 12px mounting-board strip on right and bottom",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: "offset" } },
  },
  {
    label: "Frame: glow",
    note: "Inset teal ring + outer ambient bloom — image appears backlit",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: "glow" } },
  },
  {
    label: "Overlay",
    note: "Brand teal at 40% opacity, multiply blend",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", overlay: true } },
  },
  {
    label: "Glow + Overlay",
    note: "Atmospheric — teal wash unifies tone, glow defines the edge",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: "glow", overlay: true } },
  },
  {
    label: "Offset + Overlay",
    note: "Bold — teal backing anchors the image; wash pulls the palette through",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: "offset", overlay: true } },
  },
];

const IMAGE_CAPTIONS: Array<{ label: string; note: string; props: ImageBlockProps }> = [
  {
    label: "Caption inset",
    note: "Badge floats over bottom-left corner",
    props: {
      src: IMAGE_SRC,
      alt: IMAGE_ALT,
      caption: "Precision-manufactured circuit board — OptiTech hardware layer.",
      styleOptions: { ratio: "16:9", captionPosition: "inset" },
    },
  },
  {
    label: "Caption below",
    note: "Label-scale text beneath the image",
    props: {
      src: IMAGE_SRC,
      alt: IMAGE_ALT,
      caption: "Precision-manufactured circuit board — OptiTech hardware layer.",
      styleOptions: { ratio: "16:9", captionPosition: "below" },
    },
  },
];

const IMAGE_RATIOS: Array<{ label: string; props: ImageBlockProps }> = [
  { label: "16:9", props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9" } } },
  { label: "4:3",  props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "4:3"  } } },
  { label: "3:2",  props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "3:2"  } } },
  { label: "1:1",  props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "1:1"  } } },
];

const IMAGE_SHADOWS: Array<{ label: string; note: string; props: ImageBlockProps }> = [
  {
    label: "Shadow only",
    note: "Teal left, signal green right — chromatic halo",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true } },
  },
  {
    label: "Shadow + Glow",
    note: "Inset glow defines the image boundary; shadow bloom radiates below — two depths, one surface",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, frame: "glow" } },
  },
  {
    label: "Shadow + Overlay",
    note: "Teal wash unifies image tone; shadow amplifies it",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, overlay: true } },
  },
  {
    label: "Shadow + Glow + Overlay",
    note: "Full atmospheric stack — wash, edge glow, and bloom all in the same teal register",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, frame: "glow", overlay: true } },
  },
];

// ─── CardBlock data ───────────────────────────────────────────────────────────

const CARD_IMG_A     = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop";
const CARD_IMG_A_ALT = "Glass skyscrapers in a modern city financial district";
const CARD_IMG_B     = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop";
const CARD_IMG_B_ALT = "Electronic circuit board close-up showing components";
const CARD_IMG_C     = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop";
const CARD_IMG_C_ALT = "Data analytics charts on a laptop screen";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcaseBlocksPage() {
  return (
    <>

      {/* ════════════════════════════════════════════════════
          UI ELEMENTS — BUTTON
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="ui"
        label="UI Elements"
        description="Foundational interactive primitives. CVA-based, TypeScript props, polymorphic (button or Link). Three variants, three sizes, optional icon slots."
      />

      <section id="button" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="00 · UI" title="Button" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Three variants: <code className="font-mono text-fg text-label">primary</code> (teal fill),{" "}
            <code className="font-mono text-fg text-label">ghost</code> (bordered, for dark/teal surfaces),{" "}
            <code className="font-mono text-fg text-label">signal</code> (kinetic fill sweep — the attention CTA).
            Renders as <code className="font-mono text-fg text-label">&lt;button&gt;</code> or{" "}
            <code className="font-mono text-fg text-label">&lt;Link&gt;</code> based on <code className="font-mono text-fg text-label">href</code>.
          </p>
        </div>

        {/* ── Variants ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Variants · md · on canvas
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">primary</span>
            <Button variant="primary" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">ghost</span>
            <Button variant="ghost" href="#">Learn more</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">signal</span>
            <Button variant="signal" href="#">See it in action</Button>
          </div>
        </div>

        {/* ── Sizes ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · primary variant
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-end">
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">sm</span>
            <Button variant="primary" size="sm" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">md (default)</span>
            <Button variant="primary" size="md" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">lg</span>
            <Button variant="primary" size="lg" href="#">Get started</Button>
          </div>
        </div>

        {/* ── Icons ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Icon slots · leading · trailing · both
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">leadingIcon</span>
            <Button variant="primary" href="#" leadingIcon={<Zap />}>Deploy now</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">trailingIcon</span>
            <Button variant="primary" href="#" trailingIcon={<ArrowRight />}>Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">ghost + trailingIcon</span>
            <Button variant="ghost" href="#" trailingIcon={<ChevronRight />}>Learn more</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">signal + trailingIcon</span>
            <Button variant="signal" href="#" trailingIcon={<ArrowRight />}>See it live</Button>
          </div>
        </div>

        {/* ── Signal variant in context ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Signal · kinetic fill sweep
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Hover to trigger. Teal fills left-to-right; text transitions to press-white 75ms into the sweep.
            Reduced-motion: instant background swap, no animation.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-lg items-end">
          {(["sm", "md", "lg"] as const).map((s) => (
            <div key={s} className="flex flex-col gap-sm items-start">
              <span className="font-mono text-label text-fg-muted/50">{s}</span>
              <Button variant="signal" size={s} href="#" trailingIcon={<ArrowRight />}>
                {s === "sm" ? "Start free" : s === "md" ? "Start your trial" : "Start your free trial"}
              </Button>
            </div>
          ))}
        </div>

        {/* ── Disabled states ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Disabled · all variants
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-start">
          <Button variant="primary" disabled>Get started</Button>
          <Button variant="ghost" disabled>Learn more</Button>
          <Button variant="signal" disabled>See it in action</Button>
        </div>

        {/* ── On brand surface ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            On brand surface · ghost + signal in context
          </p>
        </div>
        <div className="bg-brand px-md py-xl lg:px-lg flex flex-wrap gap-md items-center">
          <Button variant="ghost" href="#">Learn more</Button>
          <Button variant="ghost" href="#" trailingIcon={<ChevronRight />}>View the platform</Button>
        </div>

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          HERO BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="hero"
        label="Hero Blocks"
        description="Split-panel hero sections: a text panel on one side, a visual panel on the other. The visual panel accepts a next/image src or any ReactNode for custom compositions like SVGs or code samples."
      />

      {/* HeroBlock */}
      <section id="hero-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="01 · Hero" title="HeroBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Full-bleed split layout with a text panel and an optional visual panel. When no visual
            is provided the text panel expands to full width. Layout, color, and entrance animation
            are style options. CTAs are optional. Visual accepts{" "}
            <code className="font-mono text-fg text-label">visualSrc</code> (next/image)
            or a <code className="font-mono text-fg text-label">visual</code> ReactNode override.
          </p>
        </div>

        {/* Color schemes */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · layout variants
          </p>
        </div>
        {HERO_COLORS.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">{item.label}</span>
            </div>
            <HeroBlock {...item.props} />
          </div>
        ))}

        {/* No image */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            No Image · full-width text panel
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            When no visual is provided the text panel expands to full width and the visual panel is omitted.
          </p>
        </div>
        {HERO_NO_IMAGE.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">{item.label}</span>
            </div>
            <HeroBlock {...item.props} />
          </div>
        ))}

        {/* Animations */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Entrance Animations · motion-safe
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Entrances fire on mount. All degrade to instant display when prefers-reduced-motion is set.
          </p>
        </div>
        {HERO_ANIMATIONS.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
              <span className="text-label tracking-label uppercase text-brand font-semibold">
                {item.label}
              </span>
              <span className="text-label text-fg-muted/60">{item.note}</span>
            </div>
            <HeroBlock {...item.props} />
          </div>
        ))}

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          TYPOGRAPHY BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="typography"
        label="Typography Blocks"
        description="Text-focused components for section openers, statement callouts, and editorial body copy. PrimaryTextBlock for headlines; RichTextBlock for CMS-managed HTML prose."
      />

      {/* PrimaryTextBlock */}
      <section id="primary-text-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="02 · Typography" title="PrimaryTextBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Typographic accent block for section openers, pacing moments, and statement callouts.
            Eyebrow label and headline only — Poppins throughout. All style options map 1:1 to CMS
            content properties.
          </p>
        </div>

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · canvas · left
          </p>
        </div>
        {PRIMARY_TEXT_SIZES.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                size: &ldquo;{props.styleOptions?.size}&rdquo;
              </span>
            </div>
            <PrimaryTextBlock {...props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · headline · left · same copy
          </p>
        </div>
        {PRIMARY_TEXT_COLORS.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{props.styleOptions?.color}&rdquo;
              </span>
            </div>
            <PrimaryTextBlock {...props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Display Gradients · display · center · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Gradient fires only when size is &ldquo;display&rdquo; — enforced by CVA compound variant.
          </p>
        </div>
        {PRIMARY_TEXT_GRADIENTS.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                gradient: &ldquo;{props.styleOptions?.gradient}&rdquo;
              </span>
            </div>
            <PrimaryTextBlock {...props} />
          </div>
        ))}

        <div className="pb-xl" />
      </section>

      {/* RichTextBlock */}
      <section id="rich-text-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="03 · Typography" title="RichTextBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Full-width prose section rendering TinyMCE WYSIWYG HTML output: headings, paragraphs,
            lists, blockquotes, and inline elements. Typography is applied via scoped CSS on a{" "}
            <code className="font-mono text-fg text-label">data-rich-text</code> container.
          </p>
        </div>

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · editorial · left · same copy
          </p>
        </div>
        {RICH_TEXT_COLORS.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{props.styleOptions?.color}&rdquo;
              </span>
            </div>
            <RichTextBlock {...props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Treatments · canvas · editorial · same copy
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Treatment affects the first paragraph only.
          </p>
        </div>
        {RICH_TEXT_TREATMENTS.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
              <span className="font-mono text-label text-fg-muted/50">
                treatment: &ldquo;{item.props.styleOptions?.treatment}&rdquo;
              </span>
              <span className="text-label text-fg-muted/40">{item.note}</span>
            </div>
            <RichTextBlock {...item.props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Options · ruled headings · compact · center aligned
          </p>
        </div>
        {RICH_TEXT_OPTIONS.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
              <span className="text-label tracking-label uppercase text-brand font-semibold">
                {item.label}
              </span>
              <span className="text-label text-fg-muted/60">{item.note}</span>
            </div>
            <RichTextBlock {...item.props} />
          </div>
        ))}

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          QUOTE BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="quote"
        label="Quote Blocks"
        description="Full-width testimonial and pull-quote sections. The large quotation mark is a Poppins 800 letterform, not an icon. Quote text and attribution only; no imagery."
      />

      <section id="quote-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="04 · Quote" title="QuoteBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Typographic anchor moment for customer social proof and editorial pull quotes.
            All style options map 1:1 to CMS content properties.
          </p>
        </div>

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · large · left · same copy
          </p>
        </div>
        {QUOTE_COLOR_SCHEMES.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{props.styleOptions?.color}&rdquo;
              </span>
            </div>
            <QuoteBlock {...props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · canvas · left · same copy
          </p>
        </div>
        {QUOTE_SIZES.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                size: &ldquo;{props.styleOptions?.size}&rdquo;
              </span>
            </div>
            <QuoteBlock {...props} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Alignment · canvas · large · same copy
          </p>
        </div>
        {QUOTE_ALIGNMENTS.map((props, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                alignment: &ldquo;{props.styleOptions?.alignment}&rdquo;
              </span>
            </div>
            <QuoteBlock {...props} />
          </div>
        ))}

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          MEDIA BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="media"
        label="Media Blocks"
        description="Image and video components for editorial, product, and illustrative content. Contained within the column with support for overlays, frames, captions, and animated reveals."
      />

      <section id="image-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="05 · Media" title="ImageBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Flexible image block with two frame modes (bold offset backing, atmospheric glow), teal brand overlay,
            inset or below caption, chromatic shadow bloom, and a scroll-triggered wipe reveal. All options map 1:1 to CMS
            content properties.
          </p>
        </div>

        {/* Treatments */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Treatments</p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {IMAGE_TREATMENTS.map((item) => (
              <div key={item.label}>
                <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                  <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                  <span className="text-label text-fg-muted/60">{item.note}</span>
                </div>
                <ImageBlock {...item.props} />
              </div>
            ))}
          </div>
        </div>

        {/* Captions */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Captions</p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {IMAGE_CAPTIONS.map((item) => (
              <div key={item.label}>
                <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                  <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                  <span className="text-label text-fg-muted/60">{item.note}</span>
                </div>
                <ImageBlock {...item.props} />
              </div>
            ))}
          </div>
        </div>

        {/* Aspect Ratios */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Aspect Ratios</p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            {IMAGE_RATIOS.map((item) => (
              <div key={item.label}>
                <p className="text-label tracking-label uppercase text-brand font-semibold mb-sm">{item.label}</p>
                <ImageBlock {...item.props} />
              </div>
            ))}
          </div>
        </div>

        {/* Shadow */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Shadow · chromatic bloom
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Dual radial gradient: brand teal pools bottom-left, signal green bottom-right.
            52px blur diffuses into a halo that bleeds past the image edge.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {IMAGE_SHADOWS.map((item) => (
              <div key={item.label}>
                <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                  <span className="text-label tracking-label uppercase text-brand font-semibold">{item.label}</span>
                  <span className="text-label text-fg-muted/60">{item.note}</span>
                </div>
                <ImageBlock {...item.props} />
              </div>
            ))}
          </div>
        </div>

        {/* Animate */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Animate · scroll-triggered wipe reveal
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Teal bar sweeps right; image follows on its heels via clip-path.
            Fires once on IntersectionObserver entry. Respects prefers-reduced-motion.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <ImageBlock
            src={IMAGE_SRC}
            alt={IMAGE_ALT}
            caption="OptiTech. Precision at every layer."
            styleOptions={{ ratio: "16:9", animate: true, frame: "offset", captionPosition: "inset" }}
          />
        </div>

      </section>

      {/* ════════════════════════════════════════════════════
          CONTENT BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="content"
        label="Content Blocks"
        description="Composable card components for feature sections, case studies, and collection displays. Fill and border are independently controlled; image renders as top, background, or side."
      />

      <section id="card-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="06 · Content" title="CardBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            A single composable card: eyebrow, heading, description, optional image, optional CTA.
            Fill (<code className="font-mono text-fg text-label">ghost</code>,{" "}
            <code className="font-mono text-fg text-label">surface</code>,{" "}
            <code className="font-mono text-fg text-label">brand</code>,{" "}
            <code className="font-mono text-fg text-label">light</code>) and border
            (<code className="font-mono text-fg text-label">none</code>,{" "}
            <code className="font-mono text-fg text-label">subtle</code>,{" "}
            <code className="font-mono text-fg text-label">brand</code>) are independent.
            Image style controls layout:{" "}
            <code className="font-mono text-fg text-label">top</code> (4:3 above content),{" "}
            <code className="font-mono text-fg text-label">background</code> (full-bleed with scrim), or{" "}
            <code className="font-mono text-fg text-label">side</code> (40% image column, left or right).
            Cards are <code className="font-mono text-fg text-label">h-full</code> for equal-height grid alignment.
          </p>
        </div>

        {/* ── Fill variants ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Fill variants · no image · with CTA
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            <CardBlock
              heading="Targeted Rollouts"
              eyebrow="Deployment"
              description="Deploy to any user segment with a single API call. Real-time, without a redeploy."
              cta={{ label: "Learn more", href: "#" }}
              styleOptions={{ fill: "ghost", border: "subtle" }}
            />
            <CardBlock
              heading="Experiment Engine"
              eyebrow="Analytics"
              description="Concurrent A/B tests with automatic interaction detection. Results in hours, not weeks."
              cta={{ label: "Learn more", href: "#" }}
              styleOptions={{ fill: "surface" }}
            />
            <CardBlock
              heading="Statistical Confidence"
              eyebrow="Insights"
              description="Power calculations and confidence intervals are built into the platform. No spreadsheets."
              cta={{ label: "Learn more", href: "#" }}
              styleOptions={{ fill: "brand" }}
            />
            <CardBlock
              heading="Instant Rollback"
              eyebrow="Safety"
              description="One flag, one API call. Revert any change across every deployment in seconds."
              cta={{ label: "Learn more", href: "#" }}
              styleOptions={{ fill: "light" }}
            />
          </div>
        </div>

        {/* ── Border variants ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Border variants · no image
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <span className="font-mono text-label text-fg-muted/50">surface · border: none</span>
              <div className="mt-sm">
                <CardBlock
                  heading="No Border"
                  eyebrow="Surface"
                  description="Surface fill with no border. Content is defined by background contrast, not a frame."
                  cta={{ label: "Explore", href: "#" }}
                  styleOptions={{ fill: "surface", border: "none" }}
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-label text-fg-muted/50">surface · border: subtle</span>
              <div className="mt-sm">
                <CardBlock
                  heading="Subtle Border"
                  eyebrow="Surface"
                  description="1px at 10% foreground opacity. Barely-there definition for cards that float over dark grounds."
                  cta={{ label: "Explore", href: "#" }}
                  styleOptions={{ fill: "surface", border: "subtle" }}
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-label text-fg-muted/50">ghost · border: brand</span>
              <div className="mt-sm">
                <CardBlock
                  heading="Brand Border"
                  eyebrow="Ghost"
                  description="1px teal border signals selection or attention. Works best on ghost fill over a dark section."
                  cta={{ label: "Explore", href: "#" }}
                  styleOptions={{ fill: "ghost", border: "brand" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Image: top ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Image: top · 4:3 aspect · surface fill
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Feature Flags at Scale"
              eyebrow="Platform"
              description="Ship to any segment with a kill switch on every flag. The safest way to deploy at velocity."
              image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
              cta={{ label: "See how it works", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "top" }}
            />
            <CardBlock
              heading="Precision-Grade Telemetry"
              eyebrow="Infrastructure"
              description="Every signal, every layer. OptiTech ingests data from flag changes, deploys, and user events in real time."
              image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
              cta={{ label: "See how it works", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "top" }}
            />
            <CardBlock
              heading="Results You Can Act On"
              eyebrow="Analytics"
              description="Statistical significance checks, interaction effects, and automatic stopping rules. No guesswork."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "See how it works", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "top" }}
            />
          </div>
        </div>

        {/* ── Image: background ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Image: background · scrim · content at bottom
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Dark gradient from bottom. Text always press-white regardless of fill.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Ship with confidence."
              eyebrow="Deployment"
              description="Every flag tracked. Every change reversible."
              image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
              cta={{ label: "Get started", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "background" }}
            />
            <CardBlock
              heading="Measure what matters."
              eyebrow="Analytics"
              description="Real signals, not approximations."
              image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
              styleOptions={{ fill: "surface", imageStyle: "background" }}
            />
            <CardBlock
              heading="Iterate faster."
              eyebrow="Velocity"
              description="From hypothesis to result in hours."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "See the platform", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "background" }}
            />
          </div>
        </div>

        {/* ── Image: side ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Image: side · imageSide left and right
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Stacks vertically on mobile. At md+, image occupies 40% of card width; content fills the rest.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-col gap-lg">
          <div>
            <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;left&rdquo;</span>
            <div className="mt-sm">
              <CardBlock
                heading="Infrastructure built for continuous delivery."
                eyebrow="Platform"
                description="OptiTech gives engineering teams the tooling to ship incrementally, measure precisely, and respond in real time. Feature flags, experiment infrastructure, and deployment telemetry in one platform."
                image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
                cta={{ label: "View the platform", href: "#" }}
                styleOptions={{ fill: "surface", imageStyle: "side", imageSide: "left" }}
              />
            </div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;right&rdquo;</span>
            <div className="mt-sm">
              <CardBlock
                heading="Statistical confidence at every decision point."
                eyebrow="Analytics"
                description="Every experiment runs with power calculations, automatic stopping rules, and interaction effect detection. Ship when the data says so, not when the sprint ends."
                image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
                cta={{ label: "Explore analytics", href: "#" }}
                styleOptions={{ fill: "surface", imageStyle: "side", imageSide: "right" }}
              />
            </div>
          </div>
        </div>

        {/* ── Minimal ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Minimal · eyebrow + heading only · no description · no CTA · no image
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Feature flags for every team."
              eyebrow="Deployment"
              styleOptions={{ fill: "surface", border: "subtle" }}
            />
            <CardBlock
              heading="Experiments that answer real questions."
              eyebrow="Analytics"
              styleOptions={{ fill: "brand" }}
            />
            <CardBlock
              heading="Rollback in one API call."
              eyebrow="Safety"
              styleOptions={{ fill: "ghost", border: "brand" }}
            />
          </div>
        </div>

        {/* ── fill:glass ──────────────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            fill:glass · dark glass panels over imagery
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Dark glass requires something interesting beneath it — imagery, a teal section, a layered background.
            The border auto-defaults to subtle to define the glass panel edge.
          </p>
        </div>
        <div className="relative overflow-hidden">
          {/* Background image behind the glass grid */}
          <Image
            src={CARD_IMG_A}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden
          />
          {/* Dark scrim so the cards don't fight the image too hard */}
          <div className="absolute inset-0 bg-canvas/40" />
          <div className="relative z-10 px-md py-xl lg:px-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <CardBlock
                heading="Edges computed at the edge."
                eyebrow="Edge Network"
                description="OptiTech routes intelligence to where your users are — 200ms becomes 20ms without changing a line of application code."
                cta={{ label: "See coverage", href: "#" }}
                styleOptions={{ fill: "glass", hover: "glow" }}
              />
              <CardBlock
                heading="Flags ship features safely."
                eyebrow="Feature Flags"
                description="Controlled rollouts, instant kill-switches, and audience targeting — all without a deployment cycle."
                cta={{ label: "Read the docs", href: "#" }}
                styleOptions={{ fill: "glass", hover: "glow" }}
              />
              <CardBlock
                heading="Every experiment tells a story."
                eyebrow="Experimentation"
                description="Statistical rigor built in. Run A/B tests and multivariate experiments with automatic significance detection."
                cta={{ label: "Start experimenting", href: "#" }}
                styleOptions={{ fill: "glass", hover: "glow" }}
              />
            </div>
          </div>
        </div>
        <div className="px-md pt-xl pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Glass + top image: image blurs into the glass content panel */}
            <CardBlock
              heading="Glass over photo."
              eyebrow="fill:glass · imageStyle:float"
              description="Float + glass: the content panel blurs the image below it through the glass surface — depth compounds into a single surface moment."
              image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
              cta={{ label: "Explore", href: "#" }}
              styleOptions={{ fill: "glass", imageStyle: "float", hover: "lift" }}
            />
            {/* Glass with noise + accent */}
            <CardBlock
              heading="Glass, grain, accent."
              eyebrow="fill:glass · noise · accentLine:top"
              description="Glass surface with mineral grain and a brand-teal top accent. Three depth instruments — blur, texture, edge — layered without competing."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "Explore", href: "#" }}
              styleOptions={{ fill: "glass", imageStyle: "top", noise: true, accentLine: "top", hover: "glow" }}
            />
          </div>
        </div>

        {/* ── image:float ─────────────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            image:float · content slides up over the image bottom
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Content box overlaps the lower portion of the image with the card&apos;s fill background — depth without resting shadows.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Infrastructure that never sleeps."
              eyebrow="Platform"
              description="99.99% uptime across every region, backed by automated failover and real-time health monitoring."
              image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
              cta={{ label: "View SLA", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "float" }}
            />
            <CardBlock
              heading="Signal in the noise."
              eyebrow="Analytics"
              description="Our engine sifts millions of events per second so your team sees what matters — not everything."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "See the dashboard", href: "#" }}
              styleOptions={{ fill: "brand", imageStyle: "float" }}
            />
            <CardBlock
              heading="Hardware meets intelligence."
              eyebrow="Edge compute"
              description="Push logic to the edge. OptiTech runs where your users are, cutting round-trip latency by 80%."
              image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
              cta={{ label: "Explore edge", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "float", border: "subtle" }}
            />
          </div>
        </div>

        {/* ── Hover interactions ───────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Hover interactions · lift · glow · image zoom
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Depth appears in motion, not at rest. All effects use transform and box-shadow only — no layout-property animation.
            Image zoom fires on any hover variant.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Lift on hover."
              eyebrow="hover:lift"
              description="Card rises 4px with a faint teal ambient shadow. Returns to rest on mouse-out."
              image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
              cta={{ label: "Interact", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "top", hover: "lift" }}
            />
            <CardBlock
              heading="Glow on hover."
              eyebrow="hover:glow"
              description="Teal shadow blooms beneath the card on hover — no translate, pure atmospheric depth."
              image={{ src: CARD_IMG_B, alt: CARD_IMG_B_ALT }}
              cta={{ label: "Interact", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "top", hover: "glow" }}
            />
            <CardBlock
              heading="Float + lift."
              eyebrow="float · hover:lift"
              description="Float layout with lift interaction — the content overlap and the hover rise compound into a single editorial moment."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "Interact", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "float", hover: "lift" }}
            />
          </div>
        </div>

        {/* ── Density ─────────────────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Density · compact · default · spacious
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Three padding tiers for different grid densities. Compact suits 4+ column grids; spacious anchors 2-column feature layouts.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Compact."
              eyebrow="density:compact"
              description="Tighter padding — 16px. Best in high-density grids of four or more cards."
              styleOptions={{ fill: "surface", border: "subtle", density: "compact" }}
            />
            <CardBlock
              heading="Default."
              eyebrow="density:default"
              description="Standard padding — 32px. The baseline for most card contexts."
              styleOptions={{ fill: "surface", border: "subtle", density: "default" }}
            />
            <CardBlock
              heading="Spacious."
              eyebrow="density:spacious"
              description="Generous padding — 64px. Anchors feature-level cards in two-column layouts."
              styleOptions={{ fill: "surface", border: "subtle", density: "spacious" }}
            />
          </div>
        </div>

        {/* ── Accent line + noise ──────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Detail options · accent line · noise texture
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Accent line: 3px brand-teal top edge — not a side stripe. Noise: SVG feTurbulence grain at 7% overlay opacity adds
            tactile depth on dark surfaces without resting shadows.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <CardBlock
              heading="Top accent, surface fill."
              eyebrow="accentLine:top"
              description="A 3px brand-teal rule on the top edge anchors the card's hierarchy without a full border."
              styleOptions={{ fill: "surface", accentLine: "top" }}
            />
            <CardBlock
              heading="Top accent, brand fill."
              eyebrow="accentLine:top · fill:brand"
              description="On brand panels the accent shifts to press-white at 40% — still readable, never competing."
              styleOptions={{ fill: "brand", accentLine: "top" }}
            />
            <CardBlock
              heading="Noise on dark."
              eyebrow="noise:true · fill:surface"
              description="Grain overlay at 7% via mix-blend-mode: overlay. Tactile mineral depth that reads as material quality, not decoration."
              styleOptions={{ fill: "surface", border: "subtle", noise: true }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
            <CardBlock
              heading="Noise on brand."
              eyebrow="noise:true · fill:brand"
              description="Grain on the committed teal anchor. Pushes the surface from flat paint into oxidized mineral — the brand palette's physical analogue."
              image={{ src: CARD_IMG_A, alt: CARD_IMG_A_ALT }}
              cta={{ label: "See the platform", href: "#" }}
              styleOptions={{ fill: "brand", imageStyle: "top", noise: true }}
            />
            <CardBlock
              heading="Accent + noise + hover."
              eyebrow="all three"
              description="Top accent, grain texture, and lift on hover. Each detail earns its place — together they compose without competing."
              image={{ src: CARD_IMG_C, alt: CARD_IMG_C_ALT }}
              cta={{ label: "Explore", href: "#" }}
              styleOptions={{ fill: "surface", imageStyle: "float", accentLine: "top", noise: true, hover: "lift" }}
            />
          </div>
        </div>

      </section>

    </>
  );
}
