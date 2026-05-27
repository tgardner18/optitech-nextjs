/**
 * Theme initialisation — runs before React hydration to prevent FOUC.
 *
 * Priority order:
 *   1. User's explicit preference stored in localStorage ("optitech-theme")
 *   2. Site default from CMS ThemeManager, passed as data-default-theme on <html>
 *   3. Hard fallback: "dark"
 *
 * This script is loaded with strategy="beforeInteractive" by next/script, which
 * Next.js injects into <head> as a blocking <script src="…"> in the server-rendered
 * HTML. It executes before any React JavaScript runs.
 *
 * The CMS defaultMode value is NOT embedded here (no inline string interpolation).
 * Instead, layout.tsx sets `data-default-theme` on the <html> element, which
 * is already present in the DOM when this script executes.
 */
(function () {
  try {
    var h = document.documentElement
    var stored = localStorage.getItem('optitech-theme')
    var defaultMode = h.getAttribute('data-default-theme') || 'dark'
    h.setAttribute('data-theme', stored || defaultMode)
  } catch (e) {
    // localStorage unavailable (private mode, browser restriction) — keep default
  }
})()
