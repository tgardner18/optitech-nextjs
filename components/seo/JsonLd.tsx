/**
 * components/seo/JsonLd.tsx
 *
 * Server component — renders a <script type="application/ld+json"> tag.
 * Next.js App Router hoists <script> tags rendered in server components into
 * <head> automatically, so this component can be placed anywhere in the
 * server-side tree and will always land in the correct document position.
 *
 * No @optimizely/cms-sdk imports.
 */
import type { ReactNode } from 'react'

export default function JsonLd({ data }: { data: object }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
