import { cva } from "class-variance-authority";
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { ArrowUp } from 'lucide-react'

// The SDK's default element map has no horizontal-rule entry, so an editor's
// section break renders as an empty <span>. Register an <hr> renderer.
const Hr = () => <hr />;
const baseElements = {
  hr: Hr,
  'horizontal-rule': Hr,
  'thematic-break': Hr,
  divider: Hr,
};

// ─── Style option types ───────────────────────────────────────────────────────

export type RichTextStyleOptions = {
  /** Background color applied to the block container */
  color?: "none" | "brand" | "canvas" | "surface";
  /** Horizontal alignment of the prose column */
  alignment?: "left" | "center";
  /** Type scale and vertical rhythm */
  size?: "editorial" | "compact";
  /**
   * Display treatment.
   * - standard: faithful prose rendering
   * - lead: first paragraph promoted to deck size
   * - toc: auto-generated section navigator from h2 headings
   * - glow_frame: gradient-bordered premium frame with ambient glow
   * - layered_depth: brand depth panel offset lower-right behind the content card
   * - float_elevation: compound multi-layer chromatic elevation shadow
   * - sidebar_accent: brand top rule + tinted wash (not a left/right stripe — see the
   *   ban on side-stripe borders in DESIGN.md's absolute-bans list)
   * - layers_3d: hard multi-layer 45° box-shadow extrude — same depth as the text effect
   */
  treatment?: "standard" | "lead" | "toc" | "glow_frame" | "layered_depth" | "float_elevation" | "sidebar_accent" | "layers_3d";
};

// ─── TOC utilities ────────────────────────────────────────────────────────────

type HeadingEntry = { text: string; id: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractNodeText(node: any): string {
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(extractNodeText).join('');
  return '';
}

function extractHeadings(content: any): HeadingEntry[] {
  const nodes: any[] = content?.children ?? [];
  // De-duplicate ids: two headings with the same text would otherwise share an
  // anchor and every TOC link would jump to the first. Suffix repeats (-2, -3…).
  const seen = new Map<string, number>();
  return nodes
    .filter(n => n.type === 'heading-two')
    .map(n => {
      const text = extractNodeText(n);
      const base = slugify(text) || 'section';
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return { text, id: count === 0 ? base : `${base}-${count + 1}` };
    });
}

// ─── ArticleToc panel ─────────────────────────────────────────────────────────

function ArticleToc({ headings }: { headings: HeadingEntry[] }) {
  if (headings.length === 0) return null;
  return (
    <nav id="article-toc" aria-label="Article contents" className="my-lg">
      <div className="rounded-ot-surface overflow-hidden border border-(--ot-bloom-brand-border) bg-surface">
        <div className="px-md pt-md pb-sm border-b border-(--ot-bloom-brand-border)">
          <span className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Contents
          </span>
        </div>
        <ol className="px-md py-sm">
          {headings.map((heading, i) => (
            <li key={heading.id} className="list-none">
              <a href={`#${heading.id}`} className="group/entry flex items-baseline gap-3 py-1">
                <span className="font-mono text-brand text-xs tabular-nums flex-shrink-0 transition-colors duration-150">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-fg-muted leading-snug group-hover/entry:text-fg group-hover/entry:translate-x-[3px] transition-all duration-150 ease-out">
                  {heading.text}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

// ─── CVA variant configs ──────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export type RichTextBlockProps = {
  content: Parameters<typeof RichText>[0]['content'] | null;
  styleOptions?: RichTextStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};

export default function RichTextBlock({
  content,
  styleOptions = {},
  pa = () => ({}),
}: RichTextBlockProps) {
  const {
    color     = "canvas",
    alignment = "left",
    size      = "editorial",
    treatment = "standard",
  } = styleOptions;

  // Build element map for toc treatment. The nav panel itself is rendered above
  // the whole RichText so it sits at the very top of the block, regardless of
  // whether the first node is a heading or a paragraph. The map here only adds
  // anchor ids + a back-to-contents arrow to each h2.
  const headings = treatment === 'toc' ? extractHeadings(content) : [];

  // Headings render in document order, exactly as extractHeadings collected
  // them, so walk the same array by index. This guarantees each rendered h2 id
  // matches its TOC link's href (and inherits the same de-dup).
  let headingIndex = 0;
  const elements = treatment === 'toc' ? {
    ...baseElements,
    'heading-two': ({ children }: any) => {
      const id = headings[headingIndex++]?.id;
      return (
        <h2 id={id}>
          <span>{children}</span>
          {headings.length > 0 && (
            <a href="#article-toc" aria-label="Back to contents">
              <ArrowUp size={12} strokeWidth={2} aria-hidden="true" />
            </a>
          )}
        </h2>
      );
    },
  } : baseElements;

  // ── Gradient Border Glow Frame ──────────────────────────────────────────────
  if (treatment === 'glow_frame') {
    return (
      <section className={sectionCva({ color, size })}>
        <div className={`${innerCva({ alignment, size })} rte-glow-frame rounded-ot-surface p-1`}>
          <div
            data-rich-text=""
            data-color={color}
            data-size={size}
            data-treatment="glow_frame"
            className="bg-canvas rounded-[inherit] px-8 py-7"
            {...pa('content')}
          >
            <RichText content={content ?? undefined} elements={elements} />
          </div>
        </div>
      </section>
    );
  }

  // ── Layered Depth Offset ────────────────────────────────────────────────────
  if (treatment === 'layered_depth') {
    return (
      <section className={sectionCva({ color, size })}>
        <div className={`${innerCva({ alignment, size })} relative pb-3`}>
          {/* Brand depth panel — same size as the container, offset lower-right so
              it peeks out from behind the content card on the right and bottom */}
          <div
            aria-hidden
            className="absolute top-3 left-3 right-0 bottom-0 rte-depth-bg hidden md:block"
          />
          <div
            data-rich-text=""
            data-color={color}
            data-size={size}
            data-treatment="layered_depth"
            className="relative mr-3 bg-surface rounded-ot-surface px-8 py-8 rte-depth-card"
            {...pa('content')}
          >
            <RichText content={content ?? undefined} elements={elements} />
          </div>
        </div>
      </section>
    );
  }

  // ── Premium Float Elevation ─────────────────────────────────────────────────
  if (treatment === 'float_elevation') {
    return (
      <section className={sectionCva({ color, size })}>
        <div className={innerCva({ alignment, size })}>
          <div
            data-rich-text=""
            data-color={color}
            data-size={size}
            data-treatment="float_elevation"
            className="bg-surface rounded-ot-surface px-8 py-8 rte-float-elevation"
            {...pa('content')}
          >
            <RichText content={content ?? undefined} elements={elements} />
          </div>
        </div>
      </section>
    );
  }

  // ── Accent Rail ──────────────────────────────────────────────────────────────
  // A brand top rule + tinted wash on the card. Earlier versions of this treatment
  // used a full-height brand-colored bar flush to the card's left edge — visually
  // identical to the banned "side-stripe border" pattern (DESIGN.md absolute bans:
  // no border-left/border-right > 1px as a decorative accent) even though it was a
  // positioned div rather than a literal `border-left`. Rewritten per the design
  // system's own suggested alternative: a full border edge (here, the top rule) plus
  // a background tint, instead of a side stripe.
  if (treatment === 'sidebar_accent') {
    return (
      <section className={sectionCva({ color, size })}>
        <div className={innerCva({ alignment, size })}>
          <div
            data-rich-text=""
            data-color={color}
            data-size={size}
            data-treatment="sidebar_accent"
            className="bg-brand/5 rounded-ot-surface border-t-[3px] border-brand px-8 py-8 rte-depth-card"
            {...pa('content')}
          >
            <RichText content={content ?? undefined} elements={elements} />
          </div>
        </div>
      </section>
    );
  }

  // ── 3D Layers Extrude ───────────────────────────────────────────────────────
  if (treatment === 'layers_3d') {
    return (
      <section className={sectionCva({ color, size })}>
        {/* pb-10/pr-10 (40px) gives the 4 × 10px depth layers room to show */}
        <div className={`${innerCva({ alignment, size })} relative pb-10 pr-10`}>
          {/* Full-size layer rectangles — ordered back-to-front in DOM so each
              later sibling paints on top. Each is inset 10px from the outer
              container right/bottom so it matches the card face width/height,
              then translated to its offset position. */}
          <div aria-hidden className="absolute top-0 left-0 right-10 bottom-10 translate-x-10 translate-y-10 rounded-ot-surface rte-3d-l4 hidden md:block" />
          <div aria-hidden className="absolute top-0 left-0 right-10 bottom-10 translate-x-7.5 translate-y-7.5 rounded-ot-surface rte-3d-l3 hidden md:block" />
          <div aria-hidden className="absolute top-0 left-0 right-10 bottom-10 translate-x-5 translate-y-5 rounded-ot-surface rte-3d-l2 hidden md:block" />
          <div aria-hidden className="absolute top-0 left-0 right-10 bottom-10 translate-x-2.5 translate-y-2.5 rounded-ot-surface rte-3d-l1 hidden md:block" />
          <div
            data-rich-text=""
            data-color={color}
            data-size={size}
            data-treatment="layers_3d"
            className="relative bg-surface rounded-ot-surface px-8 py-8 rte-3d-face"
            {...pa('content')}
          >
            <RichText content={content ?? undefined} elements={elements} />
          </div>
        </div>
      </section>
    );
  }

  // ── Standard / Lead / TOC ───────────────────────────────────────────────────
  return (
    <section className={sectionCva({ color, size })}>
      <div
        data-rich-text=""
        data-color={color}
        data-size={size}
        data-treatment={treatment !== "standard" ? treatment : undefined}
        className={innerCva({ alignment, size })}
        {...pa('content')}
      >
        {treatment === 'toc' && <ArticleToc headings={headings} />}
        <RichText content={content ?? undefined} elements={elements} />
      </div>
    </section>
  );
}
