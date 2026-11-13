import { ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { LocationData } from '@/lib/locations'
import { detailsPreview, directionsUrl } from '@/lib/locationFormat'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
  onOpenDetails?: (location: LocationData) => void
}

export default function LocationListRow({ location: l, density = 'comfortable', onOpenDetails }: Props) {
  const name = l.locationName || 'Location'
  const dir = directionsUrl(l)
  return (
    <article data-part="row" aria-labelledby={`locr-${l.key}`}>
      <div data-part="row-media"><LocationPlate src={l.imageUrl} name={name} alt="" size="sm" /></div>
      <div data-part="row-body">
        <p data-part="row-head"><span data-part="name" id={`locr-${l.key}`}>{name}</span>{l.locationLabel && <LocationLabelBadge label={l.locationLabel} />}</p>
        {l.address && <p data-part="addr"><MapPin aria-hidden strokeWidth={2} /><span>{l.address}</span></p>}
        {density !== 'compact' && l.details?.html && <p data-part="details">{detailsPreview(l.details, 120)}</p>}
      </div>
      <p data-part="row-actions">
        {l.url ? (
          <Link href={l.url} data-part="more">View location<span className="sr-only"> {name}</span></Link>
        ) : onOpenDetails ? (
          <button type="button" data-part="more" onClick={() => onOpenDetails(l)}>Details<span className="sr-only"> for {name}</span></button>
        ) : null}
        {dir && (
          <a href={dir} target="_blank" rel="noopener noreferrer" data-part="dir">
            Directions<ExternalLink aria-hidden strokeWidth={2} />
            <span className="sr-only"> to {name} (opens Google Maps in a new tab)</span>
          </a>
        )}
      </p>
    </article>
  )
}
