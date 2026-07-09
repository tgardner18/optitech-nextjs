import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import { BrandMark } from '@/components/layout/BrandMark'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import SearchTrigger from '@/components/search/SearchTrigger'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { SplitLogoWrap } from '@/components/layout/SplitLogoWrap'
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
 * Split-bar nav variant — transparent header on desktop, logo bare left, floating pill right.
 *
 * The pill (bg-surface/90 + backdrop-blur + rounded-full) contains nav links, icon
 * utilities, and the CTA. No full-width background band on desktop; content reads
 * through the gap between the two elements.
 *
 * The pill's border-radius tracks the Corner Style axis via `rounded-ot-surface`
 * (`--ot-radius-surface`): sharp → 0px, soft → 8px, rounded → 20px.
 *
 * Mobile (< lg): glass sticky bar, logo left, hamburger right — identical to top-bar.
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

  const logoEl = logoSrc ? (
    <Image src={logoSrc} alt={logoAlt} width={444} height={90} className={logoImgClass} priority />
  ) : (
    <BrandMark name={siteName} className="text-fg" />
  )

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-300
                   focus:px-md focus:py-sm focus:bg-brand focus:text-fg-on-brand
                   focus:text-sm focus:font-semibold"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      {/* ── Desktop: transparent header — logo bare left, pill right ─────────── */}
      <header className="sticky top-0 z-50 lg:bg-transparent lg:border-none bg-canvas/80 backdrop-blur-md border-b border-fg/5 lg:backdrop-filter-none">

        <div className="hidden lg:flex items-center justify-between px-lg py-sm">

          {/* Logo — floats bare on hero, gains glass pill after scrolling */}
          <SplitLogoWrap>
            <a
              href={localizedHref('/', locale)}
              aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}
              className="flex items-center h-12 shrink-0"
              style={{ filter: 'drop-shadow(0 0 20px var(--ot-bloom-brand-faint))' }}
            >
              {logoEl}
            </a>
          </SplitLogoWrap>

          {/* Floating pill — nav links + utilities + CTA in one surface capsule */}
          <div
            className="flex items-center rounded-ot-surface border border-fg/15"
            style={{
              background:           'color-mix(in oklch, var(--ot-surface) 92%, transparent)',
              backdropFilter:       'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow:            '0 2px 20px var(--ot-bloom-brand-faint), 0 1px 4px oklch(0 0 0 / 0.08)',
            }}
          >
            {/* Nav links */}
            <div className="px-md">
              <DesktopNav navItems={navItems} />
            </div>

            {/* Separator */}
            <div aria-hidden="true" className="w-px self-stretch bg-fg/10 my-sm" />

            {/* Icon utilities */}
            <div className="flex items-center gap-xs px-sm py-sm">
              <SearchTrigger />
              <LocaleSelector enabledLocales={enabledLocales} />
              <ThemeToggle />
            </div>

            {/* CTA — inset from pill edge with generous vertical breathing room */}
            <div className="pr-2.5 pl-xs py-1.5">
              <Button href={ctaHref} size="sm">{ctaLabel}</Button>
            </div>
          </div>

        </div>

        {/* ── Mobile: glass bar — identical to top-bar mobile ──────────────── */}
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
