/**
 * Canonical icon choices for display template settings.
 *
 * Keys match ICON_REGISTRY in components/icons/iconRegistry.ts exactly.
 * Import ICON_CHOICES_WITH_NONE when "None" should be the default option.
 * Import ICON_CHOICES when "None" isn't relevant.
 *
 * To add an icon: add it here + add it to iconRegistry.ts, then push templates.
 */

const BASE_CHOICES = {
  // ── Data & Metrics ──────────────────────────────────────────────────────
  zap:          { displayName: 'Zap',            sortOrder:  10 },
  trendingUp:   { displayName: 'Trending Up',    sortOrder:  20 },
  barChart:     { displayName: 'Bar Chart',      sortOrder:  30 },
  users:        { displayName: 'Users',          sortOrder:  40 },
  globe:        { displayName: 'Globe',          sortOrder:  50 },
  clock:        { displayName: 'Clock',          sortOrder:  60 },
  // ── Trust & Achievement ─────────────────────────────────────────────────
  shield:       { displayName: 'Shield',         sortOrder:  70 },
  award:        { displayName: 'Award',          sortOrder:  80 },
  checkCircle:  { displayName: 'Check Circle',   sortOrder:  90 },
  sparkles:     { displayName: 'Sparkles',       sortOrder: 100 },
  star:         { displayName: 'Star',           sortOrder: 110 },
  // ── Actions & Navigation ────────────────────────────────────────────────
  arrowRight:   { displayName: 'Arrow Right',    sortOrder: 120 },
  chevronRight: { displayName: 'Chevron Right',  sortOrder: 130 },
  externalLink: { displayName: 'External Link',  sortOrder: 140 },
  arrowUpRight: { displayName: 'Arrow Up-Right', sortOrder: 150 },
  rocket:       { displayName: 'Rocket',         sortOrder: 160 },
  plus:         { displayName: 'Plus',           sortOrder: 170 },
  // ── Media & Communication ───────────────────────────────────────────────
  play:         { displayName: 'Play',           sortOrder: 180 },
  download:     { displayName: 'Download',       sortOrder: 190 },
  send:         { displayName: 'Send',           sortOrder: 200 },
} as const

/** Full icon set — use for display template settings that require an icon. */
export const ICON_CHOICES = BASE_CHOICES

/** Full icon set with a leading "None" option — use when icon is optional. */
export const ICON_CHOICES_WITH_NONE = {
  none: { displayName: 'None (Default)', sortOrder: 5 },
  ...BASE_CHOICES,
} as const
