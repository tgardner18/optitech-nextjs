import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_DividerBlockDefault = displayTemplate({
  key:         'OT_DividerBlockDefault',
  displayName: 'Divider Default',
  contentType: 'OT_DividerBlock',
  isDefault:   true,
  settings: {

    // ── Visual treatment ───────────────────────────────────────────────────────
    style: {
      displayName: 'Style',
      editor:      'select',
      sortOrder:   10,
      choices: {
        slope: { displayName: 'Angled slope (Default)', sortOrder: 10 },
        mark:  { displayName: 'Centered text mark',     sortOrder: 20 },
        bleed: { displayName: 'Gradient bleed',         sortOrder: 30 },
      },
    },

    // ── Vertical breathing room ──────────────────────────────────────────────────
    space: {
      displayName: 'Spacing',
      editor:      'select',
      sortOrder:   20,
      choices: {
        sm: { displayName: 'Small',           sortOrder: 10 },
        md: { displayName: 'Medium',          sortOrder: 20 },
        lg: { displayName: 'Large (Default)', sortOrder: 30 },
        xl: { displayName: 'Extra large',     sortOrder: 40 },
      },
    },

    // ── Tone ─────────────────────────────────────────────────────────────────────
    tone: {
      displayName: 'Tone',
      editor:      'select',
      sortOrder:   30,
      choices: {
        neutral: { displayName: 'Neutral (Default)', sortOrder: 10 },
        brand:   { displayName: 'Brand',             sortOrder: 20 },
        accent:  { displayName: 'Accent',            sortOrder: 30 },
      },
    },

    // ── Slant direction (slope style only) ─────────────────────────────────────
    slant: {
      displayName: 'Slant (slope style only)',
      editor:      'select',
      sortOrder:   40,
      choices: {
        rise: { displayName: 'Rise — up to the right (Default)', sortOrder: 10 },
        fall: { displayName: 'Fall — down to the right',         sortOrder: 20 },
      },
    },

    // ── Ornament (text-mark style only) ────────────────────────────────────────
    ornament: {
      displayName: 'Ornament (text mark style only)',
      editor:      'select',
      sortOrder:   50,
      choices: {
        none:     { displayName: 'None',                  sortOrder: 10 },
        pendant:  { displayName: 'Pendant ❧ (Default)', sortOrder: 20 },
        asterism: { displayName: 'Asterism ⁂',         sortOrder: 30 },
        dot:      { displayName: 'Dot •',              sortOrder: 40 },
      },
    },

    // ── Entrance reveal ────────────────────────────────────────────────────────
    reveal: {
      displayName: 'Reveal on scroll',
      editor:      'select',
      sortOrder:   60,
      choices: {
        static: { displayName: 'Static (Default)', sortOrder: 10 },
        draw:   { displayName: 'Draw in',          sortOrder: 20 },
      },
    },

  },
})
