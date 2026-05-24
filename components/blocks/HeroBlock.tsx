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
   * "parallax" degrades to fade until a client enhancer is added.
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
  "px-md py-xl lg:px-lg lg:py-2xl flex flex-col",
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

const bodyCva = cva("text-body leading-body max-w-[52ch]", {
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
  "inline-block hover:-translate-y-0.5 text-label font-semibold tracking-label uppercase px-12 py-4 transition duration-150 ease-quick focus-visible:outline-2 focus-visible:outline-offset-[3px]",
  {
    variants: {
      color: {
        brand:
          "bg-brand-hover hover:bg-canvas text-fg-on-brand focus-visible:outline-fg-on-brand",
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

  const stagger = (delay: number): CSSProperties =>
    isAnimated ? { animationDelay: `${delay}ms` } : {};

  return (
    <section className={sectionCva({ layout })} aria-label="Hero">

      {/* ── Text panel ── */}
      {/* data-theme="dark" on brand panels ensures tokens like bg-canvas, text-fg,
          and button hover states always resolve to dark-mode values regardless of
          the site's page-level theme (light or dark). */}
      <div
        className={textPanelCva({ color, mode: hasVisual ? "split" : "full" })}
        data-theme={color === 'brand' ? 'dark' : undefined}
      >
        <div className="flex flex-col gap-lg">
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
          <div className={`mt-xl flex flex-wrap gap-sm ${animClass}`} style={stagger(320)}>
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
        <div className={`${visualPanelCva({ color })} ${animClass}`} style={stagger(150)} {...pa('visual')}>
          {visual ?? (
            visualSrc ? (
              <Image
                src={visualSrc}
                alt={visualAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null
          )}
        </div>
      )}

    </section>
  );
}
