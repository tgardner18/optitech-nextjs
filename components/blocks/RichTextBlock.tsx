import { cva } from "class-variance-authority";
import { RichText } from '@optimizely/cms-sdk/react/richText'

// The SDK's default element map has no horizontal-rule entry, so an editor's
// section break renders as an empty <span>. Register an <hr> renderer (under the
// type names the editor/Slate may emit) so breaks render — and so the `dividers`
// treatment below has something to style.
const Hr = () => <hr />;
const richTextElements = {
  hr: Hr,
  'horizontal-rule': Hr,
  'thematic-break': Hr,
  divider: Hr,
};

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
   * - incipit: first line of the opening paragraph set in tracked small-caps —
   *   the classic editorial incipit. Distinct from dropcap (one letter) and
   *   lead (whole paragraph).
   */
  treatment?: "standard" | "lead" | "dropcap" | "incipit";
  /** Adds a 1px teal rule above h2 and h3 headings — editorial chapter dividers */
  ruledHeadings?: boolean;
  /** Prose font size tier: body (default), large, lead, or statement callout */
  textScale?: "body" | "large" | "lead" | "statement";
  /** Prose font weight: regular (default), medium, or semibold */
  textWeight?: "regular" | "medium" | "semibold";
  /**
   * Broadsheet column flow — the long-form move a single headline cannot make.
   * Uses CSS multi-column with a tokenized column rule; collapses to a single
   * column automatically when the measure gets too narrow.
   *   single — one column (default)
   *   dual   — two columns, justified + hyphenated
   *   triple — three columns, tighter measure
   */
  columns?: "single" | "dual" | "triple";
  /**
   * Print ground behind the prose — a background effect, not a fill.
   *   flat   — no texture (default), inherits the section background
   *   ruled  — faint baseline ruling, ledger/manuscript register
   *   grain  — halftone dot field, screenprint texture
   *   framed — bordered editorial "page" with a masthead rule along the top
   */
  ground?: "flat" | "ruled" | "grain" | "framed";
  /**
   * Section break (<hr>) treatment.
   *   rule     — 1px teal line (default)
   *   ornament — centered fleuron (❧)
   *   asterism — centered asterism (⁂)
   */
  dividers?: "rule" | "ornament" | "asterism";
  /** Auto-number h2 chapter headings ("01 /") in tracked mono accent */
  numberedHeadings?: boolean;
  /**
   * Reading-cadence motion: each block rises + fades as it scrolls into view.
   * Pure CSS scroll-driven (animation-timeline: view()); degrades to static
   * for unsupported browsers and reduced-motion users.
   *   none    — static (default)
   *   cascade — staggered scroll reveal down the column
   */
  reveal?: "none" | "cascade";
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
    color            = "canvas",
    alignment        = "left",
    size             = "editorial",
    treatment        = "standard",
    ruledHeadings    = false,
    textScale        = "body",
    textWeight       = "regular",
    columns          = "single",
    ground           = "flat",
    dividers         = "rule",
    numberedHeadings = false,
    reveal           = "none",
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
        data-columns={columns !== "single" ? columns : undefined}
        data-ground={ground !== "flat" ? ground : undefined}
        data-dividers={dividers !== "rule" ? dividers : undefined}
        data-numbered={numberedHeadings ? "" : undefined}
        data-reveal={reveal !== "none" ? reveal : undefined}
        className={innerCva({ alignment, size })}
        {...pa('content')}
      >
        <RichText content={content ?? undefined} elements={richTextElements} />
      </div>
    </section>
  );
}
