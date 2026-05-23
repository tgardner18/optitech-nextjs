import type { Metadata } from "next";
import Image from "next/image";
import { SectionLabel } from "../components";
import OT_HeroBlock        from "@/cms/components/OT_HeroBlock";
import OT_ButtonBlock      from "@/cms/components/OT_ButtonBlock";
import OT_PrimaryTextBlock from "@/cms/components/OT_PrimaryTextBlock";
import OT_RichTextBlock    from "@/cms/components/OT_RichTextBlock";
import OT_QuoteBlock       from "@/cms/components/OT_QuoteBlock";
import OT_ImageBlock       from "@/cms/components/OT_ImageBlock";
import OT_VideoBlock       from "@/cms/components/OT_VideoBlock";
import OT_CardBlock        from "@/cms/components/OT_CardBlock";
import OT_StatBlock            from "@/cms/components/OT_StatBlock";
import OT_FeatureGridBlock     from "@/cms/components/OT_FeatureGridBlock";
import Button from "@/components/ui/Button";
import { ArrowRight, Zap, ChevronRight, Play, Download, Sparkles, Send, Rocket, Star, Plus } from "lucide-react";

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

const HERO_COLORS: Array<{ label: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Brand · Image Right (default)",
    content: {
      eyebrow: "Introducing OptiTech",
      headline: "Move at the speed of certainty.",
      body: "OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.",
      primaryCtaLabel:   "Get started",
      primaryCtaUrl:     { default: "#" },
      secondaryCtaLabel: "Learn more",
      secondaryCtaUrl:   { default: "#" },
      visual:    HERO_IMG,
      visualAlt: HERO_ALT,
    },
    displaySettings: { layout: "imageRight", color: "brand", animation: "none" },
  },
  {
    label: "Canvas · Image Left",
    content: {
      eyebrow: "The platform",
      headline: "Built for teams who ship daily.",
      body: "Feature flags, experiment data, and deployment telemetry in one platform. OptiTech closes the gap between shipping and knowing.",
      primaryCtaLabel: "View the platform",
      primaryCtaUrl:   { default: "#" },
      visual:    HERO_IMG,
      visualAlt: HERO_ALT,
    },
    displaySettings: { layout: "imageLeft", color: "canvas", animation: "none" },
  },
  {
    label: "Surface · Image Right",
    content: {
      eyebrow: "The method",
      headline: "Precision at every layer.",
      body: "From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.",
      primaryCtaLabel: "See how it works",
      primaryCtaUrl:   { default: "#" },
      visual:    HERO_IMG,
      visualAlt: HERO_ALT,
    },
    displaySettings: { layout: "imageRight", color: "surface", animation: "none" },
  },
];

const HERO_NO_IMAGE: Array<{ label: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Brand · No image",
    content: {
      eyebrow: "Introducing OptiTech",
      headline: "Move at the speed of certainty.",
      body: "OptiTech gives your teams the infrastructure to experiment continuously, ship confidently, and know whether it worked.",
      primaryCtaLabel:   "Get started",
      primaryCtaUrl:     { default: "#" },
      secondaryCtaLabel: "Learn more",
      secondaryCtaUrl:   { default: "#" },
    },
    displaySettings: { color: "brand", animation: "none" },
  },
  {
    label: "Canvas · No image",
    content: {
      eyebrow: "The platform",
      headline: "Built for teams who ship daily.",
      body: "Feature flags, experiment data, and deployment telemetry in one platform. OptiTech closes the gap between shipping and knowing.",
      primaryCtaLabel: "View the platform",
      primaryCtaUrl:   { default: "#" },
    },
    displaySettings: { color: "canvas", animation: "none" },
  },
  {
    label: "Surface · No image",
    content: {
      eyebrow: "The method",
      headline: "Precision at every layer.",
      body: "From the first feature flag to the thousandth experiment, OptiTech tracks what matters and surfaces it when you need it.",
      primaryCtaLabel: "See how it works",
      primaryCtaUrl:   { default: "#" },
    },
    displaySettings: { color: "surface", animation: "none" },
  },
];

const HERO_ANIMATIONS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Fade",
    note: "motion-safe: fade entrance on section mount",
    content: {
      eyebrow: "Animation",
      headline: "Fade entrance.",
      primaryCtaLabel: "Get started",
      primaryCtaUrl:   { default: "#" },
      visual:    HERO_IMG,
      visualAlt: HERO_ALT,
    },
    displaySettings: { color: "brand", animation: "fade" },
  },
  {
    label: "Slide",
    note: "motion-safe: slide-up entrance — expo ease-out",
    content: {
      eyebrow: "Animation",
      headline: "Slide entrance.",
      primaryCtaLabel: "Get started",
      primaryCtaUrl:   { default: "#" },
      visual:    HERO_IMG,
      visualAlt: HERO_ALT,
    },
    displaySettings: { color: "canvas", animation: "slide" },
  },
];

// ─── PrimaryTextBlock data ────────────────────────────────────────────────────

const PRIMARY_TEXT_SIZES: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content:       { eyebrow: "The platform", headline: "Speed that compounds." },
    displaySettings: { size: "display",  color: "canvas", alignment: "left", gradient: "none" },
  },
  {
    content:       { eyebrow: "Integrations", headline: "Connect everything you already use." },
    displaySettings: { size: "headline", color: "canvas", alignment: "left", gradient: "none" },
  },
  {
    content:       { eyebrow: "Customers", headline: "Trusted by teams who ship fast." },
    displaySettings: { size: "title",   color: "canvas", alignment: "left", gradient: "none" },
  },
  {
    content:       { headline: "Section tag · Supporting context" },
    displaySettings: { size: "label",   color: "canvas", alignment: "left", gradient: "none" },
  },
];

const PRIMARY_TEXT_COLORS: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content:       { eyebrow: "The method", headline: "Precision at every layer." },
    displaySettings: { size: "headline", color: "brand",   alignment: "left", gradient: "none" },
  },
  {
    content:       { eyebrow: "The method", headline: "Precision at every layer." },
    displaySettings: { size: "headline", color: "canvas",  alignment: "left", gradient: "none" },
  },
  {
    content:       { eyebrow: "The method", headline: "Precision at every layer." },
    displaySettings: { size: "headline", color: "surface", alignment: "left", gradient: "none" },
  },
];

const PRIMARY_TEXT_GRADIENTS: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content:       { eyebrow: "Brand Sweep", headline: "Kinetic by design." },
    displaySettings: { size: "display", color: "canvas", alignment: "center", gradient: "brand" },
  },
  {
    content:       { eyebrow: "Warm to Cool", headline: "Heat meets precision." },
    displaySettings: { size: "display", color: "canvas", alignment: "center", gradient: "warm" },
  },
  {
    content:       { eyebrow: "Luminous", headline: "Lit from within." },
    displaySettings: { size: "display", color: "canvas", alignment: "center", gradient: "luminous" },
  },
  {
    content:       { eyebrow: "Ember", headline: "Burn bright." },
    displaySettings: { size: "display", color: "canvas", alignment: "center", gradient: "ember" },
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

const RICH_TEXT_COLORS: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  { content: { content: { html: RT_FULL } }, displaySettings: { color: "canvas",  size: "editorial", alignment: "left", treatment: "standard", ruledHeadings: false } },
  { content: { content: { html: RT_FULL } }, displaySettings: { color: "surface", size: "editorial", alignment: "left", treatment: "standard", ruledHeadings: false } },
  { content: { content: { html: RT_FULL } }, displaySettings: { color: "brand",   size: "editorial", alignment: "left", treatment: "standard", ruledHeadings: false } },
];

const RICH_TEXT_TREATMENTS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Standard",
    note: "Faithful prose rendering (default)",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", treatment: "standard", size: "editorial", alignment: "left", ruledHeadings: false },
  },
  {
    label: "Lead",
    note: "First paragraph promoted to deck size in Blueprint color",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", treatment: "lead", size: "editorial", alignment: "left", ruledHeadings: false },
  },
  {
    label: "Dropcap",
    note: "First letter enlarged in brand teal, floated left",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", treatment: "dropcap", size: "editorial", alignment: "left", ruledHeadings: false },
  },
];

const RICH_TEXT_OPTIONS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Ruled headings",
    note: "1px teal rule above h2 and h3: editorial chapter dividers",
    content: { content: { html: RT_STRUCTURED } },
    displaySettings: { color: "canvas",  size: "editorial", ruledHeadings: true, alignment: "left", treatment: "standard" },
  },
  {
    label: "Compact + ruled",
    note: "Tighter scale for shorter sections; ruled headings still apply",
    content: { content: { html: RT_STRUCTURED } },
    displaySettings: { color: "surface", size: "compact",   ruledHeadings: true, alignment: "left", treatment: "standard" },
  },
  {
    label: "Center aligned",
    note: "Column centred within the section, for opening statements",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas",  alignment: "center", treatment: "lead", size: "editorial", ruledHeadings: false },
  },
];

const RICH_TEXT_SCALES: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Body (default)",
    note: "1rem / weight 400 — standard prose",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", textScale: "body", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
  {
    label: "Large",
    note: "1.125rem / weight 400 — important supporting copy",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", textScale: "large", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
  {
    label: "Lead",
    note: "1.25rem / weight 400 / tracking –0.005em — editorial intro scale",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", textScale: "lead", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
  {
    label: "Statement",
    note: "1.5rem / weight 300 / tracking –0.02em — standalone callout",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "canvas", textScale: "statement", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
];

const RICH_TEXT_WEIGHTS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Regular",
    note: "400 — default prose weight",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "surface", textWeight: "regular", textScale: "large", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
  {
    label: "Medium",
    note: "500 — more presence; good for supporting callouts",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "surface", textWeight: "medium", textScale: "large", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
  {
    label: "Semibold",
    note: "600 — maximum prose emphasis; best for short, punchy callouts",
    content: { content: { html: RT_PROSE } },
    displaySettings: { color: "surface", textWeight: "semibold", textScale: "large", size: "compact", alignment: "left", treatment: "standard", ruledHeadings: false },
  },
];

// ─── QuoteBlock data ──────────────────────────────────────────────────────────

const QUOTE_COLOR_SCHEMES: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content: { quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.", attributionName: "Sarah Chen", attributionTitle: "VP Engineering, Meridian" },
    displaySettings: { color: "brand",   alignment: "left", size: "large" },
  },
  {
    content: { quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.", attributionName: "Sarah Chen", attributionTitle: "VP Engineering, Meridian" },
    displaySettings: { color: "canvas",  alignment: "left", size: "large" },
  },
  {
    content: { quote: "OptiTech gave us the confidence to ship faster without second-guessing every decision. The team moved from monthly releases to daily.", attributionName: "Sarah Chen", attributionTitle: "VP Engineering, Meridian" },
    displaySettings: { color: "surface", alignment: "left", size: "large" },
  },
];

const QUOTE_SIZES: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content: { quote: "We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.", attributionName: "Marcus Reid", attributionTitle: "CTO, Folio" },
    displaySettings: { size: "large", color: "canvas", alignment: "left" },
  },
  {
    content: { quote: "We went from quarterly experiments to continuous iteration. OptiTech is the infrastructure that made that possible.", attributionName: "Marcus Reid", attributionTitle: "CTO, Folio" },
    displaySettings: { size: "small", color: "canvas", alignment: "left" },
  },
];

const QUOTE_ALIGNMENTS: Array<{ content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    content: { quote: "The only platform that keeps up with how fast we move.", attributionName: "Priya Nair", attributionTitle: "Head of Product, Vertex" },
    displaySettings: { alignment: "left",   color: "canvas", size: "large" },
  },
  {
    content: { quote: "The only platform that keeps up with how fast we move.", attributionName: "Priya Nair", attributionTitle: "Head of Product, Vertex" },
    displaySettings: { alignment: "center", color: "canvas", size: "large" },
  },
];

// ─── ImageBlock data ──────────────────────────────────────────────────────────

const IMAGE_SRC = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop";
const IMAGE_ALT = "Business professionals walking past glass skyscrapers in a modern city financial district";

const IMAGE_TREATMENTS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Clean",
    note: "No treatments — baseline",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9" },
  },
  {
    label: "Frame: offset",
    note: "Bold teal backing block — 12px mounting-board strip on right and bottom",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", frame: "offset" },
  },
  {
    label: "Frame: glow",
    note: "Inset teal ring + outer ambient bloom — image appears backlit",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", frame: "glow" },
  },
  {
    label: "Overlay",
    note: "Brand teal at 40% opacity, multiply blend",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", overlay: true },
  },
  {
    label: "Glow + Overlay",
    note: "Atmospheric — teal wash unifies tone, glow defines the edge",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", frame: "glow", overlay: true },
  },
  {
    label: "Offset + Overlay",
    note: "Bold — teal backing anchors the image; wash pulls the palette through",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", frame: "offset", overlay: true },
  },
];

const IMAGE_CAPTIONS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Caption inset",
    note: "Badge floats over bottom-left corner",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT, caption: "Precision-manufactured circuit board — OptiTech hardware layer." },
    displaySettings: { ratio: "r16_9", captionPosition: "inset" },
  },
  {
    label: "Caption below",
    note: "Label-scale text beneath the image",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT, caption: "Precision-manufactured circuit board — OptiTech hardware layer." },
    displaySettings: { ratio: "r16_9", captionPosition: "below" },
  },
];

const IMAGE_RATIOS: Array<{ label: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  { label: "16:9", content: { image: IMAGE_SRC, alt: IMAGE_ALT }, displaySettings: { ratio: "r16_9" } },
  { label: "4:3",  content: { image: IMAGE_SRC, alt: IMAGE_ALT }, displaySettings: { ratio: "r4_3"  } },
  { label: "3:2",  content: { image: IMAGE_SRC, alt: IMAGE_ALT }, displaySettings: { ratio: "r3_2"  } },
  { label: "1:1",  content: { image: IMAGE_SRC, alt: IMAGE_ALT }, displaySettings: { ratio: "r1_1"  } },
];

const IMAGE_SHADOWS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Shadow only",
    note: "Teal left, signal green right — chromatic halo",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", shadow: true },
  },
  {
    label: "Shadow + Glow",
    note: "Inset glow defines the image boundary; shadow bloom radiates below — two depths, one surface",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", shadow: true, frame: "glow" },
  },
  {
    label: "Shadow + Overlay",
    note: "Teal wash unifies image tone; shadow amplifies it",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", shadow: true, overlay: true },
  },
  {
    label: "Shadow + Glow + Overlay",
    note: "Full atmospheric stack — wash, edge glow, and bloom all in the same teal register",
    content: { image: IMAGE_SRC, alt: IMAGE_ALT },
    displaySettings: { ratio: "r16_9", shadow: true, frame: "glow", overlay: true },
  },
];

// ─── VideoBlock data ──────────────────────────────────────────────────────────

const VIDEO_SRC_YT   = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const VIDEO_SRC_VM   = "https://vimeo.com/148751763";
const VIDEO_TITLE_YT = "OptiTech Platform Overview";
const VIDEO_TITLE_VM = "OptiTech Case Study: Meridian Engineering";

const VIDEO_TREATMENTS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Clean",
    note: "No treatments — baseline",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9" },
  },
  {
    label: "Frame: offset",
    note: "Bold teal backing block — 12px mounting-board strip on right and bottom",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", frame: "offset" },
  },
  {
    label: "Frame: glow",
    note: "Inset teal ring + outer ambient bloom — poster appears backlit",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", frame: "glow" },
  },
  {
    label: "Overlay",
    note: "Brand teal at 40% opacity, multiply blend — tints thumbnail in the brand palette",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", overlay: true },
  },
  {
    label: "Glow + Overlay",
    note: "Atmospheric — teal wash unifies thumbnail tone, glow defines the edge",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", frame: "glow", overlay: true },
  },
  {
    label: "Offset + Overlay",
    note: "Bold — teal backing anchors the frame; wash pulls the palette through the thumbnail",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", frame: "offset", overlay: true },
  },
];

const VIDEO_SHADOWS: Array<{ label: string; note: string; content: any; displaySettings: Record<string, string | boolean> }> = [
  {
    label: "Shadow only",
    note: "Teal left, signal green right — chromatic halo",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", shadow: true },
  },
  {
    label: "Shadow + Glow",
    note: "Inset glow defines the boundary; shadow bloom radiates below — two depths, one surface",
    content: { src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT },
    displaySettings: { ratio: "r16_9", shadow: true, frame: "glow" },
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
        description="Foundational interactive primitives. CVA-based, TypeScript props, polymorphic (button or Link). Six variants, three sizes, optional icon slots."
      />

      <section id="button" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="00 · UI" title="Button" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Six variants:{" "}
            <code className="font-mono text-fg text-label">brand</code> (theme fill),{" "}
            <code className="font-mono text-fg text-label">accent</code> (accent token fill),{" "}
            <code className="font-mono text-fg text-label">ghost</code> (bordered, for dark surfaces),{" "}
            <code className="font-mono text-fg text-label">signal</code> (kinetic fill sweep),{" "}
            <code className="font-mono text-fg text-label">hover-fill</code> (glow border → brand fill on hover),{" "}
            <code className="font-mono text-fg text-label">glass</code> (frosted backdrop blur).
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
            <span className="font-mono text-label text-fg-muted/50">brand</span>
            <Button variant="brand" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">accent</span>
            <Button variant="accent" href="#">Explore features</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">ghost</span>
            <Button variant="ghost" href="#">Learn more</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">signal</span>
            <Button variant="signal" href="#">See it in action</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">hover-fill</span>
            <Button variant="hover-fill" href="#">Start free trial</Button>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">glass</span>
            <Button variant="glass" href="#">View the platform</Button>
          </div>
        </div>

        {/* ── Sizes ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · brand variant
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-end">
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">sm</span>
            <Button variant="brand" size="sm" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">md (default)</span>
            <Button variant="brand" size="md" href="#">Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">lg</span>
            <Button variant="brand" size="lg" href="#">Get started</Button>
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
            <span className="font-mono text-label text-fg-muted/50">brand · leading · zap</span>
            <Button variant="brand" href="#" leadingIcon={<Zap />}>Deploy now</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">brand · trailing · arrowRight</span>
            <Button variant="brand" href="#" trailingIcon={<ArrowRight />}>Get started</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">brand · trailing · sparkles</span>
            <Button variant="brand" href="#" trailingIcon={<Sparkles />}>Try AI features</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">accent · trailing · rocket</span>
            <Button variant="accent" href="#" trailingIcon={<Rocket />}>Launch now</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">ghost · trailing · chevronRight</span>
            <Button variant="ghost" href="#" trailingIcon={<ChevronRight />}>Learn more</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">signal · trailing · arrowRight</span>
            <Button variant="signal" href="#" trailingIcon={<ArrowRight />}>See it live</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">hover-fill · trailing · play</span>
            <Button variant="hover-fill" href="#" trailingIcon={<Play />}>Watch demo</Button>
          </div>
          <div className="flex flex-col gap-sm items-start">
            <span className="font-mono text-label text-fg-muted/50">glass · trailing · download</span>
            <Button variant="glass" href="#" trailingIcon={<Download />}>Download report</Button>
          </div>
        </div>

        {/* ── Signal variant in context ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Signal · kinetic fill sweep
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Hover to trigger. Brand color fills left-to-right; text transitions to press-white 75ms into the sweep.
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
          <Button variant="brand" disabled>Get started</Button>
          <Button variant="accent" disabled>Explore features</Button>
          <Button variant="ghost" disabled>Learn more</Button>
          <Button variant="signal" disabled>See it in action</Button>
          <Button variant="hover-fill" disabled>Start free trial</Button>
          <Button variant="glass" disabled>View the platform</Button>
        </div>

        {/* ── On brand surface ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            On brand surface · ghost in context
          </p>
        </div>
        <div className="bg-brand px-md py-xl lg:px-lg flex flex-wrap gap-md items-center">
          <Button variant="ghost" href="#">Learn more</Button>
          <Button variant="ghost" href="#" trailingIcon={<ChevronRight />}>View the platform</Button>
        </div>

        {/* ── Hover-fill in context ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Hover-fill · glow border → brand fill
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Ambient glow border at rest. On hover: brand color floods in with intensified glow bloom.
            Reduced-motion: instant fill swap.
          </p>
        </div>
        <div className="bg-canvas px-md py-xl lg:px-lg flex flex-wrap gap-lg items-end">
          {(["sm", "md", "lg"] as const).map((s) => (
            <div key={s} className="flex flex-col gap-sm items-start">
              <span className="font-mono text-label text-fg-muted/50">{s}</span>
              <Button variant="hover-fill" size={s} href="#" trailingIcon={<ArrowRight />}>
                {s === "sm" ? "Start free" : s === "md" ? "Start your trial" : "Start your free trial"}
              </Button>
            </div>
          ))}
        </div>

        {/* ── Glass in context ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Glass · frosted backdrop blur
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Adapts text to the surface — white on dark, near-black on light. Best used layered over imagery or colored backgrounds.
          </p>
        </div>
        <div className="relative overflow-hidden px-md py-xl lg:px-lg flex flex-wrap gap-md items-center"
          style={{ background: "linear-gradient(135deg, oklch(0.25 0.04 230), oklch(0.18 0.06 260))" }}>
          <Button variant="glass" href="#">View the platform</Button>
          <Button variant="glass" href="#" trailingIcon={<ArrowRight />}>Get started</Button>
          <Button variant="glass" href="#" leadingIcon={<Star />}>Featured release</Button>
        </div>
        <div data-surface="light" className="relative overflow-hidden px-md py-xl lg:px-lg flex flex-wrap gap-md items-center bg-[oklch(0.96_0.01_220)]">
          <span className="font-mono text-label text-fg-muted/50 w-full mb-sm">Light surface</span>
          <Button variant="glass" href="#">View the platform</Button>
          <Button variant="glass" href="#" trailingIcon={<Plus />}>New project</Button>
        </div>

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          BUTTON BLOCK
      ═══════════════════════════════════════════════════ */}
      <section id="button-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="00 · CMS" title="ButtonBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            CMS-managed button with a link field. Variant, size, icon, position, and alignment are
            display template settings. Polymorphic — renders as{" "}
            <code className="font-mono text-fg text-label">&lt;a target=&quot;_blank&quot;&gt;</code> for external URLs,{" "}
            <code className="font-mono text-fg text-label">&lt;Link&gt;</code> for internal routes.
          </p>
        </div>

        {/* ── Variants ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Variants</p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md">
          {(["brand", "accent", "ghost", "signal", "hover-fill", "glass"] as const).map((v) => (
            <div key={v} className="flex flex-col gap-sm">
              <span className="font-mono text-label text-fg-muted/50">{v}</span>
              <OT_ButtonBlock
                content={{
                  label: v === "brand" ? "Get started" : v === "accent" ? "Explore features" : v === "ghost" ? "Learn more" : v === "signal" ? "See it in action" : v === "hover-fill" ? "Start free trial" : "View the platform",
                  url: { default: "#" }
                }}
                displaySettings={{ variant: v }}
              />
            </div>
          ))}
        </div>

        {/* ── Sizes ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Sizes · brand</p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md items-end">
          {(["sm", "md", "lg"] as const).map((s) => (
            <div key={s} className="flex flex-col gap-sm items-start">
              <span className="font-mono text-label text-fg-muted/50">{s}</span>
              <OT_ButtonBlock
                content={{ label: "Get started", url: { default: "#" } }}
                displaySettings={{ variant: "brand", size: s }}
              />
            </div>
          ))}
        </div>

        {/* ── Icons ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Icons · trailing (default) · leading</p>
        </div>
        <div className="px-md pb-xl lg:px-lg flex flex-wrap gap-md">
          {(["arrowRight", "chevronRight", "zap", "externalLink", "arrowUpRight", "play", "download", "sparkles", "send", "rocket", "star", "plus"] as const).map((icon) => (
            <div key={icon} className="flex flex-col gap-sm">
              <span className="font-mono text-label text-fg-muted/50">{icon}</span>
              <OT_ButtonBlock
                content={{ label: "Get started", url: { default: "#" } }}
                displaySettings={{ variant: "brand", icon, iconPosition: "trailing" }}
              />
            </div>
          ))}
          <div className="flex flex-col gap-sm">
            <span className="font-mono text-label text-fg-muted/50">leading · zap</span>
            <OT_ButtonBlock
              content={{ label: "Deploy now", url: { default: "#" } }}
              displaySettings={{ variant: "brand", icon: "zap", iconPosition: "leading" }}
            />
          </div>
        </div>

        {/* ── Alignment ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Alignment · signal variant</p>
        </div>
        <div className="flex flex-col gap-sm pb-xl">
          {(["left", "center", "right"] as const).map((a) => (
            <div key={a}>
              <div className="px-md pb-xs lg:px-lg">
                <span className="font-mono text-label text-fg-muted/50">{a}</span>
              </div>
              <div className="px-md lg:px-lg">
                <OT_ButtonBlock
                  content={{ label: "Start your trial", url: { default: "#" } }}
                  displaySettings={{ variant: "signal", icon: "arrowRight", iconPosition: "trailing", alignment: a }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Full width ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Full width · brand</p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <OT_ButtonBlock
            content={{ label: "Start your free trial — no credit card required", url: { default: "#" } }}
            displaySettings={{ variant: "brand", size: "lg", fullWidth: "true" }}
          />
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

      <section id="hero-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="01 · Hero" title="HeroBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Full-bleed split layout with a text panel and an optional visual panel. When no visual
            is provided the text panel expands to full width. Layout, color, and entrance animation
            are display settings. CTAs are optional.
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
            <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
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
            <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
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
            <OT_HeroBlock content={item.content} displaySettings={item.displaySettings} />
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
            Eyebrow label and headline only — Poppins throughout. All display settings map 1:1 to CMS
            display template choices.
          </p>
        </div>

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · canvas · left
          </p>
        </div>
        {PRIMARY_TEXT_SIZES.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                size: &ldquo;{item.displaySettings.size}&rdquo;
              </span>
            </div>
            <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · headline · left · same copy
          </p>
        </div>
        {PRIMARY_TEXT_COLORS.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{item.displaySettings.color}&rdquo;
              </span>
            </div>
            <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
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
        {PRIMARY_TEXT_GRADIENTS.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                gradient: &ldquo;{item.displaySettings.gradient}&rdquo;
              </span>
            </div>
            <OT_PrimaryTextBlock content={item.content} displaySettings={item.displaySettings} />
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
        {RICH_TEXT_COLORS.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{item.displaySettings.color}&rdquo;
              </span>
            </div>
            <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
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
                treatment: &ldquo;{item.displaySettings.treatment}&rdquo;
              </span>
              <span className="text-label text-fg-muted/40">{item.note}</span>
            </div>
            <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
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
            <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Prose scale · textScale setting
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Four size tiers. Statement drops to weight 300 — at 1.5rem, lighter weight reads as more refined.
          </p>
        </div>
        {RICH_TEXT_SCALES.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
              <span className="text-label tracking-label uppercase text-brand font-semibold">
                {item.label}
              </span>
              <span className="text-label text-fg-muted/60">{item.note}</span>
            </div>
            <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Font weight · textWeight setting · shown at large scale
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Weight override applies to paragraphs and list items only — headings maintain their own weight hierarchy.
          </p>
        </div>
        {RICH_TEXT_WEIGHTS.map((item) => (
          <div key={item.label} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg flex flex-wrap items-baseline gap-x-sm gap-y-xs">
              <span className="text-label tracking-label uppercase text-brand font-semibold">
                {item.label}
              </span>
              <span className="text-label text-fg-muted/60">{item.note}</span>
            </div>
            <OT_RichTextBlock content={item.content} displaySettings={item.displaySettings} />
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
            All display settings map 1:1 to CMS display template choices.
          </p>
        </div>

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color Schemes · large · left · same copy
          </p>
        </div>
        {QUOTE_COLOR_SCHEMES.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                color: &ldquo;{item.displaySettings.color}&rdquo;
              </span>
            </div>
            <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Sizes · canvas · left · same copy
          </p>
        </div>
        {QUOTE_SIZES.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                size: &ldquo;{item.displaySettings.size}&rdquo;
              </span>
            </div>
            <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
          </div>
        ))}

        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Alignment · canvas · large · same copy
          </p>
        </div>
        {QUOTE_ALIGNMENTS.map((item, i) => (
          <div key={i} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">
                alignment: &ldquo;{item.displaySettings.alignment}&rdquo;
              </span>
            </div>
            <OT_QuoteBlock content={item.content} displaySettings={item.displaySettings} />
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
            inset or below caption, chromatic shadow bloom, and a scroll-triggered wipe reveal. All display settings
            map 1:1 to CMS display template choices.
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
                <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
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
                <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
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
                <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
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
                <OT_ImageBlock content={item.content} displaySettings={item.displaySettings} />
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
          <OT_ImageBlock
            content={{ image: IMAGE_SRC, alt: IMAGE_ALT, caption: "OptiTech. Precision at every layer." }}
            displaySettings={{ ratio: "r16_9", animate: true, frame: "offset", captionPosition: "inset" }}
          />
        </div>

      </section>

      <section id="video-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="06 · Media" title="VideoBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            YouTube and Vimeo embeds with a branded poster state. Platform thumbnails are auto-fetched;
            a teal play button replaces the iframe until clicked. Mirrors ImageBlock&apos;s full display
            settings API: frame treatments, overlay, shadow bloom, and caption.
          </p>
        </div>

        {/* Platform support */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Platform support · YouTube and Vimeo · auto-fetched thumbnails
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Platform is detected from the URL. YouTube thumbnails are served from YouTube&apos;s CDN;
            Vimeo thumbnails are fetched client-side from the oEmbed API with a shimmer while loading.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">YouTube</span>
                <span className="text-label text-fg-muted/60">Platform thumbnail + branded play button</span>
              </div>
              <OT_VideoBlock
                content={{ src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT }}
                displaySettings={{ ratio: "r16_9" }}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">Vimeo</span>
                <span className="text-label text-fg-muted/60">oEmbed thumbnail fetched on mount — shimmer while loading</span>
              </div>
              <OT_VideoBlock
                content={{ src: { default: VIDEO_SRC_VM }, title: VIDEO_TITLE_VM }}
                displaySettings={{ ratio: "r16_9" }}
              />
            </div>
          </div>
        </div>

        {/* Treatments */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Treatments</p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Same frame options as ImageBlock — all treatments apply to the poster and the live embed equally.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {VIDEO_TREATMENTS.map((item) => (
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

        {/* Shadow */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Shadow · chromatic bloom
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Dual radial gradient: brand teal pools bottom-left, signal green bottom-right.
            52px blur diffuses into a halo that bleeds past the video edge.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {VIDEO_SHADOWS.map((item) => (
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

        {/* Captions */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">Captions</p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">Inset</span>
                <span className="text-label text-fg-muted/60">Badge floats over bottom-left corner of the poster</span>
              </div>
              <OT_VideoBlock
                content={{ src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT, caption: "OptiTech. Precision at every layer." }}
                displaySettings={{ ratio: "r16_9", captionPosition: "inset" }}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                <span className="text-label tracking-label uppercase text-brand font-semibold">Below</span>
                <span className="text-label text-fg-muted/60">Label-scale text beneath the video</span>
              </div>
              <OT_VideoBlock
                content={{ src: { default: VIDEO_SRC_YT }, title: VIDEO_TITLE_YT, caption: "OptiTech. Precision at every layer." }}
                displaySettings={{ ratio: "r16_9", captionPosition: "below" }}
              />
            </div>
          </div>
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
            All display settings map 1:1 to CMS display template choices.
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
            <OT_CardBlock
              content={{ Heading: "Targeted Rollouts", Eyebrow: "Deployment", Description: "Deploy to any user segment with a single API call. Real-time, without a redeploy.", ctaLabel: "Learn more", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "ghost", border: "subtle" }}
            />
            <OT_CardBlock
              content={{ Heading: "Experiment Engine", Eyebrow: "Analytics", Description: "Concurrent A/B tests with automatic interaction detection. Results in hours, not weeks.", ctaLabel: "Learn more", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface" }}
            />
            <OT_CardBlock
              content={{ Heading: "Statistical Confidence", Eyebrow: "Insights", Description: "Power calculations and confidence intervals are built into the platform. No spreadsheets.", ctaLabel: "Learn more", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "brand" }}
            />
            <OT_CardBlock
              content={{ Heading: "Instant Rollback", Eyebrow: "Safety", Description: "One flag, one API call. Revert any change across every deployment in seconds.", ctaLabel: "Learn more", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "light" }}
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
                <OT_CardBlock
                  content={{ Heading: "No Border", Eyebrow: "Surface", Description: "Surface fill with no border. Content is defined by background contrast, not a frame.", ctaLabel: "Explore", ctaUrl: { default: "#" } }}
                  displaySettings={{ fill: "surface", border: "none" }}
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-label text-fg-muted/50">surface · border: subtle</span>
              <div className="mt-sm">
                <OT_CardBlock
                  content={{ Heading: "Subtle Border", Eyebrow: "Surface", Description: "1px at 10% foreground opacity. Barely-there definition for cards that float over dark grounds.", ctaLabel: "Explore", ctaUrl: { default: "#" } }}
                  displaySettings={{ fill: "surface", border: "subtle" }}
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-label text-fg-muted/50">ghost · border: brand</span>
              <div className="mt-sm">
                <OT_CardBlock
                  content={{ Heading: "Brand Border", Eyebrow: "Ghost", Description: "1px teal border signals selection or attention. Works best on ghost fill over a dark section.", ctaLabel: "Explore", ctaUrl: { default: "#" } }}
                  displaySettings={{ fill: "ghost", border: "brand" }}
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
            <OT_CardBlock
              content={{ Heading: "Feature Flags at Scale", Eyebrow: "Platform", Description: "Ship to any segment with a kill switch on every flag. The safest way to deploy at velocity.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "See how it works", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "top" }}
            />
            <OT_CardBlock
              content={{ Heading: "Precision-Grade Telemetry", Eyebrow: "Infrastructure", Description: "Every signal, every layer. OptiTech ingests data from flag changes, deploys, and user events in real time.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "See how it works", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "top" }}
            />
            <OT_CardBlock
              content={{ Heading: "Results You Can Act On", Eyebrow: "Analytics", Description: "Statistical significance checks, interaction effects, and automatic stopping rules. No guesswork.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "See how it works", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "top" }}
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
            <OT_CardBlock
              content={{ Heading: "Ship with confidence.", Eyebrow: "Deployment", Description: "Every flag tracked. Every change reversible.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "Get started", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "background" }}
            />
            <OT_CardBlock
              content={{ Heading: "Measure what matters.", Eyebrow: "Analytics", Description: "Real signals, not approximations.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT }}
              displaySettings={{ fill: "surface", imageStyle: "background" }}
            />
            <OT_CardBlock
              content={{ Heading: "Iterate faster.", Eyebrow: "Velocity", Description: "From hypothesis to result in hours.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "See the platform", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "background" }}
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
              <OT_CardBlock
                content={{ Heading: "Infrastructure built for continuous delivery.", Eyebrow: "Platform", Description: "OptiTech gives engineering teams the tooling to ship incrementally, measure precisely, and respond in real time. Feature flags, experiment infrastructure, and deployment telemetry in one platform.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "View the platform", ctaUrl: { default: "#" } }}
                displaySettings={{ fill: "surface", imageStyle: "side", imageSide: "left" }}
              />
            </div>
          </div>
          <div>
            <span className="font-mono text-label text-fg-muted/50">imageSide: &ldquo;right&rdquo;</span>
            <div className="mt-sm">
              <OT_CardBlock
                content={{ Heading: "Statistical confidence at every decision point.", Eyebrow: "Analytics", Description: "Every experiment runs with power calculations, automatic stopping rules, and interaction effect detection. Ship when the data says so, not when the sprint ends.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "Explore analytics", ctaUrl: { default: "#" } }}
                displaySettings={{ fill: "surface", imageStyle: "side", imageSide: "right" }}
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
            <OT_CardBlock
              content={{ Heading: "Feature flags for every team.", Eyebrow: "Deployment" }}
              displaySettings={{ fill: "surface", border: "subtle" }}
            />
            <OT_CardBlock
              content={{ Heading: "Experiments that answer real questions.", Eyebrow: "Analytics" }}
              displaySettings={{ fill: "brand" }}
            />
            <OT_CardBlock
              content={{ Heading: "Rollback in one API call.", Eyebrow: "Safety" }}
              displaySettings={{ fill: "ghost", border: "brand" }}
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
          <Image
            src={CARD_IMG_A}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-canvas/40" />
          <div className="relative z-10 px-md py-xl lg:px-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <OT_CardBlock
                content={{ Heading: "Edges computed at the edge.", Eyebrow: "Edge Network", Description: "OptiTech routes intelligence to where your users are — 200ms becomes 20ms without changing a line of application code.", ctaLabel: "See coverage", ctaUrl: { default: "#" } }}
                displaySettings={{ fill: "glass", hover: "glow" }}
              />
              <OT_CardBlock
                content={{ Heading: "Flags ship features safely.", Eyebrow: "Feature Flags", Description: "Controlled rollouts, instant kill-switches, and audience targeting — all without a deployment cycle.", ctaLabel: "Read the docs", ctaUrl: { default: "#" } }}
                displaySettings={{ fill: "glass", hover: "glow" }}
              />
              <OT_CardBlock
                content={{ Heading: "Every experiment tells a story.", Eyebrow: "Experimentation", Description: "Statistical rigor built in. Run A/B tests and multivariate experiments with automatic significance detection.", ctaLabel: "Start experimenting", ctaUrl: { default: "#" } }}
                displaySettings={{ fill: "glass", hover: "glow" }}
              />
            </div>
          </div>
        </div>
        <div className="px-md pt-xl pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <OT_CardBlock
              content={{ Heading: "Glass over photo.", Eyebrow: "fill:glass · imageStyle:float", Description: "Float + glass: the content panel blurs the image below it through the glass surface — depth compounds into a single surface moment.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "Explore", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "glass", imageStyle: "float", hover: "lift" }}
            />
            <OT_CardBlock
              content={{ Heading: "Glass, grain, accent.", Eyebrow: "fill:glass · noise · accentLine:top", Description: "Glass surface with mineral grain and a brand-teal top accent. Three depth instruments — blur, texture, edge — layered without competing.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "Explore", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "glass", imageStyle: "top", noise: true, accentLine: "top", hover: "glow" }}
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
            <OT_CardBlock
              content={{ Heading: "Infrastructure that never sleeps.", Eyebrow: "Platform", Description: "99.99% uptime across every region, backed by automated failover and real-time health monitoring.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "View SLA", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "float" }}
            />
            <OT_CardBlock
              content={{ Heading: "Signal in the noise.", Eyebrow: "Analytics", Description: "Our engine sifts millions of events per second so your team sees what matters — not everything.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "See the dashboard", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "brand", imageStyle: "float" }}
            />
            <OT_CardBlock
              content={{ Heading: "Hardware meets intelligence.", Eyebrow: "Edge compute", Description: "Push logic to the edge. OptiTech runs where your users are, cutting round-trip latency by 80%.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "Explore edge", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "float", border: "subtle" }}
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
            <OT_CardBlock
              content={{ Heading: "Lift on hover.", Eyebrow: "hover:lift", Description: "Card rises 4px with a faint teal ambient shadow. Returns to rest on mouse-out.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "Interact", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "top", hover: "lift" }}
            />
            <OT_CardBlock
              content={{ Heading: "Glow on hover.", Eyebrow: "hover:glow", Description: "Teal shadow blooms beneath the card on hover — no translate, pure atmospheric depth.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "Interact", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "top", hover: "glow" }}
            />
            <OT_CardBlock
              content={{ Heading: "Float + lift.", Eyebrow: "float · hover:lift", Description: "Float layout with lift interaction — the content overlap and the hover rise compound into a single editorial moment.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "Interact", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "float", hover: "lift" }}
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
            <OT_CardBlock
              content={{ Heading: "Compact.", Eyebrow: "density:compact", Description: "Tighter padding — 16px. Best in high-density grids of four or more cards." }}
              displaySettings={{ fill: "surface", border: "subtle", density: "compact" }}
            />
            <OT_CardBlock
              content={{ Heading: "Default.", Eyebrow: "density:default", Description: "Standard padding — 32px. The baseline for most card contexts." }}
              displaySettings={{ fill: "surface", border: "subtle", density: "default" }}
            />
            <OT_CardBlock
              content={{ Heading: "Spacious.", Eyebrow: "density:spacious", Description: "Generous padding — 64px. Anchors feature-level cards in two-column layouts." }}
              displaySettings={{ fill: "surface", border: "subtle", density: "spacious" }}
            />
          </div>
        </div>

        {/* ── Accent line + noise ──────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Detail options · accent line · noise texture
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Accent line: 3px top edge using{" "}
            <code className="font-mono text-fg text-label">--ot-accent</code> — follows the CMS theme override, not a side stripe.
            Noise: SVG feTurbulence grain at 7% overlay opacity adds tactile depth on dark surfaces without resting shadows.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <OT_CardBlock
              content={{ Heading: "Top accent, surface fill.", Eyebrow: "accentLine:top", Description: "A 3px brand-teal rule on the top edge anchors the card's hierarchy without a full border." }}
              displaySettings={{ fill: "surface", accentLine: "top" }}
            />
            <OT_CardBlock
              content={{ Heading: "Top accent, brand fill.", Eyebrow: "accentLine:top · fill:brand", Description: "On brand panels the accent shifts to press-white at 40% — still readable, never competing." }}
              displaySettings={{ fill: "brand", accentLine: "top" }}
            />
            <OT_CardBlock
              content={{ Heading: "Noise on dark.", Eyebrow: "noise:true · fill:surface", Description: "Grain overlay at 7% via mix-blend-mode: overlay. Tactile mineral depth that reads as material quality, not decoration." }}
              displaySettings={{ fill: "surface", border: "subtle", noise: true }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
            <OT_CardBlock
              content={{ Heading: "Noise on brand.", Eyebrow: "noise:true · fill:brand", Description: "Grain on the committed teal anchor. Pushes the surface from flat paint into oxidized mineral — the brand palette's physical analogue.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT, ctaLabel: "See the platform", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "brand", imageStyle: "top", noise: true }}
            />
            <OT_CardBlock
              content={{ Heading: "Accent + noise + hover.", Eyebrow: "all three", Description: "Top accent, grain texture, and lift on hover. Each detail earns its place — together they compose without competing.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "Explore", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "float", accentLine: "top", noise: true, hover: "lift" }}
            />
          </div>
        </div>

        {/* ── Max height ───────────────────────────────────────────────────────── */}
        <div className="px-md py-lg lg:px-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            maxHeight · cap card height for background-image cards
          </p>
          <p className="text-body text-fg-muted mt-xs">
            Background and float cards benefit from a height cap in wide or sparse layouts.
            sm&nbsp;=&nbsp;320px · md&nbsp;=&nbsp;480px · lg&nbsp;=&nbsp;640px.
          </p>
        </div>
        <div className="px-md pb-xl lg:px-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <OT_CardBlock
              content={{ Heading: "Uncapped.", Eyebrow: "maxHeight:none", Description: "Natural content height — default. Correct for most card grids.", image: CARD_IMG_A, imageAlt: CARD_IMG_A_ALT }}
              displaySettings={{ fill: "surface", imageStyle: "background" }}
            />
            <OT_CardBlock
              content={{ Heading: "Medium cap.", Eyebrow: "maxHeight:md · 480px", Description: "480px keeps background cards proportional in two- and three-column layouts.", image: CARD_IMG_B, imageAlt: CARD_IMG_B_ALT, ctaLabel: "Get started", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "background", maxHeight: "md" }}
            />
            <OT_CardBlock
              content={{ Heading: "Small cap.", Eyebrow: "maxHeight:sm · 320px", Description: "320px suits dense grids or cards with minimal copy where a tighter frame reads as intentional.", image: CARD_IMG_C, imageAlt: CARD_IMG_C_ALT, ctaLabel: "See more", ctaUrl: { default: "#" } }}
              displaySettings={{ fill: "surface", imageStyle: "background", maxHeight: "sm" }}
            />
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════
          IMAGE BACKGROUND SECTION
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="image-bg-section"
        label="Image Background Section"
        description="A section-level block (baseType _section) with a CMS-managed background image and a full row/column/element grid inside. data-surface='dark' is baked in — all nested text, ghost buttons, and labels automatically read as white over the photo. Five overlay modes handle legibility across any image."
      />
      <section className="border-t border-fg/5">

        {/* ── Overlay variants ── */}
        <div className="px-md pb-md lg:px-lg pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Overlay modes
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            An absolutely-positioned scrim between the photo and content. Glass uses backdrop-blur-xl — the photo softens into a frosted depth layer while content stays crisp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-fg/5 border-t border-fg/5">
          {([
            { key: "none",       label: "None",         overlayClass: "" },
            { key: "subtleDark", label: "Subtle dark",  overlayClass: "bg-canvas/40" },
            { key: "strongDark", label: "Strong dark",  overlayClass: "bg-canvas/70" },
            { key: "brand",      label: "Brand tint",   overlayClass: "bg-brand/50"  },
            { key: "glass",      label: "Glass blur",   overlayClass: "backdrop-blur-md bg-canvas/20" },
          ] as const).map(({ key, label, overlayClass }) => (
            <div
              key={key}
              data-surface="dark"
              className="relative isolate overflow-hidden min-h-[380px] flex flex-col justify-end"
              style={{ backgroundImage: `url(${IMAGE_SRC})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              {overlayClass && (
                <div className={`absolute inset-0 -z-10 ${overlayClass}`} aria-hidden="true" />
              )}
              <div className="p-lg flex flex-col gap-xs">
                <span className="font-mono text-label text-fg-muted/50 tracking-label uppercase">{key}</span>
                <p className="text-headline font-bold text-fg leading-tight">{label}</p>
                <p className="text-body text-fg-muted text-sm max-w-[38ch] mt-xs">
                  OptiTech gives your teams the infrastructure to experiment continuously and ship with certainty.
                </p>
                <div className="mt-sm">
                  <Button variant="ghost" size="sm" href="#">Learn more</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Min-height reference ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/5 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Minimum height
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Content height (default) · 50vh · 75vh · Full viewport. The section expands beyond the minimum to fit its inner grid.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-fg/5 border-t border-fg/5">
          {([
            { label: "Content height", heightClass: "min-h-[120px]", note: "none" },
            { label: "50% viewport",   heightClass: "min-h-[50vh]",  note: "screen50" },
            { label: "75% viewport",   heightClass: "min-h-[75vh]",  note: "screen75" },
          ] as const).map(({ label, heightClass, note }) => (
            <div
              key={note}
              data-surface="dark"
              className={`relative isolate overflow-hidden flex flex-col justify-center items-center ${heightClass}`}
              style={{ backgroundImage: `url(${IMAGE_SRC})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 -z-10 bg-canvas/65" aria-hidden="true" />
              <div className="text-center px-lg py-xl">
                <span className="font-mono text-label text-fg-muted/50 block mb-xs">{note}</span>
                <p className="text-headline font-bold text-fg">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pb-xl" />
      </section>

      {/* ════════════════════════════════════════════════════
          GLASS PANEL BACKGROUNDS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="glass-panel"
        label="Glass Panel Background"
        description="The 'Glass (frosted)' backgroundColor option available on both rows and sections. Brand-tinted backdrop-filter material at structural scale. The blur earns its depth over a brand fill, image background, or layered surface — over flat canvas it renders as a subtle dark tinted panel."
      />
      <section className="border-t border-fg/5">

        {/* ── Glass over brand fill ── */}
        <div className="px-md pb-md lg:px-lg pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Glass over brand fill — row backgroundColor: glass, inside brand section
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            The glass panel floats above the committed teal — blur catches the saturated color and diffracts it into a frosted mineral layer.
          </p>
        </div>
        <div className="bg-brand py-xl px-md lg:px-lg">
          <div className="bg-glass py-xl px-lg">
            <p className="font-mono text-label text-fg-muted/60 mb-sm">backgroundColor: &ldquo;glass&rdquo;</p>
            <p className="text-headline font-bold text-fg leading-tight max-w-[22ch]">
              The infrastructure that made continuous shipping possible.
            </p>
            <p className="text-body text-fg-muted mt-md max-w-[55ch]">
              OptiTech gives your engineering and product teams a shared language for running experiments with statistical confidence backed by real signal.
            </p>
          </div>
        </div>

        {/* ── Glass over image background ── */}
        <div className="px-md pb-md lg:px-lg pt-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Glass over image background — row backgroundColor: glass, inside ImageBgSection
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            The specular rim and brand bloom lift the glass panel off the photo — depth without obscuring the image.
          </p>
        </div>
        <div
          className="relative isolate overflow-hidden py-2xl"
          data-surface="dark"
          style={{ backgroundImage: `url(${IMAGE_SRC})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 -z-10 bg-canvas/40" aria-hidden="true" />
          <div className="container mx-auto px-lg">
            <div className="bg-glass py-xl px-lg max-w-3xl">
              <p className="font-mono text-label text-fg-muted/60 mb-sm">backgroundColor: &ldquo;glass&rdquo;</p>
              <p className="text-headline font-bold text-fg leading-tight max-w-[22ch]">
                Speed that compounds. The faster you measure, the faster you iterate.
              </p>
              <p className="text-body text-fg-muted mt-md max-w-[55ch]">
                Feature flags, experiment data, user behaviour telemetry, and deployment events — all in one signal layer.
              </p>
            </div>
          </div>
        </div>

        {/* ── Glass over surface ── */}
        <div className="px-md pb-md lg:px-lg pt-lg border-t border-fg/5">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Glass over surface fill — subtle dark tinted panel
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Over a flat surface, glass renders as a quiet tinted layer with specular rim. Valid as a subtle section divider, quieter than brand fill.
          </p>
        </div>
        <div className="bg-surface py-xl px-md lg:px-lg">
          <div className="bg-glass py-lg px-lg">
            <p className="font-mono text-label text-fg-muted/60 mb-sm">backgroundColor: &ldquo;glass&rdquo; over surface</p>
            <p className="text-title font-semibold text-fg">
              A quieter treatment — still distinctly material, not a flat box.
            </p>
            <p className="text-body text-fg-muted mt-sm max-w-[55ch]">
              Use glass over canvas or surface when you want gentle visual separation without committing to a brand fill.
            </p>
          </div>
        </div>

        <div className="pb-xl" />
      </section>


      {/* ════════════════════════════════════════════════════
          STAT BLOCKS
      ═══════════════════════════════════════════════════ */}
      <BlockGroup
        id="stat"
        label="Stat Blocks"
        description="A horizontal row of metric callouts for communicating scale and ROI. Numbers animate on scroll entry with a staggered entrance and easeOutQuart count-up. No card chrome — stats sit as open typographic monuments."
      />

      <section id="stat-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="09 · Social Proof" title="StatBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            Three color schemes (brand, canvas, surface), three column counts (2/3/4), optional Lucide
            icon slots, and an opt-in animated count-up on scroll. Numbers at{" "}
            <code className="font-mono text-fg text-label">text-display</code> scale for 2–3 columns,
            intermediate scale for 4. Stagger entrance + divider draw-in + completion pulse on every
            metric.
          </p>
        </div>

        {/* ── Color schemes · 3 columns · no icons ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color schemes · 3 columns · animate off (static)
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Brand is the committed default. Canvas and surface for lighter editorial contexts.
          </p>
        </div>
        {(["brand", "canvas", "surface"] as const).map((color) => (
          <div key={color} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">color: &ldquo;{color}&rdquo;</span>
            </div>
            <OT_StatBlock
              content={{
                items: [
                  { value: "40%",    label: "Faster deployment",  context: "vs. baseline" },
                  { value: "99.99%", label: "Uptime SLA",         context: "across all regions" },
                  { value: "2M+",    label: "Active users",       context: "and growing" },
                ],
              }}
              displaySettings={{ color, columns: "3", animate: false }}
            />
          </div>
        ))}

        {/* ── Column counts · brand · no icons ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Column counts · brand · animate off
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            2-col uses the full display scale — heroic presence for anchor stat moments.
            4-col compresses to an intermediate scale that still reads at a glance.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg">
            <span className="font-mono text-label text-fg-muted/50">columns: &ldquo;2&rdquo;</span>
          </div>
          <OT_StatBlock
            content={{
              items: [
                { value: "$6.4B",  label: "Total loan volume",  context: "originated this year" },
                { value: "312K",   label: "Member accounts",    context: "across all regions" },
              ],
            }}
            displaySettings={{ color: "brand", columns: "2", animate: false }}
          />
        </div>
        <div className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg">
            <span className="font-mono text-label text-fg-muted/50">columns: &ldquo;3&rdquo;</span>
          </div>
          <OT_StatBlock
            content={{
              items: [
                { value: "40%",    label: "Faster deployment",  context: "vs. baseline"        },
                { value: "99.99%", label: "Uptime SLA",         context: "across all regions"  },
                { value: "2M+",    label: "Active users",       context: "and growing"         },
              ],
            }}
            displaySettings={{ color: "brand", columns: "3", animate: false }}
          />
        </div>
        <div className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg">
            <span className="font-mono text-label text-fg-muted/50">columns: &ldquo;4&rdquo;</span>
          </div>
          <OT_StatBlock
            content={{
              items: [
                { value: "1.2M",   label: "Claims processed",    context: "last 12 months"     },
                { value: "98.3%",  label: "Satisfaction rate",   context: "post-claim survey"  },
                { value: "4.8hr",  label: "Avg. resolution",     context: "from first contact" },
                { value: "340+",   label: "Partner carriers",    context: "in our network"     },
              ],
            }}
            displaySettings={{ color: "brand", columns: "4", animate: false }}
          />
        </div>

        {/* ── With icons · 3 columns · brand ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            With icons · 3 columns · brand · animate off
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Icons sit above the value at 28px / strokeWidth 1.5. Muted to 55% opacity on brand
            surfaces so they support without competing with the number.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_StatBlock
            content={{
              items: [
                { value: "40%",    label: "Faster deployment",  context: "vs. baseline",       icon: "zap"          },
                { value: "99.99%", label: "Uptime SLA",         context: "across all regions", icon: "shield"       },
                { value: "2M+",    label: "Active users",       context: "and growing",        icon: "users"        },
              ],
            }}
            displaySettings={{ color: "brand", columns: "3", showIcons: true, animate: false }}
          />
        </div>
        <div className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg">
            <span className="font-mono text-label text-fg-muted/50">canvas + icons</span>
          </div>
          <OT_StatBlock
            content={{
              items: [
                { value: "18K+",   label: "Member organisations", icon: "users"       },
                { value: "420",    label: "Annual events",        icon: "clock"       },
                { value: "97%",    label: "Renewal rate",         icon: "check-circle"},
              ],
            }}
            displaySettings={{ color: "canvas", columns: "3", showIcons: true, animate: false }}
          />
        </div>

        {/* ── Icon key reference ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Icon key reference · all 10 icons · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Available icon keys for the CMS{" "}
            <code className="font-mono text-fg">icon</code> field on each stat item.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_StatBlock
            content={{
              items: [
                { value: "1", label: "zap",           icon: "zap"           },
                { value: "2", label: "shield",         icon: "shield"        },
                { value: "3", label: "users",          icon: "users"         },
                { value: "4", label: "trending-up",    icon: "trending-up"   },
              ],
            }}
            displaySettings={{ color: "canvas", columns: "4", showIcons: true, animate: false }}
          />
          <OT_StatBlock
            content={{
              items: [
                { value: "5", label: "clock",          icon: "clock"         },
                { value: "6", label: "award",          icon: "award"         },
                { value: "7", label: "bar-chart",      icon: "bar-chart"     },
                { value: "8", label: "globe",          icon: "globe"         },
              ],
            }}
            displaySettings={{ color: "canvas", columns: "4", showIcons: true, animate: false }}
          />
          <OT_StatBlock
            content={{
              items: [
                { value: "9",  label: "sparkles",      icon: "sparkles"      },
                { value: "10", label: "check-circle",  icon: "check-circle"  },
              ],
            }}
            displaySettings={{ color: "canvas", columns: "4", showIcons: true, animate: false }}
          />
        </div>

        {/* ── Animated (live) ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Animated · brand · 3 columns · icons on
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Scroll this section into view to trigger. Sequence: columns stagger slide-up →
            dividers draw in → numbers count 0→target over 1.4s (easeOutQuart) →
            completion pulse on landing. Respects{" "}
            <code className="font-mono text-fg">prefers-reduced-motion</code>.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_StatBlock
            content={{
              items: [
                { value: "40%",    label: "Faster deployment",  context: "vs. baseline",       icon: "zap"     },
                { value: "99.99%", label: "Uptime SLA",         context: "across all regions", icon: "shield"  },
                { value: "2M+",    label: "Active users",       context: "and growing",        icon: "users"   },
              ],
            }}
            displaySettings={{ color: "brand", columns: "3", showIcons: true, animate: true }}
          />
        </div>
        <div className="border-t border-fg/5">
          <div className="px-md pt-sm pb-xs lg:px-lg">
            <span className="font-mono text-label text-fg-muted/50">canvas · 4 columns · animate on</span>
          </div>
          <OT_StatBlock
            content={{
              items: [
                { value: "8.3B",   label: "Assets under management", icon: "bar-chart"   },
                { value: "99.95%", label: "System uptime",           icon: "shield"      },
                { value: "47K+",   label: "Client accounts",         icon: "users"       },
                { value: "4.9",    label: "NPS score",               icon: "award"       },
              ],
            }}
            displaySettings={{ color: "canvas", columns: "4", showIcons: true, animate: true }}
          />
        </div>

        {/* ── Vertical use cases · no context line ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Without context line · surface · 3 columns
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Context is optional. Omitting it gives the block a tighter, more editorial rhythm — value + label only.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_StatBlock
            content={{
              items: [
                { value: "12K",   label: "Experiments run"      },
                { value: "94%",   label: "Rollout confidence"   },
                { value: "6.2ms", label: "Avg. flag latency"    },
              ],
            }}
            displaySettings={{ color: "surface", columns: "3", animate: false }}
          />
        </div>

        <div className="pb-xl" />
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          10 · Features — FeatureGridBlock
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="feature-grid-block" className="border-t border-fg/5">
        <div className="px-md pt-xl pb-lg lg:px-lg">
          <SectionLabel index="10 · Features" title="FeatureGridBlock" />
          <p className="text-body leading-body text-fg-muted max-w-[65ch]">
            The canonical &ldquo;here&apos;s what the platform does&rdquo; block. Section header (eyebrow +
            heading + subheading), up to 6 feature items (headline + rich text body + optional
            per-feature CTA), and a section-level CTA. Grid and ruled layouts; three icon modes;
            three color schemes. Stagger entrance animation on scroll.
          </p>
        </div>

        {/* ── Typography-only · no icons · 3 col grid ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Grid · 3 col · no icons · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Pure typographic hierarchy. Headline scale separates each entry from its body without
            visual containers. Gap-based rhythm, no card chrome.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_FeatureGridBlock
            content={{
              eyebrow:    "Why OptiTech",
              heading:    "The platform built for continuous delivery.",
              subheading: "Every layer of the stack, connected. Every decision, measured.",
              items: [
                { headline: "Feature flags at scale", body: "<p>Deploy to targeted segments without a code release. Roll back any flag in a single API call with full audit history.</p>" },
                { headline: "Concurrent experiments", body: "<p>Run multiple A/B tests simultaneously with built-in interaction detection so results stay clean.</p>" },
                { headline: "Statistical confidence", body: "<p>Sequential testing with controlled false-discovery rates. Know when you have enough data to call it.</p>" },
                { headline: "Deployment telemetry", body: "<p>Correlate every release event with downstream metrics. Spot regressions before your users do.</p>" },
                { headline: "Unified SDK", body: "<p>One SDK, every platform. Server-side, client-side, edge. Sub-millisecond flag evaluation at any throughput.</p>" },
                { headline: "Audit trail & governance", body: "<p>Full change history with actor attribution. SOC 2 Type II. Approval flows for regulated environments.</p>" },
              ],
            }}
            displaySettings={{ color: "canvas", layout: "grid", columns: "col3", iconStyle: "none", animate: false }}
          />
        </div>

        {/* ── Structural icons · 3 col grid · canvas ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Grid · 3 col · structural icons · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Icons at 32px sit above each headline at 70% opacity. Structural landmark, not label.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_FeatureGridBlock
            content={{
              eyebrow:    "The platform",
              heading:    "Speed that compounds.",
              subheading: "Faster experiments produce better data. Better data produces more confident decisions.",
              items: [
                { headline: "Feature flags",           body: "<p>Decouple deployment from release. Ship dark and turn on when you're ready.</p>" },
                { headline: "Experiment engine",       body: "<p>Concurrent A/B tests with automatic interaction controls and sequential validity.</p>" },
                { headline: "Rollout targeting",       body: "<p>Segment by user attributes, cohort, geography, or any combination of the above.</p>" },
                { headline: "Real-time telemetry",     body: "<p>Latency, error rates, and custom KPIs stream into the platform the moment a flag changes.</p>" },
                { headline: "SDK for every surface",   body: "<p>JavaScript, Go, Python, Java, Swift, Kotlin. Same evaluation logic everywhere.</p>" },
                { headline: "Enterprise governance",   body: "<p>Change approvals, audit logs, and role-based access for regulated teams.</p>" },
              ],
              ctaLabel: "See all capabilities",
              ctaUrl:   { default: "#" },
            }}
            displaySettings={{ color: "canvas", layout: "grid", columns: "col3", iconStyle: "structural", feature1Icon: "zap", feature2Icon: "barChart", feature3Icon: "users", feature4Icon: "trendingUp", feature5Icon: "globe", feature6Icon: "shield", animate: false }}
          />
        </div>

        {/* ── Accent icons · 3 col grid · brand ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Grid · 3 col · accent icons · brand
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            16px icon inline before each headline at full weight. Signals intent without upstaging the copy.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_FeatureGridBlock
            content={{
              eyebrow:    "What's included",
              heading:    "Everything your team needs to ship with confidence.",
              items: [
                { headline: "Instant rollback",        body: "<p>One-click flag disable from the dashboard or API. Mean time to recovery measured in seconds.</p>" },
                { headline: "Mutual exclusion groups", body: "<p>Ensure competing experiments never contaminate each other's results.</p>" },
                { headline: "Hold-out experiments",    body: "<p>Measure long-term impact by keeping a clean control group across feature iterations.</p>" },
                { headline: "Funnel analytics",        body: "<p>Track multi-step conversion flows end-to-end, attributed to the correct experiment variant.</p>" },
                { headline: "Webhook integrations",    body: "<p>Push flag events to Datadog, Slack, PagerDuty, or any custom endpoint.</p>" },
                { headline: "Compliance exports",      body: "<p>One-click GDPR and CCPA data exports. User deletion propagates to all experiment records.</p>" },
              ],
            }}
            displaySettings={{ color: "brand", layout: "grid", columns: "col3", iconStyle: "accent", feature1Icon: "zap", feature2Icon: "checkCircle", feature3Icon: "shield", feature4Icon: "barChart", feature5Icon: "send", feature6Icon: "award", animate: false }}
          />
        </div>

        {/* ── Color schemes · typography only ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Color schemes · 3 col · no icons · animate off
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Canvas (default), surface, and brand. Brand inverts to <code className="font-mono text-fg">fg-on-brand</code> throughout.
          </p>
        </div>
        {(["canvas", "surface", "brand"] as const).map((color) => (
          <div key={color} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">color: &ldquo;{color}&rdquo;</span>
            </div>
            <OT_FeatureGridBlock
              content={{
                eyebrow: "The platform",
                heading: "Precision at every layer.",
                items: [
                  { headline: "Feature flags", body: "<p>Decouple deployment from release. Ship dark and turn on when ready.</p>" },
                  { headline: "Experiments",   body: "<p>Concurrent A/B tests with sequential validity and false-discovery controls.</p>" },
                  { headline: "Telemetry",     body: "<p>Real-time correlation between flag changes and downstream metrics.</p>" },
                ],
              }}
              displaySettings={{ color, layout: "grid", columns: "col3", iconStyle: "none", animate: false }}
            />
          </div>
        ))}

        {/* ── Ruled layout · canvas ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Ruled layout · 2-col · structural icons · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Horizontal rules as section separators. Editorial rhythm suited to longer copy or reference lists.
            Always 2-col on desktop regardless of the columns setting.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_FeatureGridBlock
            content={{
              eyebrow:    "How it works",
              heading:    "From flag to finding in four steps.",
              items: [
                { headline: "Define your flag",        body: "<p>Create a boolean, multivariate, or JSON flag. Set targeting rules using any combination of user attributes, cohort membership, or random assignment.</p>" },
                { headline: "Deploy without releasing",body: "<p>Merge your code behind the flag. The feature stays dormant until you flip the switch. No branching, no hotfix risk.</p>" },
                { headline: "Configure your metric",   body: "<p>Choose the primary metric you're optimising for and the guardrails you can't afford to move. OptiTech watches both automatically.</p>" },
                { headline: "Read the result",         body: "<p>Sequential testing surfaces significance as it accrues. When you have enough signal, the platform tells you — you don't have to keep checking.</p>" },
                { headline: "Act on findings",         body: "<p>Roll out to 100%, roll back instantly, or set up the next iteration. Every decision is logged with actor, timestamp, and reason.</p>" },
                { headline: "Ship the next thing",     body: "<p>The flywheel completes. Your data improves your next hypothesis. Your next hypothesis improves your data.</p>" },
              ],
            }}
            displaySettings={{ color: "canvas", layout: "ruled", iconStyle: "structural", feature1Icon: "zap", feature2Icon: "rocket", feature3Icon: "barChart", feature4Icon: "checkCircle", feature5Icon: "award", feature6Icon: "sparkles", animate: false }}
          />
        </div>

        {/* ── Column counts ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Column counts · grid layout · structural icons · canvas
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            2-col for generous prose; 4-col for tighter reference grids. The ruled layout always forces 2-col.
          </p>
        </div>
        {(["col2", "col3", "col4"] as const).map((col) => (
          <div key={col} className="border-t border-fg/5">
            <div className="px-md pt-sm pb-xs lg:px-lg">
              <span className="font-mono text-label text-fg-muted/50">columns: &ldquo;{col}&rdquo;</span>
            </div>
            <OT_FeatureGridBlock
              content={{
                items: [
                  { headline: "Feature flags",      body: "<p>Ship dark and turn on when you're ready. Full audit trail.</p>",         icon: "zap"         },
                  { headline: "Experiments",        body: "<p>Concurrent A/B tests with interaction controls.",                        icon: "barChart"    },
                  { headline: "Targeting",          body: "<p>Segment by any combination of user attributes.",                        icon: "users"       },
                  { headline: "Telemetry",          body: "<p>Real-time correlation between flag events and KPIs.",                   icon: "trendingUp"  },
                ],
              }}
              displaySettings={{ color: "canvas", layout: "grid", columns: col, iconStyle: "structural", feature1Icon: "zap", feature2Icon: "barChart", feature3Icon: "users", feature4Icon: "trendingUp", animate: false }}
            />
          </div>
        ))}

        {/* ── Animated (live) ── */}
        <div className="px-md pb-md lg:px-lg border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Animated · brand · 3 col · structural icons
          </p>
          <p className="text-label text-fg-muted/60 mt-xs">
            Scroll into view to trigger. Each item stagers in at {"{"}80ms intervals{"}"}:
            opacity + translateY, driven by <code className="font-mono text-fg">var(--ot-ease-kinetic)</code>.
            Respects <code className="font-mono text-fg">prefers-reduced-motion</code>.
          </p>
        </div>
        <div className="border-t border-fg/5">
          <OT_FeatureGridBlock
            content={{
              eyebrow:    "What's included",
              heading:    "Everything your team needs.",
              subheading: "Experiment continuously. Ship confidently. Know whether it worked.",
              items: [
                { headline: "Feature flags",           body: "<p>Decouple deployment from release. Ship dark and turn on when ready.</p>" },
                { headline: "Concurrent experiments",  body: "<p>Multiple A/B tests running simultaneously with interaction controls.</p>" },
                { headline: "Rollout targeting",       body: "<p>Segment by user attributes, cohort, geography — or any combination.</p>" },
                { headline: "Real-time telemetry",     body: "<p>Flag changes correlated to downstream metrics the moment they happen.</p>" },
                { headline: "SDK for every platform",  body: "<p>JavaScript, Go, Python, Java, Swift, Kotlin. Same logic everywhere.</p>" },
                { headline: "Enterprise governance",   body: "<p>Approval flows, audit logs, and RBAC for regulated environments.</p>" },
              ],
              ctaLabel: "See all capabilities",
              ctaUrl:   { default: "#" },
            }}
            displaySettings={{ color: "brand", layout: "grid", columns: "col3", iconStyle: "structural", feature1Icon: "zap", feature2Icon: "barChart", feature3Icon: "users", feature4Icon: "trendingUp", feature5Icon: "globe", feature6Icon: "shield", animate: true }}
          />
        </div>

        <div className="pb-xl" />
      </section>


    </>
  );
}
