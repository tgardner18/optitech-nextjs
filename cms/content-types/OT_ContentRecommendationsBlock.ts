import { contentType } from '@optimizely/cms-sdk'

// ─── OT_ContentRecommendationsBlock ──────────────────────────────────────────
// Personalized content feed powered by Optimizely Content Recommendations
// (Idio). The delivery API key and tracking IDs are configured once per domain
// on the ThemeManager (Integrations) — NOT on the block. At render time the
// adapter reads the visitor's `iv` cookie and fetches `rpp` recommended items.
//
// heading / subheading — optional section copy above the grid.
// rpp                  — how many recommendations to request (3/6/9/12).

export const OT_ContentRecommendationsBlock = contentType({
  key:         'OT_ContentRecommendationsBlock',
  displayName: 'Content Recommendations',
  description: 'Personalized content grid from Optimizely Content Recommendations (Idio).',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    heading: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Heading',
      description: 'Optional heading displayed above the recommendations grid.',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    subheading: {
      type:        'string',
      isLocalized: true,
      maxLength:   200,
      displayName: 'Subheading',
      description: 'Optional supporting line below the heading.',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    rpp: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Recommendations',
      description: 'How many recommendations to request and display.',
      group:       'OT_Content',
      sortOrder:   30,
      enum: [
        { value: '3',  displayName: '3'  },
        { value: '6',  displayName: '6'  },
        { value: '9',  displayName: '9'  },
        { value: '12', displayName: '12' },
      ],
    },
  },
})
