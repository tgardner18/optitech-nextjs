import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'

/**
 * Footer — driven by OT_FooterBlock via ThemeManager.footerRef.
 *
 * Layout:
 *   [2px gradient bar]
 *   [two-column main: left = angled brand panel + prominent logo + description;
 *                     right = nav links, separated by a skewed brand divider]
 *   [bottom strip — year]
 *
 * Depth: clip-path parallelogram on the left panel, skewed column divider,
 *        45° diagonal line texture, bottom-right bloom.
 */
export default async function Footer() {
  const settings = await getSiteSettings(await getRequestDomain(), await getRequestLocale())

  // ── Logo ──────────────────────────────────────────────────────────────────
  // ThemeManager logo is the site-wide default. FooterBlock can override it with
  // a dedicated logo (e.g. icon mark in the footer, full wordmark in the header).
  const themeLogoSrc      = settings?.logo?.url?.default ?? '/brand/logo/optitech-icon.svg'
  const logoAlt           = settings?.logoAlt ?? 'OptiTech'
  const themeLogoInvert   = settings?.logoInvertDark === true

  // ── Footer block data ─────────────────────────────────────────────────────
  const footerRef         = (settings?.footerRef?.item ?? settings?.footerRef) as any | undefined

  // Footer-specific logo: overrides the ThemeManager logo when set.
  // Inversion: when the footer has its own logo, use its own invert flag;
  // when falling back to the theme logo, respect the theme's invert setting.
  const footerLogoOverride = footerRef?.footerLogo?.url?.default as string | undefined
  const footerLogoSrc      = footerLogoOverride ?? themeLogoSrc
  const footerLogoInvert   = footerLogoOverride !== undefined
                             ? footerRef?.footerLogoInvertDark === true
                             : themeLogoInvert
  const footerLogoSize    = (footerRef?.footerLogoSize as string | undefined) ?? 'md'

  // Size → CSS class. Controls display height; width is auto (preserves aspect ratio).
  const FOOTER_LOGO_SIZE: Record<string, string> = {
    sm: 'max-h-10 w-auto',
    md: 'max-h-14 w-auto',
    lg: 'max-h-20 w-auto',
    xl: 'max-h-28 w-auto',
  }
  const logoImgClass = [
    FOOTER_LOGO_SIZE[footerLogoSize] ?? FOOTER_LOGO_SIZE.md,
    footerLogoInvert ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  // ── Footer block data ─────────────────────────────────────────────────────
  const descriptionHtml = (footerRef?.description?.html as string | undefined) ?? null

  type FooterLink = { label: string; href: string }
  const links: FooterLink[] = Array.isArray(footerRef?.links)
    ? (footerRef.links as any[])
        .map(l => ({ label: (l.label as string) ?? '', href: (l.url?.default as string) ?? '#' }))
        .filter(l => l.label)
        .slice(0, 10)
    : []

  const twoColumnLinks = links.length > 5
  const year           = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden isolate bg-canvas">

      {/* ── 2px gradient horizon — brand → accent ──────────────────────────── */}
      <div
        aria-hidden
        className="h-0.5"
        style={{
          background: 'linear-gradient(to right, transparent, var(--ot-brand) 20%, var(--ot-accent) 80%, transparent)',
        }}
      />

      {/* ── 45° diagonal line texture — matches extrude shadow direction ──── */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage:
            'repeating-linear-gradient(45deg, oklch(from var(--ot-brand) l c h / 0.04) 0px, oklch(from var(--ot-brand) l c h / 0.04) 1px, transparent 1px, transparent 52px)',
        }}
      />

      {/* ── Bottom-right ambient bloom ────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage:
            'radial-gradient(ellipse 60% 90% at 92% 110%, var(--ot-bloom-brand-faint) 0%, transparent 65%)',
        }}
      />

      {/* ── Main content — two columns ────────────────────────────────────────
           Left (logo + description) and right (nav) sit side-by-side at lg+.
           Below lg they stack: logo first, then links. ──────────────────── */}
      <div className="relative flex flex-col lg:flex-row min-h-65" style={{ zIndex: 1 }}>

        {/* ── Left column — logo anchor zone ─────────────────────────────── */}
        <div className="relative lg:w-[58%] flex flex-col justify-center px-md py-xl lg:px-lg lg:pr-24">

          {/* Angled brand panel — parallelogram: straight left edge,
               diagonal right edge. The cut angle matches the extrude depth
               direction, making both effects part of the same visual system. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 5rem) 100%, 0 100%)',
              background: 'linear-gradient(120deg, oklch(from var(--ot-brand) l c h / 0.18) 0%, oklch(from var(--ot-brand) l c h / 0.04) 100%)',
            }}
          />

          {/* Logo — primary focal point */}
          <Link
            href="/"
            aria-label={`${logoAlt} — Home`}
            className="relative inline-flex items-center hover:opacity-80 transition-opacity duration-200 ease-quick"
            style={{
              filter: 'drop-shadow(0 6px 24px var(--ot-bloom-brand-faint))',
            }}
          >
            <Image
              src={footerLogoSrc}
              alt={logoAlt}
              width={444}
              height={90}
              className={logoImgClass}
            />
          </Link>

          {/* Description */}
          {descriptionHtml && (
            <div
              className="
                relative mt-lg max-w-[46ch]
                text-[0.9375rem] leading-[1.65] text-fg-muted
                [&_p]:m-0
                [&_p+p]:mt-[0.75em]
                [&_strong]:font-semibold [&_strong]:text-fg
                [&_em]:not-italic [&_em]:text-accent
                [&_a]:text-fg-muted [&_a]:underline [&_a]:decoration-fg/20
                [&_a:hover]:text-fg [&_a:hover]:decoration-fg/50
                transition-colors duration-150
              "
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}
        </div>

        {/* ── Skewed column divider — 2px brand→accent gradient stripe ──────
             skewX pulls the top of the line left, giving the separator the
             same diagonal direction as the panel edge and the texture lines. */}
        {links.length > 0 && (
          <div
            aria-hidden
            className="hidden lg:block absolute top-0 bottom-0 pointer-events-none"
            style={{
              width: '2px',
              left: '58%',
              transform: 'skewX(-4deg)',
              transformOrigin: 'top center',
              background: 'linear-gradient(to bottom, transparent 0%, var(--ot-brand) 25%, var(--ot-accent) 75%, transparent 100%)',
              opacity: 0.35,
            }}
          />
        )}

        {/* ── Right column — navigation ───────────────────────────────────── */}
        {links.length > 0 && (
          <div className="relative lg:w-[42%] flex flex-col justify-center px-md py-xl lg:px-lg border-t border-fg/8 lg:border-t-0">
            {links.length >= 3 && (
              <p className="text-label tracking-label uppercase text-fg-muted/40 font-semibold mb-md">
                Navigation
              </p>
            )}
            <nav aria-label="Footer navigation">
              <ul className={`grid grid-cols-1 gap-y-xs ${twoColumnLinks ? 'sm:grid-cols-2 gap-x-xl' : ''}`}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-label tracking-label uppercase text-fg-muted hover:text-fg transition-colors duration-150 ease-quick"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

      </div>

      {/* ── Bottom strip — year mark ──────────────────────────────────────────
           Minimal. The logo above already provides the brand close. ──────── */}
      <div
        className="relative border-t border-fg/8 px-md lg:px-lg py-sm flex items-center justify-between"
        style={{ zIndex: 1 }}
      >
        <p className="text-label text-brand/40 tracking-label uppercase">{year}</p>
      </div>

    </footer>
  )
}
