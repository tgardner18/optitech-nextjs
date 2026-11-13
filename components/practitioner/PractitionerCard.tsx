import type { PractitionerCardData } from '@/lib/practitioners'
import {
  practitionerInitials,
  practitionerName,
  primaryArea,
  bioPreview,
} from '@/lib/practitionerFormat'
import { stableId } from '@/lib/stableId'
import PractitionerPortrait from './PractitionerPortrait'

type Props = {
  practitioner: PractitionerCardData
  /** Kept for API parity with the row; the portrait card carries its own dark context. */
  onSurface?: boolean
  density?: 'comfortable' | 'compact'
  /** Optional contextual badge ("Accepting New Patients", …). Not present in the listing context. */
  profileLabel?: string
}

// Portrait-first directory card (styled by practitioner-listing.css). The headshot, or its branded
// fallback, IS the card face. The name is the link and stretches over the whole card, so assistive
// tech reads name, role, specialty, and bio rather than only "View profile". The footer slides up
// to reveal the bio on hover, on keyboard focus, and always on touch screens.
// data-theme="dark" pins the footer to light-on-dark regardless of the page theme: it sits over a photo.

export default function PractitionerCard({ practitioner, profileLabel }: Props) {
  const p        = practitioner
  const name     = practitionerName(p, false) || 'Practitioner'
  const initials = practitionerInitials(p)
  const primary  = primaryArea(p.practiceAreas)
  const bio      = bioPreview(p.bio, 160)
  const id       = stableId('pr', p.key)

  return (
    <article data-part="card" data-theme="dark" aria-labelledby={id}>
      <PractitionerPortrait src={p.headshotUrl} initials={initials} />
      <span data-part="vignette" aria-hidden="true" />

      {profileLabel && (
        <span
          className="absolute left-0 top-4 z-20 px-2 py-0.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.08em]"
          style={{ background: 'var(--ot-accent)', color: 'var(--ot-fg-on-accent)' }}
        >
          {profileLabel}
        </span>
      )}

      <div data-part="foot">
        <h3 id={id} data-part="name">
          {p.url ? <a href={p.url} data-part="link">{name}</a> : name}
          {p.credentials && <span data-part="cred">, {p.credentials}</span>}
        </h3>
        {p.title && <p data-part="role">{p.title}</p>}
        {primary?.areaName && <p data-part="area">{primary.areaName}</p>}
        {bio && <p data-part="bio">{bio}</p>}
      </div>
    </article>
  )
}
