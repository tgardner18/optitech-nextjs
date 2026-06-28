import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_DividerBlockDefault = displayTemplate({
  key:         'OT_DividerBlockDefault',
  displayName: 'Divider Default',
  contentType: 'OT_DividerBlock',
  isDefault:   true,
  settings: {

    // ── Visual treatment ───────────────────────────────────────────────────────

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

    // ── Tone — one control across every style ──────────────────────────────────
    // mark gets gradient hairlines for spectrum / aurora; glow and bleed carry
    // the tone as the light color. Neutral is a quiet, tinted treatment.
    tone: {
      displayName: 'Tone',
      editor:      'select',
      sortOrder:   30,
      choices: {
        neutral:  { displayName: 'Neutral (Default)',        sortOrder: 10 },
        brand:    { displayName: 'Brand',                    sortOrder: 20 },
        accent:   { displayName: 'Accent',                   sortOrder: 30 },
        spectrum: { displayName: 'Spectrum — brand → accent', sortOrder: 40 },
        aurora:   { displayName: 'Aurora — brand · accent · brand', sortOrder: 50 },
      },
    },

    // ── Ornament (text-mark style only) ────────────────────────────────────────
    ornament: {
      displayName: 'Ornament (text mark style only)',
      editor:      'select',
      sortOrder:   40,
      choices: {
        none:     { displayName: 'None',                sortOrder: 10 },
        pendant:  { displayName: 'Pendant ❧ (Default)', sortOrder: 20 },
        asterism: { displayName: 'Asterism ⁂',          sortOrder: 30 },
        dot:      { displayName: 'Dot •',               sortOrder: 40 },
      },
    },

    // ── Weight — glow rule thickness & bleed intensity (not used by mark) ───────
    weight: {
      displayName: 'Weight (glow & bleed styles)',
      editor:      'select',
      sortOrder:   50,
      choices: {
        slim: { displayName: 'Slim (Default)', sortOrder: 10 },
        bold: { displayName: 'Bold',           sortOrder: 20 },
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
