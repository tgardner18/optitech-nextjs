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
 * Quote mark watermark — absolutely positioned behind the text at z-0.
 * Left-aligned: anchors to the top-left corner of the figure.
 * Center-aligned: centered horizontally via left-1/2 + -translate-x-1/2.
 * Both use the same large bgMarkSize so the visual weight is identical.
 */
const quoteMarkCva = cva(
  "absolute select-none pointer-events-none font-syne font-bold leading-none top-[-0.15em] z-0",
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

  const bgMarkSize = size === "large"
    ? "clamp(9rem, 17vw, 13rem)"
    : "clamp(6.5rem, 11vw, 9rem)";

  return (
    <section className={sectionCva({ color, size })}>
      <figure className={cn(figureCva({ alignment }), "relative")}>

        {/* ── Watermark mark — same large treatment for both alignments ────────
          * Left:   anchors top-left, text indented right via pl-10/pl-14.
          * Center: centered horizontally, text flows centered beneath it.
          * Both sit at z-0 so text content at z-10 overlaps cleanly. */}
        <span
          aria-hidden="true"
          className={cn(
            quoteMarkCva({ color }),
            alignment === "left" ? "left-[-0.05em]" : "left-1/2 -translate-x-1/2",
          )}
          style={{ fontSize: bgMarkSize }}
        >
          &ldquo;
        </span>

        {/* ── All content (z-10) ────────────────────────────────────────── */}
        <div className={cn("relative z-10", alignment === "left" && "pl-10 sm:pl-14")}>

          {/* ── Quote body ────────────────────────────────────────────────── */}
          <blockquote>
            <p
              className={cn("relative z-10", quoteTextCva({ color, size, alignment }))}
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
