'use client'

/**
 * LocaleSelector — locale picker for the site header.
 *
 * Desktop: compact globe + code trigger → glass dropdown with language options.
 * Mobile: inline grid of language buttons (used inside MobileMenu).
 *
 * On selection, navigates to the locale-prefixed equivalent of the current URL.
 * next-intl middleware detects the locale from the URL prefix on every request,
 * so no cookie is needed — the URL is the single source of truth for locale.
 *
 * Design constraints (DESIGN.md):
 *  - Sharp corners only (rounded-none)
 *  - Dark glass dropdown: bg-canvas/90 backdrop-blur-md border border-fg/10
 *  - Active locale: accent dot + text-accent
 *  - Muted locale code alongside native name (text-label text-fg-muted)
 *  - Kinetic ease on dropdown: 180ms opacity + translateY
 *
 * enabledLocales prop: array of locale codes to display, sourced from the CMS
 * ThemeManager. Falls back to SUPPORTED_LOCALES when not provided or empty.
 *
 * Storefront sites (inside CommerceProvider) also offer "English (UK)": same
 * English URLs, plus the `ot_market=uk` cookie that switches prices to GBP and
 * sizes to UK labels (lib/commerce/market.ts). The trigger then shows the
 * currency too ("UK · £").
 */

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { SUPPORTED_LOCALES, getLocaleMeta, localizedHref, isSupportedLocale } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useCommerce } from '@/components/commerce/CommerceProvider'
import { writeMarketCookie } from '@/lib/commerce/market'

/** One row in the picker: a locale, optionally pinned to the UK market. */
type Option = { id: string; locale: Locale; native: string; code: string; uk: boolean }

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' }

function useOptions(visibleLocales: Locale[]): { options: Option[]; activeId: string; storefront: boolean; currencySymbol: string } {
  const locale = useLocale()
  const { enabled, market, currency } = useCommerce()
  const options: Option[] = []
  for (const loc of visibleLocales) {
    const lm = getLocaleMeta(loc)
    options.push({ id: loc, locale: loc, native: lm.native, code: lm.code, uk: false })
    if (enabled && loc === 'en') options.push({ id: 'en-uk', locale: 'en', native: 'English (UK)', code: 'UK', uk: true })
  }
  return {
    options,
    activeId: locale === 'en' && market === 'uk' ? 'en-uk' : locale,
    storefront: enabled,
    currencySymbol: CURRENCY_SYMBOL[currency] ?? '',
  }
}

/** Navigate to `opt`: set the locale + market cookies, then load the localized URL. */
function goTo(opt: Option) {
  try {
    document.cookie = `NEXT_LOCALE=${opt.locale}; path=/; max-age=31536000; SameSite=Lax`
  } catch { /* private-mode or restricted context — safe to swallow */ }
  writeMarketCookie(opt.uk ? 'uk' : null)
  window.location.href = localizedHref(getBrowserPathname(), opt.locale)
}

/**
 * Returns the real browser URL path — important because Next.js proxy/middleware
 * rewrites locale-prefixed paths (/es/about → /about) before they reach the
 * app router. usePathname() returns the REWRITTEN path, not the browser URL.
 * Using window.location.pathname gives us the prefix so we can swap it correctly.
 */
function getBrowserPathname(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

type LocaleSelectorProps = {
  /** Locale codes to show in the picker. Omit or pass [] to show all SUPPORTED_LOCALES. */
  enabledLocales?: string[]
  /** Inside the primary navigation: site-nav.css owns the look (data-part hooks, no utility classes). */
  scoped?: boolean
}

// ── Desktop trigger + dropdown ────────────────────────────────────────────────

export function LocaleSelector({ enabledLocales, scoped = false }: LocaleSelectorProps) {
  const { t }    = useTranslation()
  const popId    = useId()
  const [open, setOpen] = useState(false)
  const containerRef    = useRef<HTMLDivElement>(null)
  const triggerRef      = useRef<HTMLButtonElement>(null)
  const firstItemRef    = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  // Resolve which locales to show.
  // Filter against SUPPORTED_LOCALES so only routable, middleware-known locales
  // appear — this prevents broken URLs if an editor types an unsupported code.
  // If the CMS list is empty or not set, fall back to showing all supported locales.
  const visibleLocales: Locale[] = enabledLocales?.length
    ? enabledLocales.filter(isSupportedLocale)
    : [...SUPPORTED_LOCALES]

  const { options, activeId, storefront, currencySymbol } = useOptions(visibleLocales)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [close])

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { close(); triggerRef.current?.focus() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, close])

  // Focus first item when dropdown opens
  useEffect(() => {
    if (open) {
      // Microtask: wait for the dropdown to paint before focusing
      setTimeout(() => firstItemRef.current?.focus(), 0)
    }
  }, [open])

  // Write the NEXT_LOCALE cookie BEFORE navigating (goTo). next-intl's middleware
  // reads it for locale detection; without it, going back to English ('/') with a
  // stale 'es' cookie redirects to '/es/' again. goTo also uses the real browser
  // path (window.location.pathname) — usePathname() returns the rewritten path
  // without the locale prefix.
  function select(opt: Option) {
    close()
    if (opt.id === activeId) return
    goTo(opt)
  }

  const active = options.find((o) => o.id === activeId) ?? options[0]

  // If the site only has one choice, don't render the selector at all
  if (options.length <= 1) return null

  if (scoped) {
    return (
      <div ref={containerRef} data-part="locale">
        <button
          ref={triggerRef}
          type="button"
          data-part="tool"
          data-wide=""
          aria-expanded={open}
          aria-controls={open ? popId : undefined}
          aria-label={`${t('locale.selector')}: ${active.native}`}
          onClick={() => setOpen(v => !v)}
        >
          <GlobeIcon size={18} />
          <span data-part="tool-code">{active.code}{storefront && currencySymbol ? ` · ${currencySymbol}` : ''}</span>
          <ChevronIcon open={false} size={12} />
        </button>
        {open && (
          <div data-part="locale-pop" id={popId} role="listbox" aria-label={t('locale.selector')}>
            {options.map((opt, i) => (
              <button
                key={opt.id}
                ref={i === 0 ? firstItemRef : undefined}
                type="button"
                role="option"
                data-part="locale-opt"
                aria-selected={opt.id === activeId}
                onClick={() => select(opt)}
              >
                <span>{opt.native}</span>
                <small>{opt.code}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('locale.selector')}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-xs text-sm font-semibold
                   text-fg-muted hover:text-fg
                   transition-colors duration-150 ease-quick
                   focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[3px]"
      >
        <GlobeIcon />
        <span className="tracking-wide">{active.code}{storefront && currencySymbol ? ` · ${currencySymbol}` : ''}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('locale.selector')}
          className="absolute top-full right-0 mt-sm z-50
                     bg-canvas/90 backdrop-blur-md
                     border border-fg/10
                     shadow-[0_8px_32px_var(--ot-bloom-brand-faint)]
                     min-w-[180px]
                     motion-safe:animate-dropdown-in"
        >
          {options.map((opt, i) => {
            const isActive = opt.id === activeId

            return (
              <button
                key={opt.id}
                ref={i === 0 ? firstItemRef : undefined}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => select(opt)}
                className="w-full flex items-center justify-between gap-md
                           px-md py-sm
                           text-left
                           hover:bg-fg/5
                           transition-colors duration-100 ease-quick
                           focus-visible:outline-none focus-visible:bg-fg/5
                           group"
              >
                <span className="flex items-center gap-sm">
                  {/* Accent dot — active indicator */}
                  <span
                    className={`block w-1.5 h-1.5 rounded-none shrink-0 transition-colors duration-150 ${
                      isActive ? 'bg-accent' : 'bg-transparent'
                    }`}
                  />
                  <span className={`text-sm font-semibold transition-colors duration-100 ${
                    isActive ? 'text-accent' : 'text-fg group-hover:text-fg'
                  }`}>
                    {opt.native}
                  </span>
                </span>
                <span className="text-label text-fg-muted shrink-0">{opt.code}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Mobile inline variant ─────────────────────────────────────────────────────

export function LocaleSelectorMobile({
  onSelect,
  enabledLocales,
  scoped = false,
}: {
  onSelect?: () => void
  enabledLocales?: string[]
  scoped?: boolean
}) {
  const { t }  = useTranslation()

  const visibleLocales: Locale[] = enabledLocales?.length
    ? enabledLocales.filter(isSupportedLocale)
    : [...SUPPORTED_LOCALES]

  const { options, activeId } = useOptions(visibleLocales)

  // Don't render if only one choice is configured
  if (options.length <= 1) return null

  function select(opt: Option) {
    onSelect?.()
    if (opt.id === activeId) return
    goTo(opt) // writes NEXT_LOCALE first — see the desktop select() note
  }

  if (scoped) {
    return (
      <div data-part="sheet-lang">
        <p>{t('locale.selector')}</p>
        <div role="group" aria-label={t('locale.selector')}>
          {options.map(opt => (
            <button key={opt.id} type="button" aria-pressed={opt.id === activeId} onClick={() => select(opt)}>
              <b>{opt.native}</b>
              <small>{opt.code}</small>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-fg/10 py-md">
      <p className="text-label text-fg-muted uppercase tracking-widest mb-sm">
        {t('locale.selector')}
      </p>
      <div className="grid grid-cols-2 gap-xs">
        {options.map((opt) => {
          const isActive = opt.id === activeId

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt)}
              className={`flex items-center justify-between px-sm py-xs
                          border transition-colors duration-150 ease-quick
                          text-sm font-semibold
                          ${isActive
                            ? 'border-accent text-accent'
                            : 'border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg'
                          }`}
            >
              <span>{opt.native}</span>
              <span className="text-label opacity-60">{opt.code}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GlobeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ChevronIcon({ open, size = 11 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 12 12"
      fill="none" aria-hidden="true"
      className={`shrink-0 transition-transform duration-150 ease-quick ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
