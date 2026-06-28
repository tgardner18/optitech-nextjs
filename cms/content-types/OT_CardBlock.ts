import { contentType } from '@optimizely/cms-sdk'

export const OT_CardBlock = contentType({
  key: 'OT_CardBlock',
  displayName: 'Card Block',
  description: 'Media card with heading, description, image, and optional CTA.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    imageStyle: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Image Treatment',
      description: 'How the card image is placed.',
      enum: [
        { value: 'top', displayName: 'Top (Default)' },
        { value: 'background', displayName: 'Background' },
        { value: 'side', displayName: 'Side' },
        { value: 'float', displayName: 'Floating' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    Heading:     { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Heading',         group: 'OT_Content', sortOrder: 10, indexingType: 'searchable' },
    Eyebrow:     { type: 'string', isLocalized: true, maxLength: 60,  displayName: 'Eyebrow',         group: 'OT_Content', sortOrder: 20, indexingType: 'searchable' },
    Description: { type: 'richText', isLocalized: true, displayName: 'Description', group: 'OT_Content', sortOrder: 30 },
    image:       { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Image',          group: 'OT_Content', sortOrder: 40 },
    imageAlt:    { type: 'string', isLocalized: true, maxLength: 200,  displayName: 'Image Alt Text', group: 'OT_Content', sortOrder: 50 },
    ctaLabel:    { type: 'string', isLocalized: true, maxLength: 40,   displayName: 'CTA Label',      group: 'OT_Content', sortOrder: 60 },
    ctaUrl:      { type: 'url',    displayName: 'CTA URL',        group: 'OT_Content', sortOrder: 70 },
  },
})
