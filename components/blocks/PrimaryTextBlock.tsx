import { cva } from "class-variance-authority";
import { RichText } from '@optimizely/cms-sdk/react/richText'
import PrimaryTextDepth3D from './PrimaryTextDepth3D.client'

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

/**
 * Header effect applied to the heading. One consolidated, marketer-facing set —
 * every option is token-derived (works on any color scheme) and handles both
 * dark and light mode. Most impactful at headline scale and up.
 *   gradient          — static brand→accent diagonal fill (background-clip:text)
 *   animatedGradient  — the same fill, animated as a slow shimmer/sweep
 *   depth3d           — hard isometric 3D offset shadow stack ("pop-out")
 *   glitch            — chromatic smear: RGB-split ghosts + vertical motion streaks
 *   outline           — hollow wire letterforms with brand stroke + glow
 *   neon              — retro-disco glowing tube (dual-tone brand+accent, buzz flicker)
 *   highlight         — accent marker swipe behind the text (inline)
 *   glow              — backlit aurora halo
 */
export type HeaderEffect =
  | "none" | "gradient" | "animatedGradient" | "depth3d"
  | "glitch" | "outline" | "neon" | "highlight" | "glow";

export type PrimaryTextStyleOptions = {
  /** Horizontal alignment of the content column within the section */
  alignment?: "left" | "center";
  /** Background color of the block — "none" is transparent, inheriting the row/section background */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Heading scale — controls font size, weight, tracking, and vertical rhythm */
  size?: "display" | "headline" | "title" | "label";
  /** Header effect on the heading (see HeaderEffect). */
  effect?: HeaderEffect;
};

/** Effect key → global CSS class (defined in app/globals.css). */
const EFFECT_CLASS: Record<HeaderEffect, string> = {
  none:             "",
  gradient:         "ot-fx-gradient",
  animatedGradient: "ot-depth-liquid",
  depth3d:          "ot-depth-extrude",
  glitch:           "ot-fx-chromatic",
  outline:          "ot-depth-outline",
  neon:             "ot-fx-neon",
  highlight:        "ot-fx-highlight",
  glow:             "ot-fx-glow",
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
 * "center" centers the capped-width column on the page (mx-auto) AND centers the
 * content within it (text-center) so the heading/eyebrow/body read as genuinely
 * centered rather than left-aligned inside a centered box. The flex container
 * below also gets items-center so block-level children collapse to their content
 * width and sit on the page's center axis.
 */
const innerCva = cva("", {
  variants: {
    alignment: {
      left:   "",
      center: "mx-auto max-w-5xl text-center",
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
 * Heading: scale carries weight, tracking, and line-height; color sets the face.
 * The header effect class is appended separately (see EFFECT_CLASS) so a single
 * dropdown drives it; the effect's own CSS handles theme + background overrides.
 */
const headlineCva = cva("text-balance", {
  variants: {
    size: {
      display:  "text-display leading-display-safe tracking-display font-extrabold",
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
  },
  defaultVariants: { size: "headline", color: "canvas" },
});

// ─── Component ───────────────────────────────────────────────────────────────

export type PrimaryTextBlockProps = {
  eyebrow?: string;
  headline: string;
  headingLevel?: 'h1' | 'h2';
  body?: Parameters<typeof RichText>[0]['content'] | null;
  styleOptions?: PrimaryTextStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
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
    effect    = "none",
  } = styleOptions;

  const Heading = headingLevel
  const effectClass = EFFECT_CLASS[effect]
  // Highlight is an inline marker swipe, so it lives on a span hugging the text;
  // every other effect applies directly to the heading element.
  const isHighlight = effect === 'highlight'
  // depth3d is the one interactive effect: it renders real stacked DOM layers via
  // a client component (cursor-driven 3D rotation). The heading itself does NOT
  // get the effect class — the client owns the layered markup. Every other effect
  // stays exactly as it was: server-rendered, zero client JavaScript.
  const isDepth3d = effect === 'depth3d'

  const headingChildren = isHighlight
    ? <span className={effectClass}>{headline}</span>
    : isDepth3d
      ? <PrimaryTextDepth3D text={headline} />
      : headline

  return (
    <section className={sectionCva({ color, size })}>
      <div className={innerCva({ alignment })}>
        <div className={`flex flex-col gap-sm${alignment === 'center' ? ' items-center' : ''}`}>
          {eyebrow && (
            <p className={eyebrowCva({ color })} {...pa('eyebrow')}>{eyebrow}</p>
          )}
          <Heading
            className={`${headlineCva({ size, color })}${
              // Highlight's band fills the line's leading, so add a little bottom
              // margin (on top of the gap-sm) to keep it off the body copy.
              isHighlight ? ' mb-sm' : isDepth3d ? '' : effectClass ? ` ${effectClass}` : ''
            }`}
            {...(effect === 'animatedGradient' ? { 'data-pause-offscreen': '' } : {})}
            {...(effect === 'glitch' ? { 'data-text': headline, 'data-pause-offscreen': '' } : {})}
            {...pa('headline')}
          >
            {headingChildren}
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
