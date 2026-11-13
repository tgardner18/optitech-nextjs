import { Phone, Mail, ChevronRight } from 'lucide-react'
import type { PractitionerCardData } from '@/lib/practitioners'
import {
  practitionerInitials,
  practitionerName,
  primaryArea,
} from '@/lib/practitionerFormat'
import { stableId } from '@/lib/stableId'
import PractitionerPortrait from './PractitionerPortrait'

type Props = {
  practitioner: PractitionerCardData
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
}

// Directory row (styled by practitioner-listing.css). The name is the link and stretches over the
// row; phone and email are real tel: / mailto: links layered above it.

export default function PractitionerListRow({ practitioner }: Props) {
  const p        = practitioner
  const name     = practitionerName(p, false) || 'Profile'
  const initials = practitionerInitials(p)
  const primary  = primaryArea(p.practiceAreas)
  const id       = stableId('prr', p.key)

  return (
    <article data-part="row" aria-labelledby={id}>
      <PractitionerPortrait src={p.headshotUrl} initials={initials} />

      <div data-part="row-body">
        <h3 id={id} data-part="name">
          {p.url ? <a href={p.url} data-part="link">{name}</a> : name}
          {p.credentials && <span data-part="cred">{p.credentials}</span>}
        </h3>
        {p.title && <p data-part="role">{p.title}</p>}
        {primary?.areaName && (
          <p data-part="area-line">
            {primary.areaName}
            {primary.facility && <><span aria-hidden="true">·</span>{primary.facility}</>}
          </p>
        )}
        {(p.phone || p.email) && (
          <p data-part="contact">
            {p.phone && (
              <a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`} data-part="contact-link">
                <Phone size={14} strokeWidth={2} aria-hidden />{p.phone}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} data-part="contact-link">
                <Mail size={14} strokeWidth={2} aria-hidden /><span>{p.email}</span>
              </a>
            )}
          </p>
        )}
      </div>

      {p.url && <span data-part="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2} /></span>}
    </article>
  )
}
