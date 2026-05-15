import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export type HeroColorScheme = "brand" | "canvas" | "surface";
export type HeroOrientation = "left" | "right";

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
  /** Which side the text panel appears on at desktop widths. Default: "left" */
  orientation?: HeroOrientation;
  /** Background color of the text panel. Default: "brand" */
  colorScheme?: HeroColorScheme;
};

const SCHEMES: Record<
  HeroColorScheme,
  {
    panel: string;
    eyebrow: string;
    headline: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    visualBg: string;
  }
> = {
  brand: {
    panel:       "bg-brand",
    eyebrow:     "text-fg-on-brand/60",
    headline:    "text-fg-on-brand",
    body:        "text-fg-on-brand/80",
    primaryCta:
      "bg-brand-hover hover:bg-canvas text-fg-on-brand focus-visible:outline-fg-on-brand",
    secondaryCta:
      "border border-fg-on-brand/40 hover:border-fg-on-brand/70 hover:bg-fg-on-brand/8 text-fg-on-brand focus-visible:outline-fg-on-brand",
    visualBg: "bg-canvas",
  },
  canvas: {
    panel:    "bg-canvas",
    eyebrow:  "text-fg-muted",
    headline: "text-fg",
    body:     "text-fg-muted",
    primaryCta:
      "bg-brand hover:bg-brand-hover text-fg-on-brand focus-visible:outline-brand",
    secondaryCta:
      "border border-fg/40 hover:border-fg/70 hover:bg-fg/8 text-fg focus-visible:outline-fg",
    visualBg: "bg-surface",
  },
  surface: {
    panel:    "bg-surface",
    eyebrow:  "text-fg-muted",
    headline: "text-fg",
    body:     "text-fg-muted",
    primaryCta:
      "bg-brand hover:bg-brand-hover text-fg-on-brand focus-visible:outline-brand",
    secondaryCta:
      "border border-fg/40 hover:border-fg/70 hover:bg-fg/8 text-fg focus-visible:outline-fg",
    visualBg: "bg-canvas",
  },
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
  orientation = "left",
  colorScheme = "brand",
}: HeroBlockProps) {
  const s = SCHEMES[colorScheme];

  return (
    <section
      className={`flex flex-col ${orientation === "right" ? "lg:flex-row-reverse" : "lg:flex-row"}`}
      aria-label="Hero"
    >

      {/* ── Text panel ── */}
      <div className={`${s.panel} px-md py-xl lg:px-lg lg:py-2xl flex flex-col lg:w-[55%]`}>
        <div className="flex flex-col gap-lg">
          {eyebrow && (
            <p className={`text-label tracking-label uppercase font-semibold ${s.eyebrow}`}>
              {eyebrow}
            </p>
          )}
          <h1 className={`text-display font-extrabold leading-display tracking-display ${s.headline}`}>
            {headline}
          </h1>
          {body && (
            <p className={`text-body leading-body max-w-[52ch] ${s.body}`}>
              {body}
            </p>
          )}
        </div>

        {(primaryCta || secondaryCta) && (
          <div className="mt-xl flex flex-wrap gap-sm">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className={`inline-block hover:-translate-y-0.5
                           text-label font-semibold tracking-label uppercase
                           px-12 py-4
                           transition duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-offset-[3px]
                           ${s.primaryCta}`}
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className={`inline-block
                           text-label font-semibold tracking-label uppercase
                           px-12 py-4
                           transition duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-offset-[3px]
                           ${s.secondaryCta}`}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Visual panel ── */}
      <div className={`relative overflow-hidden aspect-video lg:aspect-auto lg:flex-1 ${s.visualBg}`}>
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

    </section>
  );
}
