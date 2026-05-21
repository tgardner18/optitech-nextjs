import { contentType } from '@optimizely/cms-sdk'

export const OT_VideoBlock = contentType({
  key: 'OT_VideoBlock',
  displayName: 'Video Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    src:      { type: 'url',    displayName: 'Video URL (legacy)',            group: 'OT_Content', sortOrder: 10 },
    videoUrl: { type: 'string', displayName: 'Video URL (YouTube or Vimeo)', group: 'OT_Content', sortOrder: 11 },
    title:    { type: 'string', displayName: 'Title',                        group: 'OT_Content', sortOrder: 20 },
    caption:  { type: 'string', displayName: 'Caption',                      group: 'OT_Content', sortOrder: 30 },
  },
})
