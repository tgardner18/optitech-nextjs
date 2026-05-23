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
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    eyebrow: {
      type:        'string',
      displayName: 'Eyebrow',
      description: 'Small label above the heading e.g. "Why OptiTech"',
      group:       'OT_Content',
      sortOrder:   10,
    },
    heading: {
      type:        'string',
      displayName: 'Heading',
      group:       'OT_Content',
      sortOrder:   20,
    },
    subheading: {
      type:        'string',
      displayName: 'Subheading',
      description: 'One sentence of supporting context below the heading.',
      group:       'OT_Content',
      sortOrder:   30,
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
