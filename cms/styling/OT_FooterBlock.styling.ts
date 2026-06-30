export type FooterStyle      = 'spotlight' | 'centered' | 'minimal'
export type FooterBackground = 'dark' | 'light' | 'brand'

export type FooterStyleOptions = {
  style:      FooterStyle
  background: FooterBackground
}

const KNOWN_STYLES = new Set<FooterStyle>(['spotlight', 'centered', 'minimal'])
const KNOWN_BG     = new Set<FooterBackground>(['dark', 'light', 'brand'])

/**
 * Resolve the footer's two independent axes from the raw footerRef record.
 *
 * - `footerStyle`     → layout structure (default 'spotlight', the original design)
 * - `footerLeftMode`  → background tone (default 'dark'). Key is historical: it
 *                       was a left-panel-only light/dark toggle and now also
 *                       carries the whole-footer tone, plus the new 'brand' value.
 *
 * Unknown / legacy values fall back to the safe defaults so a half-migrated CMS
 * never renders an undefined layout.
 */
export function getFooterStyles(s: Record<string, unknown> | null | undefined): FooterStyleOptions {
  const rawStyle = String(s?.footerStyle ?? 'spotlight')
  const style = (KNOWN_STYLES.has(rawStyle as FooterStyle) ? rawStyle : 'spotlight') as FooterStyle

  const rawBg = String(s?.footerLeftMode ?? 'dark')
  const background = (KNOWN_BG.has(rawBg as FooterBackground) ? rawBg : 'dark') as FooterBackground

  return { style, background }
}

/**
 * Scoped color-context attributes for a footer surface. The footer pins its own
 * tone regardless of the site's light/dark mode by setting data-theme directly.
 *
 * - dark  → standard dark surface
 * - light → standard light surface (logo invert auto-disables via globals.css)
 * - brand → dark foreground semantics (light text, inverted logo) + the
 *           data-footer-surface="brand" hook that flips --ot-canvas/-fg-muted to
 *           brand-drench values in tokens.css
 */
export function footerSurfaceAttrs(
  background: FooterBackground,
): { 'data-theme': 'dark' | 'light'; 'data-footer-surface'?: 'brand' } {
  if (background === 'light') return { 'data-theme': 'light' }
  if (background === 'brand') return { 'data-theme': 'dark', 'data-footer-surface': 'brand' }
  return { 'data-theme': 'dark' }
}
