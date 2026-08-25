import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import MemberAuth from '@/components/auth/MemberAuth'
import MobileMenu from '@/components/layout/MobileMenu'
import DesktopNav from '@/components/layout/DesktopNav'
import { BrandMark } from '@/components/layout/BrandMark'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import SearchTrigger from '@/components/search/SearchTrigger'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { SplitHeaderShell } from '@/components/layout/SplitHeaderShell'
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
 * Split-bar nav variant — an editorial masthead, not a shrunk-down utility
 * bar: the logo sits dead-center, and the primary links split into two wings
 * that flank it. This is the style's namesake, and it earns the name twice —
 * structurally (the wings) and kinetically:
 *
 * - **First paint**: the two wings slide in from the outer edges toward the
 *   logo (`data-stagger="split-left"` / `"split-right"` in globals.css) —
 *   the header visibly performs a "split" resolving into place.
 * - **On scroll**: the whole bar crossfades from a bare transparent masthead
 *   (reads directly against the hero) into a glass surface with a
 *   brand→accent horizon hairline along the bottom edge — the same motif as
 *   the mega-menu dropdown and the footer, so the material change reads as
 *   one system rather than a one-off transition. See `.split-shell` in
 *   globals.css / `SplitHeaderShell.tsx` for the scroll-linked state.
 *
 * Mobile (< lg): identical glass sticky bar to top-bar — logo left,
 * hamburger right. The masthead is a desktop statement; small viewports
 * don't have the width to earn a centered logo.
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
    full:    'max-h-10 w-auto',
    icon:    'h-10 w-10 object-contain',
    compact: 'max-h-8 w-auto max-w-[150px]',
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

  // Split into two wings around the centered logo. The left wing takes the
  // extra item on an odd count — the right wing also carries the utility
  // icons and CTA, so keeping it one item lighter balances the two sides.
  const splitPoint = Math.ceil(navItems.length / 2)
  const leftItems  = navItems.slice(0, splitPoint)
  const rightItems = navItems.slice(splitPoint)

  const logoEl = logoSrc ? (
    <Image src={logoSrc} alt={logoAlt} width={370} height={75} className={logoImgClass} priority />
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

      <SplitHeaderShell>
        {/* ── Desktop masthead: left wing / centered logo / right wing ─────── */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-lg px-lg py-6">

          <div className="flex justify-end" data-stagger="split-left">
            <DesktopNav navItems={leftItems} variant="split" ariaLabel="Primary navigation" />
          </div>

          <a
            href={localizedHref('/', locale)}
            aria-label={`${logoAlt} — ${t(locale, 'nav.home')}`}
            className="split-logo flex items-center justify-center h-10 shrink-0"
            style={{ filter: 'drop-shadow(0 0 20px var(--ot-bloom-brand-faint))' }}
          >
            {logoEl}
          </a>

          <div className="flex items-center justify-start gap-lg" data-stagger="split-right">
            <DesktopNav navItems={rightItems} variant="split" ariaLabel="More navigation" />

            <div aria-hidden="true" className="w-px h-6 bg-fg/15 shrink-0" />

            <div className="flex items-center gap-xs shrink-0">
              <SearchTrigger />
              <LocaleSelector enabledLocales={enabledLocales} />
              <ThemeToggle />
            </div>

            {/* Member auth — inset from pill edge with generous vertical breathing room */}
            <div className="pr-2.5 pl-xs py-1.5">
              <MemberAuth />
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
            <MobileMenu navItems={navItems} enabledLocales={enabledLocales} />
          </div>
        </div>
      </SplitHeaderShell>
    </>
  )
}
