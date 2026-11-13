import { MapPin } from 'lucide-react'
import { locationInitials } from '@/lib/locationFormat'

// Image surface shared by the card, row, rail thumbnail, popup and dialog: the location's image when present,
// otherwise a brand-derived plate with a pin and the location's initials (styled in location-listing.css).
// No hooks, so it is safe in server and client trees. The parent supplies the box (position: relative + size).
type Props = {
  src?:       string
  name:       string
  alt?:       string
  shape?:     'fill'
  className?: string
  /** Kept for existing callers; the card no longer zooms on hover. */
  hoverZoom?: boolean
  /** Small thumbnails drop the initials. */
  size?:      'sm' | 'md'
}

export default function LocationPlate({ src, name, alt, size = 'md', className }: Props) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? name ?? 'Location'} loading="lazy" className={className} />
  }
  return (
    <span data-part="plate" data-sm={size === 'sm' ? '' : undefined} aria-hidden="true" className={className}>
      <MapPin strokeWidth={1.75} />
      <b>{locationInitials(name)}</b>
    </span>
  )
}
