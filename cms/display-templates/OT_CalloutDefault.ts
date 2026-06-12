import { displayTemplate }       from '@optimizely/cms-sdk'
import { ICON_CHOICES_WITH_NONE } from './_shared/iconChoices'

export const OT_CalloutDefault = displayTemplate({
  key:         'OT_CalloutDefault',
  displayName: 'Callout Default',
  contentType: 'OT_CalloutBlock',
  isDefault:   true,
  settings: {

    // ── Semantic intent ──────────────────────────────────────────────────────
    intent: {
      displayName: 'Intent',
      editor:      'select',
      sortOrder:   10,
      choices: {
        neutral: { displayName: 'Neutral',          sortOrder: 10 },
        info:    { displayName: 'Info (Default)',    sortOrder: 20 },
        success: { displayName: 'Success',           sortOrder: 30 },
        warning: { displayName: 'Warning',           sortOrder: 40 },
        danger:  { displayName: 'Danger',            sortOrder: 50 },
        brand:   { displayName: 'Brand',             sortOrder: 60 },
      },
    },

    // ── Visual variant ───────────────────────────────────────────────────────
    variant: {
      displayName: 'Variant',
      editor:      'select',
      sortOrder:   20,
      choices: {
        filled:   { displayName: 'Filled (Default)',              sortOrder: 10 },
        bordered: { displayName: 'Bordered',                      sortOrder: 20 },
        bar:      { displayName: 'Bar — Full width recommended',  sortOrder: 30 },
      },
    },

    // ── Size ─────────────────────────────────────────────────────────────────
    size: {
      displayName: 'Size',
      editor:      'select',
      sortOrder:   30,
      choices: {
        default: { displayName: 'Default (Default)', sortOrder: 10 },
        compact: { displayName: 'Compact',            sortOrder: 20 },
      },
    },

    // ── Alignment ────────────────────────────────────────────────────────────
    alignment: {
      displayName: 'Alignment',
      editor:      'select',
      sortOrder:   40,
      choices: {
        left:   { displayName: 'Left (Default)', sortOrder: 10 },
        center: { displayName: 'Center',          sortOrder: 20 },
      },
    },

    // ── Dismissible ──────────────────────────────────────────────────────────
    dismissible: {
      displayName: 'Dismissible',
      editor:      'select',
      sortOrder:   50,
      choices: {
        off: { displayName: 'Off (Default)', sortOrder: 10 },
        on:  { displayName: 'On',            sortOrder: 20 },
      },
    },

    // ── Sticky (bar only) ────────────────────────────────────────────────────
    sticky: {
      displayName: 'Sticky (bar variant only)',
      editor:      'select',
      sortOrder:   60,
      choices: {
        off: { displayName: 'Off (Default)',    sortOrder: 10 },
        on:  { displayName: 'On — fixed top-0', sortOrder: 20 },
      },
    },

    // ── Icon ─────────────────────────────────────────────────────────────────
    icon: {
      displayName: 'Icon',
      editor:      'select',
      sortOrder:   70,
      choices:     ICON_CHOICES_WITH_NONE,
    },

    // ── Entrance animation ───────────────────────────────────────────────────
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor:      'select',
      sortOrder:   80,
      choices: {
        none:     { displayName: 'None (Default)', sortOrder: 10 },
        fade:     { displayName: 'Fade in',        sortOrder: 20 },
        slide:    { displayName: 'Slide up',       sortOrder: 30 },
        parallax: { displayName: 'Parallax',       sortOrder: 40 },
      },
    },

    // ── Max width ────────────────────────────────────────────────────────────
    maxWidth: {
      displayName: 'Max Width',
      editor:      'select',
      sortOrder:   90,
      choices: {
        full:    { displayName: 'Full — spans container width (Default)', sortOrder: 10 },
        wide:    { displayName: 'Wide — max 768px, centered',             sortOrder: 20 },
        default: { displayName: 'Default — max 560px, centered',         sortOrder: 30 },
        narrow:  { displayName: 'Narrow — max 400px, centered',          sortOrder: 40 },
      },
    },

  },
})
