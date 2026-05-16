import { contentType } from '@optimizely/cms-sdk'

export const OT_CardBlock = contentType({
  key: 'OT_CardBlock',
  displayName: 'Card Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    Heading:     { type: 'string', displayName: 'Heading',         group: 'OT_Content', sortOrder: 10 },
    Eyebrow:     { type: 'string', displayName: 'Eyebrow',         group: 'OT_Content', sortOrder: 20 },
    Description: { type: 'string', displayName: 'Description',     group: 'OT_Content', sortOrder: 30 },
    image:       { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Image',          group: 'OT_Content', sortOrder: 40 },
    imageAlt:    { type: 'string',                                    displayName: 'Image Alt Text', group: 'OT_Content', sortOrder: 50 },
    ctaLabel:    { type: 'string', displayName: 'CTA Label',        group: 'OT_Content', sortOrder: 60 },
    ctaUrl:      { type: 'url',    displayName: 'CTA URL',          group: 'OT_Content', sortOrder: 70 },
  },
})
