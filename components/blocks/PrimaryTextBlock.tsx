import { cva } from "class-variance-authority";
import { RichText } from '@optimizely/cms-sdk/react/richText'

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type PrimaryTextStyleOptions = {
  /** Horizontal alignment of the content column within the section */
  alignment?: "left" | "center";
  /** Background color of the block — "none" is transparent, inheriting the row/section background */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Heading scale — controls font size, weight, tracking, and vertical rhythm */
  size?: "display" | "headline" | "title" | "label";
  /**
   * Gradient fill for the heading.
   * Only takes effect when size is "display"; ignored at all other scales.
   * Dark canvas background required (see DESIGN.md §6).
   *   brand    — brand teal face + brand shadow stack (Brand — Primary)
   *   warm     — accent face + brand shadows (Brand — Extended)
   *   luminous — fg/near-white face + brand-tinted shadows (Luminous — Carved from Light)
   *   ember    — accent face + hue-shifted ember shadows (Accent — Ember)
   *   extrude  — fg face + accent rim + 12-layer brand isometric shadows
   *   mono     — fg face + greyscale shadows; dark mode=silver, light mode=charcoal
   */
  gradient?: "none" | "brand" | "warm" | "luminous" | "ember" | "extrude" | "mono";
  /**
   * Depth effect applied to the heading letterforms.
   * Works at any scale; most impactful at display/headline.
   * outline works best at headline scale and above (hollow letterforms need stroke mass).
   *   extrude — comic 3D offset shadow (dark: white face; light: brand face + token shadows)
   *   liquid  — animated brand↔accent tidal gradient sweep via background-clip:text
   *   outline — hollow wire letterforms with brand stroke, static glow, ghost offset
   *   emboss  — carved-into-surface: brand face, opposing cavity shadow + rim highlight
   */
  depth?: "none" | "extrude" | "liquid" | "outline" | "emboss";
};

// ─── CVA variant configs ─────────────────────────────────────────────────────

/** Section wrapper: background + vertical padding scaled to heading size */
const sectionCva = cva("px-md lg:px-lg", {
  variants: {
    color: {
      none:    "",
      brand:   "bg-brand-fill",
      canvas:  "bg-canvas",
      surface: "bg-surface",
    },
    size: {
      display:  "py-xl",
      headline: "py-lg",
      title:    "py-md",
      label:    "py-md",
    },
  },
  defaultVariants: { color: "canvas", size: "headline" },
});

/**
 * Inner column: horizontal placement + max-width cap.
 * "center" centers the column on the page (mx-auto) and caps its width, but the
 * text inside still reads as a left-aligned block — no text-center, so paragraphs
 * keep a clean left edge rather than going ragged-centered.
 */
const innerCva = cva("", {
  variants: {
    alignment: {
      left:   "",
      center: "mx-auto max-w-5xl",
    },
  },
  defaultVariants: { alignment: "left" },
});

/** Eyebrow label: small uppercase tag, color adapts to surface */
const eyebrowCva = cva("text-label tracking-label uppercase font-semibold", {
  variants: {
    color: {
      none:    "text-fg-muted",
      brand:   "text-fg-on-brand/60",
      canvas:  "text-fg-muted",
      surface: "text-fg-muted",
    },
  },
  defaultVariants: { color: "canvas" },
});

/**
 * Heading: scale carries weight, tracking, and line-height.
 * Gradient compound variants fire only when size === "display" — enforced here,
 * not by the caller.
 * Depth compound variants apply at any scale; CSS handles theme + bg overrides.
 */
const headlineCva = cva("text-balance", {
  variants: {
    size: {
      display:  "text-display leading-[1.15] tracking-display font-extrabold",
      headline: "text-headline leading-headline tracking-headline font-bold",
      title:    "text-title leading-title tracking-title font-semibold",
      label:    "text-label tracking-label uppercase font-semibold",
    },
    color: {
      none:    "text-fg",
      brand:   "text-fg-on-brand",
      canvas:  "text-fg",
      surface: "text-fg",
    },
    gradient: {
      none:     "",
      brand:    "",
      warm:     "",
      luminous: "",
      ember:    "",
      extrude:  "",
      mono:     "",
    },
    depth: {
      none:    "",
      extrude: "",
      liquid:  "",
      outline: "",
      emboss:  "",
    },
  },
  compoundVariants: [
    { size: "display", gradient: "brand",    class: "display-gradient-brand" },
    { size: "display", gradient: "warm",     class: "display-gradient-warm" },
    { size: "display", gradient: "luminous", class: "display-gradient-luminous" },
    { size: "display", gradient: "ember",    class: "display-gradient-ember" },
    { size: "display", gradient: "extrude",  class: "display-extrude" },
    { size: "display", gradient: "mono",     class: "display-gradient-mono" },
    { depth: "extrude", class: "ot-depth-extrude" },
    { depth: "liquid",  class: "ot-depth-liquid" },
    { depth: "outline", class: "ot-depth-outline" },
    { depth: "emboss",  class: "ot-depth-emboss" },
  ],
  defaultVariants: { size: "headline", color: "canvas", gradient: "none", depth: "none" },
});

// ─── Component ───────────────────────────────────────────────────────────────

export type PrimaryTextBlockProps = {
  eyebrow?: string;
  headline: string;
  headingLevel?: 'h1' | 'h2';
  body?: Parameters<typeof RichText>[0]['content'] | null;
  styleOptions?: PrimaryTextStyleOptions;
  pa?: (prop: string) => { "data-epi-property-name"?: string };
};

export default function PrimaryTextBlock({
  eyebrow,
  headline,
  headingLevel = 'h2',
  body,
  styleOptions = {},
  pa = () => ({}),
}: PrimaryTextBlockProps) {
  const {
    alignment = "left",
    color     = "canvas",
    size      = "headline",
    gradient  = "none",
    depth     = "none",
  } = styleOptions;

  const Heading = headingLevel

  return (
    <section className={sectionCva({ color, size })}>
      <div className={innerCva({ alignment })}>
        <div className="flex flex-col gap-sm">
          {eyebrow && (
            <p className={eyebrowCva({ color })} {...pa('eyebrow')}>{eyebrow}</p>
          )}
          <Heading
            className={headlineCva({ size, color, gradient, depth })}
            {...(depth === 'liquid' ? { 'data-pause-offscreen': '' } : {})}
            {...pa('headline')}
          >
            {headline}
          </Heading>
          {body && (
            <div
              data-rich-text=""
              data-color={color}
              {...pa('body')}
            >
              <RichText content={body} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
