import { contentType } from '@optimizely/cms-sdk'
import { OT_NavigationItem } from './OT_NavigationItem'
import { OT_FooterBlock } from './OT_FooterBlock'

export const OT_ThemeManager = contentType({
  key: 'OT_ThemeManager',
  displayName: 'Theme Manager',
  baseType: '_component',
  properties: {
    // Identity — which front-end domain loads this theme
    frontEndDomain: {
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9]([a-zA-Z0-9\\-]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9\\-]*[a-zA-Z0-9])?)*([:\\d]+)?$',
      displayName: 'Front-End Domain (e.g. mysite.vercel.app)',
      description: 'Hostname only — no https:// prefix. Include port if needed (e.g. localhost:3000).',
      group: 'OT_Content',
      sortOrder: 1,
    },

    // Logo
    logo:           { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Logo',                                          group: 'OT_Content', sortOrder: 5   },
    logoAlt:        { type: 'string', maxLength: 100,   displayName: 'Logo Alt Text',                                   group: 'OT_Content', sortOrder: 10  },
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
    ctaLabel: { type: 'string', maxLength: 40, displayName: 'CTA Label', group: 'OT_Content', sortOrder: 20 },
    ctaUrl:   { type: 'url',   displayName: 'CTA URL',   group: 'OT_Content', sortOrder: 30 },

    // Search
    searchScope: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Search Scope',
      description: 'Controls whether site search returns results from this site only or all sites in the CMS instance.',
      group: 'OT_Content',
      sortOrder: 35,
      enum: [
        { value: 'thisSite', displayName: 'This Site Only (default)' },
        { value: 'allSites', displayName: 'All Sites in CMS Instance' },
      ],
    },

    // Header Navigation
    primaryNavigation: {
      type: 'array',
      displayName: 'Primary Navigation',
      description: 'Top-level nav links. Each item uses a native Link picker (supports internal pages, external URLs, and DAM files). Add Sub-Navigation Items inside each entry to create a dropdown.',
      group: 'OT_Content',
      sortOrder: 40,
      items: { type: 'component', contentType: OT_NavigationItem },
    },

    // Footer — structured footer block (replaces footerColumns / footerTagline)
    footerRef: {
      type: 'contentReference',
      allowedTypes: [OT_FooterBlock],
      displayName: 'Footer Block',
      description: 'Select the Footer block item that contains the site description and navigation links. Create a Footer block in Shared Assets first.',
      group: 'OT_Content',
      sortOrder: 45,
    },

    // Footer
    copyright:    { type: 'string', isLocalized: true, maxLength: 150, displayName: 'Copyright',      group: 'OT_Content', sortOrder: 50 },

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
    colorFg:           { type: 'string', displayName: 'Foreground Dark — primary text in dark mode (default: near-white)',             group: 'OT_Theme', sortOrder: 167 },
    colorFgLight:      { type: 'string', displayName: 'Foreground Light — primary text in light mode (default: near-black)',           group: 'OT_Theme', sortOrder: 168 },
    colorFgMuted:      { type: 'string', displayName: 'Foreground Muted Dark — secondary text in dark mode (hex or oklch)',            group: 'OT_Theme', sortOrder: 170 },
    colorFgMutedLight: { type: 'string', displayName: 'Foreground Muted Light — secondary text in light mode (hex or oklch)',          group: 'OT_Theme', sortOrder: 175 },

    // ── Non-color theme axes ───────────────────────────────────────────────
    // Stored as option keys only; vetted CSS values live in lib/theme-axes.ts.
    // All default to the current behavior, so unset = identical to today.
    cornerStyle: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Corner Style — radius on cards, panels, glass & buttons',
      description: 'Sharp is the default. Soft and Rounded add a modest radius to surfaces and controls only — inputs and structure are unaffected.',
      group: 'OT_Theme',
      sortOrder: 180,
      enum: [
        { value: 'sharp',   displayName: 'Sharp — square corners (default)' },
        { value: 'soft',    displayName: 'Soft — subtle 4px radius' },
        { value: 'rounded', displayName: 'Rounded — 8–10px radius' },
      ],
    },
    primaryFont: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Primary Font — the whole type hierarchy (display, headline, body, labels)',
      description: 'Sets the primary typeface for the entire site — display headers down to body and labels. All four ship the same 300–800 weight range and hold up under the display, gradient-fill, and bloom treatments. Syne stays reserved for select accent areas.',
      group: 'OT_Theme',
      sortOrder: 185,
      enum: [
        { value: 'poppins',       displayName: 'Poppins — geometric, friendly (default)' },
        { value: 'sourceSerif', displayName: 'Source Serif — editorial, trustworthy (serif)' },
        { value: 'sora',          displayName: 'Sora — squared, technical' },
        { value: 'bricolage',     displayName: 'Bricolage Grotesque — expressive, characterful' },
      ],
    },
    motionIntensity: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Motion Intensity — scales all animation/transition timing',
      description: 'Calm slows motion, Energetic speeds it up. Never overrides a visitor\'s OS "reduce motion" setting — that always wins.',
      group: 'OT_Theme',
      sortOrder: 190,
      enum: [
        { value: 'calm',      displayName: 'Calm — slower (1.3×)' },
        { value: 'default',   displayName: 'Default — current timing (1×)' },
        { value: 'energetic', displayName: 'Energetic — faster (0.7×)' },
      ],
    },

    // ── SEO / Search & Discovery ──────────────────────────────────────────────
    siteName: {
      type: 'string',
      displayName: 'Site Name',
      description: 'Used in the browser tab title template ("Page Title | Site Name") and og:site_name.',
      group: 'OT_SEO',
      sortOrder: 10,
    },
    defaultSeoDescription: {
      type: 'string',
      displayName: 'Default Meta Description',
      description: 'Fallback description for pages that have no Meta Description set.',
      group: 'OT_SEO',
      sortOrder: 20,
    },
    defaultSocialImage: {
      type: 'contentReference',
      displayName: 'Default Social Share Image',
      description: 'Fallback og:image and twitter:image for pages with no Social Share Image set.',
      allowedTypes: ['_image'],
      group: 'OT_SEO',
      sortOrder: 30,
    },
    twitterHandle: {
      type: 'string',
      displayName: 'X / Twitter Handle',
      description: 'Include the @ symbol. Used as twitter:site on every page.',
      group: 'OT_SEO',
      sortOrder: 40,
    },
    organizationDescription: {
      type: 'string',
      displayName: 'Organization Summary',
      description: 'One or two sentences describing the organization. Injected into the Organization JSON-LD block on every page — used by AI engines to establish entity identity.',
      group: 'OT_SEO',
      sortOrder: 50,
    },

    // ── Integrations ──────────────────────────────────────────────────────────
    // Third-party script IDs resolved per-domain so different deployments can
    // target different accounts without environment variable changes.
    webExperimentationProjectId: {
      type: 'string',
      maxLength: 20,
      displayName: 'Optimizely Web Experimentation Project ID',
      description: 'Numeric project ID from your Optimizely Web Experimentation account (e.g. 12345678). When set, the Optimizely Web snippet is injected as a blocking script in <head> for this domain.',
      group: 'OT_Integrations',
      sortOrder: 10,
    },
  },
})
