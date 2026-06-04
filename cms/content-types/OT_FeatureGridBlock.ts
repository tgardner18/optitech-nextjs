import { contentType }    from '@optimizely/cms-sdk'
import { OT_FeatureItem } from './OT_FeatureItem'

/**
 * OT_FeatureGridBlock — the canonical "here's what the platform does" block.
 *
 * An icon-feature grid with section header (eyebrow + heading + subheading),
 * up to 6 OT_FeatureItem entries, and an optional section-level CTA.
 * Icon selection and layout mode are controlled via display template settings.
 */
export const OT_FeatureGridBlock = contentType({
  key:                  'OT_FeatureGridBlock',
  displayName:          'Feature Grid Block',
  description:          'Icon-feature grid with section heading and up to 6 feature tiles.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    eyebrow: {
      type:        'string',
      isLocalized: true,
      maxLength:   60,
      displayName: 'Eyebrow',
      description: 'Small label above the heading e.g. "Why OptiTech"',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    heading: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Heading',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    subheading: {
      type:        'string',
      isLocalized: true,
      maxLength:   200,
      displayName: 'Subheading',
      description: 'One sentence of supporting context below the heading.',
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
    features: {
      type:        'array',
      displayName: 'Features',
      description: 'Add up to 6 feature items. Each has a headline, body, and optional CTA.',
      group:       'OT_Content',
      sortOrder:   40,
      items:       { type: 'component', contentType: OT_FeatureItem },
    },
    ctaLabel: {
      type:        'string',
      isLocalized: true,
      maxLength:   40,
      displayName: 'Section CTA Label',
      description: "Text for the section-level call to action e.g. 'See all features'",
      group:       'OT_Content',
      sortOrder:   50,
    },
    ctaUrl: {
      type:        'url',
      displayName: 'Section CTA URL',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   60,
    },
  },
})
