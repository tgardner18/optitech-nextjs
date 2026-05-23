import { displayTemplate }          from '@optimizely/cms-sdk'
import { ICON_CHOICES_WITH_NONE }   from './_shared/iconChoices'

export const OT_StatBlockDefault = displayTemplate({
  key:         'OT_StatBlockDefault',
  displayName: 'Stat Block',
  contentType: 'OT_StatBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        brand:   { displayName: 'Brand (Default)', sortOrder: 10 },
        canvas:  { displayName: 'Canvas',          sortOrder: 20 },
        surface: { displayName: 'Surface',         sortOrder: 30 },
      },
    },
    columns: {
      displayName: 'Columns',
      editor:      'select',
      sortOrder:   20,
      choices: {
        col2: { displayName: '2 columns — heroic scale', sortOrder: 10 },
        col3: { displayName: '3 columns — standard',     sortOrder: 20 },
        col4: { displayName: '4 columns — compact',      sortOrder: 30 },
      },
    },
    animate: {
      displayName: 'Animate count-up on scroll',
      editor:      'select',
      sortOrder:   30,
      choices: {
        true:  { displayName: 'On (Default)', sortOrder: 10 },
        false: { displayName: 'Off',          sortOrder: 20 },
      },
    },
    showIcons: {
      displayName: 'Show icons',
      editor:      'select',
      sortOrder:   40,
      choices: {
        false: { displayName: 'Off (Default)', sortOrder: 10 },
        true:  { displayName: 'On',            sortOrder: 20 },
      },
    },
    // ── Per-slot icon selectors (choices from shared registry) ──────────────
    stat1Icon: { displayName: 'Stat 1 — Icon', editor: 'select', sortOrder: 50, choices: ICON_CHOICES_WITH_NONE },
    stat2Icon: { displayName: 'Stat 2 — Icon', editor: 'select', sortOrder: 60, choices: ICON_CHOICES_WITH_NONE },
    stat3Icon: { displayName: 'Stat 3 — Icon', editor: 'select', sortOrder: 70, choices: ICON_CHOICES_WITH_NONE },
    stat4Icon: { displayName: 'Stat 4 — Icon', editor: 'select', sortOrder: 80, choices: ICON_CHOICES_WITH_NONE },
  },
})
