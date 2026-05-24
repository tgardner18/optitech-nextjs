/**
 * Server-side typed translation helper.
 *
 * Usage in server components / adapters:
 *   import { t } from '@/lib/i18n/t'
 *   const label = t('fr', 'nav.openMenu')
 *   const msg   = t('de', 'forms.fieldRequired', { field: 'Email' })
 *
 * Keys are dot-separated paths into the JSON message files.
 * Missing keys fall back to English. Missing English keys return the key itself.
 * Template variables are replaced: '{count}' → value from vars object.
 *
 * The locale parameter accepts any string. If the locale is not one of the
 * bundled message files, the function falls back to English automatically.
 * This means adding a new language in the CMS never causes a runtime error —
 * editors see English static labels until a messages file is added.
 */

import type { Locale } from './config'
import { DEFAULT_LOCALE } from './config'

// Eagerly load all message files at module load time.
// JSON imports are statically analysed by Next.js — no dynamic require needed.
import en from './messages/en.json'
import es from './messages/es.json'
import fr from './messages/fr.json'
import de from './messages/de.json'

// Keyed by the bundled locale codes. Cast to a wider index type so we can
// safely do a runtime lookup with an arbitrary string locale without TypeScript
// complaints — unknown keys simply return `undefined` which triggers the fallback.
const MESSAGES: Record<string, Record<string, unknown>> = { en, es, fr, de }

type Messages = typeof en
type DotPath<T, Prefix extends string = ''> = T extends Record<string, unknown>
  ? { [K in keyof T & string]: DotPath<T[K], Prefix extends '' ? K : `${Prefix}.${K}`> }[keyof T & string]
  : Prefix

/** All valid translation keys, inferred from the English message file. */
export type MessageKey = DotPath<Messages>

/** Resolve a dot-path string into a nested object value. */
function resolvePath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

/**
 * Translate a message key for the given locale.
 *
 * - Falls back to English if the locale has no bundled message file.
 * - Falls back to English if the locale file is missing the requested key.
 * - Falls back to the key string itself if English is also missing it.
 * - Replaces {variable} tokens from the `vars` object.
 *
 * Accepts a plain `string` for locale so that new CMS languages that don't yet
 * have a messages file are handled gracefully without a runtime error.
 */
export function t(
  locale: string,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
  let value =
    resolvePath(messages as Record<string, unknown>, key) ??
    resolvePath(MESSAGES[DEFAULT_LOCALE] as Record<string, unknown>, key) ??
    key

  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement))
    }
  }

  return value
}

/**
 * Returns the locale code to use for message lookups.
 * If the locale has a bundled messages file, returns it as-is.
 * Otherwise strips a region subtag (e.g. 'es-MX' → 'es') and checks again.
 * Falls back to the default locale if neither variant is bundled.
 */
export function resolveMessageLocale(locale: string): Locale {
  if (MESSAGES[locale]) return locale as Locale
  const base = locale.split('-')[0]
  if (MESSAGES[base]) return base as Locale
  return DEFAULT_LOCALE
}
