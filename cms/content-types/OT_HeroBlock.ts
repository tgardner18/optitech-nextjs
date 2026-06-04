import { contentType } from '@optimizely/cms-sdk'

export const OT_HeroBlock = contentType({
  key: 'OT_HeroBlock',
  displayName: 'Hero Block',
  description: 'Full-width hero with eyebrow, headline, body, and dual CTAs.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    eyebrow:            { type: 'string', isLocalized: true, maxLength: 60,  displayName: 'Eyebrow',             group: 'OT_Content', sortOrder: 10, indexingType: 'searchable' },
    headline:           { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Headline',            group: 'OT_Content', sortOrder: 20, indexingType: 'searchable' },
    body:               { type: 'string', isLocalized: true, maxLength: 300, displayName: 'Body',                group: 'OT_Content', sortOrder: 30, indexingType: 'searchable' },
    primaryCtaLabel:    { type: 'string', isLocalized: true, maxLength: 40,  displayName: 'Primary CTA Label',   group: 'OT_Content', sortOrder: 40 },
    primaryCtaUrl:      { type: 'url',                                       displayName: 'Primary CTA URL',     group: 'OT_Content', sortOrder: 50 },
    secondaryCtaLabel:  { type: 'string', isLocalized: true, maxLength: 40,  displayName: 'Secondary CTA Label', group: 'OT_Content', sortOrder: 60 },
    secondaryCtaUrl:    { type: 'url',                                       displayName: 'Secondary CTA URL',   group: 'OT_Content', sortOrder: 70 },
    visual:             { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Visual Image',    group: 'OT_Content', sortOrder: 80 },
    visualAlt:          { type: 'string', isLocalized: true,  maxLength: 200, displayName: 'Visual Alt Text', group: 'OT_Content', sortOrder: 90 },
  },
})
