import { cva } from "class-variance-authority";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import LaserSignature from "./LaserSignature";

// ─── Style option types ───────────────────────────────────────────────────────

export type QuoteTreatment = "default" | "bubble" | "glow";

export type QuoteStyleOptions = {
  treatment?: QuoteTreatment;
  color?:     "none" | "brand" | "canvas" | "surface";
  alignment?: "left" | "center";
  size?:      "large" | "small";
};

// ─── CVA variants — shared ────────────────────────────────────────────────────

const sectionCva = cva("px-md lg:px-lg", {
  variants: {
    color: {
      none:    "",
      brand:   "bg-brand-fill",
      canvas:  "bg-canvas",
      surface: "bg-surface",
    },
    size: {
      large: "py-xl",
      small: "py-lg",
    },
  },
  defaultVariants: { color: "brand", size: "large" },
});

const containerCva = cva("mx-auto w-full", {
  variants: {
    alignment: {
      left:   "max-w-[72rem]",
      center: "max-w-[56rem]",
    },
  },
  defaultVariants: { alignment: "center" },
});

// ─── CVA variants — default treatment ────────────────────────────────────────

const blockquoteCva = cva("relative pl-16", {
  variants: {
    alignment: {
      left:   "max-w-(--ot-measure)",
      center: "max-w-(--ot-measure) mx-auto",
    },
  },
  defaultVariants: { alignment: "center" },
});

const quoteTextCva = cva(
  "font-sans font-light text-pretty leading-[1.75] tracking-[0.003em]",
  {
    variants: {
      color: {
        none:    "text-fg",
        brand:   "text-fg-on-brand",
        canvas:  "text-fg",
        surface: "text-fg",
      },
      size: {
        large: "text-[1.375rem]",
        small: "text-[1.1rem]",
      },
    },
    defaultVariants: { color: "canvas", size: "large" },
  }
);

const quoteMarkCva = cva(
  "absolute select-none pointer-events-none font-display font-bold leading-none",
  {
    variants: {
      color: {
        none:    "text-brand/[0.30]",
        brand:   "text-fg-on-brand/[0.35]",
        canvas:  "text-brand/[0.30]",
        surface: "text-brand/[0.30]",
      },
    },
    defaultVariants: { color: "canvas" },
  }
);

const attributionTitleCva = cva(
  "text-label font-normal tracking-label uppercase",
  {
    variants: {
      color: {
        none:    "text-fg-muted",
        brand:   "text-fg-on-brand/55",
        canvas:  "text-fg-muted",
        surface: "text-fg-muted",
      },
    },
    defaultVariants: { color: "canvas" },
  }
);


// ─── Component ────────────────────────────────────────────────────────────────

export type QuoteBlockProps = {
  quote: string;
  attribution: { name: string; title?: string };
  styleOptions?: QuoteStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};

export default function QuoteBlock({
  quote,
  attribution,
  styleOptions = {},
  pa = () => ({}),
}: QuoteBlockProps) {
  const {
    treatment = "default",
    color     = "canvas",
    alignment = "left",
    size      = "large",
  } = styleOptions;

  if (treatment === "bubble") {
    return <BubbleQuote quote={quote} attribution={attribution} color={color} size={size} alignment={alignment} pa={pa} />;
  }
  if (treatment === "glow") {
    return <GlowQuote quote={quote} attribution={attribution} color={color} size={size} alignment={alignment} pa={pa} />;
  }

  // ── Default treatment ──────────────────────────────────────────────────────

  const bgMarkSize = size === "large"
    ? "clamp(7rem, 13vw, 10rem)"
    : "clamp(5rem, 10vw, 7.5rem)";

  return (
    <section className={sectionCva({ color, size })}>
      <div className={containerCva({ alignment })}>
        <figure className={cn(
          "relative",
          alignment === "center" && "flex flex-col items-center"
        )}>

          <blockquote className={blockquoteCva({ alignment })}>
            <span
              aria-hidden="true"
              className={cn(quoteMarkCva({ color }), "top-[-0.2em] left-0 z-0")}
              style={{ fontSize: bgMarkSize }}
            >
              &ldquo;
            </span>
            <p
              className={cn(quoteTextCva({ color, size }), "relative z-10")}
              {...pa('quote')}
            >
              {quote}
            </p>
          </blockquote>

          <figcaption className={cn(
            "mt-lg",
            alignment === "center" ? "flex flex-col items-center" : "pl-16"
          )}>
            <LaserSignature
              name={attribution.name}
              color={color}
              epiProps={pa('attributionName')}
            />
            {attribution.title && (
              <p
                className={cn(attributionTitleCva({ color }), "mt-xs")}
                {...pa('attributionTitle')}
              >
                {attribution.title}
              </p>
            )}
          </figcaption>

        </figure>
      </div>
    </section>
  );
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type TreatmentProps = {
  quote: string;
  attribution: { name: string; title?: string };
  color: NonNullable<QuoteStyleOptions["color"]>;
  size: NonNullable<QuoteStyleOptions["size"]>;
  alignment: NonNullable<QuoteStyleOptions["alignment"]>;
  pa: NonNullable<QuoteBlockProps["pa"]>;
};

// ── Bubble ────────────────────────────────────────────────────────────────────
//
// Two-column grid: bold quote text (left) + large decorative Quote icon (right).
// Attribution spans full width below a hairline divider.
// A thin brand-to-accent gradient bar runs along the top edge of the card.
// A CSS triangle tail hangs from the bottom-left via .bq-tail, which reads
// --bq-tail-color set by the shadow class — no per-variant color override needed.

function BubbleQuote({ quote, attribution, color, size, alignment, pa }: TreatmentProps) {
  const isBrand = color === "brand";
  const shadowClass = color === "brand"
    ? "bq-bubble-shadow-brand"
    : color === "surface"
    ? "bq-bubble-shadow-surface"
    : "bq-bubble-shadow-canvas";
  const bubbleBgClass = isBrand ? ""
    : color === "canvas" ? "bg-surface"
    : "bg-canvas";
  const gradientBar = isBrand
    ? "bg-gradient-to-r from-fg-on-brand/40 to-accent"
    : "bg-gradient-to-r from-brand/40 to-accent";
  const iconClass = isBrand ? "text-brand opacity-[0.18]" : "text-accent/20";
  const quoteSize = size === "large"
    ? "text-[clamp(1.55rem,3.2vw,2.3rem)]"
    : "text-[clamp(1.2rem,2.5vw,1.75rem)]";

  return (
    <section className={sectionCva({ color, size })}>
      <div className={cn("w-full max-w-3xl", alignment === "center" ? "mx-auto" : "mr-auto")}>
        <figure>
          {/* Outer wrapper: carries the shadow class (sets --bq-tail-color + box-shadow)
              and is `relative` so the tail span can be positioned against it.
              Tail is a sibling to the card so overflow-hidden on the card doesn't clip it. */}
          <div className={cn(shadowClass, "relative rounded-3xl motion-safe:animate-slide-up")}>
            <div
              className={cn("relative rounded-3xl px-8 py-8 overflow-hidden", bubbleBgClass)}
              style={isBrand ? { background: "oklch(97% 0.004 195)" } : undefined}
            >
              {/* Top gradient bar — `relative` on parent + overflow-hidden clips it to the card's border-radius */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", gradientBar)} />

              <div className="grid grid-cols-[1fr_auto] grid-rows-[1fr_auto] gap-x-8">
                {/* Quote text */}
                <p
                  className={cn(
                    "col-start-1 row-start-1 font-sans font-extrabold leading-[1.1] tracking-tight",
                    quoteSize,
                    !isBrand && "accent-ink",
                  )}
                style={isBrand ? { color: "oklch(14% 0.012 195)" } : undefined}
                {...pa('quote')}
              >
                {quote}
              </p>

                {/* Decorative Quote icon */}
                <div aria-hidden="true" className={cn("col-start-2 row-start-1 self-center ml-4", iconClass)}>
                  <Quote className="w-16 h-16" strokeWidth={1.5} />
                </div>

                {/* Attribution — spans full width below divider */}
                <figcaption
                  className={cn(
                    "col-span-2 row-start-2 mt-6 pt-4",
                    isBrand ? "border-t" : "border-t border-brand/12",
                  )}
                  style={isBrand ? { borderColor: "oklch(14% 0.012 195 / 0.12)" } : undefined}
                >
                  <p
                    className={cn("font-semibold text-[1rem] leading-tight", !isBrand && "text-fg")}
                    style={isBrand ? { color: "oklch(14% 0.012 195)" } : undefined}
                    {...pa('attributionName')}
                  >
                    {attribution.name}
                  </p>
                  {attribution.title && (
                    <p
                      className={cn("text-label font-normal tracking-label uppercase mt-xs", !isBrand && "text-fg-muted")}
                      style={isBrand ? { color: "oklch(14% 0.012 195 / 0.5)" } : undefined}
                      {...pa('attributionTitle')}
                    >
                      {attribution.title}
                    </p>
                  )}
                </figcaption>
              </div>
            </div>

            {/* Tail — sibling to the card so overflow-hidden doesn't clip it */}
            <span className="bq-tail" aria-hidden="true" />
          </div>
        </figure>
      </div>
    </section>
  );
}

// ── Glow ──────────────────────────────────────────────────────────────────────
//
// Inspired by the tweet-card reference: a brand-colored circle badge with the
// Quote icon overlaps the top-left of the card. The "aggressive bloom" is two
// absolutely-positioned blurred divs BEHIND the card, creating a deep chromatic
// halo that radiates outward — brand (teal) inner bloom, accent outer corona.
// The card itself sits on top (z-10) with a clean ring border.
//
// No dark mode forced — the backdrop divs are more dramatic in dark mode
// (bloom on dark field) and softer in light mode (bloom on light field).
// brand color → section bg mapped to canvas so the badge reads on a neutral field.

function GlowQuote({ quote, attribution, color, size, alignment, pa }: TreatmentProps) {
  const sectionColor = (color === "brand" ? "canvas" : color) as QuoteStyleOptions["color"];
  const cardBg       = sectionColor === "surface" ? "bg-canvas" : "bg-surface";

  return (
    <section className={sectionCva({ color: sectionColor, size })}>
      <div className={cn("w-full max-w-4xl", alignment === "center" ? "mx-auto" : "mr-auto")}>
        <figure>
          <div className="relative motion-safe:animate-slide-up">

            {/* Chromatic bloom backdrop — positioned behind the card.
                Inner: brand-colored blur (tight, intense)
                Outer: accent-colored blur (wide, soft corona)
                Both use opacity so they fade naturally in light mode.            */}
            <div className="absolute -top-3 -bottom-3 -left-6 -right-6 rounded-3xl opacity-60 blur-2xl bg-brand/40 pointer-events-none" />
            <div className="absolute -top-6 -bottom-6 -left-10 -right-10 rounded-3xl opacity-35 blur-3xl bg-accent/35 pointer-events-none" />

            {/* Card — on top of the bloom, clean and readable.
                overflow-hidden clips the watermark at the rounded corners.
                borderLeft inline style overrides just the left border to be
                3px accent-colored — the other three sides keep brand/20.     */}
            <div
              className={cn(
                "quote-glow-card relative z-10 rounded-2xl border border-brand/20 px-8 pt-8 pb-7 overflow-hidden",
                cardBg
              )}
              style={{
                borderLeftColor: "var(--ot-accent)",
                borderLeftWidth: "3px",
              }}
            >
              {/* Watermark ❝ — oversized, bottom-right, behind all text */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-4 select-none pointer-events-none font-display font-bold leading-none text-brand/12 translate-y-4 z-0"
                style={{ fontSize: "clamp(7rem, 14vw, 10rem)" }}
              >
                &ldquo;
              </span>

              {/* pl-5 pushes text away from the 3px left accent border */}
              <blockquote className="relative z-10 pl-5">
                <p className={quoteTextCva({ color: "none", size })} {...pa('quote')}>
                  {quote}
                </p>
              </blockquote>

              <figcaption className="relative z-10 pl-5 mt-5 pt-4 border-t border-brand/12 text-right">
                <p
                  className="font-semibold text-[1rem] leading-tight text-fg"
                  {...pa('attributionName')}
                >
                  {attribution.name}
                </p>
                {attribution.title && (
                  <p
                    className="text-label font-normal tracking-label uppercase text-fg-muted mt-xs"
                    {...pa('attributionTitle')}
                  >
                    {attribution.title}
                  </p>
                )}
              </figcaption>
            </div>

          </div>
        </figure>
      </div>
    </section>
  );
}
