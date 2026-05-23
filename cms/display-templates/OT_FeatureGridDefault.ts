import { displayTemplate }        from '@optimizely/cms-sdk'
import { ICON_CHOICES_WITH_NONE } from './_shared/iconChoices'

export const OT_FeatureGridDefault = displayTemplate({
  key:         'OT_FeatureGridDefault',
  displayName: 'Feature Grid',
  contentType: 'OT_FeatureGridBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    layout: {
      displayName: 'Layout',
      editor:      'select',
      sortOrder:   20,
      choices: {
        grid:  { displayName: 'Grid (Default)',                   sortOrder: 10 },
        ruled: { displayName: 'Ruled — 2-col with divider lines', sortOrder: 20 },
      },
    },
    columns: {
      displayName: 'Columns (Grid layout only)',
      editor:      'select',
      sortOrder:   30,
      choices: {
        col2: { displayName: '2 columns',           sortOrder: 10 },
        col3: { displayName: '3 columns (Default)', sortOrder: 20 },
        col4: { displayName: '4 columns — compact', sortOrder: 30 },
      },
    },
    iconStyle: {
      displayName: 'Icon style',
      editor:      'select',
      sortOrder:   40,
      choices: {
        none:       { displayName: 'None (Default)',                    sortOrder: 10 },
        accent:     { displayName: 'Accent — inline before headline',   sortOrder: 20 },
        structural: { displayName: 'Structural — above headline',       sortOrder: 30 },
      },
    },
    // ── Per-slot icon selectors ──────────────────────────────────────────────
    feature1Icon: { displayName: 'Feature 1 — Icon', editor: 'select', sortOrder:  50, choices: ICON_CHOICES_WITH_NONE },
    feature2Icon: { displayName: 'Feature 2 — Icon', editor: 'select', sortOrder:  60, choices: ICON_CHOICES_WITH_NONE },
    feature3Icon: { displayName: 'Feature 3 — Icon', editor: 'select', sortOrder:  70, choices: ICON_CHOICES_WITH_NONE },
    feature4Icon: { displayName: 'Feature 4 — Icon', editor: 'select', sortOrder:  80, choices: ICON_CHOICES_WITH_NONE },
    feature5Icon: { displayName: 'Feature 5 — Icon', editor: 'select', sortOrder:  90, choices: ICON_CHOICES_WITH_NONE },
    feature6Icon: { displayName: 'Feature 6 — Icon', editor: 'select', sortOrder: 100, choices: ICON_CHOICES_WITH_NONE },
    animate: {
      displayName: 'Stagger entrance on scroll',
      editor:      'select',
      sortOrder:   110,
      choices: {
        true:  { displayName: 'On (Default)', sortOrder: 10 },
        false: { displayName: 'Off',          sortOrder: 20 },
      },
    },
  },
})
