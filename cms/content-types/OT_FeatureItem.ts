import { contentType } from '@optimizely/cms-sdk'

export const OT_FeatureItem = contentType({
  key:         'OT_FeatureItem',
  displayName: 'Feature Item',
  baseType:    '_component',
  properties: {
    headline: {
      type:        'string',
      displayName: 'Headline',
      group:       'OT_Content',
      sortOrder:   10,
    },
    body: {
      type:        'richText',
      displayName: 'Body',
      description: '1–2 sentences describing this feature.',
      group:       'OT_Content',
      sortOrder:   20,
    },
    ctaLabel: {
      type:        'string',
      displayName: 'CTA Label',
      description: "e.g. 'Learn more'",
      group:       'OT_Content',
      sortOrder:   30,
    },
    ctaUrl: {
      type:         'url',
      displayName:  'CTA URL',
      isLocalized:  true,
      group:        'OT_Content',
      sortOrder:    40,
    },
  },
})
