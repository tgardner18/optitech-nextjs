import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ComparisonTableDefault = displayTemplate({
  key:         'OT_ComparisonTableDefault',
  displayName: 'Comparison Table',
  contentType: 'OT_ComparisonTableBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
      },
    },
  },
})
