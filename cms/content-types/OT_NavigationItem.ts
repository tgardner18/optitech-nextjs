import { contentType } from '@optimizely/cms-sdk'
import { OT_NavigationSubItem } from './OT_NavigationSubItem'

export const OT_NavigationItem = contentType({
  key: 'OT_NavigationItem',
  displayName: 'Navigation Item',
  baseType: '_component',
  properties: {
    menuLink: { type: 'link', displayName: 'Link', group: 'OT_Content', sortOrder: 10 },
    subNavItems: {
      type: 'array',
      displayName: 'Sub-Navigation Items (leave empty for a simple link)',
      group: 'OT_Content',
      sortOrder: 20,
      items: { type: 'component', contentType: OT_NavigationSubItem },
    },
  },
})
