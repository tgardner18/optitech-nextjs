/**
 * Canonical icon choices for display template settings.
 *
 * Keys match ICON_REGISTRY in components/icons/iconRegistry.ts exactly.
 * Sorted alphabetically by displayName. sortOrder values are sequential
 * multiples of 10 — insert new entries at the correct alphabetical position
 * and re-number if needed.
 *
 * Import ICON_CHOICES_WITH_NONE when "None" should be the default option.
 * Import ICON_CHOICES when "None" isn't relevant.
 */

const BASE_CHOICES = {
  activity:      { displayName: 'Activity',       sortOrder:  10 },
  arrowRight:    { displayName: 'Arrow Right',     sortOrder:  20 },
  arrowUpRight:  { displayName: 'Arrow Up-Right',  sortOrder:  30 },
  award:         { displayName: 'Award',           sortOrder:  40 },
  barChart:      { displayName: 'Bar Chart',       sortOrder:  50 },
  calendar:      { displayName: 'Calendar',        sortOrder:  60 },
  checkCircle:   { displayName: 'Check Circle',    sortOrder:  70 },
  chevronRight:  { displayName: 'Chevron Right',   sortOrder:  80 },
  clock:         { displayName: 'Clock',           sortOrder:  90 },
  code:          { displayName: 'Code',            sortOrder: 100 },
  cpu:           { displayName: 'CPU',             sortOrder: 110 },
  database:      { displayName: 'Database',        sortOrder: 120 },
  dollarSign:    { displayName: 'Dollar Sign',     sortOrder: 130 },
  download:      { displayName: 'Download',        sortOrder: 140 },
  externalLink:  { displayName: 'External Link',   sortOrder: 150 },
  eye:           { displayName: 'Eye',             sortOrder: 160 },
  gauge:         { displayName: 'Gauge',           sortOrder: 170 },
  globe:         { displayName: 'Globe',           sortOrder: 180 },
  headphones:    { displayName: 'Headphones',      sortOrder: 190 },
  heart:         { displayName: 'Heart',           sortOrder: 200 },
  infinity:      { displayName: 'Infinity',        sortOrder: 210 },
  layers:        { displayName: 'Layers',          sortOrder: 220 },
  lightbulb:     { displayName: 'Lightbulb',       sortOrder: 230 },
  lock:          { displayName: 'Lock',            sortOrder: 240 },
  mail:          { displayName: 'Mail',            sortOrder: 250 },
  mapPin:        { displayName: 'Map Pin',         sortOrder: 260 },
  messageSquare: { displayName: 'Message Square',  sortOrder: 270 },
  monitor:       { displayName: 'Monitor',         sortOrder: 280 },
  package:       { displayName: 'Package',         sortOrder: 290 },
  percent:       { displayName: 'Percent',         sortOrder: 300 },
  play:          { displayName: 'Play',            sortOrder: 310 },
  plus:          { displayName: 'Plus',            sortOrder: 320 },
  rocket:        { displayName: 'Rocket',          sortOrder: 330 },
  send:          { displayName: 'Send',            sortOrder: 340 },
  server:        { displayName: 'Server',          sortOrder: 350 },
  settings:      { displayName: 'Settings',        sortOrder: 360 },
  shield:        { displayName: 'Shield',          sortOrder: 370 },
  sparkles:      { displayName: 'Sparkles',        sortOrder: 380 },
  star:          { displayName: 'Star',            sortOrder: 390 },
  target:        { displayName: 'Target',          sortOrder: 400 },
  thumbsUp:      { displayName: 'Thumbs Up',       sortOrder: 410 },
  timer:         { displayName: 'Timer',           sortOrder: 420 },
  trendingUp:    { displayName: 'Trending Up',     sortOrder: 430 },
  trophy:        { displayName: 'Trophy',          sortOrder: 440 },
  userCheck:     { displayName: 'User Check',      sortOrder: 450 },
  users:         { displayName: 'Users',           sortOrder: 460 },
  wrench:        { displayName: 'Wrench',          sortOrder: 470 },
  zap:           { displayName: 'Zap',             sortOrder: 480 },
} as const

/** Full icon set — use for display template settings that require an icon. */
export const ICON_CHOICES = BASE_CHOICES

/** Full icon set with a leading "None" option — use when icon is optional. */
export const ICON_CHOICES_WITH_NONE = {
  none: { displayName: 'None (Default)', sortOrder: 5 },
  ...BASE_CHOICES,
} as const

/**
 * Content-type `selectOne` enum form of the same icon set.
 *
 * Content-type string properties (e.g. OT_TabItem.tabIcon) take an array of
 * { value, displayName } rather than the keyed record the display-template
 * `choices` editor uses. Deriving it from BASE_CHOICES here keeps the
 * content-property pickers in lockstep with the display-template pickers — one
 * source of truth, one alphabetical order, the full library everywhere.
 *
 * Object.entries preserves BASE_CHOICES' insertion order, which is already
 * alphabetical by displayName.
 */
export const ICON_ENUM = Object.entries(BASE_CHOICES).map(
  ([value, { displayName }]) => ({ value, displayName }),
)

/** Icon enum with a leading "None (Default)" option — use when icon is optional. */
export const ICON_ENUM_WITH_NONE = [
  { value: 'none', displayName: 'None (Default)' },
  ...ICON_ENUM,
]
