import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { BrandMark } from '@/components/layout/BrandMark'
import {
  getFooterStyles,
  footerSurfaceAttrs,
  type FooterBackground,
} from '@/cms/styling/OT_FooterBlock.styling'

// Normalized, layout-agnostic footer data. Resolved once, then handed to the
// chosen layout sub-component below.
type FooterLink = { label: string; href: string }
type FooterView = {
  siteName: string
  logoSrc?: string
  logoAlt: string
  logoInvert: boolean
  logoSizeClass: string
  descriptionHtml: string | null
  links: FooterLink[]
  year: number
  background: FooterBackground
  surfaceAttrs: ReturnType<typeof footerSurfaceAttrs>
}

// Shared rich-text element styling. <em> colour is handled by the `.footer-prose`
// rules in globals.css (accent on dark/brand, accent-hover on light).
const PROSE =
  'footer-prose [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-fg ' +
  '[&_a]:text-fg-muted [&_a]:underline [&_a]:decoration-fg/20 ' +
  '[&_a:hover]:text-fg [&_a:hover]:decoration-fg/50 transition-colors duration-150'

// Top hairline gradient. On a brand surface the brand stop vanishes into the
// teal, so it centres on accent instead.
function topBarBg(background: FooterBackground): string {
  return background === 'brand'
    ? 'linear-gradient(to right, transparent, var(--ot-accent) 50%, transparent)'
    : 'linear-gradient(to right, transparent, var(--ot-brand) 20%, var(--ot-accent) 80%, transparent)'
}

function FooterLogo({ view, className }: { view: FooterView; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${view.logoAlt} — Home`}
      className={cn(
        'inline-flex items-center hover:opacity-80 transition-opacity duration-200 ease-quick',
        className,
      )}
      style={{ filter: 'drop-shadow(0 4px 16px var(--ot-bloom-brand-faint))' }}
    >
      {view.logoSrc ? (
        <Image
          src={view.logoSrc}
          alt={view.logoAlt}
          width={444}
          height={90}
          className={cn(view.logoSizeClass, view.logoInvert && 'logo-invert-dark')}
        />
      ) : (
        <BrandMark name={view.siteName} size="lg" className="text-fg" />
      )}
    </Link>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
 * Spotlight — the original asymmetric, branded layout. Background tints only the
 * left (logo) zone; the right link panel stays brand. Unchanged structurally;
 * the left zone's tone now comes from the generalized background field.
 * ════════════════════════════════════════════════════════════════════════════ */
function SpotlightFooter({ view }: { view: FooterView }) {
  const { surfaceAttrs, background, links, descriptionHtml, year } = view

  // In brand mode both zones are teal, so lift the canvas zone a touch above
  // brand-hover to keep the diagonal seam readable; otherwise use the surface canvas.
  const canvasLayerBg =
    background === 'brand'
      ? 'oklch(from var(--ot-brand-hover) calc(l + 0.07) c h)'
      : 'var(--ot-canvas)'

  return (
    <footer className="relative overflow-hidden isolate" data-theme="dark">

      {/* Top gradient bar */}
      <div aria-hidden className="h-px" style={{ background: topBarBg(background) }} />

      {/* z-0: brand-hover base fills everything */}
      <div aria-hidden className="absolute inset-0" style={{ zIndex: 0, background: 'var(--ot-brand-hover)' }} />

      {/* z-1: canvas panel — masked right edge dissolves into the brand side */}
      <div
        aria-hidden
        {...surfaceAttrs}
        className="hidden lg:block absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: canvasLayerBg,
          clipPath: 'polygon(0 0, 74% 0, calc(74% - 5rem) 100%, 0 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.80) 57%, rgba(0,0,0,0.50) 63%, rgba(0,0,0,0.18) 68%, transparent 73%)',
          maskImage:
            'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.80) 57%, rgba(0,0,0,0.50) 63%, rgba(0,0,0,0.18) 68%, transparent 73%)',
          filter: 'drop-shadow(12px 0 44px oklch(4% 0.005 195 / 0.65))',
        }}
      />

      {/* z-3: right-column elevation */}
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

      {/* z-4: ambient bloom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          backgroundImage:
            'radial-gradient(ellipse 50% 80% at 90% 115%, var(--ot-bloom-brand-faint) 0%, transparent 65%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row" style={{ zIndex: 10 }}>

        {/* Left: canvas — logo + description + copyright */}
        <div {...surfaceAttrs} className="bg-canvas lg:bg-transparent lg:w-[62%] flex flex-col justify-center px-md py-md lg:px-lg lg:py-lg lg:pr-20">

          <FooterLogo view={view} />

          {descriptionHtml && (
            <div
              className={cn(PROSE, 'mt-sm max-w-(--ot-measure-tight) text-body leading-body text-fg-muted [&_p+p]:mt-[0.5em]')}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}

          <p className="text-label tracking-label uppercase text-fg-muted/60 mt-sm">
            © {year}
          </p>

        </div>

        {/* Right: brand — nav links, right-aligned */}
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

/* ════════════════════════════════════════════════════════════════════════════
 * Centered — calm, symmetrical, single-surface column. Background tints the whole
 * footer. Description reads as a statement (subhead scale).
 * ════════════════════════════════════════════════════════════════════════════ */
function CenteredFooter({ view }: { view: FooterView }) {
  const { surfaceAttrs, background, links, descriptionHtml, year, siteName } = view

  return (
    <footer {...surfaceAttrs} className="relative overflow-hidden isolate bg-canvas">

      {/* Top gradient bar */}
      <div aria-hidden className="h-px" style={{ background: topBarBg(background) }} />

      {/* Ambient bloom, bottom-centre — reads as depth on dark/brand, invisible on light */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            'radial-gradient(ellipse 50% 60% at 50% 115%, var(--ot-bloom-brand-faint) 0%, transparent 70%)',
        }}
      />

      {/* Main area. Arbitrary px width — the named max-w-* scale is broken in this
          Tailwind v4 setup (collapses to a few px); the repo uses max-w-[Npx]/[Nch]. */}
      <div className="relative z-10 mx-auto max-w-[640px] px-md py-lg lg:py-xl flex flex-col items-center text-center">

        <FooterLogo view={view} />

        {descriptionHtml && (
          <div
            className={cn(PROSE, 'mt-sm text-body leading-body text-balance text-fg-muted max-w-[58ch] [&_p+p]:mt-[0.5em]')}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}

        {links.length > 0 && (
          <nav aria-label="Footer navigation" className="mt-md">
            <ul className="flex flex-wrap items-center justify-center gap-y-2">
              {links.map((link, i) => (
                <li key={link.label} className="flex items-center">
                  <Link
                    href={link.href}
                    className="text-[0.9375rem] font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline transition-colors duration-200 ease-quick"
                  >
                    {link.label}
                  </Link>
                  {i < links.length - 1 && (
                    <span aria-hidden className="mx-3 select-none text-fg-muted/30">·</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

      </div>

      {/* Brand bottom bar — anchors the footer with the brand color. Uses fixed
          brand tokens + fg-on-brand so it stays legible on any Footer Background;
          a faint top rule separates it when the surface itself is Brand. */}
      <div className="relative z-10 bg-brand-hover border-t border-fg-on-brand/10">
        <p className="mx-auto max-w-[1120px] px-md py-sm text-center text-label tracking-label uppercase text-fg-on-brand/85">
          © {year} {siteName}
        </p>
      </div>

    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
 * Minimal — compact single-row footer. No description (kept slim by design).
 * Logo left, links right, hairline, then copyright. Background tints the surface.
 * ════════════════════════════════════════════════════════════════════════════ */
function MinimalFooter({ view }: { view: FooterView }) {
  const { surfaceAttrs, background, links, year } = view

  return (
    <footer {...surfaceAttrs} className="relative overflow-hidden isolate bg-canvas">

      {/* Top gradient bar */}
      <div aria-hidden className="h-px" style={{ background: topBarBg(background) }} />

      <div className="relative z-10 px-md py-md lg:px-lg">

        <div className="flex flex-col gap-y-sm sm:flex-row sm:items-center sm:justify-between">

          <FooterLogo view={view} />

          {links.length > 0 && (
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-x-md gap-y-xs sm:justify-end">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline transition-colors duration-200 ease-quick"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

        </div>

        <p className="text-label tracking-label uppercase text-fg-muted/60 mt-sm pt-sm border-t border-fg/10">
          © {year}
        </p>

      </div>

    </footer>
  )
}

export default async function Footer() {
  const settings = await getSiteSettings(await getRequestDomain(), await getRequestLocale())

  const siteName        = (settings?.siteName as string | undefined) ?? 'Site Accelerator'
  const themeLogoSrc    = settings?.logo?.url?.default as string | undefined
  const logoAlt         = settings?.logoAlt ?? siteName
  const themeLogoInvert = settings?.logoInvertDark === true

  const footerRef          = (settings?.footerRef?.item ?? settings?.footerRef) as any | undefined
  const footerLogoOverride = footerRef?.footerLogo?.url?.default as string | undefined
  const footerLogoSrc      = footerLogoOverride ?? themeLogoSrc
  const footerLogoInvert   = footerLogoOverride !== undefined
                               ? footerRef?.footerLogoInvertDark === true
                               : themeLogoInvert
  const footerLogoSize     = (footerRef?.footerLogoSize as string | undefined) ?? 'md'

  // Two independent axes — layout structure and background tone — resolved with
  // safe fallbacks. Background is applied as a scoped colour context so the
  // footer pins its own tone regardless of the site's light/dark mode.
  const { style, background } = getFooterStyles(footerRef)
  const surfaceAttrs = footerSurfaceAttrs(background)

  const FOOTER_LOGO_SIZE: Record<string, string> = {
    sm: 'max-h-8 w-auto',
    md: 'max-h-10 w-auto',
    lg: 'max-h-14 w-auto',
    xl: 'max-h-20 w-auto',
  }
  const logoSizeClass = FOOTER_LOGO_SIZE[footerLogoSize] ?? FOOTER_LOGO_SIZE.md

  const descriptionHtml = (footerRef?.description?.html as string | undefined) ?? null

  const links: FooterLink[] = Array.isArray(footerRef?.links)
    ? (footerRef.links as any[])
        .map(l => ({ label: (l.label as string) ?? '', href: (l.url?.default as string) ?? '#' }))
        .filter(l => l.label)
        .slice(0, 5)
    : []

  const view: FooterView = {
    siteName,
    logoSrc: footerLogoSrc,
    logoAlt,
    logoInvert: footerLogoInvert,
    logoSizeClass,
    descriptionHtml,
    links,
    year: new Date().getFullYear(),
    background,
    surfaceAttrs,
  }

  switch (style) {
    case 'centered': return <CenteredFooter view={view} />
    case 'minimal':  return <MinimalFooter view={view} />
    default:         return <SpotlightFooter view={view} />
  }
}
