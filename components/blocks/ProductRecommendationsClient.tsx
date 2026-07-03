'use client'

import { useEffect, useMemo, useState } from 'react'

// A single recommendation card. Peerius payloads vary by account/widget config,
// so every field is optional and resolved defensively from common aliases.
export interface ProductRec {
  id?:          string | number
  refCode?:     string
  title?:       string
  url?:         string
  img?:         string
  description?: string
  price?:       string
}

export type ProductRecColor = 'canvas' | 'surface' | 'brand'

interface Props {
  widgetPosition?: string
  initialCount:    number
  showAllLabel:    string
  onBrand:         boolean
  /** Sample recs for the showcase — bypasses the live Peerius listener. */
  initialRecs?:    ProductRec[]
}

// ─── Defensive Peerius payload parsing ───────────────────────────────────────

type Unknown = Record<string, unknown>

function asRec(raw: Unknown): ProductRec {
  const s = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : undefined)
  return {
    id:          (raw.id as string | number | undefined) ?? undefined,
    refCode:     s('refCode') ?? s('sku') ?? s('productId'),
    title:       s('title') ?? s('name'),
    url:         s('url') ?? s('link') ?? s('productUrl'),
    img:         s('img') ?? s('image') ?? s('imageUrl') ?? s('image_url'),
    description: s('description') ?? s('abstract'),
    price:       s('price') ?? s('displayPrice'),
  }
}

/** Pull the item list for the chosen widget out of an arbitrary Peerius payload. */
function parsePayload(raw: unknown, widgetPosition?: string): ProductRec[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((r) => asRec(r as Unknown))

  const obj = raw as Unknown
  const widgets =
    (Array.isArray(obj.recs) && obj.recs) ||
    (Array.isArray(obj.widgets) && obj.widgets) ||
    null

  if (widgets) {
    const list = widgets as Unknown[]
    const chosen =
      (widgetPosition &&
        list.find((w) => w.position === widgetPosition || w.name === widgetPosition)) ||
      list[0]
    if (!chosen) return []
    const items =
      (Array.isArray(chosen.items) && chosen.items) ||
      (Array.isArray(chosen.recs) && chosen.recs) ||
      (Array.isArray(chosen.products) && chosen.products) ||
      []
    return (items as Unknown[]).map(asRec)
  }

  // Last resort: a bare items array on the payload.
  if (Array.isArray(obj.items)) return (obj.items as Unknown[]).map(asRec)
  return []
}

// ─── Widget ───────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    __peeriusRecs?: unknown
  }
}

export default function ProductRecommendationsClient({
  widgetPosition,
  initialCount,
  showAllLabel,
  onBrand,
  initialRecs,
}: Props) {
  // When initialRecs is provided (showcase), render immediately and skip the
  // live listener + loading state.
  const [recs, setRecs] = useState<ProductRec[] | null>(initialRecs ?? null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (initialRecs) return
    let cancelled = false
    const read = (detail?: unknown) => {
      if (!cancelled) setRecs(parsePayload(detail ?? window.__peeriusRecs, widgetPosition))
    }
    // The engine may have already fired before this mounted — read it, but
    // deferred so it isn't a synchronous setState within the effect.
    queueMicrotask(() => { if (window.__peeriusRecs) read() })
    const onRecs = (e: Event) => read((e as CustomEvent).detail)
    window.addEventListener('peerius:recs', onRecs)
    return () => { cancelled = true; window.removeEventListener('peerius:recs', onRecs) }
  }, [widgetPosition, initialRecs])

  const visible = useMemo(() => {
    if (!recs) return []
    return expanded ? recs : recs.slice(0, initialCount)
  }, [recs, expanded, initialCount])

  const handleClick = (rec: ProductRec) => {
    window.dispatchEvent(
      new CustomEvent('peerius:rec-click', {
        detail: { id: rec.id, refCode: rec.refCode, title: rec.title, url: rec.url },
      }),
    )
  }

  const mutedColor = onBrand ? 'text-fg-on-brand/70' : 'text-fg-muted'

  // Loading — waiting for the engine.
  if (recs === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg" aria-hidden="true">
        {Array.from({ length: initialCount }).map((_, i) => (
          <div key={i} className="rounded-card border border-fg/[0.08] overflow-hidden">
            <div className="aspect-[3/2] w-full bg-fg/[0.06] motion-safe:animate-pulse" />
            <div className="p-lg space-y-2">
              <div className="h-4 w-3/4 bg-fg/[0.06] motion-safe:animate-pulse" />
              <div className="h-3 w-full bg-fg/[0.05] motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty — engine returned nothing.
  if (recs.length === 0) {
    return <p className={`text-body ${mutedColor}`}>No recommendations available right now.</p>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {visible.map((rec, i) => (
          <a
            key={`${rec.id ?? rec.refCode ?? i}`}
            href={rec.url || '#'}
            onClick={() => handleClick(rec)}
            className="group flex flex-col overflow-hidden rounded-card border border-fg/[0.08] bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <div
              className="aspect-[3/2] w-full bg-fg/[0.05] bg-cover bg-center"
              style={rec.img ? { backgroundImage: `url('${rec.img}')` } : undefined}
            />
            <div className="flex flex-1 flex-col p-lg">
              <h3 className="text-title leading-title font-semibold text-fg group-hover:text-brand transition-colors duration-150">
                {rec.title || 'Recommended'}
              </h3>
              {rec.description && (
                <p className="mt-xs text-body text-fg-muted line-clamp-3">{rec.description}</p>
              )}
              <div className="mt-auto pt-md flex items-center justify-between">
                {rec.price && <span className="text-body font-semibold text-fg">{rec.price}</span>}
                <span className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-brand">
                  Learn more
                  <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {recs.length > initialCount && !expanded && (
        <div className="mt-lg">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="px-lg py-[9px] border border-fg/[0.14] text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg hover:border-brand/40 hover:text-brand transition-colors duration-150"
          >
            {showAllLabel || 'Show all'}
          </button>
        </div>
      )}
    </>
  )
}
