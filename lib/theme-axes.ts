/**
 * Non-color theme axes — vetted value sets.
 *
 * ThemeManager stores INTENT (an option key chosen by an editor). The actual CSS
 * values live here, never in the CMS — mirroring the color-token philosophy: the
 * editor picks a personality, the code owns the math. buildThemeCSS() (lib/optimizely.ts)
 * maps the stored key through these tables to emit --ot-* overrides before first paint.
 *
 * Every axis has an explicit DEFAULT key whose values equal the current tokens in
 * styles/tokens.css, so an unset (or default-valued) field renders identically to today.
 */

// ── Corner Style (radius axis) ──────────────────────────────────────────────
// Constrained on purpose: DESIGN.md treats sharp corners as brand identity and
// bans rounded-lg/xl/full. These three steps shift personality without ever
// reaching the SaaS-pill anti-pattern. `surface` drives cards/panels/glass;
// `control` drives buttons (kept a touch tighter than surface at Rounded).
export const CORNER_STYLES = {
  sharp:   { surface: '0px',  control: '0px' },
  soft:    { surface: '4px',  control: '4px' },
  rounded: { surface: '10px', control: '8px' },
} as const

export type CornerStyleKey = keyof typeof CORNER_STYLES
export const DEFAULT_CORNER_STYLE: CornerStyleKey = 'sharp'

// ── Primary Font ──────────────────────────────────────────────────────────────
// next/font is build-time: only fonts preloaded in app/layout.tsx can be used.
// Each option maps to the CSS var that next/font assigned. This is the WHOLE
// hierarchy (display headers → body → labels) — it overrides --ot-font-sans, so
// every type level, gradient fill, and bloom header follows the selected family.
// Every option ships the 300–800 weight ladder Poppins uses. (Syne stays a fixed,
// non-themeable accent font for select areas — see app/layout.tsx.)
export const PRIMARY_FONTS = {
  poppins:        { var: 'var(--font-poppins)',   label: 'Poppins (default)' },
  hankenGrotesk:  { var: 'var(--font-primary-a)', label: 'Hanken Grotesk'    },
  sora:           { var: 'var(--font-primary-b)', label: 'Sora'              },
  bricolage:      { var: 'var(--font-primary-c)', label: 'Bricolage Grotesque' },
} as const

export type PrimaryFontKey = keyof typeof PRIMARY_FONTS
export const DEFAULT_PRIMARY_FONT: PrimaryFontKey = 'poppins'

// ── Motion Intensity ────────────────────────────────────────────────────────
// A single unitless multiplier on the --ot-dur-* scale (incl. ambient loops).
// Composes with, never overrides, OS reduced-motion: the value only feeds the
// no-preference durations — the `prefers-reduced-motion: reduce` static blocks
// are independent and always win. No "off" option (the OS owns that floor).
export const MOTION_INTENSITIES = {
  calm:      0.7,
  default:   1,
  energetic: 1.3,
} as const

export type MotionIntensityKey = keyof typeof MOTION_INTENSITIES
export const DEFAULT_MOTION_INTENSITY: MotionIntensityKey = 'default'

// ── Resolvers — return the override value only when set and ≠ default ────────
// (null = "leave the token at its default", so buildThemeCSS emits nothing.)

export function resolveCornerStyle(key: string | null | undefined) {
  if (!key || key === DEFAULT_CORNER_STYLE) return null
  return CORNER_STYLES[key as CornerStyleKey] ?? null
}

export function resolvePrimaryFont(key: string | null | undefined) {
  if (!key || key === DEFAULT_PRIMARY_FONT) return null
  return PRIMARY_FONTS[key as PrimaryFontKey]?.var ?? null
}

export function resolveMotionScale(key: string | null | undefined) {
  if (!key || key === DEFAULT_MOTION_INTENSITY) return null
  return MOTION_INTENSITIES[key as MotionIntensityKey] ?? null
}
