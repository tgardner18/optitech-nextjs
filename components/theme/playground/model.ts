// Shared model for the theme playground — types, default token values, and the
// CMS-settings → state merge. No React here, so the server page and the client
// component can both import it.

export type Mode = 'dark' | 'light'

export type Grounds = {
  canvas: string
  surface: string
  fg: string
  fgMuted: string
}

export type ColorState = {
  // Mode-invariant (constant across dark/light per DESIGN.md)
  brand: string
  brandHover: string
  accent: string
  accentHover: string
  fgOnBrand: string
  fgOnAccent: string
  // Mode-specific grounds
  dark: Grounds
  light: Grounds
}

// Defaults mirror styles/tokens.css exactly, so an unconfigured site renders
// identically to live.
export const DEFAULT_COLORS: ColorState = {
  brand: 'oklch(55% 0.18 195)',
  brandHover: 'oklch(38% 0.16 195)',
  accent: 'oklch(82% 0.19 145)',
  accentHover: 'oklch(68% 0.17 145)',
  fgOnBrand: 'oklch(97% 0.005 195)',
  fgOnAccent: 'oklch(12% 0.012 195)',
  dark: {
    canvas: 'oklch(12% 0.012 195)',
    surface: 'oklch(20% 0.022 195)',
    fg: 'oklch(97% 0.005 195)',
    fgMuted: 'oklch(68% 0.06 195)',
  },
  light: {
    canvas: 'oklch(97% 0.005 195)',
    surface: 'oklch(93% 0.008 195)',
    fg: 'oklch(12% 0.012 195)',
    fgMuted: 'oklch(38% 0.05 195)',
  },
}

// CMS ThemeManager field → which state slot it seeds. Mirrors lib/optimizely.ts.
export function buildInitialColors(settings: Record<string, unknown> | null | undefined): ColorState {
  const s = settings ?? {}
  const pick = (key: string, fallback: string) => {
    const v = s[key]
    return typeof v === 'string' && v.trim() ? v.trim() : fallback
  }
  const d = DEFAULT_COLORS
  return {
    brand: pick('colorBrand', d.brand),
    brandHover: pick('colorBrandHover', d.brandHover),
    accent: pick('colorAccent', d.accent),
    accentHover: pick('colorAccentHover', d.accentHover),
    fgOnBrand: pick('colorFgOnBrand', d.fgOnBrand),
    fgOnAccent: pick('colorFgOnAccent', d.fgOnAccent),
    dark: {
      canvas: pick('colorCanvas', d.dark.canvas),
      surface: pick('colorSurface', d.dark.surface),
      fg: pick('colorFg', d.dark.fg),
      fgMuted: pick('colorFgMuted', d.dark.fgMuted),
    },
    light: {
      canvas: pick('colorCanvasLight', d.light.canvas),
      surface: pick('colorSurfaceLight', d.light.surface),
      fg: pick('colorFgLight', d.light.fg),
      fgMuted: pick('colorFgMutedLight', d.light.fgMuted),
    },
  }
}

export type Axes = {
  cornerStyle: string
  primaryFont: string
  motionIntensity: string
  navbarStyle: string
}

export function buildInitialAxes(settings: Record<string, unknown> | null | undefined): Axes {
  const s = settings ?? {}
  const str = (k: string, f: string) => (typeof s[k] === 'string' && s[k] ? (s[k] as string) : f)
  return {
    cornerStyle:     str('cornerStyle',     'sharp'),
    primaryFont:     str('primaryFont',     'poppins'),
    motionIntensity: str('motionIntensity', 'default'),
    navbarStyle:     str('navbarStyle',     'top-bar'),
  }
}
