import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type Attrs = Record<string, string | undefined>

/**
 * Editorial text column shared by Image and Video. Pure presentation: the adapter passes the
 * rendered body and the click-to-edit attributes. Styling lives in media.css.
 */
export default function MediaEditorial({
  eyebrow, heading, headingId, body, ctaHref, ctaLabel, attrs = {},
}: {
  eyebrow?: string | null
  heading?: string | null
  headingId?: string
  body?: ReactNode
  ctaHref?: string
  ctaLabel?: string | null
  attrs?: { eyebrow?: Attrs; heading?: Attrs; body?: Attrs }
}) {
  return (
    <div data-part="text">
      {eyebrow && <p data-part="eyebrow" {...attrs.eyebrow}>{eyebrow}</p>}
      {heading && <h2 data-part="heading" id={headingId} {...attrs.heading}>{heading}</h2>}
      {body && <div data-part="body" data-rich-text="" {...attrs.body}>{body}</div>}
      {ctaHref && (
        <div data-part="cta-wrap">
          <a data-part="cta" className="btn-signal" href={ctaHref}>
            {ctaLabel || 'Learn more'}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  )
}
