import { contentType } from '@optimizely/cms-sdk'
import { OT_NavigationItem } from './OT_NavigationItem'
import { OT_FooterLink } from './OT_FooterLink'
import { OT_FooterColumn } from './OT_FooterColumn'

export const OT_ThemeManager = contentType({
  key: 'OT_ThemeManager',
  displayName: 'Theme Manager',
  baseType: '_component',
  properties: {
    // Identity — which front-end domain loads this theme
    frontEndDomain: { type: 'string', displayName: 'Front-End Domain (e.g. mysite.vercel.app)', group: 'OT_Content', sortOrder: 1 },

    // Logo
    logo:           { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Logo',                                          group: 'OT_Content', sortOrder: 5   },
    logoAlt:        { type: 'string',                                     displayName: 'Logo Alt Text',                                   group: 'OT_Content', sortOrder: 10  },
    logoFit: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Logo Fit',
      group: 'OT_Content',
      sortOrder: 15,
      enum: [
        { value: 'full',    displayName: 'Full — wide logo, natural width (default)' },
        { value: 'icon',    displayName: 'Icon — square / icon logo, fixed 40×40px'  },
        { value: 'compact', displayName: 'Compact — small horizontal logo, max 160px' },
      ],
    },
    logoInvertDark: { type: 'boolean', displayName: 'Invert Logo in Dark Mode (turns dark logos white)', group: 'OT_Content', sortOrder: 18 },
    defaultMode: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Default Theme Mode',
      description: 'Controls the site\'s initial color mode. Users can still switch modes via the header toggle.',
      group: 'OT_Content',
      sortOrder: 19,
      enum: [
        { value: 'dark',  displayName: 'Dark (default)' },
        { value: 'light', displayName: 'Light' },
      ],
    },

    // Header CTA
    ctaLabel: { type: 'string', displayName: 'CTA Label', group: 'OT_Content', sortOrder: 20 },
    ctaUrl:   { type: 'url',    displayName: 'CTA URL',   group: 'OT_Content', sortOrder: 30 },

    // Header Navigation
    primaryNavigation: {
      type: 'array',
      displayName: 'Primary Navigation',
      description: 'Top-level nav links. Each item uses a native Link picker (supports internal pages, external URLs, and DAM files). Add Sub-Navigation Items inside each entry to create a dropdown.',
      group: 'OT_Content',
      sortOrder: 40,
      items: { type: 'component', contentType: OT_NavigationItem },
    },

    // Footer
    copyright:    { type: 'string', displayName: 'Copyright',      group: 'OT_Content', sortOrder: 50 },
    footerTagline: { type: 'string', displayName: 'Footer Tagline', group: 'OT_Content', sortOrder: 60 },
    footerColumns: {
      type: 'array',
      displayName: 'Footer Columns',
      description: 'Multi-column footer navigation. Each column has a title and a list of links.',
      group: 'OT_Content',
      sortOrder: 70,
      items: { type: 'component', contentType: OT_FooterColumn },
    },
    legalLinks: {
      type: 'array',
      displayName: 'Legal Links (bottom bar)',
      description: 'Privacy policy, terms, and other legal links shown next to the copyright.',
      group: 'OT_Content',
      sortOrder: 80,
      items: { type: 'component', contentType: OT_FooterLink },
    },

    // Theme color overrides — CSS values (hex, oklch, hsl, etc.)
    // All optional; if empty the defaults in styles/tokens.css apply.
    // ── Brand ──────────────────────────────────────────────────────────────
    colorBrand:        { type: 'string', displayName: 'Brand — primary fill: hero panels, CTAs (e.g. oklch(55% 0.18 195))',          group: 'OT_Theme', sortOrder: 100 },
    colorBrandHover:   { type: 'string', displayName: 'Brand Hover — depth state on hover (hex or oklch)',                             group: 'OT_Theme', sortOrder: 110 },
    // ── Accent ─────────────────────────────────────────────────────────────
    colorAccent:       { type: 'string', displayName: 'Accent — highlights, badges, alt CTAs (e.g. oklch(82% 0.19 145))',              group: 'OT_Theme', sortOrder: 120 },
    colorAccentHover:  { type: 'string', displayName: 'Accent Hover — deeper accent for hover states (hex or oklch)',                  group: 'OT_Theme', sortOrder: 125 },
    colorFgOnAccent:   { type: 'string', displayName: 'Foreground on Accent — text/icons on accent-filled surfaces (hex or oklch)',    group: 'OT_Theme', sortOrder: 127 },
    // ── Canvas / Surface ───────────────────────────────────────────────────
    colorCanvas:       { type: 'string', displayName: 'Canvas Dark — page background in dark mode (hex or oklch)',                     group: 'OT_Theme', sortOrder: 130 },
    colorSurface:      { type: 'string', displayName: 'Surface Dark — component panels in dark mode (hex or oklch)',                   group: 'OT_Theme', sortOrder: 140 },
    colorCanvasLight:  { type: 'string', displayName: 'Canvas Light — page background in light mode (hex or oklch)',                   group: 'OT_Theme', sortOrder: 150 },
    colorSurfaceLight: { type: 'string', displayName: 'Surface Light — component panels in light mode (hex or oklch)',                 group: 'OT_Theme', sortOrder: 160 },
    // ── Foreground ─────────────────────────────────────────────────────────
    colorFgOnBrand:    { type: 'string', displayName: 'Foreground on Brand — text/borders on brand-filled surfaces (hex or oklch)',    group: 'OT_Theme', sortOrder: 165 },
    colorFgMuted:      { type: 'string', displayName: 'Foreground Muted Dark — secondary text in dark mode (hex or oklch)',            group: 'OT_Theme', sortOrder: 170 },
    colorFgMutedLight: { type: 'string', displayName: 'Foreground Muted Light — secondary text in light mode (hex or oklch)',          group: 'OT_Theme', sortOrder: 175 },
  },
})
