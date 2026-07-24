import { contentType } from '@optimizely/cms-sdk'

export const OT_TopicHubRecommendation = contentType({
  key:         'OT_TopicHubRecommendation',
  displayName: 'Topic Hub Recommendation',
  description: 'A suggested search topic pill shown below the Topic Hub search input.',
  baseType:    '_component',
  properties: {
    label: {
      type:        'string',
      isLocalized: true,
      maxLength:   60,
      displayName: 'Topic Label',
      description: 'Short phrase shown as a clickable pill, e.g. "AI in banking"',
      group:       'OT_Content',
      sortOrder:   10,
    },
  },
})
