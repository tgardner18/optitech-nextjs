import { contentType } from '@optimizely/cms-sdk'

export const OT_BannerBlock = contentType({
  key:         'OT_BannerBlock',
  displayName: 'Banner Block',
  description: 'Full-width promotional banner with heading, body, and dual CTAs.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    treatment: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Overlay Treatment',
      description: 'How content sits over the image.',
      enum: [
        { value: 'scrim', displayName: 'Scrim (Default)' },
        { value: 'glass', displayName: 'Glass panel' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    heading:           { type: 'string',           displayName: 'Heading',             group: 'OT_Content', sortOrder: 10, isLocalized: true, maxLength: 120, indexingType: 'searchable' },
    headingLevel:      { type: 'string',           displayName: 'Heading Level',       group: 'OT_Content', sortOrder: 15, format: 'selectOne', enum: [
      { value: 'h2', displayName: 'H2 – Section heading (default)' },
      { value: 'h1', displayName: 'H1 – Page title' },
    ] },
    eyebrow:           { type: 'string',           displayName: 'Eyebrow Label',       group: 'OT_Content', sortOrder: 20, isLocalized: true, maxLength: 60,  indexingType: 'searchable' },
    body:              { type: 'richText',          displayName: 'Body Text',           group: 'OT_Content', sortOrder: 30, isLocalized: true,                 indexingType: 'searchable' },
    backgroundImage:   { type: 'contentReference', displayName: 'Background Image',    group: 'OT_Content', sortOrder: 40, allowedTypes: ['_image']           },
    primaryCtaLabel:   { type: 'string',           displayName: 'Primary CTA Label',   group: 'OT_Content', sortOrder: 50, isLocalized: true, maxLength: 60  },
    primaryCtaUrl:     { type: 'url',              displayName: 'Primary CTA URL',     group: 'OT_Content', sortOrder: 60                                    },
    secondaryCtaLabel: { type: 'string',           displayName: 'Secondary CTA Label', group: 'OT_Content', sortOrder: 70, isLocalized: true, maxLength: 60  },
    secondaryCtaUrl:   { type: 'url',              displayName: 'Secondary CTA URL',   group: 'OT_Content', sortOrder: 80                                    },
  },
})
