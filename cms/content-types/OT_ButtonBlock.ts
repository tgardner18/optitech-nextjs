import { contentType } from '@optimizely/cms-sdk'

export const OT_ButtonBlock = contentType({
  key: 'OT_ButtonBlock',
  displayName: 'Button Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    label: { type: 'string', displayName: 'Button Label', group: 'OT_Content', sortOrder: 10 },
    url:   { type: 'url',    displayName: 'Link URL',     group: 'OT_Content', sortOrder: 20 },
  },
})
