import { cva } from "class-variance-authority";
import LaserSignature from "./LaserSignature";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type QuoteStyleOptions = {
  /** Background color of the block */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Horizontal alignment of quote and attribution */
  alignment?: "left" | "center";
  /** Quote text scale — large for anchor moments, small for lighter placement */
  size?: "large" | "small";
};

// ─── CVA variant configs ─────────────────────────────────────────────────────

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

const figureCva = cva("relative", {
  variants: {
    alignment: {
      left:   "max-w-screen-lg",
      center: "mx-auto max-w-screen-md text-center",
    },
  },
  defaultVariants: { alignment: "left" },
});

/**
 * Opening quotation mark — a large typographic ornament sitting behind the text,
 * dissolving downward with a mask so it integrates rather than crowds.
 * Kept smaller than before so it defers to the signature as the focal element.
 */
const quoteMarkCva = cva(
  "absolute top-0 font-extrabold leading-none select-none pointer-events-none",
  {
    variants: {
      color: {
        none:    "text-brand opacity-[0.12]",
        brand:   "text-fg-on-brand opacity-[0.10]",
        canvas:  "text-brand opacity-[0.12]",
        surface: "text-brand opacity-[0.12]",
      },
      size: {
        large: "text-[7rem] lg:text-[9rem]",
        small: "text-[5rem] lg:text-[7rem]",
      },
      alignment: {
        left:   "left-0",
        center: "left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: { color: "canvas", size: "large", alignment: "left" },
  }
);

/**
 * Quote text — italic, strong weight, headline scale.
 * The quote carries full visual weight; the signature below is the signature
 * of authorship that closes the statement. Both are prominent.
 * Capped at 55ch so lines never sprawl on wide viewports.
 */
const quoteTextCva = cva(
  "text-pretty max-w-[55ch] italic font-semibold",
  {
    variants: {
      color: {
        none:    "text-fg",
        brand:   "text-fg-on-brand",
        canvas:  "text-fg",
        surface: "text-fg",
      },
      size: {
        large: "text-headline leading-headline tracking-headline",
        small: "text-title leading-title tracking-title",
      },
      alignment: {
        left:   "",
        center: "mx-auto",
      },
    },
    defaultVariants: { color: "canvas", size: "large", alignment: "left" },
  }
);

const attributionTitleCva = cva("text-label font-normal tracking-label", {
  variants: {
    color: {
      none:    "text-fg-muted",
      brand:   "text-fg-on-brand/55",
      canvas:  "text-fg-muted",
      surface: "text-fg-muted",
    },
  },
  defaultVariants: { color: "canvas" },
});

// ─── Component ───────────────────────────────────────────────────────────────

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

  return (
    <section className={sectionCva({ color, size })}>
      <figure className={figureCva({ alignment })}>

        {/* Recessed opening mark — ornamental, not structural */}
        <span
          aria-hidden="true"
          className={quoteMarkCva({ color, size, alignment })}
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 72%)",
            maskImage:        "linear-gradient(to bottom, black 20%, transparent 72%)",
          }}
        >
          &ldquo;
        </span>

        {/* ── Quote body ─────────────────────────────────────────────────── */}
        <div className={size === "large" ? "pt-[3rem] lg:pt-[4rem]" : "pt-[2rem] lg:pt-[3rem]"}>
          <blockquote>
            <p
              className={quoteTextCva({ color, size, alignment })}
              {...pa('quote')}
            >
              {quote}
            </p>
          </blockquote>

          {/* ── Signature block ──────────────────────────────────────────── */}
          <figcaption className={`mt-xl ${alignment === 'center' ? 'flex flex-col items-center' : ''}`}>
            <LaserSignature
              name={attribution.name}
              color={color}
              epiProps={pa('attributionName')}
            />
            {attribution.title && (
              <p
                className={`${attributionTitleCva({ color })} mt-xs uppercase tracking-label`}
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
