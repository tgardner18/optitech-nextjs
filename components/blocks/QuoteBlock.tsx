import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import LaserSignature from "./LaserSignature";

// ─── Style option types ───────────────────────────────────────────────────────

export type QuoteStyleOptions = {
  color?:     "none" | "brand" | "canvas" | "surface";
  alignment?: "left" | "center";
  size?:      "large" | "small";
};

// ─── CVA variants ─────────────────────────────────────────────────────────────

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
  defaultVariants: { color: "canvas", size: "large" },
});

const figureCva = cva("", {
  variants: {
    alignment: {
      left:   "max-w-screen-lg",
      center: "mx-auto max-w-screen-md",
    },
  },
  defaultVariants: { alignment: "left" },
});

/**
 * Quote mark: an oversized `"` in Syne 700, positioned absolutely behind the
 * quote body at low opacity. Functions as a visual watermark — unmistakably a
 * quotation mark, never competing with the text.
 *
 * On brand surface: slightly higher opacity (text is on a teal bg, mark can
 * be more present). On dark/canvas: brand teal at 12%.
 */
const quoteMarkBgCva = cva(
  "absolute select-none pointer-events-none font-syne font-bold leading-none",
  {
    variants: {
      color: {
        none:    "text-brand/[0.12]",
        brand:   "text-fg-on-brand/[0.18]",
        canvas:  "text-brand/[0.12]",
        surface: "text-brand/[0.12]",
      },
      alignment: {
        left:   "",
        center: "left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: { color: "canvas", alignment: "left" },
  }
);

/**
 * Quote text: Poppins 300 at reading scale.
 * The signature is the visual centrepiece; the quote should feel like something
 * you read, not a headline you scan. Light weight, generous leading, relaxed.
 */
const quoteTextCva = cva(
  "font-sans font-light text-pretty max-w-[65ch] leading-[1.75] tracking-[0.003em]",
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
      alignment: {
        left:   "",
        center: "mx-auto text-center",
      },
    },
    defaultVariants: { color: "canvas", size: "large", alignment: "left" },
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
  pa?: (prop: string) => { "data-epi-property-name"?: string };
};

export default function QuoteBlock({
  quote,
  attribution,
  styleOptions = {},
  pa = () => ({}),
}: QuoteBlockProps) {
  const {
    color     = "canvas",
    alignment = "left",
    size      = "large",
  } = styleOptions;

  // Oversized background mark — large enough to dwarf the body text
  const bgMarkSize = size === "large"
    ? "clamp(7rem, 13vw, 10rem)"
    : "clamp(5rem, 10vw, 7.5rem)";

  return (
    <section className={sectionCva({ color, size })}>
      {/* relative so the absolute background " is contained */}
      <figure className={cn(figureCva({ alignment }), "relative")}>

        {/* ── Background quote mark ─────────────────────────────────────────
          * Absolutely positioned behind everything else (z-0). Large enough
          * to read as a deliberate shape, low enough opacity to stay recessed.
          * Left-aligned: sits at the top-left of the figure, partially behind
          * the first line of the quote body. Center-aligned: centered via cva. */}
        <span
          aria-hidden="true"
          className={cn(quoteMarkBgCva({ color, alignment }), "top-[-0.15em] left-[-0.05em] z-0")}
          style={{ fontSize: bgMarkSize }}
        >
          &ldquo;
        </span>

        {/* ── All content sits above the background mark (z-10) ─────────── */}
        <div className="relative z-10">

          {/* ── Quote body ──────────────────────────────────────────────── */}
          <blockquote>
            <p
              className={quoteTextCva({ color, size, alignment })}
              {...pa('quote')}
            >
              {quote}
            </p>
          </blockquote>

          {/* ── Signature & attribution ─────────────────────────────────── */}
          <figcaption className={cn(
            "mt-xl",
            alignment === "center" && "flex flex-col items-center"
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

        </div>

      </figure>
    </section>
  );
}
