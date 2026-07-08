import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import { BrandMark } from '@/components/layout/BrandMark'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import SearchTrigger from '@/components/search/SearchTrigger'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { getEnabledLanguages } from '@/lib/i18n/getEnabledLanguages'
import { t } from '@/lib/i18n/t'
import { localizedHref, stripLocalePrefix } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import type { NavItem } from '@/components/layout/DesktopNav'

const FALLBACK_NAV: NavItem[] = [
  { label: 'Product',  href: '#' },
  { label: 'Pricing',  href: '#' },
  { label: 'About',    href: '#' },
  { label: 'Showcase', href: '/showcase' },
]

function normalizeNavHref(rawUrl: string | null | undefined, locale: Locale, domain: string): string {
  if (!rawUrl) return '#'
  if (rawUrl.startsWith('cms://')) return '#'
  let pathname: string
  if (rawUrl.startsWith('/')) {
    pathname = rawUrl
  } else if (rawUrl.startsWith('http')) {
    try {
      const linkUrl = new URL(rawUrl)
      if (linkUrl.host !== domain) return rawUrl
      pathname = linkUrl.pathname
    } catch { return '#' }
  } else {
    return '#'
  }
  return localizedHref(stripLocalePrefix(pathname), locale)
}

/**
 * Split Bar nav variant — logo is horizontally centered in a three-column grid.
 * Nav links are split: Math.floor(n/2) on the left, remainder on the right toward the CTA.
 * Same glass shell and sticky behavior as the default Header; only the flex layout changes.
 * Below lg, collapses to logo-left + hamburger (identical to top-bar mobile behavior).
 */
export default async function SplitHeader() {
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

  const LOGO_IMG_CLASS: Record<string, string> = {
    full:    'max-h-12 w-auto',
    icon:    'h-12 w-12 object-contain',
    compact: 'max-h-9 w-auto max-w-[160px]',
  }
  const logoImgClass = [
    LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full,
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

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

  // Fewer items left (away from CTA), more right (toward CTA).
  // With 1 item: 0 left, 1 right — degrades gracefully to an asymmetric layout.
  const leftCount    = Math.floor(navItems.length / 2)
  const leftNavItems = navItems.slice(0, leftCount)
  const rightNavItems = navItems.slice(leftCount)

  const logoEl = logoSrc ? (
    <Image src={logoSrc} alt={logoAlt} width={444} height={90} className={logoImgClass} priority />
  ) : (
    <BrandMark name={siteName} className="text-fg" />
  )

  return (
    <>
      {/* Skip to main content — must be first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-[9999]
                   focus:px-md focus:py-sm focus:bg-brand focus:text-fg-on-brand
                   focus:text-sm focus:font-semibold"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">

        {/* ── Desktop: three-column grid — left-nav | logo | right-nav+CTA ──── */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center px-lg py-md gap-xl">

          {/* Left nav — right-aligned so items sit close to the centered logo */}
          <div className="flex justify-end">
            <DesktopNav navItems={leftNavItems} />
          </div>

          {/* Center: logo with a persistent brand-bloom halo */}
          <a
            href={localizedHref('/', locale)}
            aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}
            className="flex items-center justify-center h-12 shrink-0"
            style={{ filter: 'drop-shadow(0 0 14px var(--ot-bloom-brand-faint))' }}
          >
            {logoEl}
          </a>

          {/* Right nav + utilities — left-aligned so items sit close to the logo */}
          <div className="flex items-center gap-lg">
            <DesktopNav navItems={rightNavItems} />
            <div className="flex items-center gap-sm ml-auto">
              <SearchTrigger />
              <LocaleSelector enabledLocales={enabledLocales} />
              <ThemeToggle />
              <Button href={ctaHref} size="sm">{ctaLabel}</Button>
            </div>
          </div>
        </div>

        {/* ── Mobile: logo left + hamburger (identical to top-bar mobile) ─── */}
        <div className="lg:hidden flex items-center justify-between px-md py-md">
          <a
            href={localizedHref('/', locale)}
            aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}
            className="flex items-center h-12"
          >
            {logoEl}
          </a>
          <div className="flex items-center gap-sm">
            <SearchTrigger />
            <ThemeToggle />
            <MobileMenu navItems={navItems} ctaLabel={ctaLabel} ctaHref={ctaHref} enabledLocales={enabledLocales} />
          </div>
        </div>

      </header>
    </>
  )
}
