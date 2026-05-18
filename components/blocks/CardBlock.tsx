import Image from "next/image";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

// ─── Style option types ───────────────────────────────────────────────────────

export type CardFill       = "ghost" | "surface" | "brand" | "light" | "glass";
export type CardBorder     = "none" | "subtle" | "brand";
export type CardImageStyle = "top" | "background" | "side" | "float";
export type CardImageSide  = "left" | "right";
export type CardHover      = "none" | "lift" | "glow";
export type CardDensity    = "compact" | "default" | "spacious";

export type CardStyleOptions = {
  fill?:       CardFill;
  border?:     CardBorder;
  imageStyle?: CardImageStyle;
  imageSide?:  CardImageSide;
  hover?:      CardHover;
  density?:    CardDensity;
  noise?:      boolean;
  accentLine?: "none" | "top";
};

export type CardBlockProps = {
  heading:       string;
  headingLevel?: "h2" | "h3" | "h4";
  eyebrow?:      string;
  description?:  string;
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
    dark:  "primary" as const,
    brand: "ghost"   as const,
    light: "primary" as const,
  },
} as const;

// ─── Fill and border helpers ──────────────────────────────────────────────────

const FILL_CLASS: Record<CardFill, string> = {
  ghost:   "bg-transparent",
  surface: "bg-surface",
  brand:   "bg-brand",
  light:   "bg-[oklch(97%_0.005_195)]",
  // Dark glass: needs something visually interesting behind it (imagery, teal section).
  // Glass over a flat same-color surface is a non-effect.
  glass:   "bg-canvas/75 backdrop-blur-md",
};

function resolveBorder(fill: CardFill, border: CardBorder): string {
  // Glass panels default to subtle — the edge defines the glass surface
  const effectiveBorder = fill === "glass" && border === "none" ? "subtle" : border;

  if (effectiveBorder === "none") return "";
  if (effectiveBorder === "brand") {
    return fill === "brand" ? "border border-fg-on-brand/30" : "border border-brand";
  }
  // subtle — adapts to fill context
  if (fill === "brand") return "border border-fg-on-brand/20";
  if (fill === "light") return "border border-canvas/10";
  return "border border-fg/10"; // ghost + surface + glass
}

// ─── Hover ────────────────────────────────────────────────────────────────────

// Lift adds translateY + ambient teal shadow only on hover — both disappear at rest,
// preserving the flat-at-rest rule.
const HOVER_CLASS: Record<CardHover, string> = {
  none: "",
  lift: [
    "hover:-translate-y-1",
    "hover:shadow-[0_8px_32px_oklch(55%_0.18_195_/_0.15)]",
    "transition-[transform,box-shadow]",
    "duration-200",
    "ease-[var(--ease-quick)]",
  ].join(" "),
  glow: [
    "hover:shadow-[0_8px_32px_oklch(55%_0.18_195_/_0.25)]",
    "transition-shadow",
    "duration-200",
    "ease-[var(--ease-quick)]",
  ].join(" "),
};

// ─── Density ─────────────────────────────────────────────────────────────────

const DENSITY_CLASS: Record<CardDensity, string> = {
  compact:  "p-md",
  default:  "p-lg",
  spacious: "p-xl",
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
    fill       = "surface",
    border     = "none",
    imageStyle = "top",
    imageSide  = "left",
    hover      = "none",
    density    = "default",
    noise      = false,
    accentLine = "none",
  } = styleOptions;

  const s        = resolveScheme(fill, imageStyle);
  const Tag      = headingLevel;
  const isBg     = imageStyle === "background";
  const isSide   = imageStyle === "side";
  const isFloat  = imageStyle === "float";
  const isHover  = hover !== "none";
  const padding  = DENSITY_CLASS[density];

  // Accent line: 3px top border using the brand or on-brand tone.
  // Expressed as inline style for reliable rendering alongside border utilities.
  const accentStyle = accentLine === "top"
    ? { borderTop: fill === "brand" ? "3px solid oklch(97% 0.005 195 / 0.4)" : "3px solid oklch(55% 0.18 195)" }
    : undefined;

  // Float content needs an explicit background to visually slide over the image.
  // Ghost/glass fall back to canvas so text stays readable.
  const floatContentBg = (fill === "ghost" || fill === "glass") ? "bg-canvas" : FILL_CLASS[fill];

  const rootClass = cn(
    "relative h-full overflow-hidden",
    FILL_CLASS[fill],
    resolveBorder(fill, border),
    // Hover behaviour — group enables image zoom via group-hover: child selectors
    isHover && "group cursor-pointer",
    HOVER_CLASS[hover],
    // Flex direction — side goes row on md+; all others are column
    isSide
      ? cn("flex flex-col md:flex-row", imageSide === "right" && "md:flex-row-reverse")
      : "flex flex-col",
    // Background mode needs minimum height so the image has room to show
    isBg && "min-h-[320px]",
    className
  );

  // Image zoom on hover: motion-safe prefix respects prefers-reduced-motion
  const imgClass = cn(
    "object-cover",
    isHover && !isBg && "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ease-kinetic)] motion-safe:group-hover:scale-105"
  );

  return (
    <div className={rootClass} style={accentStyle}>

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
        <div className="relative w-full aspect-4/3 shrink-0 overflow-hidden" {...pa('image')}>
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
        <div className="relative w-full aspect-video shrink-0 overflow-hidden" {...pa('image')}>
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
        <div className="relative w-full aspect-4/3 md:aspect-auto md:w-2/5 shrink-0 overflow-hidden" {...pa('image')}>
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
          {description && <p className={T.description[s]} {...pa('Description')}>{description}</p>}
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
            {description && <p className={T.description[s]} {...pa('Description')}>{description}</p>}
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
            {description && <p className={T.description[s]} {...pa('Description')}>{description}</p>}
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
