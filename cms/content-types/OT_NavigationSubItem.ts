import { contentType } from '@optimizely/cms-sdk'

export const OT_NavigationSubItem = contentType({
  key: 'OT_NavigationSubItem',
  displayName: 'Navigation Sub-Item',
  baseType: '_component',
  properties: {
    menuLink:    { type: 'link',   displayName: 'Link',                                          group: 'OT_Content', sortOrder: 10 },
    description: { type: 'string', displayName: 'Description (optional — shown in mega menu)', group: 'OT_Content', sortOrder: 20 },
  },
})
