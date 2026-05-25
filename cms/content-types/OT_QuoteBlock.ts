import { contentType } from '@optimizely/cms-sdk'

export const OT_QuoteBlock = contentType({
  key: 'OT_QuoteBlock',
  displayName: 'Quote Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    quote:             { type: 'string', isLocalized: true, maxLength: 500, displayName: 'Quote',              group: 'OT_Content', sortOrder: 10 },
    attributionName:   { type: 'string',                  maxLength: 80,  displayName: 'Attribution Name',   group: 'OT_Content', sortOrder: 20 },
    attributionTitle:  { type: 'string', isLocalized: true, maxLength: 100, displayName: 'Attribution Title',  group: 'OT_Content', sortOrder: 30 },
  },
})
