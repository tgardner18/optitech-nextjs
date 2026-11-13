import LaserSignature from "./LaserSignature";
import EntranceTrigger from "./EntranceTrigger.client";

// ─── Style option types ───────────────────────────────────────────────────────

export type QuoteTreatment = "default" | "bubble" | "glow";

export type QuoteStyleOptions = {
  treatment?: QuoteTreatment;
  color?:     "none" | "brand" | "canvas" | "surface";
  alignment?: "left" | "center";
  size?:      "large" | "small";
};

// Visual styling lives in quote.css (imported from app/globals.css), keyed on the data attributes below.

// ─── Component ────────────────────────────────────────────────────────────────

export type QuoteBlockProps = {
  quote: string;
  attribution: { name: string; title?: string };
  styleOptions?: QuoteStyleOptions;
  pa?: (prop?: string | { key: string }) => Record<string, string | undefined>;
};

const QUOTE_MARK = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10.2 5.2C6.3 6.4 3.6 9.5 3.6 13.9V19h6.2v-6.2H6.9c.2-2.4 1.5-4.1 3.9-5zM20.4 5.2c-3.9 1.2-6.6 4.3-6.6 8.7V19H20v-6.2h-2.9c.2-2.4 1.5-4.1 3.9-5z" />
  </svg>
);

/** Initials for the monogram, derived from the name (no extra field). */
function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function QuoteBlock({
  quote,
  attribution,
  styleOptions = {},
  pa = () => ({}),
}: QuoteBlockProps) {
  const {
    treatment = "default",
    color     = "canvas",
    alignment = "left",
    size      = "large",
  } = styleOptions;

  const quoteEl = (
    <blockquote data-part="quote">
      <p {...pa('quote')}>{quote}</p>
    </blockquote>
  );

  // Bubble and Glow share one attribution: monogram, name, title.
  const byEl = (
    <figcaption data-part="by">
      <span data-part="monogram" aria-hidden="true">{initialsOf(attribution.name)}</span>
      <span data-part="who">
        <span data-part="name" {...pa('attributionName')}>{attribution.name}</span>
        {attribution.title && <span data-part="title" {...pa('attributionTitle')}>{attribution.title}</span>}
      </span>
    </figcaption>
  );

  return (
    <section
      data-block="quote"
      data-treatment={treatment}
      data-color={color}
      data-size={size}
      data-align={alignment}
      // brand fill is always dark: assert dark theme so nested tokens resolve correctly.
      data-theme={color === "brand" ? "dark" : undefined}
      data-animate=""
    >
      <div data-part="inner">
        <figure data-part="qfig">
          {treatment === "default" && (
            <>
              <span data-part="mark" aria-hidden="true">&ldquo;</span>
              {quoteEl}
              <figcaption data-part="by">
                <LaserSignature name={attribution.name} color={color} epiProps={pa('attributionName')} />
                {attribution.title && <p data-part="title" {...pa('attributionTitle')}>{attribution.title}</p>}
              </figcaption>
            </>
          )}
          {treatment === "bubble" && (
            <>
              <div data-part="bubble">
                <span data-part="badge" aria-hidden="true">{QUOTE_MARK}</span>
                {quoteEl}
              </div>
              {byEl}
            </>
          )}
          {treatment === "glow" && (
            <div data-part="card">
              <span data-part="watermark" aria-hidden="true">&ldquo;</span>
              {quoteEl}
              {byEl}
            </div>
          )}
        </figure>
      </div>
      <EntranceTrigger block="quote" />
    </section>
  );
}
