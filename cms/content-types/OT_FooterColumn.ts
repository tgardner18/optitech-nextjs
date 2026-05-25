import { contentType } from '@optimizely/cms-sdk'
import { OT_FooterLink } from './OT_FooterLink'

export const OT_FooterColumn = contentType({
  key: 'OT_FooterColumn',
  displayName: 'Footer Column',
  baseType: '_component',
  properties: {
    title: { type: 'string', isLocalized: true, maxLength: 60, displayName: 'Title', group: 'OT_Content', sortOrder: 10 },
    linkItems: {
      type: 'array',
      displayName: 'Links',
      group: 'OT_Content',
      sortOrder: 20,
      items: { type: 'component', contentType: OT_FooterLink },
    },
  },
})
