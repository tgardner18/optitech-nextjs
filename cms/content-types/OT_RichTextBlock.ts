import { contentType } from '@optimizely/cms-sdk'

export const OT_RichTextBlock = contentType({
  key: 'OT_RichTextBlock',
  displayName: 'Rich Text Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    content: { type: 'richText', isLocalized: true, displayName: 'Content', group: 'OT_Content', sortOrder: 10 },
  },
})
