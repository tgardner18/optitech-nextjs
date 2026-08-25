import { contentType } from '@optimizely/cms-sdk'

export const OT_QuoteBlock = contentType({
  key: 'OT_QuoteBlock',
  displayName: 'Quote Block',
  description: 'Pull quote with attribution name and title.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    treatment: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Visual Treatment',
      description: 'Controls the visual presentation of the quote block.',
      enum: [
        { value: 'default', displayName: 'Editorial Mark (Default)' },
        { value: 'bubble',  displayName: 'Speech Bubble'             },
        { value: 'glow',    displayName: 'Ambient Glow'              },
      ],
      group:     'OT_Content',
      sortOrder: 5,
    },
    quote:             { type: 'string', isLocalized: true, maxLength: 500, displayName: 'Quote',              group: 'OT_Content', sortOrder: 10, indexingType: 'searchable' },
    attributionName:   { type: 'string',                  maxLength: 80,  displayName: 'Attribution Name',   group: 'OT_Content', sortOrder: 20 },
    attributionTitle:  { type: 'string', isLocalized: true, maxLength: 100, displayName: 'Attribution Title',  group: 'OT_Content', sortOrder: 30 },
  },
})
