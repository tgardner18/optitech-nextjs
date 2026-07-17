import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import { BrandMark } from '@/components/layout/BrandMark'
import { LogoImage } from '@/components/layout/LogoImage'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import type { NavItem } from '@/components/layout/DesktopNav'
import SearchTrigger from '@/components/search/SearchTrigger'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { getEnabledLanguages } from '@/lib/i18n/getEnabledLanguages'
import { t } from '@/lib/i18n/t'
import { localizedHref, stripLocalePrefix } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

const FALLBACK_NAV: NavItem[] = [
  { label: 'Product',  href: '#' },
  { label: 'Pricing',  href: '#' },
  { label: 'About',    href: '#' },
  { label: 'Showcase', href: '/showcase' },
]

/**
 * Normalises a raw CMS link URL into a front-end-navigable href.
 *
 * Content Graph can return link URLs in several forms:
 *   - Relative path:          "/about"  → strip+re-apply locale prefix
 *   - Absolute same-domain:   "https://domain.com/showcase" → extract path, locale-prefix
 *   - Absolute external:      "https://other.com" → return unchanged
 *   - Unresolved content ref: "cms://content/{uuid}" → fall back to '#'
 *
 * All internal paths are run through localizedHref so nav links stay
 * locale-aware: on /es/* every link points to /es/... automatically.
 */
function normalizeNavHref(
  rawUrl: string | null | undefined,
  locale: Locale,
  domain: string,       // request Host header, e.g. "your-site.vercel.app"
): string {
  if (!rawUrl) return '#'

  // Unresolvable CMS internal reference — graceful fallback.
  if (rawUrl.startsWith('cms://')) return '#'

  let pathname: string

  if (rawUrl.startsWith('/')) {
    pathname = rawUrl
  } else if (rawUrl.startsWith('http')) {
    try {
      const linkUrl = new URL(rawUrl)
      // External URL — return unchanged so external links work normally.
      if (linkUrl.host !== domain) return rawUrl
      // Same-domain absolute URL → extract pathname for locale-prefixing.
      pathname = linkUrl.pathname
    } catch {
      return '#'
    }
  } else {
    return '#'
  }

  // Strip any locale prefix the CMS may have embedded, then re-apply for
  // the current request locale so links work correctly on /es/*, /fr/*, etc.
  return localizedHref(stripLocalePrefix(pathname), locale)
}

export default async function Header() {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)

  const siteName       = (settings?.siteName as string | undefined) ?? 'Site Accelerator'
  const logoSrc        = settings?.logo?.url?.default
  const logoAlt        = settings?.logoAlt       ?? siteName
  const logoFit        = (settings?.logoFit as string | undefined) ?? 'full'
  const logoInvertDark = settings?.logoInvertDark === true
  const ctaLabel       = settings?.ctaLabel ?? 'Get Started'
  const ctaHref        = normalizeNavHref(settings?.ctaUrl?.default, locale, domain)

  // Container owns the sizing — image uses h-full w-auto so any asset format
  // (SVG with/without viewBox, PNG, WebP, any aspect ratio) scales correctly.
  const LOGO_CONTAINER_CLASS: Record<string, string> = {
    full:    'h-10 max-w-[200px] flex-shrink-0',
    icon:    'h-10 w-10 flex-shrink-0',
    compact: 'h-8 max-w-[160px] flex-shrink-0',
  }
  const logoContainerClass = LOGO_CONTAINER_CLASS[logoFit] ?? LOGO_CONTAINER_CLASS.full
  const logoImgClass = [
    'h-full w-auto max-w-full object-contain object-left',
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  // Locale codes sourced from Graph (Content locale facets) rather than a manual
  // ThemeManager field — see lib/i18n/getEnabledLanguages.ts.
  const enabledLocales = await getEnabledLanguages()

  const navItems: NavItem[] = settings?.primaryNavigation?.length
    ? settings.primaryNavigation.map((item: any) => ({
        label:    item.menuLink?.text ?? '',
        href:     normalizeNavHref(item.menuLink?.url?.default, locale, domain),
        children: item.subNavItems?.length
          ? item.subNavItems.map((c: any) => ({
              label:       c.menuLink?.text ?? '',
              href:        normalizeNavHref(c.menuLink?.url?.default, locale, domain),
              description: c.description ?? undefined,
              icon:        c.icon && c.icon !== 'none' ? c.icon : undefined,
            }))
          : undefined,
      }))
    : FALLBACK_NAV

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-9999
                   focus:px-md focus:py-sm focus:bg-brand focus:text-fg-on-brand
                   focus:text-sm focus:font-semibold"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">
        <div className="flex items-center justify-between px-md py-md lg:px-lg">

          <a href={localizedHref('/', locale)} aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`} className="flex items-center h-12">
            {logoSrc ? (
              <LogoImage
                src={logoSrc}
                alt={logoAlt}
                containerClass={logoContainerClass}
                imgClass={logoImgClass}
              />
            ) : (
              <BrandMark name={siteName} className="text-fg" />
            )}
          </a>

          <DesktopNav navItems={navItems} />

          <div className="hidden lg:flex items-center gap-sm">
            <SearchTrigger />
            <LocaleSelector enabledLocales={enabledLocales} />
            <ThemeToggle />
            <Button href={ctaHref} size="sm">{ctaLabel}</Button>
          </div>

          <div className="lg:hidden flex items-center gap-sm">
            <SearchTrigger />
            <ThemeToggle />
            <MobileMenu navItems={navItems} ctaLabel={ctaLabel} ctaHref={ctaHref} enabledLocales={enabledLocales} />
          </div>

        </div>
      </header>
    </>
  )
}
