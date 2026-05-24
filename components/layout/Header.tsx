import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import type { NavItem } from '@/components/layout/DesktopNav'
import SearchTrigger from '@/components/search/SearchTrigger'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { t } from '@/lib/i18n/t'

const FALLBACK_NAV: NavItem[] = [
  { label: 'Product',  href: '#' },
  { label: 'Pricing',  href: '#' },
  { label: 'About',    href: '#' },
  { label: 'Showcase', href: '/showcase' },
]

export default async function Header() {
  const settings = await getSiteSettings(await getRequestDomain())
  const locale   = await getRequestLocale()

  const logoSrc        = settings?.logo?.url?.default ?? '/brand/logo/OT.png'
  const logoAlt        = settings?.logoAlt       ?? 'OptiTech'
  const logoFit        = (settings?.logoFit as string | undefined) ?? 'full'
  const logoInvertDark = settings?.logoInvertDark === true
  const ctaLabel       = settings?.ctaLabel ?? 'Get Started'
  const ctaHref        = settings?.ctaUrl?.default ?? '#'

  const LOGO_IMG_CLASS: Record<string, string> = {
    full:    'max-h-12 w-auto',
    icon:    'h-12 w-12 object-contain',
    compact: 'max-h-9 w-auto max-w-[160px]',
  }
  const logoImgClass = [
    LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full,
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  // Locale codes configured in the CMS ThemeManager. Empty array = show all.
  const enabledLocales: string[] = Array.isArray(settings?.enabledLocales)
    ? settings.enabledLocales.filter((l: unknown) => typeof l === 'string' && l.trim())
    : []

  const navItems: NavItem[] = settings?.primaryNavigation?.length
    ? settings.primaryNavigation.map((item: any) => ({
        label:    item.menuLink?.text ?? '',
        href:     item.menuLink?.url?.default ?? '#',
        children: item.subNavItems?.length
          ? item.subNavItems.map((c: any) => ({
              label:       c.menuLink?.text ?? '',
              href:        c.menuLink?.url?.default ?? '#',
              description: c.description ?? undefined,
            }))
          : undefined,
      }))
    : FALLBACK_NAV

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-[9999]
                   focus:px-md focus:py-sm focus:bg-brand focus:text-fg-on-brand
                   focus:text-sm focus:font-semibold"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">
        <div className="flex items-center justify-between px-md py-md lg:px-lg">

          <Link href="/" aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`} className="flex items-center h-12">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={200}
              height={40}
              className={logoImgClass}
              priority
            />
          </Link>

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
