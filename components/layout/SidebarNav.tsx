import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import { BrandMark } from '@/components/layout/BrandMark'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem'
import { SidebarNavShell } from '@/components/layout/SidebarNavClient'
import SearchTrigger from '@/components/search/SearchTrigger'
import { draftMode } from 'next/headers'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import CommerceHeaderActions from '@/components/commerce/CommerceHeaderActions'
import { getHeaderCommerce } from '@/lib/commerce/settings'
import { getEnabledLanguages } from '@/lib/i18n/getEnabledLanguages'
import { t } from '@/lib/i18n/t'
import { localizedHref, stripLocalePrefix } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import type { NavItem } from '@/components/layout/DesktopNav'
import { resolveCmsUrl } from '@/lib/resolveCmsUrl'

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
 * Sidebar nav variant — fixed left rail: logo top, nav items stacked, CTA anchored bottom.
 * Page content lives in a sibling wrapper with lg:margin-left = --ot-sidebar-width.
 *
 * Desktop (≥ lg): fixed rail rendered as <aside>. No top header.
 * Mobile (< lg):  rail hidden; a minimal sticky top bar (logo + hamburger) renders instead.
 *                 MobileMenu overlay is reused unchanged — no new mobile pattern.
 *
 * Active nav state: brand-tinted background fill + semibold text, driven by
 * usePathname() in SidebarNavItem.tsx (a side-stripe accent border would
 * violate the system's ban on colored border-left/right accents). Sections
 * containing the active page auto-expand and stay highlighted when collapsed.
 * Sub-items: accordion expansion via SidebarNavItem (client component), each
 * with an icon tile matching the split-bar mega-menu's visual language.
 * Skip link: position:fixed so it always appears at viewport top on focus, not inside the rail.
 */
export default async function SidebarNav() {
  const { isEnabled: isPreview } = await draftMode()
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const commerce = await getHeaderCommerce(domain)

  const siteName       = (settings?.siteName as string | undefined) ?? 'Site Accelerator'
  const logoSrc        = settings?.logo?.url?.default
  const logoAlt        = settings?.logoAlt       ?? siteName
  const logoFit        = (settings?.logoFit as string | undefined) ?? 'full'
  const logoInvertDark = settings?.logoInvertDark === true
  const ctaLabel       = settings?.ctaLabel ?? 'Get Started'
  // Storefronts lead with the bag, not a CTA: hide it unless one is authored.
  const showCta        = !(commerce.enabled && !settings?.ctaLabel)
  const ctaHref        = normalizeNavHref(resolveCmsUrl(settings?.ctaUrl, domain), locale, domain)

  const LOGO_IMG_CLASS: Record<string, string> = {
    full:    'max-h-10 w-auto',
    icon:    'h-10 w-10 object-contain',
    compact: 'max-h-8 w-auto max-w-[140px]',
  }
  const logoImgClass = [
    LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full,
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  const enabledLocales = await getEnabledLanguages()

  const navItems: NavItem[] = settings?.primaryNavigation?.length
    ? settings.primaryNavigation.map((item: any) => ({
        label:    item.menuLink?.text ?? '',
        href:     normalizeNavHref(resolveCmsUrl(item.menuLink?.url, domain), locale, domain),
        children: item.subNavItems?.length
          ? item.subNavItems.map((c: any) => ({
              label:       c.menuLink?.text ?? '',
              href:        normalizeNavHref(resolveCmsUrl(c.menuLink?.url, domain), locale, domain),
              description: c.description ?? undefined,
              icon:        c.icon && c.icon !== 'none' ? c.icon : undefined,
            }))
          : undefined,
      }))
    : FALLBACK_NAV

  const logoEl = logoSrc ? (
    <Image src={logoSrc} alt={logoAlt} width={444} height={90} className={logoImgClass} priority />
  ) : (
    <BrandMark name={siteName} size="sm" className="text-fg" />
  )

  return (
    <>
      {/* Skip link — position:fixed so it appears at viewport top on focus regardless of rail position */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-300
                   focus:px-md focus:py-sm focus:bg-brand focus:text-fg-on-brand
                   focus:text-sm focus:font-semibold"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      {/* ── Desktop sidebar rail — client shell handles animation + toggle ─────── */}
      <SidebarNavShell defaultOpen={!isPreview}>
        <div data-part="rail-logo">
          <a href={localizedHref('/', locale)} aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}>
            {logoEl}
          </a>
        </div>

        {/* Nav items: scrollable if they overflow */}
        <nav aria-label="Primary navigation" data-part="rail-nav">
          {navItems.map(item => (
            <SidebarNavItem
              key={item.label}
              label={item.label}
              href={item.href}
              children={item.children}
            />
          ))}
        </nav>

        <div data-part="rail-foot">
          {showCta && (
            <Button href={ctaHref} size="sm" className="w-full justify-center">
              {ctaLabel}
            </Button>
          )}
          <div data-part="rail-tools">
            <SearchTrigger />
            <LocaleSelector enabledLocales={enabledLocales} scoped />
            <ThemeToggle scoped />
            {commerce.enabled && <CommerceHeaderActions initialBagCount={commerce.bagCount} />}
          </div>
        </div>
      </SidebarNavShell>

      {/* ── Mobile top bar — rail is hidden; hamburger takes over ───────────── */}
      <header data-block="site-nav" data-style="sidebar-top">
        <div data-part="bar">
          <a href={localizedHref('/', locale)} data-part="logo" aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}>
            {logoEl}
          </a>
          <div data-part="mobile-tools">
            <SearchTrigger />
            <ThemeToggle scoped />
            {commerce.enabled && <CommerceHeaderActions initialBagCount={commerce.bagCount} showWishlist={false} showAccount />}
            <MobileMenu navStyle="sidebar" navItems={navItems} ctaLabel={showCta ? ctaLabel : ''} ctaHref={ctaHref} enabledLocales={enabledLocales} />
          </div>
        </div>
      </header>
    </>
  )
}
