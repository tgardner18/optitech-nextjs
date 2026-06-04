import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'

export default async function Footer() {
  const settings = await getSiteSettings(await getRequestDomain(), await getRequestLocale())

  const themeLogoSrc    = settings?.logo?.url?.default ?? '/brand/logo/optitech-icon.svg'
  const logoAlt         = settings?.logoAlt ?? 'OptiTech'
  const themeLogoInvert = settings?.logoInvertDark === true

  const footerRef          = (settings?.footerRef?.item ?? settings?.footerRef) as any | undefined
  const footerLogoOverride = footerRef?.footerLogo?.url?.default as string | undefined
  const footerLogoSrc      = footerLogoOverride ?? themeLogoSrc
  const footerLogoInvert   = footerLogoOverride !== undefined
                               ? footerRef?.footerLogoInvertDark === true
                               : themeLogoInvert
  const footerLogoSize     = (footerRef?.footerLogoSize as string | undefined) ?? 'md'

  const FOOTER_LOGO_SIZE: Record<string, string> = {
    sm: 'max-h-8 w-auto',
    md: 'max-h-10 w-auto',
    lg: 'max-h-14 w-auto',
    xl: 'max-h-20 w-auto',
  }
  const logoSizeClass = FOOTER_LOGO_SIZE[footerLogoSize] ?? FOOTER_LOGO_SIZE.md

  const descriptionHtml = (footerRef?.description?.html as string | undefined) ?? null

  type FooterLink = { label: string; href: string }
  const links: FooterLink[] = Array.isArray(footerRef?.links)
    ? (footerRef.links as any[])
        .map(l => ({ label: (l.label as string) ?? '', href: (l.url?.default as string) ?? '#' }))
        .filter(l => l.label)
        .slice(0, 5)
    : []

  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden isolate" data-theme="dark">

      {/* Top gradient bar */}
      <div
        aria-hidden
        className="h-px"
        style={{
          background: 'linear-gradient(to right, transparent, var(--ot-brand) 20%, var(--ot-accent) 80%, transparent)',
        }}
      />

      {/* ── Background layers (absolute, stacked) ──────────────────────────────
       *
       * z-0  brand-hover fills everything (right side base)
       * z-1  canvas panel: clip-path extends past the mist zone; CSS mask creates
       *      a soft angled right edge that dissolves into the brand colour below.
       *      drop-shadow renders on the masked alpha edge → diffused depth shadow.
       * z-2  accent rim — thin crisp parallelogram at the diagonal spine
       * z-3  right-side elevation — subtle top-lit gradient makes the brand panel
       *      appear slightly raised above the canvas side
       * z-4  ambient brand bloom
       *
       * ─────────────────────────────────────────────────────────────────────── */}

      {/* z-0 */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ zIndex: 0, background: 'var(--ot-brand-hover)' }}
      />

      {/* z-1: Canvas panel — masked right edge creates the mist/dissolve blend */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'var(--ot-canvas)',
          /* Clip to a polygon wider than the visual diagonal so the mask has room to fade */
          clipPath: 'polygon(0 0, 74% 0, calc(74% - 5rem) 100%, 0 100%)',
          /* Mask gradient: solid canvas → soft dissolve into brand side */
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.80) 57%, rgba(0,0,0,0.50) 63%, rgba(0,0,0,0.18) 68%, transparent 73%)',
          maskImage:
            'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.80) 57%, rgba(0,0,0,0.50) 63%, rgba(0,0,0,0.18) 68%, transparent 73%)',
          /* drop-shadow follows the mask's alpha edge — produces a soft depth shadow on the brand side */
          filter: 'drop-shadow(12px 0 44px oklch(4% 0.005 195 / 0.65))',
        }}
      />

      {/* z-3: Right-column elevation — lighter top edge, makes brand side look raised */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            'linear-gradient(to bottom, oklch(from var(--ot-brand-hover) calc(l + 0.10) c h / 0.50) 0%, transparent 60%)',
          clipPath: 'polygon(61% 0, 100% 0, 100% 100%, calc(61% - 5rem) 100%)',
        }}
      />

      {/* z-4: Ambient bloom on brand side */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          backgroundImage:
            'radial-gradient(ellipse 50% 80% at 90% 115%, var(--ot-bloom-brand-faint) 0%, transparent 65%)',
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      {/*
       * Mobile: columns stack vertically, each carries its own background colour.
       * Desktop (lg:): both columns are transparent — the absolute panels above
       * show through. Left column naturally sits over the canvas region;
       * right column sits over the brand-hover region.
       */}
      <div className="relative flex flex-col lg:flex-row" style={{ zIndex: 10 }}>

        {/* ── Left: canvas — logo + description + copyright ──────────────────── */}
        <div className="bg-canvas lg:bg-transparent lg:w-[62%] flex flex-col justify-center px-md py-md lg:px-lg lg:py-lg lg:pr-20">

          <Link
            href="/"
            aria-label={`${logoAlt} — Home`}
            className="inline-flex items-center hover:opacity-80 transition-opacity duration-200 ease-quick"
            style={{ filter: 'drop-shadow(0 4px 16px var(--ot-bloom-brand-faint))' }}
          >
            <Image
              src={footerLogoSrc}
              alt={logoAlt}
              width={444}
              height={90}
              className={logoSizeClass}
              style={footerLogoInvert ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
          </Link>

          {descriptionHtml && (
            <div
              className="mt-sm max-w-[58ch] text-[0.875rem] leading-relaxed text-fg-muted [&_p]:m-0 [&_p+p]:mt-[0.5em] [&_strong]:font-semibold [&_strong]:text-fg [&_em]:not-italic [&_em]:text-accent [&_a]:text-fg-muted [&_a]:underline [&_a]:decoration-fg/20 [&_a:hover]:text-fg [&_a:hover]:decoration-fg/50 transition-colors duration-150"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}

          <p className="text-label tracking-label uppercase text-fg-muted/60 mt-sm">
            © {year}
          </p>

        </div>

        {/* ── Right: brand — nav links, right-aligned ─────────────────────────── */}
        <div className="bg-brand-hover lg:bg-transparent lg:w-[38%] flex flex-col justify-center items-end px-md py-md lg:px-lg lg:py-lg border-t border-accent/20 lg:border-t-0">

          {links.length > 0 && (
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-y-3 items-end">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] font-medium text-fg-on-brand/80 underline-offset-2 hover:text-fg-on-brand hover:underline decoration-fg-on-brand/30 transition-all duration-200 ease-quick"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

        </div>

      </div>

    </footer>
  )
}
