import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ContentRecommendationsDefault = displayTemplate({
  key:         'OT_ContentRecommendationsDefault',
  displayName: 'Content Recommendations',
  contentType: 'OT_ContentRecommendationsBlock',
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
  },
})
