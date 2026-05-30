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
 * Left-aligned quote mark: absolutely positioned in the left margin behind the
 * text. Works because the content div has pl-10/pl-14 padding that creates room.
 * Not used for center-aligned (where absolute positioning disconnects the mark
 * from the centered text — see inline mark below).
 */
const quoteMarkLeftCva = cva(
  "absolute select-none pointer-events-none font-syne font-bold leading-none top-[-0.15em] left-[-0.05em] z-0",
  {
    variants: {
      color: {
        none:    "text-brand/[0.28]",
        brand:   "text-fg-on-brand/[0.22]",
        canvas:  "text-brand/[0.28]",
        surface: "text-brand/[0.28]",
      },
    },
    defaultVariants: { color: "canvas" },
  }
);

/**
 * Center-aligned inline mark: sits directly before the first character inside
 * the <p>, so the mark + text center together as one visual unit. No absolute
 * positioning — the mark is in normal flow, which guarantees it's always
 * adjacent to the opening word regardless of quote length.
 */
const quoteMarkInlineCva = cva(
  "inline-block select-none pointer-events-none font-syne font-bold leading-none",
  {
    variants: {
      color: {
        none:    "text-brand/[0.30]",
        brand:   "text-fg-on-brand/[0.22]",
        canvas:  "text-brand/[0.30]",
        surface: "text-brand/[0.30]",
      },
    },
    defaultVariants: { color: "canvas" },
  }
);

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

  // Left: large background watermark absolutely positioned in the left margin.
  // Center: inline mark, sized to feel weighty but not overwhelm the text line.
  const bgMarkSize = size === "large"
    ? "clamp(9rem, 17vw, 13rem)"
    : "clamp(6.5rem, 11vw, 9rem)";

  const inlineMarkSize = size === "large"
    ? "clamp(4rem, 8vw, 6rem)"
    : "clamp(2.75rem, 5.5vw, 4rem)";

  return (
    <section className={sectionCva({ color, size })}>
      <figure className={cn(figureCva({ alignment }), "relative")}>

        {/* ── Left-aligned: pure watermark behind the text ─────────────────
          * Absolutely positioned at z-0 so text flows naturally from the
          * left edge at z-10, overlapping the mark. No gutter / padding
          * is added to the content — the text sits on top of the mark,
          * which reads as a large faded background character. */}
        {alignment === "left" && (
          <span
            aria-hidden="true"
            className={cn(quoteMarkLeftCva({ color }), "z-0")}
            style={{ fontSize: bgMarkSize }}
          >
            &ldquo;
          </span>
        )}

        {/* ── All content (z-10) ────────────────────────────────────────── */}
        {/* Left-aligned: small indent so the watermark mark peeks visibly
            to the left of the text without creating a large block gutter. */}
        <div className={cn("relative z-10", alignment === "left" && "pl-6 sm:pl-10")}>

          {/* ── Quote body ────────────────────────────────────────────────── */}
          <blockquote>
            <p
              className={cn("relative z-10", quoteTextCva({ color, size, alignment }))}
              {...pa('quote')}
            >
              {/* Center-aligned: mark is inline so it centers with the text.
                * This ensures it's always adjacent to the opening character
                * regardless of quote length — an absolute mark would float
                * to the container edge while short text stays centered. */}
              {alignment === "center" && (
                <span
                  aria-hidden="true"
                  className={quoteMarkInlineCva({ color })}
                  style={{
                    fontSize:      inlineMarkSize,
                    /* Pull the oversized mark up so its cap sits level with
                       the opening word — negative value is relative to the
                       mark's own em, so it stays proportional across sizes */
                    verticalAlign: "-0.55em",
                    marginRight:   "0.12em",
                    lineHeight:    1,
                  }}
                >
                  &ldquo;
                </span>
              )}
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
