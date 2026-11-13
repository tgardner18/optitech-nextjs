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
   * - glow_frame / layered_depth / float_elevation / sidebar_accent / layers_3d: framed cards
   */
  treatment?: "standard" | "lead" | "toc" | "glow_frame" | "layered_depth" | "float_elevation" | "sidebar_accent" | "layers_3d";
};

const FRAMED = ["layers_3d", "glow_frame", "layered_depth", "float_elevation", "sidebar_accent"];

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNodeText(node: any): string {
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(extractNodeText).join('');
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractHeadings(nodes: any[]): HeadingEntry[] {
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

/**
 * Contents panel: its own list markup (one set of numerals), rendered after the
 * opening paragraph. From 60rem the CSS turns it into a sticky rail.
 */
function ArticleToc({ headings }: { headings: HeadingEntry[] }) {
  if (headings.length === 0) return null;
  return (
    <nav id="article-toc" data-part="toc" aria-label="Article contents">
      <p data-part="toc-label">Contents</p>
      <ol data-part="toc-list">
        {headings.map((heading, i) => (
          <li key={heading.id}>
            <a data-part="toc-link" href={`#${heading.id}`}>
              <span data-part="toc-n">{String(i + 1).padStart(2, '0')}</span>
              <span data-part="toc-t">{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

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

  const framed = FRAMED.includes(treatment);
  // Framed cards sit on canvas or surface (a brand ground would put a card on brand).
  const groundColor = framed && color === 'brand' ? 'canvas' : color;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allNodes: any[] = (content as any)?.children ?? [];
  const isToc = treatment === 'toc';
  const headings = isToc ? extractHeadings(allNodes) : [];

  // Headings render in document order, exactly as extractHeadings collected
  // them, so walk the same array by index (shared across the split render below).
  let headingIndex = 0;
  const elements = isToc ? {
    ...baseElements,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'heading-two': ({ children }: any) => {
      const id = headings[headingIndex++]?.id;
      return (
        <h2 id={id}>
          <span>{children}</span>
          {headings.length > 0 && (
            <a data-part="back" href="#article-toc" aria-label="Back to contents">
              <ArrowUp aria-hidden="true" strokeWidth={2} />
            </a>
          )}
        </h2>
      );
    },
  } : baseElements;

  // For Contents the panel follows the opening paragraph (title → intro → panel → body).
  // Split the node list at the first paragraph, only when it opens the article.
  let body;
  if (isToc && headings.length > 0) {
    const firstP = allNodes.findIndex(n => n.type === 'paragraph');
    const cut = firstP >= 0 && firstP <= 1 ? firstP + 1 : 0;
    const head = allNodes.slice(0, cut);
    const rest = allNodes.slice(cut);
    body = (
      <>
        {head.length > 0 && <RichText content={{ ...(content as object), children: head } as never} elements={elements} />}
        <ArticleToc headings={headings} />
        <RichText content={{ ...(content as object), children: rest } as never} elements={elements} />
      </>
    );
  } else {
    body = <RichText content={content ?? undefined} elements={elements} />;
  }

  const prose = (
    <div data-part="prose" data-rich-text="" {...pa('content')}>
      {body}
    </div>
  );

  let inner;
  if (treatment === 'layers_3d') {
    inner = (
      <div data-part="stage">
        {[4, 3, 2, 1].map(n => <span key={n} data-part="plate" data-n={n} aria-hidden="true" />)}
        {prose}
      </div>
    );
  } else if (treatment === 'layered_depth') {
    inner = (
      <div data-part="stage">
        <span data-part="back-panel" aria-hidden="true" />
        {prose}
      </div>
    );
  } else if (framed) {
    inner = <div data-part="stage">{prose}</div>;
  } else {
    inner = prose;
  }

  return (
    <section
      data-block="rich-text"
      data-treatment={treatment}
      data-color={groundColor}
      data-size={size}
      data-align={alignment}
      data-theme={groundColor === 'brand' ? 'dark' : undefined}
    >
      <div data-part="inner">{inner}</div>
    </section>
  );
}
