import { cva } from "class-variance-authority";
import { RichText } from '@optimizely/cms-sdk/react/richText'

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type RichTextStyleOptions = {
  /** Background color of the block — "none" is transparent, inheriting the row/section background */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Horizontal alignment of the prose column */
  alignment?: "left" | "center";
  /** Type scale and vertical rhythm: editorial for long-form prose, compact for shorter sections */
  size?: "editorial" | "compact";
  /**
   * First-paragraph treatment.
   * - standard: faithful prose rendering
   * - lead: first paragraph promoted to deck size in Blueprint color
   * - dropcap: first letter enlarged in brand teal, floated left
   */
  treatment?: "standard" | "lead" | "dropcap";
  /** Adds a 1px teal rule above h2 and h3 headings — editorial chapter dividers */
  ruledHeadings?: boolean;
  /** Prose font size tier: body (default), large, lead, or statement callout */
  textScale?: "body" | "large" | "lead" | "statement";
  /** Prose font weight: regular (default), medium, or semibold */
  textWeight?: "regular" | "medium" | "semibold";
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
      editorial: "py-lg",
      compact:   "py-md",
    },
  },
  defaultVariants: { color: "canvas", size: "editorial" },
});

const innerCva = cva("w-full", {
  variants: {
    alignment: {
      left:   "",
      center: "mx-auto",
    },
    size: {
      editorial: "",
      compact:   "",
    },
  },
  defaultVariants: { alignment: "left", size: "editorial" },
});

// ─── Component ───────────────────────────────────────────────────────────────

export type RichTextBlockProps = {
  content: Parameters<typeof RichText>[0]['content'] | null;
  styleOptions?: RichTextStyleOptions;
  pa?: (prop: string) => { "data-epi-property-name"?: string };
};

export default function RichTextBlock({
  content,
  styleOptions = {},
  pa = () => ({}),
}: RichTextBlockProps) {
  const {
    color         = "canvas",
    alignment     = "left",
    size          = "editorial",
    treatment     = "standard",
    ruledHeadings = false,
    textScale     = "body",
    textWeight    = "regular",
  } = styleOptions;

  return (
    <section className={sectionCva({ color, size })}>
      <div
        data-rich-text=""
        data-color={color}
        data-size={size}
        data-treatment={treatment !== "standard" ? treatment : undefined}
        data-ruled-headings={ruledHeadings ? "" : undefined}
        data-scale={textScale !== "body" ? textScale : undefined}
        data-weight={textWeight !== "regular" ? textWeight : undefined}
        className={innerCva({ alignment, size })}
        {...pa('content')}
      >
        <RichText content={content ?? undefined} />
      </div>
    </section>
  );
}
