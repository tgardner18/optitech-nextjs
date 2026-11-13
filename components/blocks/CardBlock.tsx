import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RichText } from '@optimizely/cms-sdk/react/richText'

// ─── Style option types ───────────────────────────────────────────────────────

export type CardFill       = "ghost" | "surface" | "brand" | "light" | "glass";
export type CardBorder     = "none" | "subtle" | "brand";
export type CardImageStyle = "top" | "background" | "side" | "float";
export type CardImageSide  = "left" | "right";
export type CardHover      = "none" | "lift" | "glow" | "tilt";
export type CardDensity    = "compact" | "default" | "spacious";

export type CardAspectRatio      = "auto" | "square" | "portrait" | "landscape" | "wide" | "cinema";
export type CardImageAspectRatio = "auto" | "square" | "portrait" | "landscape" | "wide";
export type CardMinHeight        = "none" | "xs" | "sm" | "md" | "lg";

export type CardStyleOptions = {
  fill?:             CardFill;
  border?:           CardBorder;
  imageStyle?:       CardImageStyle;
  imageSide?:        CardImageSide;
  hover?:            CardHover;
  density?:          CardDensity;
  noise?:            boolean;
  accentLine?:       "none" | "top";
  maxHeight?:        "none" | "sm" | "md" | "lg";
  minHeight?:        CardMinHeight;
  aspectRatio?:      CardAspectRatio;
  imageAspectRatio?: CardImageAspectRatio;
};

export type CardBlockProps = {
  heading:       string;
  headingLevel?: "h2" | "h3" | "h4";
  eyebrow?:      string;
  description?:  Parameters<typeof RichText>[0]['content'] | null;
  image?:        { src: string; alt: string };
  cta?:          { label: string; href: string };
  className?:    string;
  styleOptions?: CardStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};

// ─── Size helpers (inline so they beat the unlayered card.css) ────────────────

const MIN_H: Record<CardMinHeight, string | undefined> = {
  none: undefined, xs: "200px", sm: "280px", md: "380px", lg: "480px",
};
const MAX_H: Record<NonNullable<CardStyleOptions["maxHeight"]>, string | undefined> = {
  none: undefined, sm: "320px", md: "480px", lg: "640px",
};
const RATIO: Record<CardAspectRatio, string | undefined> = {
  auto: undefined, square: "1 / 1", portrait: "3 / 4", landscape: "4 / 3", wide: "16 / 9", cinema: "21 / 9",
};

// SVG feTurbulence grain — rendered at a fixed tile size and tiled via background-repeat.
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ─── Component ───────────────────────────────────────────────────────────────

// Layout adapts to the card's own width (card.css container query), so the sizes hint
// stays conservative for the widest case.
const IMG_SIZES = "(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw";

export default function CardBlock({
  heading,
  headingLevel   = "h3",
  eyebrow,
  description,
  image,
  cta,
  className,
  styleOptions = {},
  pa = () => ({}),
}: CardBlockProps) {
  const {
    fill             = "surface",
    border           = "none",
    imageStyle       = "top",
    imageSide        = "left",
    hover            = "none",
    density          = "default",
    noise            = false,
    accentLine       = "none",
    maxHeight        = "none",
    minHeight        = "none",
    aspectRatio      = "auto",
    imageAspectRatio = "auto",
  } = styleOptions;

  const Tag   = headingLevel;
  const isBg  = imageStyle === "background";
  const hasImage = !!image;

  // Accent line uses --ot-accent so it follows the CMS theme override.
  const accentStyle = accentLine === "top"
    ? { borderTop: fill === "brand" ? "3px solid oklch(from var(--ot-fg-on-brand) l c h / 0.4)" : "3px solid var(--ot-accent)" }
    : {};

  const rootStyle = {
    ...accentStyle,
    ...(MIN_H[minHeight]    ? { minHeight:   MIN_H[minHeight] }    : {}),
    ...(MAX_H[maxHeight]    ? { maxHeight:   MAX_H[maxHeight] }    : {}),
    ...(RATIO[aspectRatio]  ? { aspectRatio: RATIO[aspectRatio] }  : {}),
  };
  const mediaStyle = imageAspectRatio !== "auto" && imageStyle !== "background"
    ? { aspectRatio: RATIO[imageAspectRatio as CardAspectRatio] }
    : undefined;

  return (
    <div data-card-shell>
      {/* data-theme="dark" on background-image cards: the scrim is always dark, so
          text tokens must resolve to light values regardless of the page theme. */}
      <article
        className={[fill === "glass" ? "bg-glass" : "", className].filter(Boolean).join(" ") || undefined}
        style={rootStyle}
        data-block="card"
        data-fill={fill}
        data-border={border}
        data-image={hasImage ? imageStyle : "none"}
        data-image-side={imageSide}
        data-hover={hover}
        data-density={density}
        {...(isBg ? { "data-theme": "dark" } : {})}
      >
        {noise && <div data-part="noise" aria-hidden style={{ backgroundImage: NOISE_BG }} />}

        {hasImage && (
          <div data-part="media" style={mediaStyle} {...pa("image")}>
            <Image data-part="img" src={image.src} alt={image.alt} fill sizes={IMG_SIZES} />
          </div>
        )}
        {hasImage && isBg && <div data-part="scrim" aria-hidden />}

        <div data-part="body">
          <div data-part="text">
            {eyebrow && <p data-part="eyebrow" {...pa("Eyebrow")}>{eyebrow}</p>}
            <Tag data-part="heading" {...pa("Heading")}>{heading}</Tag>
            {description && (
              <div data-part="desc" className="card-rich" {...pa("Description")}>
                <RichText content={description} />
              </div>
            )}
          </div>
          {cta && (
            <div data-part="cta-wrap" {...pa("ctaLabel")}>
              <Link data-part="cta" href={cta.href}>
                {cta.label}
                <ArrowRight data-part="arrow" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
