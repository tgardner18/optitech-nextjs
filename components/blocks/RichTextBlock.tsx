import { cva } from "class-variance-authority";

// ─── Style option types (map 1:1 to CMS content properties) ─────────────────

export type RichTextStyleOptions = {
  /** Background color of the block */
  color?: "brand" | "canvas" | "surface";
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
      editorial: "py-2xl",
      compact:   "py-xl",
    },
  },
  defaultVariants: { color: "canvas", size: "editorial" },
});

const innerCva = cva("", {
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
  compoundVariants: [
    { alignment: "center", size: "editorial", class: "max-w-[72ch]" },
    { alignment: "center", size: "compact",   class: "max-w-[60ch]" },
  ],
  defaultVariants: { alignment: "left", size: "editorial" },
});

// ─── Component ───────────────────────────────────────────────────────────────

export type RichTextBlockProps = {
  content: string;
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
  } = styleOptions;

  return (
    <section className={sectionCva({ color, size })}>
      {/* Content is CMS-managed TinyMCE output — not user-generated input */}
      <div
        data-rich-text=""
        data-color={color}
        data-size={size}
        data-treatment={treatment !== "standard" ? treatment : undefined}
        data-ruled-headings={ruledHeadings ? "" : undefined}
        className={innerCva({ alignment, size })}
        {...pa('content')}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
