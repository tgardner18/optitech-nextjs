/**
 * next-intl server-side request configuration.
 *
 * Called once per request to resolve the active locale.
 * We do NOT use next-intl's message/translation system — the project uses its
 * own typed message files (lib/i18n/t.ts + lib/i18n/messages/*.json).
 * Passing `messages: {}` satisfies next-intl's type contract without loading
 * any translation strings via this path.
 *
 * Server components access the locale via:
 *   import { getLocale } from 'next-intl/server'
 *   const locale = await getLocale()
 *
 * Client components access it via:
 *   import { useLocale } from '@/lib/i18n/LocaleProvider'
 *   (locale is passed as a prop from the nearest server layout)
 */

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale

  // Validate — fall back to default locale for unknown or missing values.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    // Not using next-intl's translation system (t() / useTranslations).
    // Our own lib/i18n/t.ts handles message lookups.
    messages: {},
  }
})
