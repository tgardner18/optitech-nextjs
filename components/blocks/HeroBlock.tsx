import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import HeroPointerLight from "./HeroPointerLight.client";

// All visual styling lives in hero.css (imported from app/globals.css).
// This component only sets data attributes and markup.

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

/**
 * Art direction of the hero. Each value is a distinct composition that reuses
 * the same content (eyebrow / headline / body / dual CTA / optional visual) but
 * arranges it differently. "color" remains the ground-palette modifier within
 * every direction.
 *   editorialSplit — the default: solid-color text panel beside a contained visual
 *   spotlight      — a wide content panel leads beside a deliberately small,
 *                    offset-framed image; no full-bleed color panel
 *   overlap        — layered editorial; the headline plate is anchored to the
 *                    image's bottom edge and pulled up by a % of its own height,
 *                    at any viewport width or copy length
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
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};


/** Stable, readable id so each hero's section is labelled by its own headline. */
function headingIdFor(headline: string): string {
  let h = 0;
  for (let i = 0; i < headline.length; i++) h = (h * 31 + headline.charCodeAt(i)) | 0;
  return `hero-${(h >>> 0).toString(36)}`;
}

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
  const {
    direction: rawDirection = "editorialSplit",
    layout: rawLayout = "imageRight",
    color: rawColor = "brand",
    animation = "none",
  } = styleOptions;
  // Display-template settings are free strings in the CMS (AI-authored or hand-edited pages can
  // carry values like "split"), so every setting falls back to its default when unknown.
  const direction: HeroDirection =
    rawDirection === "spotlight" || rawDirection === "overlap" || rawDirection === "diagonal" ? rawDirection : "editorialSplit";
  const side: "left" | "right" = rawLayout === "imageLeft" ? "left" : "right";
  const color: NonNullable<HeroStyleOptions["color"]> =
    rawColor === "canvas" || rawColor === "surface" ? rawColor : "brand";

  const hasVisual = !!(visual || visualSrc);
  const id = headingIdFor(headline);
  const theme = color === "brand" ? "dark" : undefined;
  // Tailwind hooks that campaign-looks.css keys on for the Editorial Split section.
  const splitClass = cn("flex flex-col", side === "left" ? "lg:flex-row-reverse" : "lg:flex-row");

  const text = (
    <>
      {eyebrow && (
        <p data-part="eyebrow" {...pa("eyebrow")}>
          <span data-part="rule" aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
      )}
      <h1 id={id} data-part="headline" {...pa("headline")}>{headline}</h1>
      {body && <p data-part="body" {...pa("body")}>{body}</p>}
      {(primaryCta || secondaryCta) && (
        <div data-part="ctas" className="flex-wrap">
          {primaryCta && (
            <Link href={primaryCta.href} data-part="primary" className="inline-block" {...pa("primaryCtaLabel")}>
              {primaryCta.label}
              <ArrowRight data-part="arrow" aria-hidden />
            </Link>
          )}
          {secondaryCta && (
            <Link href={secondaryCta.href} data-part="secondary" className="inline-block" {...pa("secondaryCtaLabel")}>
              {secondaryCta.label}
            </Link>
          )}
        </div>
      )}
    </>
  );

  const media = (extra?: ReactNode) =>
    hasVisual ? (
      <div data-part="media" {...pa("visual")}>
        {extra}
        <div data-part="frame">
          {visual ?? (
            <Image
              data-part="img"
              src={visualSrc as string}
              alt={visualAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          )}
        </div>
      </div>
    ) : null;

  let inner: ReactNode;
  if (direction === "spotlight") {
    inner = (
      <>
        <div data-part="aura" aria-hidden="true" />
        <div data-part="inner">
          {media(<div data-part="offset" aria-hidden="true" />)}
          <div data-part="panel" data-fill={color} data-theme={theme}>{text}</div>
        </div>
        <HeroPointerLight />
      </>
    );
  } else if (direction === "overlap") {
    inner = (
      <div data-part="inner">
        {media()}
        <div data-part="panel" data-fill={color} data-theme={theme}>
          <div data-part="shade" aria-hidden="true" />
          <div data-part="content">{text}</div>
        </div>
      </div>
    );
  } else if (direction === "diagonal") {
    inner = (
      <>
        {hasVisual && (
          <>
            {media()}
            {/* The accent-lit filter sits on this wrapper so clip-path on the shape can't cut it off */}
            <div data-part="shape-wrap" aria-hidden="true">
              <div data-part="shape" data-fill={color} />
            </div>
          </>
        )}
        <div data-part="inner">
          <div data-part="panel">{text}</div>
        </div>
      </>
    );
  } else {
    inner = (
      <>
        <div data-part="panel" data-fill={color} data-theme={theme}>
          <div data-part="atmos" aria-hidden="true" />
          <div data-part="content">{text}</div>
        </div>
        {media()}
      </>
    );
  }

  return (
    <section
      className={direction === "editorialSplit" ? splitClass : undefined}
      data-block="hero"
      data-direction={direction}
      data-color={color}
      data-side={side}
      data-image={hasVisual ? "yes" : "no"}
      data-entrance={animation}
      data-fill={direction === "diagonal" ? color : undefined}
      data-theme={direction === "diagonal" ? theme : undefined}
      aria-labelledby={id}
    >
      {inner}
      {eyebrow && <HeroMarquee text={eyebrow} />}
    </section>
  );
}

/**
 * Campaign-look marquee tape: the eyebrow repeated in a slow loop. Hidden everywhere
 * (display:none); only the Poster and Stage looks of OT_CampaignLandingPage switch it on
 * (components/campaign/campaign-looks.css). Decorative duplicate of the eyebrow, so it
 * is aria-hidden. The words live in data-text and are painted by CSS (::before), so text
 * extractors and AI crawlers do not read the same phrase ten times. Two identical halves let the track loop seamlessly at -50%.
 */
function HeroMarquee({ text }: { text: string }) {
  const half = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="hero-marquee__item" data-text={text} />
  ));
  return (
    <div className="hero-marquee hidden" aria-hidden="true">
      <div className="hero-marquee__track">
        <div className="hero-marquee__half">{half}</div>
        <div className="hero-marquee__half">{half}</div>
      </div>
    </div>
  );
}
