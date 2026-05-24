/**
 * i18n configuration for OptiTech Next.js
 *
 * Four stock locales. Locale is detected from the URL prefix (/fr/, /de/, /es/).
 * The default locale (English) has no prefix — existing URLs are unaffected.
 * Non-default locales are prefixed: /fr/about, /de/about, /es/about.
 *
 * CMS locale codes (used in getContentByPath + preview loc param):
 *   en → 'en'  |  es → 'es'  |  fr → 'fr'  |  de → 'de'
 *
 * Optimizely Graph expects BCP-47 codes unchanged, so no conversion needed
 * for these four locales.
 */

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

/** Display metadata for each locale, used in the LocaleSelector UI. */
export const LOCALE_META: Record<Locale, { native: string; code: string }> = {
  en: { native: 'English',  code: 'EN' },
  es: { native: 'Español',  code: 'ES' },
  fr: { native: 'Français', code: 'FR' },
  de: { native: 'Deutsch',  code: 'DE' },
}

/** Returns true if value is a supported locale. */
export function isSupportedLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/**
 * Returns display metadata for any locale code.
 * For bundled locales returns the pre-configured native name and code.
 * For unknown locales (added in the CMS but not yet bundled) falls back to
 * a generated display using the uppercase locale code as both label and code.
 */
export function getLocaleMeta(locale: string): { native: string; code: string } {
  if (isSupportedLocale(locale)) return LOCALE_META[locale]
  // Best-effort: use Intl.DisplayNames if available, otherwise just capitalise
  try {
    const displayNames = new Intl.DisplayNames([locale, DEFAULT_LOCALE], { type: 'language' })
    const name = displayNames.of(locale)
    if (name && name !== locale) {
      return { native: name, code: locale.toUpperCase().slice(0, 2) }
    }
  } catch { /* Intl not available or locale unknown */ }
  const code = locale.toUpperCase().slice(0, 2)
  return { native: code, code }
}

/**
 * Strips the locale prefix from a URL path.
 * '/fr/about' → '/about'
 * '/about'    → '/about'  (default locale, no prefix)
 */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/'
    }
  }
  return pathname
}

/**
 * Builds a URL for a given locale by adding/swapping the prefix.
 * localizedHref('/about', 'fr') → '/fr/about'
 * localizedHref('/fr/about', 'en') → '/about'
 * localizedHref('/fr/about', 'de') → '/de/about'
 */
export function localizedHref(pathname: string, locale: Locale): string {
  const clean = stripLocalePrefix(pathname)
  if (locale === DEFAULT_LOCALE) return clean
  return `/${locale}${clean === '/' ? '' : clean}`
}
