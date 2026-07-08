import type { ComponentType, ReactNode } from 'react'
import { Phone, Mail, MapPin, Languages } from 'lucide-react'
import type { PractitionerData } from '@/lib/practitioners'
import {
  practitionerInitials,
  practitionerName,
  primaryArea,
  parseLanguages,
} from '@/lib/practitionerFormat'

type PreviewAttrs = (field: string) => Record<string, unknown>

// lucide-react in this project predates the LinkedIn brand glyph, so inline a
// minimal mark with the same prop shape as a lucide icon.
function LinkedInIcon({ size = 14, className }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.32 8.06h4.34V24H.32V8.06Zm7.13 0h4.16v2.18h.06c.58-1.1 2-2.26 4.12-2.26 4.4 0 5.22 2.9 5.22 6.67V24h-4.34v-7.06c0-1.68-.03-3.85-2.35-3.85-2.35 0-2.71 1.84-2.71 3.73V24H7.45V8.06Z" />
    </svg>
  )
}

type Props = {
  practitioner: PractitionerData
  /** Page-level contextual badge — "Accepting New Patients", etc. */
  profileLabel?: string
  /** Preview-attribute factory from getPreviewUtils — server context only. */
  pa?: PreviewAttrs
}

// SVG feTurbulence grain — desaturated, tiled. Matches the directory card/portrait
// grain so the people surfaces share one texture character. mix-blend-overlay adds
// tooth without lightening or darkening the ground beneath.
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")"

// Branded-abstract portrait surface for the no-headshot state — the same visual
// language as the directory card's fallback plate.
const PLATE_GRADIENT =
  'radial-gradient(ellipse at 40% 35%, ' +
  'oklch(from var(--ot-brand) calc(l + 0.12) c h) 0%, ' +
  'var(--ot-brand) 40%, ' +
  'oklch(from var(--ot-brand) calc(l - 0.1) c h) 100%)'

// Option A — the chromatic shadow IS the frame. The portrait floats above the
// ground, emanating a soft brand-hued light. A 1px bloom border defines the edge
// without a hard rule. Bloom tokens follow CMS theme overrides automatically.
const PORTRAIT_SHADOW =
  '0 0 0 1px var(--ot-bloom-brand-border), ' +
  '0 24px 80px var(--ot-bloom-brand-faint), ' +
  '0 8px 32px var(--ot-bloom-brand-faint)'

// ─── Contact item ───────────────────────────────────────────────────────────────

function ContactItem({
  icon: Icon,
  href,
  children,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  href?: string
  children: ReactNode
}) {
  const inner = (
    <span className="inline-flex items-center gap-xs text-fg/85">
      <Icon size={14} strokeWidth={1.75} className="flex-none text-brand" aria-hidden />
      <span className="font-mono text-sm">{children}</span>
    </span>
  )
  return href ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {inner}
    </a>
  ) : (
    inner
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────────
//
// The locked profile header — the hero of a person's profile page. Rendered by
// the slug route OUTSIDE the Visual Builder composition, so editors can never
// move or delete it and it always reflects the referenced practitioner record.
//
// Editorial split: a magazine-style portrait floats on the left over an
// atmospheric brand bloom (the glow, not a box, is the frame); the identity
// statement sits to the right with the name as the dominant typographic element.
// Stacks on narrow viewports. Stays on the canvas ground (token-derived), so it
// adapts to a CMS light/dark theme rather than pinning a single mode.

export default function PractitionerHeader({ practitioner, profileLabel, pa }: Props) {
  const p = practitioner
  const name      = practitionerName(p, false)
  const initials  = practitionerInitials(p)
  const primary   = primaryArea(p.practiceAreas)
  const languages = parseLanguages(p.languages)

  const hasContact = !!(p.phone || p.email || p.officeLocation || p.linkedIn || languages.length)

  return (
    <header className="relative overflow-hidden bg-canvas">
      {/* Atmospheric brand bloom — the portrait reads as lit from within the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 25% 50%, var(--ot-bloom-brand-faint) 0%, transparent 70%)' }}
      />
      {/* Fine grain — gives the dark ground material tooth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
        style={{ backgroundImage: NOISE_BG }}
      />

      <div className="relative mx-auto max-w-6xl px-md lg:px-xl py-12 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-lg lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] lg:gap-2xl">

          {/* ── Floating editorial portrait ── */}
          <div className="mx-auto w-full max-w-80 lg:mx-0 lg:max-w-none">
            <div
              className="@container relative aspect-3/4 w-full overflow-hidden rounded-ot-surface bg-surface"
              style={{ boxShadow: PORTRAIT_SHADOW }}
              {...pa?.('practitionerRef')}
            >
              {p.headshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.headshotUrl}
                  alt={name ? `Portrait of ${name}` : 'Practitioner portrait'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div aria-hidden className="absolute inset-0" style={{ background: PLATE_GRADIENT }}>
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12]"
                    style={{ backgroundImage: NOISE_BG }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center font-extrabold leading-none tracking-[-0.03em] text-[clamp(3rem,22cqw,5rem)]"
                    style={{ color: 'oklch(from var(--ot-fg-on-brand) l c h / 0.90)' }}
                  >
                    {initials || (
                      <svg viewBox="0 0 24 24" width="34%" height="34%" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Identity ── */}
          <div className="flex min-w-0 flex-col">
            {/* Profile label — arrives first as the eye scans; reserves no space when absent */}
            {profileLabel && (
              <span
                className="mb-md self-start inline-flex items-center rounded-ot-control bg-accent px-sm py-1 text-label font-bold uppercase tracking-label text-fg-on-accent"
                style={{ boxShadow: '0 0 0 1px var(--ot-bloom-accent-border), 0 4px 18px var(--ot-bloom-accent-faint)' }}
                {...pa?.('profileLabel')}
              >
                {profileLabel}
              </span>
            )}

            {/* Name + credentials — one typographic unit. Poppins display weight. */}
            <h1
              className="text-balance font-extrabold leading-[0.95] text-fg text-[clamp(2.5rem,5vw,4rem)]"
              style={{ letterSpacing: '-0.03em' }}
            >
              {name || 'Practitioner'}
              {p.credentials && (
                <span
                  className="font-bold"
                  style={{ fontSize: '0.65em', color: 'var(--ot-accent)', letterSpacing: '0.04em' }}
                >
                  , {p.credentials}
                </span>
              )}
            </h1>

            {/* Title — the professional role statement */}
            {p.title && (
              <p className="mt-md text-title leading-title font-semibold text-fg">{p.title}</p>
            )}

            {/* Primary practice area · facility */}
            {primary?.areaName && (
              <p className="mt-xs text-pretty text-sm text-fg-muted">
                {primary.areaName}
                {primary.facility && (
                  <>
                    <span className="mx-2 text-fg-muted/40" aria-hidden>·</span>
                    {primary.facility}
                  </>
                )}
              </p>
            )}

            {/* Contact — designed strip, divided from the identity block above */}
            {hasContact && (
              <div className="mt-lg flex flex-wrap gap-x-lg gap-y-sm border-t border-fg/8 pt-md">
                {p.phone && (
                  <ContactItem icon={Phone} href={`tel:${p.phone.replace(/[^\d+]/g, '')}`}>
                    {p.phone}
                  </ContactItem>
                )}
                {p.email && (
                  <ContactItem icon={Mail} href={`mailto:${p.email}`}>
                    {p.email}
                  </ContactItem>
                )}
                {p.officeLocation && <ContactItem icon={MapPin}>{p.officeLocation}</ContactItem>}
                {languages.length > 0 && (
                  <ContactItem icon={Languages}>{languages.join(', ')}</ContactItem>
                )}
                {p.linkedIn && (
                  <ContactItem icon={LinkedInIcon} href={p.linkedIn}>
                    LinkedIn
                  </ContactItem>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom transition — a centered brand-glow hairline that fades into the
          VB composition below, instead of a hard divider. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--ot-bloom-brand-ring), transparent)' }}
      />
    </header>
  )
}
