import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Button from '@/components/ui/Button'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import type { NavItem } from '@/components/layout/DesktopNav'
import { getSiteSettings, getRequestDomain } from '@/lib/optimizely'

const FALLBACK_NAV: NavItem[] = [
  { label: 'Product',  href: '#' },
  { label: 'Pricing',  href: '#' },
  { label: 'About',    href: '#' },
  { label: 'Showcase', href: '/showcase' },
]

export default async function Header() {
  const settings = await getSiteSettings(await getRequestDomain())

  const logoSrc        = settings?.logo?.url?.default ?? '/brand/logo/OT.png'
  const logoAlt        = settings?.logoAlt       ?? 'OptiTech'
  const logoFit        = (settings?.logoFit as string | undefined) ?? 'full'
  const logoInvertDark = settings?.logoInvertDark === true
  const ctaLabel       = settings?.ctaLabel ?? 'Get Started'
  const ctaHref        = settings?.ctaUrl?.default ?? '#'

  const LOGO_IMG_CLASS: Record<string, string> = {
    full:    'max-h-10 w-auto',
    icon:    'h-10 w-10 object-contain',
    compact: 'max-h-7 w-auto max-w-[160px]',
  }
  const logoImgClass = [
    LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full,
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

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
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">
        <div className="flex items-center justify-between px-md py-md lg:px-lg">

          <Link href="/" aria-label={`${logoAlt} — Home`} className="flex items-center h-10">
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

          <div className="hidden lg:flex items-center gap-md">
            <ThemeToggle />
            <Button href={ctaHref} size="sm">{ctaLabel}</Button>
          </div>

          <div className="lg:hidden flex items-center gap-sm">
            <ThemeToggle />
            <MobileMenu navItems={navItems} ctaLabel={ctaLabel} ctaHref={ctaHref} />
          </div>

        </div>
      </header>
    </>
  )
}
