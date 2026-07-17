import { contentType } from '@optimizely/cms-sdk'

export const OT_DisclosureItem = contentType({
  key:         'OT_DisclosureItem',
  displayName: 'Disclosure Item',
  description: 'A single regulatory disclosure or footnote. Only appears as an array item inside OT_DisclosureBlock.',
  baseType:    '_component',
  properties: {
    body: {
      type:        'richText',
      displayName: 'Disclosure Text',
      description: 'The full text of this disclosure. Supports bold, italic, and links.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   10,
    },
  },
})
