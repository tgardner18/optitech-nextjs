'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, MapPin, X } from 'lucide-react'
import type { LocationData } from '@/lib/locations'
import { directionsUrl } from '@/lib/locationFormat'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  /** null renders nothing: the parent keeps this mounted and swaps `location` in and out. */
  location: LocationData | null
  onClose:  () => void
}

// The shared full-detail dialog, opened from the map popup, the card and the row. Portaled to the body (so it is
// styled by data-lo-dialog in location-listing.css). Focus moves in on open, returns to the trigger on close,
// Tab cycles inside it, and Escape or a click outside closes it.
export default function LocationDetailsModal({ location, onClose }: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<Element | null>(null)
  const open = !!location

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement
    else (triggerRef.current as HTMLElement | null)?.focus?.()
  }, [open])

  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus())
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!focusables || focusables.length === 0) return
      const first = focusables[0], last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const name = location.locationName || 'Location'
  const dir = directionsUrl(location)
  const host = document.querySelector<HTMLElement>('[data-theme]')?.dataset.theme

  return createPortal(
    <div data-lo-dialog="" data-theme={host} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div data-part="dialog" ref={dialogRef} onClick={e => e.stopPropagation()}>
        <button type="button" data-part="pop-x" data-autofocus onClick={onClose} aria-label="Close location details"><X aria-hidden strokeWidth={2} /></button>
        <div data-part="dialog-media"><LocationPlate src={location.imageUrl} name={name} alt="" /></div>
        <div data-part="dialog-body">
          {location.locationLabel && <LocationLabelBadge label={location.locationLabel} />}
          <h2 id={titleId} data-part="dialog-title">{name}</h2>
          {location.address && <p data-part="addr"><MapPin aria-hidden strokeWidth={2} /><span>{location.address}</span></p>}
          {location.details?.html && <div data-rich-text="" data-size="compact" dangerouslySetInnerHTML={{ __html: location.details.html }} />}
          {dir && (
            <a href={dir} target="_blank" rel="noopener noreferrer" data-part="dir">
              Directions<ExternalLink aria-hidden strokeWidth={2} />
              <span className="sr-only"> to {name} (opens Google Maps in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
