import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { MapPin } from 'lucide-react'
import { OT_LocationProfile as OT_LocationProfileContentType } from '@/cms/content-types/OT_LocationProfile'
import LocationPlate from '@/components/location/LocationPlate'
import LocationLabelBadge from '@/components/location/LocationLabelBadge'

type Props = {
  content:          ContentProps<typeof OT_LocationProfileContentType>
  displaySettings?: Record<string, string | boolean>
}

// Preview / standalone adapter. OT_LocationProfile is primarily a reference-only
// record — the listing block reads it directly via lib/locations.ts. But the CMS
// preview route (/preview) and the Visual Builder render standalone content
// through <OptimizelyComponent>, which needs a registered React component;
// without one the profile preview is blank. This adapter renders the record as a
// single-location detail card (image/fallback plate, label badge, name, address,
// details rich text) so editors get a meaningful preview. Field-level pa() marks
// each editable property for click-to-edit.
export default function OT_LocationProfileAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)

  const name      = content.locationName ?? ''
  const label     = content.locationLabel ?? ''
  const address   = content.address ?? ''
  const imageUrl  = src(content.image)
  const detailsJson = content.details?.json ?? undefined

  return (
    <div className="min-h-screen bg-canvas px-md py-xl lg:px-lg" {...pa(content.__composition)}>
      <article className="mx-auto max-w-[42rem] overflow-hidden border border-fg/10 bg-surface">
        {/* Image / branded fallback plate */}
        <div className="relative aspect-[16/9] w-full bg-canvas" {...pa('image')}>
          <LocationPlate shape="fill" src={imageUrl} name={name || 'Location'} />
          {label && (
            <div className="absolute left-0 top-4 z-10" {...pa('locationLabel')}>
              <LocationLabelBadge label={label} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-md p-lg">
          <h1
            className="text-headline leading-headline tracking-headline font-bold text-fg text-balance"
            {...pa('locationName')}
          >
            {name || 'Untitled location'}
          </h1>

          {address && (
            <p className="flex items-start gap-sm text-title leading-title text-fg-muted" {...pa('address')}>
              <MapPin size={18} strokeWidth={2} className="mt-1 flex-none text-brand" aria-hidden />
              <span className="text-pretty">{address}</span>
            </p>
          )}

          {detailsJson && (
            <div className="max-w-(--ot-measure) text-body leading-body text-fg-muted [&_a]:text-brand" {...pa('details')}>
              <RichText content={detailsJson} />
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
