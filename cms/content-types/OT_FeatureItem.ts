import { contentType } from '@optimizely/cms-sdk'

export const OT_FeatureItem = contentType({
  key:         'OT_FeatureItem',
  displayName: 'Feature Item',
  description: 'Single feature tile with headline, body, and optional CTA link.',
  baseType:    '_component',
  properties: {
    headline: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'Headline',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    body: {
      type:        'richText',
      isLocalized: true,
      displayName: 'Body',
      description: '1–2 sentences describing this feature.',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    ctaLabel: {
      type:        'string',
      isLocalized: true,
      maxLength:   40,
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
