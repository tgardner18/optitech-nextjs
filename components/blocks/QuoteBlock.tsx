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

// Central container — constrains width and keeps content off the screen edge.
// Left: wide with comfortable left-alignment headroom.
// Center: narrower to keep centered prose tight and readable.
const containerCva = cva("mx-auto w-full", {
  variants: {
    alignment: {
      left:   "max-w-[72rem]",
      center: "max-w-[56rem]",
    },
  },
  defaultVariants: { alignment: "center" },
});

// Figure: center mode stacks everything as a centered flex column.
const figureCva = cva("relative", {
  variants: {
    alignment: {
      left:   "",
      center: "flex flex-col items-center",
    },
  },
  defaultVariants: { alignment: "center" },
});

// Blockquote: left indents past the quote mark glyph; center applies text-center.
const blockquoteCva = cva("relative z-10", {
  variants: {
    alignment: {
      left:   "pl-[3.25rem]",
      center: "text-center w-full",
    },
  },
  defaultVariants: { alignment: "center" },
});

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
        center: "mx-auto",
      },
    },
    defaultVariants: { color: "canvas", size: "large", alignment: "left" },
  }
);

const quoteMarkBgCva = cva(
  "absolute select-none pointer-events-none font-syne font-bold leading-none z-0",
  {
    variants: {
      color: {
        none:    "text-brand/[0.12]",
        brand:   "text-fg-on-brand/[0.18]",
        canvas:  "text-brand/[0.12]",
        surface: "text-brand/[0.12]",
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

  // Quote mark position:
  //   left   — top-left of figure, blockquote indents past it with pl-[3.25rem]
  //   center — horizontally centered at the top, text sits below and overlaps
  const markPositionClass = alignment === "left"
    ? "top-[-0.15em] left-[-0.05em]"
    : "top-[-0.15em] left-1/2 -translate-x-1/2";

  return (
    <section className={sectionCva({ color, size })}>
      <div className={containerCva({ alignment })}>
        <figure className={figureCva({ alignment })}>

          {/* Background quote mark — decorative watermark behind content */}
          <span
            aria-hidden="true"
            className={cn(quoteMarkBgCva({ color }), markPositionClass)}
            style={{ fontSize: bgMarkSize }}
          >
            &ldquo;
          </span>

          {/* Quote body */}
          <blockquote className={blockquoteCva({ alignment })}>
            <p
              className={quoteTextCva({ color, size, alignment })}
              {...pa('quote')}
            >
              {quote}
            </p>
          </blockquote>

          {/* Signature & attribution */}
          <figcaption className={cn(
            "mt-lg",
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

        </figure>
      </div>
    </section>
  );
}
