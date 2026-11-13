// Portrait surface for the directory card and row: the headshot when present, otherwise a branded
// fallback (brand-derived gradient + initials), styled by practitioner-listing.css. No hooks.

type Props = {
  src?:     string
  initials: string
}

export default function PractitionerPortrait({ src, initials }: Props) {
  return (
    <span data-part="portrait">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" />
      ) : (
        <span data-part="initials" aria-hidden="true">
          {initials || (
            <svg viewBox="0 0 24 24" width="36%" height="36%" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          )}
        </span>
      )}
    </span>
  )
}
