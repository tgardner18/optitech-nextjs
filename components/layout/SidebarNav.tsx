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
 * Sidebar nav variant — fixed left rail: logo top, nav items stacked, CTA anchored bottom.
 * Page content lives in a sibling wrapper with lg:margin-left = --ot-sidebar-width.
 *
 * Desktop (≥ lg): fixed rail rendered as <aside>. No top header.
 * Mobile (< lg):  rail hidden; a minimal sticky top bar (logo + hamburger) renders instead.
 *                 MobileMenu overlay is reused unchanged — no new mobile pattern.
 *
 * Active nav state: brand-tinted fill + left 2px accent edge.
 * Sub-items: accordion expansion via SidebarNavItem (client component).
 * Skip link: position:fixed so it always appears at viewport top on focus, not inside the rail.
 */
export default async function SidebarNav() {
  const { isEnabled: isPreview } = await draftMode()
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
        {/* Logo */}
        <div className="px-lg py-md shrink-0 border-b border-fg/8">
          <a
            href={localizedHref('/', locale)}
            aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}
            className="block"
          >
            {logoEl}
          </a>
        </div>

        {/* Nav items — scrollable if they overflow */}
        <nav
          aria-label="Primary navigation"
          className="flex-1 overflow-y-auto py-sm px-xs"
        >
          {navItems.map(item => (
            <SidebarNavItem
              key={item.label}
              label={item.label}
              href={item.href}
              children={item.children}
            />
          ))}
        </nav>

        {/* Bottom: CTA anchored to rail bottom, utilities above */}
        <div className="p-md shrink-0 border-t border-fg/8 space-y-sm">
          <Button href={ctaHref} size="sm" className="w-full justify-center">
            {ctaLabel}
          </Button>
          <div className="flex items-center gap-xs">
            <SearchTrigger />
            <LocaleSelector enabledLocales={enabledLocales} />
            <ThemeToggle />
          </div>
        </div>
      </SidebarNavShell>

      {/* ── Mobile top bar — rail is hidden; hamburger takes over ───────────── */}
      <header className="lg:hidden sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">
        <div className="flex items-center justify-between px-md py-md">
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
