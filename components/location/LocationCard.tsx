import { ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { LocationData } from '@/lib/locations'
import { detailsPreview, directionsUrl } from '@/lib/locationFormat'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  location: LocationData
  density?: 'comfortable' | 'compact'
  /** Opens the shared details dialog. Omitted → no Details button (the showcase fixtures with no dialog host). */
  onOpenDetails?: (location: LocationData) => void
}

// Everything is visible without hovering: image, label, name, address, a two-line description, a Details
// button (or a link to the location's own page) and a Directions link. Compact density drops the description.
export default function LocationCard({ location: l, onOpenDetails }: Props) {
  const name = l.locationName || 'Location'
  const dir = directionsUrl(l)
  return (
    <article data-part="card" aria-labelledby={`loc-${l.key}`}>
      <div data-part="card-media"><LocationPlate src={l.imageUrl} name={name} alt="" /></div>
      <div data-part="card-body">
        {l.locationLabel && <p><LocationLabelBadge label={l.locationLabel} /></p>}
        <h3 data-part="name" id={`loc-${l.key}`}>{name}</h3>
        {l.address && <p data-part="addr"><MapPin aria-hidden strokeWidth={2} /><span>{l.address}</span></p>}
        {l.details?.html && <p data-part="details">{detailsPreview(l.details, 150)}</p>}
        <p data-part="actions">
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
      </div>
    </article>
  )
}
