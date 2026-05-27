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
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { SUPPORTED_LOCALES, getLocaleMeta, localizedHref, isSupportedLocale } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { useTranslation } from '@/lib/i18n/useTranslation'

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
}

// ── Desktop trigger + dropdown ────────────────────────────────────────────────

export function LocaleSelector({ enabledLocales }: LocaleSelectorProps) {
  const locale   = useLocale()
  const { t }    = useTranslation()
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

  // If the site only has one language configured, don't render the selector at all
  if (visibleLocales.length <= 1) return null

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

  function selectLocale(next: Locale) {
    close()
    if (next === locale) return
    // Write the NEXT_LOCALE cookie BEFORE navigating. next-intl's middleware
    // reads this cookie for locale detection. Without this, navigating back to
    // English ('/') while a stale 'es' cookie is present causes the middleware
    // to redirect the user back to '/es/' immediately, making English unreachable.
    // Setting the cookie here ensures the middleware sees the new locale on the
    // very next request, so no redirect loop occurs.
    try {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    } catch { /* private-mode or restricted context — safe to swallow */ }
    // Use the actual browser URL (window.location.pathname) not the Next.js
    // rewritten path (usePathname). next-intl middleware rewrites /es/about →
    // /about internally, so usePathname() returns '/about' — missing the prefix.
    // window.location.pathname always shows the real URL bar value.
    window.location.href = localizedHref(getBrowserPathname(), next)
  }

  const meta = getLocaleMeta(locale)

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
        <span className="tracking-wide">{meta.code}</span>
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
          {visibleLocales.map((loc: Locale, i) => {
            const lm       = getLocaleMeta(loc)
            const isActive = loc === locale

            return (
              <button
                key={loc}
                ref={i === 0 ? firstItemRef : undefined}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => selectLocale(loc)}
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
                    {lm.native}
                  </span>
                </span>
                <span className="text-label text-fg-muted shrink-0">{lm.code}</span>
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
}: {
  onSelect?: () => void
  enabledLocales?: string[]
}) {
  const locale = useLocale()
  const { t }  = useTranslation()

  const visibleLocales: Locale[] = enabledLocales?.length
    ? enabledLocales.filter(isSupportedLocale)
    : [...SUPPORTED_LOCALES]

  // Don't render if only one language is configured
  if (visibleLocales.length <= 1) return null

  function selectLocale(next: Locale) {
    if (next === locale) { onSelect?.(); return }
    onSelect?.()
    // Write NEXT_LOCALE cookie before navigating — prevents stale-cookie redirect loop.
    // See desktop selectLocale() above for full explanation.
    try {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    } catch { /* private-mode or restricted context — safe to swallow */ }
    window.location.href = localizedHref(getBrowserPathname(), next)
  }

  return (
    <div className="border-b border-fg/10 py-md">
      <p className="text-label text-fg-muted uppercase tracking-widest mb-sm">
        {t('locale.selector')}
      </p>
      <div className="grid grid-cols-2 gap-xs">
        {visibleLocales.map((loc: Locale) => {
          const lm       = getLocaleMeta(loc)
          const isActive = loc === locale

          return (
            <button
              key={loc}
              type="button"
              onClick={() => selectLocale(loc)}
              className={`flex items-center justify-between px-sm py-xs
                          border transition-colors duration-150 ease-quick
                          text-sm font-semibold
                          ${isActive
                            ? 'border-accent text-accent'
                            : 'border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg'
                          }`}
            >
              <span>{lm.native}</span>
              <span className="text-label opacity-60">{lm.code}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 12 12"
      fill="none" aria-hidden="true"
      className={`shrink-0 transition-transform duration-150 ease-quick ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
