import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cva } from "class-variance-authority";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type HeroStyleOptions = {
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
  const { layout = "imageRight", color = "brand", animation = "none" } = styleOptions;
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
