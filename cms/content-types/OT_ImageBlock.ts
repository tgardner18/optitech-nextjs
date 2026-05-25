import { contentType } from '@optimizely/cms-sdk'

export const OT_ImageBlock = contentType({
  key: 'OT_ImageBlock',
  displayName: 'Image Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    image:   { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Image', group: 'OT_Content', sortOrder: 10 },
    alt:     { type: 'string', isLocalized: true, maxLength: 200, displayName: 'Alt Text',  group: 'OT_Content', sortOrder: 20 },
    caption: { type: 'string', isLocalized: true, maxLength: 200, displayName: 'Caption',   group: 'OT_Content', sortOrder: 30 },
  },
})
