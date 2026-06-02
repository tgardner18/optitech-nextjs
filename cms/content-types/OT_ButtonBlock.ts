import { contentType } from '@optimizely/cms-sdk'

export const OT_ButtonBlock = contentType({
  key: 'OT_ButtonBlock',
  displayName: 'Button Block',
  description: 'Standalone CTA button with label and destination URL.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    label: { type: 'string', isLocalized: true, maxLength: 40, displayName: 'Button Label', group: 'OT_Content', sortOrder: 10 },
    url:   { type: 'url',    displayName: 'Link URL',     group: 'OT_Content', sortOrder: 20 },
  },
})
