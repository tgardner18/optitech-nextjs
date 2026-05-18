import { cva } from "class-variance-authority";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type QuoteStyleOptions = {
  /** Background color of the block */
  color?: "brand" | "canvas" | "surface";
  /** Horizontal alignment of quote and attribution */
  alignment?: "left" | "center";
  /** Quote text scale — large for anchor moments, small for lighter placement */
  size?: "large" | "small";
};

// ─── CVA variant configs ─────────────────────────────────────────────────────

const sectionCva = cva("px-md lg:px-lg", {
  variants: {
    color: {
      brand:   "bg-brand",
      canvas:  "bg-canvas",
      surface: "bg-surface",
    },
    size: {
      large: "py-2xl",
      small: "py-xl",
    },
  },
  defaultVariants: { color: "canvas", size: "large" },
});

const figureCva = cva("relative overflow-hidden", {
  variants: {
    alignment: {
      left:   "",
      center: "mx-auto max-w-screen-md text-center",
    },
  },
  defaultVariants: { alignment: "left" },
});

/**
 * The `"` character: absolutely positioned behind the text.
 * Sits at the top of the figure, fades downward via mask-image so it
 * dissolves naturally as the quote text begins.
 *
 * On dark surfaces: brand teal at 20% opacity.
 * On brand surface: white at 15% opacity.
 * Centered alignment centers it behind the text column.
 */
const quoteMarkCva = cva(
  "absolute top-0 font-extrabold leading-none select-none pointer-events-none",
  {
    variants: {
      color: {
        brand:   "text-fg-on-brand opacity-[0.15]",
        canvas:  "text-brand opacity-20",
        surface: "text-brand opacity-20",
      },
      size: {
        large: "text-[10rem] lg:text-[13rem]",
        small: "text-[7rem]  lg:text-[9rem]",
      },
      alignment: {
        left:   "left-0",
        center: "left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: { color: "canvas", size: "large", alignment: "left" },
  }
);

/** Pushes the text content down so the top of the quote mark peeks above it */
const quoteContentCva = cva("relative", {
  variants: {
    size: {
      large: "pt-[4rem] lg:pt-[5.5rem]",
      small: "pt-[2.5rem] lg:pt-[3.5rem]",
    },
  },
  defaultVariants: { size: "large" },
});

const quoteTextCva = cva("text-balance", {
  variants: {
    color: {
      brand:   "text-fg-on-brand",
      canvas:  "text-fg",
      surface: "text-fg",
    },
    size: {
      large: "text-headline leading-headline tracking-headline font-bold",
      small: "text-title leading-title tracking-title font-semibold",
    },
  },
  defaultVariants: { color: "canvas", size: "large" },
});

const attributionNameCva = cva("text-label tracking-label uppercase font-semibold", {
  variants: {
    color: {
      brand:   "text-fg-on-brand",
      canvas:  "text-fg",
      surface: "text-fg",
    },
  },
  defaultVariants: { color: "canvas" },
});

const attributionTitleCva = cva("text-label font-normal", {
  variants: {
    color: {
      brand:   "text-fg-on-brand/60",
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

        {/* Quote mark: absolute, behind the text, top peeks — bottom fades */}
        <span
          aria-hidden="true"
          className={quoteMarkCva({ color, size, alignment })}
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 78%)",
            maskImage:        "linear-gradient(to bottom, black 30%, transparent 78%)",
          }}
        >
          &ldquo;
        </span>

        {/* Content: relative so it paints above the absolute mark */}
        <div className={quoteContentCva({ size })}>
          <blockquote>
            <p className={quoteTextCva({ color, size })} {...pa('quote')}>{quote}</p>
          </blockquote>
          <figcaption className="mt-lg flex flex-col gap-xs">
            <p className={attributionNameCva({ color })} {...pa('attributionName')}>{attribution.name}</p>
            {attribution.title && (
              <p className={attributionTitleCva({ color })} {...pa('attributionTitle')}>{attribution.title}</p>
            )}
          </figcaption>
        </div>

      </figure>
    </section>
  );
}
