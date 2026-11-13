import PractitionerListingClient from './PractitionerListingBlock.client'
import type { PractitionerCardData } from '@/lib/practitioners'
import type { PractitionerListingStyleOptions } from '@/cms/styling/OT_PractitionerListingBlock.styling'

export type PractitionerListingBlockProps = {
  heading?:      string
  subtext?:      string
  practitioners: PractitionerCardData[]
  emptyMessage?: string
  styleOptions:  PractitionerListingStyleOptions
  /** Preview-attribute factory from getPreviewUtils — server context only. */
  pa?:           (prop: string) => Record<string, unknown>
}

// Server wrapper (no 'use client'): renders the heading/subtext server-side so
// they carry preview attributes and are SEO-indexable, then hands the data and
// style options to the client component, which owns search and filter state.
export default function PractitionerListingBlock({
  heading,
  subtext,
  practitioners,
  emptyMessage,
  styleOptions,
  pa = () => ({}),
}: PractitionerListingBlockProps) {
  const { color } = styleOptions

  return (
    <section data-block="practitioners" data-color={color} data-density={styleOptions.density}>
      <div data-part="in">
        {(heading || subtext) && (
          <header data-part="head">
            {heading && <h2 {...pa('heading')}>{heading}</h2>}
            {subtext && <p {...pa('subtext')}>{subtext}</p>}
          </header>
        )}

        <PractitionerListingClient
          practitioners={practitioners}
          layout={styleOptions.layout}
          columns={styleOptions.columns}
          color={color}
          showSearchFilters={styleOptions.showSearchFilters}
          density={styleOptions.density}
          emptyMessage={emptyMessage?.trim() || 'No results found.'}
        />
      </div>
    </section>
  )
}
