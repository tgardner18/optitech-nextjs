import ProductRecommendationsClient, {
  type ProductRec,
  type ProductRecColor,
} from './ProductRecommendationsClient'

export type { ProductRec, ProductRecColor }

export type ProductRecommendationsBlockProps = {
  heading?:        string
  subheading?:     string
  widgetPosition?: string
  initialCount?:   number
  showAllLabel?:   string
  color?:          ProductRecColor
  /** Sample recs for the showcase — passed straight to the client widget. */
  initialRecs?:    ProductRec[]
  /** Preview-attribute factory from getPreviewUtils (server context only). */
  pa?:             (prop: string) => Record<string, unknown>
}

const BG_CLASS: Record<ProductRecColor, string> = {
  canvas:  'bg-canvas',
  surface: 'bg-surface',
  brand:   'bg-brand-fill',
}

// ─── ProductRecommendationsBlock (server wrapper) ─────────────────────────────
// Renders the section chrome + heading (SEO-indexable, preview-attributed) and
// embeds the client widget that listens for live Peerius recommendations.

export default function ProductRecommendationsBlock({
  heading,
  subheading,
  widgetPosition,
  initialCount = 3,
  showAllLabel = 'Show all',
  color = 'canvas',
  initialRecs,
  pa = () => ({}),
}: ProductRecommendationsBlockProps) {
  const onBrand = color === 'brand'
  const headingColor = onBrand ? 'text-fg-on-brand' : 'text-fg'
  const mutedColor = onBrand ? 'text-fg-on-brand/70' : 'text-fg-muted'

  return (
    <section
      className={`${BG_CLASS[color]} px-md py-xl lg:px-lg`}
      {...(onBrand ? { 'data-theme': 'dark' } : {})}
    >
      <div className="mx-auto max-w-7xl">
        {(heading || subheading) && (
          <div className="mb-xl max-w-3xl">
            {heading && (
              <h2 className={`text-headline leading-headline tracking-headline font-bold ${headingColor}`} {...pa('heading')}>
                {heading}
              </h2>
            )}
            {subheading && (
              <p className={`mt-sm text-body-lg ${mutedColor}`} {...pa('subheading')}>
                {subheading}
              </p>
            )}
          </div>
        )}

        <ProductRecommendationsClient
          widgetPosition={widgetPosition}
          initialCount={initialCount}
          showAllLabel={showAllLabel}
          onBrand={onBrand}
          initialRecs={initialRecs}
        />
      </div>
    </section>
  )
}
