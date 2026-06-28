import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cva } from "class-variance-authority";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

/**
 * Art direction of the hero. Each value is a distinct composition that reuses
 * the same content (eyebrow / headline / body / dual CTA / optional visual) but
 * arranges it differently. "color" remains the ground-palette modifier within
 * every direction.
 *   editorialSplit — the default: solid-color text panel beside a contained visual
 *   spotlight      — text leads; the visual floats as a framed object with a brand-bloom halo (compact)
 *   overlap        — layered editorial; the headline plate overlaps a contained image edge
 *   diagonal       — a sharp diagonal seam between a color panel and a contained image, accent-lit
 */
export type HeroDirection =
  | "editorialSplit" | "spotlight" | "overlap" | "diagonal";

export type HeroStyleOptions = {
  /** Art direction / composition of the hero (see HeroDirection). */
  direction?: HeroDirection;
  /** Which side the text panel appears on at desktop widths */
  layout?: "imageRight" | "imageLeft";
  /** Background color of the text panel */
  color?: "brand" | "canvas" | "surface";
  /**
   * Entrance animation for the section.
   * "parallax": the frame fades in while the visual pushes in (scale settle)
   * inside its clipped panel — a depth entrance, layout-safe, no scroll listener.
   */
  animation?: "none" | "fade" | "slide" | "parallax";
};

// ─── CVA variant configs ─────────────────────────────────────────────────────

const sectionCva = cva("flex flex-col", {
  variants: {
    layout: {
      imageRight: "lg:flex-row",
      imageLeft:  "lg:flex-row-reverse",
    },
  },
  defaultVariants: { layout: "imageRight" },
});

const textPanelCva = cva(
  "px-md py-lg lg:px-lg lg:py-xl flex flex-col",
  {
    variants: {
      color: {
        brand:   "bg-brand-fill",
        canvas:  "bg-canvas",
        surface: "bg-surface",
      },
      mode: {
        split: "lg:w-[55%]",
        full:  "w-full",
      },
    },
    defaultVariants: { color: "brand", mode: "split" },
  }
);

const eyebrowCva = cva("text-label tracking-label uppercase font-semibold", {
  variants: {
    color: {
      brand:   "text-fg-on-brand/60",
      canvas:  "text-fg-muted",
      surface: "text-fg-muted",
    },
  },
  defaultVariants: { color: "brand" },
});

const headlineCva = cva(
  "text-display font-extrabold leading-display tracking-display",
  {
    variants: {
      color: {
        brand:   "text-fg-on-brand",
        canvas:  "text-fg",
        surface: "text-fg",
      },
    },
    defaultVariants: { color: "brand" },
  }
);

const bodyCva = cva("text-body leading-body max-w-(--ot-measure-tight)", {
  variants: {
    color: {
      brand:   "text-fg-on-brand/80",
      canvas:  "text-fg-muted",
      surface: "text-fg-muted",
    },
  },
  defaultVariants: { color: "brand" },
});

const primaryCtaCva = cva(
  "inline-block hover:-translate-y-0.5 hover:shadow-hover-lift text-label font-semibold tracking-label uppercase px-12 py-4 transition duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-[3px]",
  {
    variants: {
      color: {
        // On a brand panel the resting button is already brand-hover (deeper than
        // the panel); hover inverts to a light chip rather than jumping to canvas.
        brand:
          "bg-brand-hover hover:bg-fg-on-brand text-fg-on-brand hover:text-brand focus-visible:outline-fg-on-brand",
        canvas:
          "bg-brand hover:bg-brand-hover text-fg-on-brand focus-visible:outline-brand",
        surface:
          "bg-brand hover:bg-brand-hover text-fg-on-brand focus-visible:outline-brand",
      },
    },
    defaultVariants: { color: "brand" },
  }
);

const secondaryCtaCva = cva(
  "inline-block border text-label font-semibold tracking-label uppercase px-12 py-4 transition duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-[3px]",
  {
    variants: {
      color: {
        brand:
          "border-fg-on-brand/40 hover:border-fg-on-brand/70 hover:bg-fg-on-brand/8 text-fg-on-brand focus-visible:outline-fg-on-brand",
        canvas:
          "border-fg/40 hover:border-fg/70 hover:bg-fg/8 text-fg focus-visible:outline-fg",
        surface:
          "border-fg/40 hover:border-fg/70 hover:bg-fg/8 text-fg focus-visible:outline-fg",
      },
    },
    defaultVariants: { color: "brand" },
  }
);

const visualPanelCva = cva(
  "relative overflow-hidden aspect-video lg:aspect-auto lg:flex-1",
  {
    variants: {
      color: {
        brand:   "bg-canvas",
        canvas:  "bg-surface",
        surface: "bg-canvas",
      },
    },
    defaultVariants: { color: "brand" },
  }
);

// ─── Component ───────────────────────────────────────────────────────────────

export type HeroBlockProps = {
  eyebrow?: string;
  headline: string;
  body?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** CMS image URL — rendered with next/image fill inside the visual panel */
  visualSrc?: string;
  visualAlt?: string;
  /** Non-image override — SVG, code sample, illustration, etc. Takes precedence over visualSrc */
  visual?: ReactNode;
  styleOptions?: HeroStyleOptions;
  pa?: (prop: string) => { "data-epi-property-name"?: string };
};

export default function HeroBlock({
  eyebrow,
  headline,
  body,
  primaryCta,
  secondaryCta,
  visualSrc,
  visualAlt = "",
  visual,
  styleOptions = {},
  pa = () => ({}),
}: HeroBlockProps) {
  const { direction = "editorialSplit", layout = "imageRight", color = "brand", animation = "none" } = styleOptions;

  // Non-default art directions are self-contained compositions; delegate to them.
  // They reuse the same content + the color/animation modifiers.
  if (direction !== "editorialSplit") {
    const shared = { eyebrow, headline, body, primaryCta, secondaryCta, visualSrc, visualAlt, visual, color, layout, animation, pa };
    if (direction === "spotlight") return <SpotlightHero {...shared} />;
    if (direction === "overlap")   return <OverlapHero {...shared} />;
    if (direction === "diagonal")  return <DiagonalHero {...shared} />;
  }

  const hasVisual  = !!(visual || visualSrc);
  const isAnimated = animation !== "none";

  const animClass = animation === "fade"
    ? "motion-safe:animate-fade-in"
    : isAnimated ? "motion-safe:animate-slide-up" : "";

  // Parallax: the visual frame fades in while the image inside it pushes in
  // (scale 1.08 → 1). Clipped by the panel's overflow-hidden, so it reads as
  // depth with no layout impact and no scroll listener.
  const visualPanelAnim = animation === "parallax" ? "motion-safe:animate-fade-in" : animClass;
  const visualImgAnim   = animation === "parallax" ? "motion-safe:animate-hero-zoom" : "";

  const stagger = (delay: number): CSSProperties =>
    isAnimated ? { animationDelay: `${delay}ms` } : {};

  // Tells the atmospheric layer where the light source is relative to the panel.
  // imageRight → image is on the right → light spills in from the right edge.
  // imageLeft  → image is on the left  → light spills in from the left edge.
  // full       → no image              → overhead-center ambient source.
  const atmosLayout = hasVisual ? layout : "full"

  return (
    <section className={sectionCva({ layout })} aria-label="Hero">

      {/* ── Text panel ── */}
      {/* data-theme="dark" on brand panels ensures tokens like bg-canvas, text-fg,
          and button hover states always resolve to dark-mode values regardless of
          the site's page-level theme (light or dark). */}
      <div
        className={`${textPanelCva({ color, mode: hasVisual ? "split" : "full" })} relative overflow-hidden`}
        data-theme={color === 'brand' ? 'dark' : undefined}
      >
        {/* Atmospheric depth layer — edge-lit gradient + micro-grain texture.
            Absolutely positioned so it has zero impact on flex layout. */}
        <div
          className="hero-atmos"
          data-color={color}
          data-layout={atmosLayout}
          data-pause-offscreen
          aria-hidden="true"
        />

        {/* Content lifted above the atmospheric layer */}
        <div className="relative z-10 flex flex-col gap-lg">
          {eyebrow && (
            <p className={`${eyebrowCva({ color })} ${animClass}`} style={stagger(0)} {...pa('eyebrow')}>
              {eyebrow}
            </p>
          )}
          <h1 className={`${headlineCva({ color })} ${animClass}`} style={stagger(100)} {...pa('headline')}>
            {headline}
          </h1>
          {body && (
            <p className={`${bodyCva({ color })} ${animClass}`} style={stagger(200)} {...pa('body')}>
              {body}
            </p>
          )}
        </div>

        {(primaryCta || secondaryCta) && (
          <div className={`relative z-10 mt-xl flex flex-wrap gap-sm ${animClass}`} style={stagger(320)}>
            {primaryCta && (
              <Link href={primaryCta.href} className={primaryCtaCva({ color })} {...pa('primaryCtaLabel')}>
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href} className={secondaryCtaCva({ color })} {...pa('secondaryCtaLabel')}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Visual panel — only rendered when a visual is provided ── */}
      {hasVisual && (
        <div className={`${visualPanelCva({ color })} ${visualPanelAnim}`} style={stagger(150)} {...pa('visual')}>
          {visual ?? (
            visualSrc ? (
              <Image
                src={visualSrc}
                alt={visualAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className={`object-cover ${visualImgAnim}`}
                priority
              />
            ) : null
          )}
        </div>
      )}

    </section>
  );
}

// ─── Shared pieces for the alternate art directions ──────────────────────────────

type HeroDirectionProps = {
  eyebrow?: string;
  headline: string;
  body?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  visualSrc?: string;
  visualAlt?: string;
  visual?: ReactNode;
  color: NonNullable<HeroStyleOptions["color"]>;
  layout: NonNullable<HeroStyleOptions["layout"]>;
  animation: NonNullable<HeroStyleOptions["animation"]>;
  pa: NonNullable<HeroBlockProps["pa"]>;
};

/** Section ground fill by color — the palette modifier shared across directions. */
const groundCva = cva("", {
  variants: {
    color: { brand: "bg-brand-fill", canvas: "bg-canvas", surface: "bg-surface" },
  },
  defaultVariants: { color: "brand" },
});

/** Column-level entrance class (the alternate directions animate the content
 *  group rather than per-element, keeping each composition self-contained). */
function entranceClass(animation: HeroDirectionProps["animation"]): string {
  if (animation === "fade") return "motion-safe:animate-fade-in";
  if (animation === "slide" || animation === "parallax") return "motion-safe:animate-slide-up";
  return "";
}

function HeroMedia({
  visual, visualSrc, visualAlt, sizes, className = "object-cover",
}: {
  visual?: ReactNode; visualSrc?: string; visualAlt?: string; sizes: string; className?: string;
}) {
  if (visual) return <>{visual}</>;
  if (visualSrc) {
    return (
      <Image src={visualSrc} alt={visualAlt ?? ""} fill sizes={sizes} className={className} priority />
    );
  }
  return null;
}

function HeroCtas({
  color, primaryCta, secondaryCta, pa, className = "",
}: Pick<HeroDirectionProps, "color" | "primaryCta" | "secondaryCta" | "pa"> & { className?: string }) {
  if (!primaryCta && !secondaryCta) return null;
  return (
    <div className={`flex flex-wrap gap-sm ${className}`}>
      {primaryCta && (
        <Link href={primaryCta.href} className={primaryCtaCva({ color })} {...pa("primaryCtaLabel")}>
          {primaryCta.label}
        </Link>
      )}
      {secondaryCta && (
        <Link href={secondaryCta.href} className={secondaryCtaCva({ color })} {...pa("secondaryCtaLabel")}>
          {secondaryCta.label}
        </Link>
      )}
    </div>
  );
}

// ─── Direction: Spotlight Bloom (compact) ────────────────────────────────────────
// Text leads on a single unified ground; the visual floats as a contained, framed
// object lit by a chromatic brand-bloom halo (never a full-bleed backdrop — that's
// the Banner's job). Height-conscious: trimmed vertical padding + a wide, capped
// media so the hero stays within roughly one band. No image → the statement carries
// the fold on its own.

function SpotlightHero({
  eyebrow, headline, body, primaryCta, secondaryCta, visualSrc, visualAlt, visual, color, layout, animation, pa,
}: HeroDirectionProps) {
  const hasVisual = !!(visual || visualSrc);
  const anim = entranceClass(animation);
  const imageLeft = layout === "imageLeft";

  return (
    <section
      className={`${groundCva({ color })} relative overflow-hidden px-md py-lg lg:px-lg lg:py-xl`}
      data-theme={color === "brand" ? "dark" : undefined}
      aria-label="Hero"
    >
      <div className="hero-spotlight-aura" aria-hidden />
      <div className={`relative z-10 mx-auto grid max-w-7xl items-center gap-lg lg:gap-2xl ${hasVisual ? "lg:grid-cols-2" : "max-w-4xl"}`}>
        <div className={`flex flex-col gap-md lg:gap-lg ${imageLeft ? "lg:order-2" : ""} ${anim}`}>
          {eyebrow && <p className={eyebrowCva({ color })} {...pa("eyebrow")}>{eyebrow}</p>}
          <h1 className={headlineCva({ color })} {...pa("headline")}>{headline}</h1>
          {body && <p className={bodyCva({ color })} {...pa("body")}>{body}</p>}
          <HeroCtas color={color} primaryCta={primaryCta} secondaryCta={secondaryCta} pa={pa} className="mt-sm" />
        </div>

        {hasVisual && (
          <div className={`relative ${imageLeft ? "lg:order-1" : ""}`} {...pa("visual")}>
            <div className="hero-bloom-halo" aria-hidden />
            {/* Wide, height-capped plate keeps the hero compact regardless of viewport. */}
            <div className="hero-bloom-plate relative aspect-[3/2] max-h-[24rem] overflow-hidden">
              <HeroMedia visual={visual} visualSrc={visualSrc} visualAlt={visualAlt} sizes="(min-width: 1024px) 45vw, 100vw" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Direction: Editorial Overlap (polished) ─────────────────────────────────────
// Layered, magazine composition: a contained image with a solid color headline plate
// overlapping its edge, an index marker (number + accent rule), and a chromatic depth
// shadow separating the planes. The image is contained and the type plate occludes
// its edge — distinct from the Banner's flat full-bleed photo with centered overlay.
// Polished: capped image height, refined marker, tighter rhythm + vertical padding.

function OverlapHero({
  eyebrow, headline, body, primaryCta, secondaryCta, visualSrc, visualAlt, visual, color, layout, animation, pa,
}: HeroDirectionProps) {
  const hasVisual = !!(visual || visualSrc);
  const anim = entranceClass(animation);
  const imageLeft = layout === "imageLeft";

  const plate = (
    <div
      className={`hero-overlap-plate relative z-10 ${groundCva({ color })} p-lg lg:col-span-6 lg:row-start-1 lg:self-center lg:p-xl ${
        hasVisual ? `-mt-10 mx-md lg:mx-0 lg:mt-0 ${imageLeft ? "lg:col-start-7 lg:-ml-[9%]" : "lg:col-start-1 lg:-mr-[9%]"}` : "lg:col-span-12"
      } ${anim}`}
      data-theme={color === "brand" ? "dark" : undefined}
    >
      <p className="mb-md flex items-center gap-sm font-mono text-label uppercase tracking-label text-fg-muted" {...pa("eyebrow")}>
        <span className="inline-block h-px w-8 flex-none" style={{ background: "var(--ot-accent)" }} aria-hidden />
        {eyebrow ? eyebrow : "Hero"}
      </p>
      <h1 className={headlineCva({ color })} {...pa("headline")}>{headline}</h1>
      {body && <p className={`${bodyCva({ color })} mt-sm`} {...pa("body")}>{body}</p>}
      <HeroCtas color={color} primaryCta={primaryCta} secondaryCta={secondaryCta} pa={pa} className="mt-lg" />
    </div>
  );

  return (
    <section className="bg-canvas px-md py-lg lg:px-lg lg:py-xl" aria-label="Hero">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-0 lg:grid-cols-12">
          {hasVisual && (
            <div
              className={`relative aspect-[3/2] max-h-[28rem] overflow-hidden lg:row-start-1 ${
                imageLeft ? "lg:col-span-7 lg:col-start-1" : "lg:col-span-7 lg:col-start-6"
              }`}
              {...pa("visual")}
            >
              <HeroMedia visual={visual} visualSrc={visualSrc} visualAlt={visualAlt} sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
          )}
          {plate}
        </div>
      </div>
    </section>
  );
}

// ─── Direction: Diagonal Split ───────────────────────────────────────────────────
// A sharp diagonal seam between a color panel (text) and a contained image. The
// image is clipped to a diagonal edge that is accent-lit (a token drop-shadow that
// follows the clip silhouette) with a soft brand bloom; it reveals with a motion-safe
// slide. The image is a contained half, never a full-bleed backdrop with overlay —
// clear of the Banner. Height-stable: the image tracks the panel height, capped by a
// modest min-height so the diagonal always reads.

function DiagonalHero({
  eyebrow, headline, body, primaryCta, secondaryCta, visualSrc, visualAlt, visual, color, layout, animation, pa,
}: HeroDirectionProps) {
  const hasVisual = !!(visual || visualSrc);
  const anim = entranceClass(animation);
  const side = layout === "imageLeft" ? "left" : "right";

  return (
    <section
      className={`${groundCva({ color })} relative overflow-hidden`}
      data-theme={color === "brand" ? "dark" : undefined}
      aria-label="Hero"
    >
      {hasVisual && (
        <div
          className={`hero-diagonal__media relative h-60 w-full lg:absolute lg:inset-y-0 lg:h-auto lg:w-[62%] ${side === "left" ? "lg:left-0" : "lg:right-0"}`}
          data-side={side}
          {...pa("visual")}
        >
          <HeroMedia visual={visual} visualSrc={visualSrc} visualAlt={visualAlt} sizes="(min-width: 1024px) 62vw, 100vw" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-md py-xl lg:min-h-[26rem] lg:px-lg lg:py-2xl">
        <div
          className={`flex flex-col gap-md lg:gap-lg ${anim} ${
            hasVisual ? `lg:max-w-[44%] ${side === "left" ? "lg:ml-auto" : ""}` : "max-w-(--ot-measure)"
          }`}
        >
          {eyebrow && <p className={eyebrowCva({ color })} {...pa("eyebrow")}>{eyebrow}</p>}
          <h1 className={headlineCva({ color })} {...pa("headline")}>{headline}</h1>
          {body && <p className={bodyCva({ color })} {...pa("body")}>{body}</p>}
          <HeroCtas color={color} primaryCta={primaryCta} secondaryCta={secondaryCta} pa={pa} className="mt-sm" />
        </div>
      </div>
    </section>
  );
}
