import type { Metadata } from "next";
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
    label: "Frame",
    note: "1px teal border, 6px inset gap",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: true } },
  },
  {
    label: "Overlay",
    note: "Brand teal at 40% opacity, multiply blend",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", overlay: true } },
  },
  {
    label: "Frame + Overlay",
    note: "Combined — frame holds, teal washes",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", frame: true, overlay: true } },
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
    label: "Shadow + Frame",
    note: "Hairline border holds the image, bloom escapes below",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, frame: true } },
  },
  {
    label: "Shadow + Overlay",
    note: "Teal wash unifies image tone; shadow amplifies it",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, overlay: true } },
  },
  {
    label: "Shadow + Frame + Overlay",
    note: "Full treatment stack",
    props: { src: IMAGE_SRC, alt: IMAGE_ALT, styleOptions: { ratio: "16:9", shadow: true, frame: true, overlay: true } },
  },
];

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
            Flexible image block with teal brand overlay, hairline frame, inset or below caption,
            chromatic shadow bloom, and a scroll-triggered wipe reveal. All options map 1:1 to CMS
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
            styleOptions={{ ratio: "16:9", animate: true, frame: true, captionPosition: "inset" }}
          />
        </div>

      </section>

    </>
  );
}
