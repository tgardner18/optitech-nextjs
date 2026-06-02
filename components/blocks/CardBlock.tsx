import Image from "next/image";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

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
  description?:  string | null;
  image?:        { src: string; alt: string };
  cta?:          { label: string; href: string };
  className?:    string;
  styleOptions?: CardStyleOptions;
  pa?: (prop: string) => { "data-epi-property-name"?: string };
};

// ─── Color scheme ─────────────────────────────────────────────────────────────

type Scheme = "dark" | "brand" | "light";

function resolveScheme(fill: CardFill, imageStyle: CardImageStyle): Scheme {
  if (imageStyle === "background") return "dark";
  if (fill === "brand") return "brand";
  if (fill === "light") return "light";
  return "dark";
}

// Typography classes keyed by scheme.
// "light" scheme uses hardcoded OKLCH values: canvas/fg tokens invert in light
// mode, but fill="light" is intentionally a dark-mode construct (light card
// on a dark section ground).
const T = {
  eyebrow: {
    dark:  "text-label font-semibold tracking-label uppercase text-fg-muted",
    brand: "text-label font-semibold tracking-label uppercase text-fg-on-brand/60",
    light: "text-label font-semibold tracking-label uppercase text-brand",
  },
  heading: {
    dark:  "text-title font-semibold leading-title tracking-title text-fg",
    brand: "text-title font-semibold leading-title tracking-title text-fg-on-brand",
    light: "text-title font-semibold leading-title tracking-title text-[oklch(12%_0.012_195)]",
  },
  description: {
    dark:  "text-body leading-body text-fg-muted",
    brand: "text-body leading-body text-fg-on-brand/80",
    light: "text-body leading-body text-[oklch(20%_0.022_195)]",
  },
  cta: {
    dark:  "brand" as const,
    brand: "ghost"  as const,
    light: "brand" as const,
  },
} as const;

// ─── Fill and border helpers ──────────────────────────────────────────────────

const FILL_CLASS: Record<CardFill, string> = {
  ghost:   "bg-transparent",
  surface: "bg-surface",
  brand:   "bg-brand",
  light:   "bg-[oklch(97%_0.005_195)]",
  // True glassmorphism: bg-glass provides the exact recipe (rgba white tint, blur+saturate,
  // full border, box-shadow with inset shimmer, and ::before surface sheen).
  glass:   "bg-glass",
};

function resolveBorder(fill: CardFill, border: CardBorder): string {
  // Glass: bg-glass already sets border: 1px solid rgba(255,255,255,0.20) and the inset shimmer.
  // Don't add a Tailwind border that would fight it — only allow brand border override.
  if (fill === "glass") {
    return border === "brand" ? "border-brand" : "";
  }

  if (border === "none") return "";
  if (border === "brand") {
    return fill === "brand" ? "border border-fg-on-brand/30" : "border border-brand";
  }
  // subtle — adapts to fill context
  if (fill === "brand") return "border border-fg-on-brand/20";
  if (fill === "light") return "border border-canvas/10";
  return "border border-fg/10"; // ghost + surface
}

// ─── Hover ────────────────────────────────────────────────────────────────────

// Lift/glow classes reference .card-hover-lift and .card-hover-glow in globals.css
// which use --ot-bloom-brand and --ot-bloom-accent so they follow the CMS theme override.
const HOVER_CLASS: Record<CardHover, string> = {
  none: "",
  lift: "card-hover-lift",
  glow: "card-hover-glow",
  tilt: "card-hover-tilt",
};

// ─── Density ─────────────────────────────────────────────────────────────────

const DENSITY_CLASS: Record<CardDensity, string> = {
  compact:  "p-md",
  default:  "p-lg",
  spacious: "p-xl",
};

const MIN_H_CLASS: Record<CardMinHeight, string> = {
  none: "",
  xs:   "min-h-[200px]",
  sm:   "min-h-[280px]",
  md:   "min-h-[380px]",
  lg:   "min-h-[480px]",
};

const ASPECT_CLASS: Record<CardAspectRatio, string> = {
  auto:      "",
  square:    "aspect-square",
  portrait:  "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide:      "aspect-video",
  cinema:    "aspect-[21/9]",
};

const IMG_ASPECT_CLASS: Record<CardImageAspectRatio, string> = {
  auto:      "",
  square:    "aspect-square",
  portrait:  "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide:      "aspect-video",
};

// ─── Noise texture ────────────────────────────────────────────────────────────

// SVG feTurbulence grain — rendered at a fixed tile size and tiled via background-repeat.
// mix-blend-mode: overlay adds grain without darkening or lightening the surface.
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ─── Component ───────────────────────────────────────────────────────────────

const IMG_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw";

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

  const s        = resolveScheme(fill, imageStyle);
  const Tag      = headingLevel;
  const isBg     = imageStyle === "background";
  const isSide   = imageStyle === "side";
  const isFloat  = imageStyle === "float";
  const isHover  = hover !== "none";
  const padding  = DENSITY_CLASS[density];

  const MAX_H: Record<NonNullable<CardStyleOptions["maxHeight"]>, string> = {
    none: "",
    sm:   "max-h-[320px]",
    md:   "max-h-[480px]",
    lg:   "max-h-[640px]",
  };

  // Accent line uses --ot-accent so it follows the CMS theme override.
  const accentStyle = accentLine === "top"
    ? { borderTop: fill === "brand" ? "3px solid oklch(97% 0.005 195 / 0.4)" : "3px solid var(--ot-accent)" }
    : undefined;

  // Float content needs an explicit background to visually slide over the image.
  // Ghost/glass fall back to canvas so text stays readable.
  const floatContentBg = (fill === "ghost" || fill === "glass") ? "bg-canvas" : FILL_CLASS[fill];

  const rootClass = cn(
    "relative h-full overflow-hidden",
    FILL_CLASS[fill],
    resolveBorder(fill, border),
    isHover && "group cursor-pointer",
    HOVER_CLASS[hover],
    isSide
      ? cn("flex flex-col md:flex-row", imageSide === "right" && "md:flex-row-reverse")
      : "flex flex-col",
    isBg && "min-h-[320px]",
    MAX_H[maxHeight],
    MIN_H_CLASS[minHeight],
    ASPECT_CLASS[aspectRatio],
    className
  );

  // Image zoom on hover: motion-safe prefix respects prefers-reduced-motion
  const imgClass = cn(
    "object-cover",
    isHover && !isBg && "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ease-kinetic)] motion-safe:group-hover:scale-105"
  );

  return (
    // data-theme="dark" on background-image cards: the dark scrim is always dark,
    // so text tokens must resolve to light values regardless of the page theme.
    <div className={rootClass} style={accentStyle} {...(isBg ? { 'data-theme': 'dark' } : {})}>

      {/* ── Noise grain overlay ───────────────────────────────────────────────── */}
      {noise && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay opacity-[0.07]"
          style={{ backgroundImage: NOISE_BG }}
        />
      )}

      {/* ── Background image + scrim ─────────────────────────────────────────── */}
      {isBg && image && (
        <>
          <div className="absolute inset-0" {...pa('image')}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={IMG_SIZES}
              className="object-cover"
            />
          </div>
          {/* Scrim: dense at the bottom where text lives, fades to clear at top */}
          <div
            className="absolute inset-0 z-1"
            style={{
              background:
                "linear-gradient(to top, oklch(12% 0.012 195 / 0.92) 0%, oklch(12% 0.012 195 / 0.5) 45%, transparent 100%)",
            }}
          />
        </>
      )}

      {/* ── Top image ─────────────────────────────────────────────────────────── */}
      {imageStyle === "top" && image && (
        <div className={cn("relative w-full shrink-0 overflow-hidden", imageAspectRatio !== "auto" ? IMG_ASPECT_CLASS[imageAspectRatio] : "aspect-[4/3]")} {...pa('image')}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={IMG_SIZES}
            className={imgClass}
          />
        </div>
      )}

      {/* ── Float image ───────────────────────────────────────────────────────── */}
      {/* Content slides up 2rem with the card's fill background, overlapping    */}
      {/* the image bottom. Creates editorial depth without static shadows.       */}
      {isFloat && image && (
        <div className={cn("relative w-full shrink-0 overflow-hidden", imageAspectRatio !== "auto" ? IMG_ASPECT_CLASS[imageAspectRatio] : "aspect-video")} {...pa('image')}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={IMG_SIZES}
            className={imgClass}
          />
        </div>
      )}

      {/* ── Side image ────────────────────────────────────────────────────────── */}
      {isSide && image && (
        <div className={cn("relative w-full md:aspect-auto md:w-2/5 shrink-0 overflow-hidden", imageAspectRatio !== "auto" ? IMG_ASPECT_CLASS[imageAspectRatio] : "aspect-[4/3]")} {...pa('image')}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 200px, 100vw"
            className={imgClass}
          />
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      {isBg ? (
        // Background: all content anchored to the bottom of the scrim
        <div className={cn("relative z-2 flex flex-col flex-1 justify-end gap-sm", padding)}>
          {eyebrow && <p className={T.eyebrow[s]} {...pa('Eyebrow')}>{eyebrow}</p>}
          <Tag className={T.heading[s]} {...pa('Heading')}>{heading}</Tag>
          {description && <div className={T.description[s]} dangerouslySetInnerHTML={{ __html: description }} {...pa('Description')} />}
          {cta && (
            <div className="pt-xs" {...pa('ctaLabel')}>
              <Button variant={T.cta[s]} size="sm" href={cta.href}>{cta.label}</Button>
            </div>
          )}
        </div>
      ) : isFloat ? (
        // Float: content box slides up over the image bottom with an explicit background
        <div className={cn("relative z-10 flex flex-col flex-1 -mt-8", floatContentBg, padding)}>
          <div className="flex flex-col gap-sm flex-1">
            {eyebrow && <p className={T.eyebrow[s]} {...pa('Eyebrow')}>{eyebrow}</p>}
            <Tag className={T.heading[s]} {...pa('Heading')}>{heading}</Tag>
            {description && <div className={T.description[s]} dangerouslySetInnerHTML={{ __html: description }} {...pa('Description')} />}
          </div>
          {cta && (
            <div className="mt-md" {...pa('ctaLabel')}>
              <Button variant={T.cta[s]} size="sm" href={cta.href}>{cta.label}</Button>
            </div>
          )}
        </div>
      ) : (
        // Top / Side: content group expands; CTA stays at the bottom
        <div className={cn("flex flex-col flex-1", padding)}>
          <div className="flex flex-col gap-sm flex-1">
            {eyebrow && <p className={T.eyebrow[s]} {...pa('Eyebrow')}>{eyebrow}</p>}
            <Tag className={T.heading[s]} {...pa('Heading')}>{heading}</Tag>
            {description && <div className={T.description[s]} dangerouslySetInnerHTML={{ __html: description }} {...pa('Description')} />}
          </div>
          {cta && (
            <div className="mt-md" {...pa('ctaLabel')}>
              <Button variant={T.cta[s]} size="sm" href={cta.href}>{cta.label}</Button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
