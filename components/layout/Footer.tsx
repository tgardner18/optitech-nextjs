import Link from 'next/link'
import Image from 'next/image'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'
import { getClient, getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { BrandMark } from '@/components/layout/BrandMark'
import Button from '@/components/ui/Button'
import { normalizeNavHref } from '@/components/layout/Header'
import { resolveCmsUrl } from '@/lib/resolveCmsUrl'
import {
  getFooterStyles,
  footerSurfaceAttrs,
  type FooterBackground,
  type FooterStyle,
} from '@/cms/styling/OT_FooterBlock.styling'

// Normalized, layout-agnostic footer data. Resolved once, then handed to the
// chosen layout below. Visuals live in components/layout/site-footer.css,
// keyed on data-block / data-style / data-surface / data-part.
type FooterLink = { label: string; href: string }
type FooterColumn = { title: string; links: FooterLink[] }
type FooterView = {
  style: FooterStyle
  siteName: string
  logoSrc?: string
  logoAlt: string
  logoInvert: boolean
  logoHeight: string
  descriptionHtml: string | null
  links: FooterLink[]
  columns: FooterColumn[]
  legal: string
  background: FooterBackground
  surfaceAttrs: ReturnType<typeof footerSurfaceAttrs>
  cta: { label: string; href: string } | null
}

// Footer Logo Size → the logo's max height.
const FOOTER_LOGO_H: Record<string, string> = { sm: '2rem', md: '2.5rem', lg: '3.5rem', xl: '5rem' }

function FooterLogo({ view }: { view: FooterView }) {
  return (
    <Link href="/" data-part="logo" aria-label={`${view.logoAlt}, home`}>
      {view.logoSrc ? (
        <Image
          src={view.logoSrc}
          alt={view.logoAlt}
          width={444}
          height={90}
          data-invert={view.logoInvert ? '' : undefined}
        />
      ) : (
        <BrandMark name={view.siteName} size="lg" className="text-fg" />
      )}
    </Link>
  )
}

function FooterLinks({ links, part = 'links' }: { links: FooterLink[]; part?: string }) {
  if (!links.length) return null
  return (
    <ul data-part={part} data-wrap={part === 'links' && links.length > 5 ? '' : undefined}>
      {links.map(l => (
        <li key={l.href + l.label}>
          <Link data-part={part === 'chips' ? 'chip' : 'link'} href={l.href}>{l.label}</Link>
        </li>
      ))}
    </ul>
  )
}

function Desc({ html }: { html: string | null }) {
  if (!html) return null
  return <div data-part="desc" dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }} />
}

function FooterShell({ view, children }: { view: FooterView; children: React.ReactNode }) {
  return (
    <footer
      data-block="site-footer"
      data-style={view.style}
      data-surface={view.background}
      {...view.surfaceAttrs}
      style={{ ['--ft-logo-h' as string]: view.logoHeight }}
    >
      <span data-part="rule" aria-hidden="true" />
      {children}
    </footer>
  )
}

/* Spotlight: Stage grid texture with a travelling lit sweep, and a three-hue chromatic bloom
 * rising from the bottom edge. The Theme Manager CTA is the footer's action. */
function SpotlightFooter({ view }: { view: FooterView }) {
  const { links, descriptionHtml, legal, cta, background } = view
  return (
    <FooterShell view={view}>
      <div data-part="scene" aria-hidden="true"><span data-part="grid" /><span data-part="bloom" /><span data-part="glow" /></div>
      <div data-part="in">
        <div data-part="lead"><FooterLogo view={view} /><Desc html={descriptionHtml} /></div>
        <div data-part="act">
          {cta && <Button href={cta.href} size="sm" variant={background === 'brand' ? 'ghost' : 'brand'}>{cta.label}</Button>}
          {links.length > 0 && <nav aria-label="Footer"><FooterLinks links={links} part="chips" /></nav>}
        </div>
      </div>
      <div data-part="bar">
        <p data-part="legal">{legal}</p>
      </div>
    </FooterShell>
  )
}

function CenteredFooter({ view }: { view: FooterView }) {
  return (
    <FooterShell view={view}>
      <div data-part="in">
        <FooterLogo view={view} />
        <Desc html={view.descriptionHtml} />
        {view.links.length > 0 && <nav aria-label="Footer"><FooterLinks links={view.links} /></nav>}
      </div>
      <div data-part="bar"><p data-part="legal">{view.legal}</p></div>
    </FooterShell>
  )
}

function MinimalFooter({ view }: { view: FooterView }) {
  return (
    <FooterShell view={view}>
      <div data-part="in">
        <FooterLogo view={view} />
        {view.links.length > 0 && <nav aria-label="Footer"><FooterLinks links={view.links} /></nav>}
        <p data-part="legal">{view.legal}</p>
      </div>
    </FooterShell>
  )
}

function ColumnsFooter({ view }: { view: FooterView }) {
  const { columns, links } = view
  // No columns authored yet → fall back to the flat links as one column.
  const cols = columns.length ? columns : links.length ? [{ title: '', links }] : []
  return (
    <FooterShell view={view}>
      <div data-part="in">
        <div data-part="lead"><FooterLogo view={view} /><Desc html={view.descriptionHtml} /></div>
        {cols.length > 0 && (
          <nav aria-label="Footer" data-part="cols">
            {cols.map((col, i) => (
              <div key={col.title || i} data-part="col">
                {col.title && <h2 data-part="col-t">{col.title}</h2>}
                <FooterLinks links={col.links} />
              </div>
            ))}
          </nav>
        )}
      </div>
      <div data-part="bar"><p data-part="legal">{view.legal}</p></div>
    </FooterShell>
  )
}

// Link columns are fetched with their OWN query, only for the Columns style.
// The shared theme query (lib/optimizely.ts THEME_QUERY) is never touched, so a
// Graph schema lag on this new field can never affect any other site's footer.
const FOOTER_COLUMNS_QUERY = `
  query FooterColumns($key: String!, $locale: [Locales]) {
    OT_FooterBlock(where: { _metadata: { key: { eq: $key } } }, locale: $locale, limit: 1) {
      items { columns { title linkItems { label url { default base } } } }
    }
  }
`

async function getFooterColumns(key: string | undefined, locale: string): Promise<FooterColumn[]> {
  if (!key) return []
  try {
    const data = await getClient().request(FOOTER_COLUMNS_QUERY, { key, locale: [locale] })
    const cols = ((data as any)?.OT_FooterBlock?.items?.[0]?.columns ?? []) as any[]
    return cols
      .map(c => ({
        title: (c.title as string) ?? '',
        links: ((c.linkItems ?? []) as any[])
          .map(l => ({ label: (l.label as string) ?? '', href: resolveCmsUrl(l.url) ?? '#' }))
          .filter(l => l.label),
      }))
      .filter(c => c.links.length)
      .slice(0, 5)
  } catch {
    return []
  }
}

export default async function Footer({ footerBlock, settings: settingsProp }: { footerBlock?: unknown; settings?: any } = {}) {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  // `settings` lets the Theme Manager preview render the footer with its draft values.
  const settings = settingsProp ?? await getSiteSettings(domain, locale)

  const siteName        = (settings?.siteName as string | undefined) ?? 'Site Accelerator'
  const themeLogoSrc    = settings?.logo?.url?.default as string | undefined
  const logoAlt         = settings?.logoAlt ?? siteName
  const themeLogoInvert = settings?.logoInvertDark === true

  // `footerBlock` lets a standalone page (campaign landing, CMS preview) supply its own footer record.
  const footerRef          = (footerBlock ?? settings?.footerRef?.item ?? settings?.footerRef) as any | undefined
  const footerLogoOverride = footerRef?.footerLogo?.url?.default as string | undefined
  const footerLogoSrc      = footerLogoOverride ?? themeLogoSrc
  const footerLogoInvert   = footerLogoOverride !== undefined
                               ? footerRef?.footerLogoInvertDark === true
                               : themeLogoInvert
  const footerLogoSize     = (footerRef?.footerLogoSize as string | undefined) ?? 'md'

  // Two independent axes: layout structure and background tone. The footer pins
  // its own tone regardless of the site's light/dark mode.
  const { style, background } = getFooterStyles(footerRef)
  const surfaceAttrs = footerSurfaceAttrs(background)

  const descriptionHtml = (footerRef?.description?.html as string | undefined) ?? null

  // The CMS allows 10 Footer Links; every saved link shows.
  const links: FooterLink[] = Array.isArray(footerRef?.links)
    ? (footerRef.links as any[])
        .map(l => ({ label: (l.label as string) ?? '', href: resolveCmsUrl(l.url) ?? '#' }))
        .filter(l => l.label)
        .slice(0, 10)
    : []

  const columns = style === 'columns'
    ? await getFooterColumns(footerRef?._metadata?.key as string | undefined, locale)
    : []

  // The Theme Manager's Copyright field, falling back to "© year site name".
  const copyright = (settings?.copyright as string | undefined)?.trim()
  const legal = copyright || `© ${new Date().getFullYear()} ${siteName}`

  // The header's CTA (same label and link) is the Spotlight footer's action.
  const ctaLabel = (settings?.ctaLabel as string | undefined)?.trim()
  const ctaHref  = normalizeNavHref(resolveCmsUrl(settings?.ctaUrl, domain), locale, domain)
  const cta = ctaLabel ? { label: ctaLabel, href: ctaHref } : null

  const view: FooterView = {
    style,
    siteName,
    logoSrc: footerLogoSrc,
    logoAlt,
    logoInvert: footerLogoInvert,
    logoHeight: FOOTER_LOGO_H[footerLogoSize] ?? FOOTER_LOGO_H.md,
    descriptionHtml,
    links,
    columns,
    legal,
    background,
    surfaceAttrs,
    cta,
  }

  switch (style) {
    case 'centered': return <CenteredFooter view={view} />
    case 'minimal':  return <MinimalFooter view={view} />
    case 'columns':  return <ColumnsFooter view={view} />
    default:         return <SpotlightFooter view={view} />
  }
}
