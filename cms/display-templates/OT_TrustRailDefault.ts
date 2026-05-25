import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_TrustRailDefault = displayTemplate({
  key:         'OT_TrustRailDefault',
  displayName: 'Trust Rail',
  contentType: 'OT_TrustRail',
  isDefault:   true,
  settings: {
    // ── Motion ────────────────────────────────────────────────────────────
    motion: {
      displayName: 'Motion',
      editor:      'select',
      sortOrder:   10,
      choices: {
        scroll: { displayName: 'Scroll — infinite marquee (Default)', sortOrder: 10 },
        fade:   { displayName: 'Fade — staggered reveal on scroll',   sortOrder: 20 },
        static: { displayName: 'Static — plain grid, no animation',   sortOrder: 30 },
      },
    },

    // ── Image treatment ────────────────────────────────────────────────────
    treatment: {
      displayName: 'Image Treatment',
      editor:      'select',
      sortOrder:   20,
      choices: {
        mono:  { displayName: 'Mono — grayscale, hover to colour (Default)', sortOrder: 10 },
        color: { displayName: 'Color — full colour',                         sortOrder: 20 },
      },
    },

    // ── Background ─────────────────────────────────────────────────────────
    background: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   30,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },

    // ── Density ────────────────────────────────────────────────────────────
    density: {
      displayName: 'Density',
      editor:      'select',
      sortOrder:   40,
      choices: {
        compact:     { displayName: 'Compact — tight strip (Default)', sortOrder: 10 },
        comfortable: { displayName: 'Comfortable — standard spacing',  sortOrder: 20 },
        spacious:    { displayName: 'Spacious — generous padding',     sortOrder: 30 },
      },
    },

    // ── Logo size ──────────────────────────────────────────────────────────
    size: {
      displayName: 'Logo Size',
      editor:      'select',
      sortOrder:   50,
      choices: {
        sm: { displayName: 'Small — 28 px height',          sortOrder: 10 },
        md: { displayName: 'Medium — 40 px height (Default)', sortOrder: 20 },
        lg: { displayName: 'Large — 56 px height',          sortOrder: 30 },
      },
    },

    // ── Glass overlay ──────────────────────────────────────────────────────
    glass: {
      displayName: 'Glass overlay',
      editor:      'select',
      sortOrder:   60,
      choices: {
        false: { displayName: 'Off (Default)',                         sortOrder: 10 },
        true:  { displayName: 'On — frosted panel over bg colour',    sortOrder: 20 },
      },
    },
  },
})
