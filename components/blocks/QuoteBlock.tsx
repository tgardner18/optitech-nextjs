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
  defaultVariants: { color: "brand", size: "large" },
});

// Outer container — constrains width and centers the whole block on the page.
const containerCva = cva("mx-auto w-full", {
  variants: {
    alignment: {
      left:   "max-w-[72rem]",
      center: "max-w-[56rem]",
    },
  },
  defaultVariants: { alignment: "center" },
});

// Blockquote — carries the mark as an absolutely positioned child.
// `pl-[3rem]` creates the gutter the mark sits in; both modes use the same indent.
// Center: `mx-auto max-w-[65ch]` centers the reading block, text is left-aligned
// so `left: 0` on the mark is always immediately left of the first letter.
const blockquoteCva = cva("relative pl-12", {
  variants: {
    alignment: {
      left:   "max-w-(--ot-measure)",
      center: "max-w-(--ot-measure) mx-auto",
    },
  },
  defaultVariants: { alignment: "center" },
});

// Quote text — no per-line centering; that makes the mark's anchor unpredictable.
// The reading block itself is centered via blockquoteCva mx-auto.
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

// Quote mark — more visible than before (0.30 / 0.35 vs the old 0.12 / 0.18).
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
    ? "clamp(7rem, 13vw, 10rem)"
    : "clamp(5rem, 10vw, 7.5rem)";

  return (
    <section className={sectionCva({ color, size })}>
      <div className={containerCva({ alignment })}>
        <figure className={cn(
          "relative",
          alignment === "center" && "flex flex-col items-center"
        )}>

          {/* Quote body — mark is inside so it anchors to the text left edge */}
          <blockquote className={blockquoteCva({ alignment })}>

            {/* Mark: absolute at left-0, sits in the pl-[3rem] gutter just
                left of the first letter. z-0 so it recedes behind the text
                on long lines; opacity is high enough to read clearly. */}
            <span
              aria-hidden="true"
              className={cn(
                quoteMarkCva({ color }),
                "top-[-0.2em] left-0 z-0",
              )}
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

          {/* Signature & attribution */}
          <figcaption className={cn(
            "mt-lg",
            alignment === "center" ? "flex flex-col items-center" : "pl-12"
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
