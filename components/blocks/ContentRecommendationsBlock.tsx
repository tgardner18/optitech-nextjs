import type { ContentRecItem } from '@/lib/recommendations/contentRecs'

// ─── Style option types ──────────────────────────────────────────────────────

export type ContentRecColor = 'canvas' | 'surface' | 'brand'

export type { ContentRecItem }

export type ContentRecommendationsBlockProps = {
  heading?:    string
  subheading?: string
  items:       ContentRecItem[]
  color?:      ContentRecColor
  /** Preview-attribute factory from getPreviewUtils (server context only). */
  pa?:         (prop: string) => Record<string, unknown>
}

const BG_CLASS: Record<ContentRecColor, string> = {
  canvas:  'bg-canvas',
  surface: 'bg-surface',
  brand:   'bg-brand-fill',
}

// ─── ContentRecommendationsBlock (server) ─────────────────────────────────────
// Pure server component — the recommendation items are fetched in the adapter
// and passed in. No client interactivity is needed (static personalized grid).

export default function ContentRecommendationsBlock({
  heading,
  subheading,
  items,
  color = 'canvas',
  pa = () => ({}),
}: ContentRecommendationsBlockProps) {
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

        {items.length === 0 ? (
          <p className={`text-body ${mutedColor}`}>No recommendations available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {items.map((item, i) => (
              <a
                key={`${item.linkUrl}-${i}`}
                href={item.linkUrl}
                className="group flex flex-col overflow-hidden rounded-card border border-fg/[0.08] bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {/* Image (background-image avoids remote-pattern config for arbitrary hosts) */}
                <div
                  className="relative aspect-[3/2] w-full bg-fg/[0.05] bg-cover bg-center"
                  style={item.imageUrl ? { backgroundImage: `url('${item.imageUrl}')` } : undefined}
                >
                  {item.topic && (
                    <span className="absolute left-3 top-3 bg-brand text-fg-on-brand text-[0.6875rem] font-semibold uppercase tracking-[0.06em] px-2 py-0.5">
                      {item.topic}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-lg">
                  {(item.source || item.author) && (
                    <p className="text-[0.75rem] uppercase tracking-[0.06em] text-fg-muted/70 mb-xs">
                      {[item.source, item.author].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <h3 className="text-title leading-title font-semibold text-fg group-hover:text-brand transition-colors duration-150">
                    {item.title}
                  </h3>
                  {item.abstract && (
                    <p className="mt-xs text-body text-fg-muted line-clamp-3">{item.abstract}</p>
                  )}
                  <span className="mt-auto pt-md inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-brand">
                    Read more
                    <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
