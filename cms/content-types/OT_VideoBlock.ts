import { contentType } from '@optimizely/cms-sdk'

export const OT_VideoBlock = contentType({
  key: 'OT_VideoBlock',
  displayName: 'Video Block',
  description: 'Embedded YouTube or Vimeo video with title and caption.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    videoUrl: {
      type: 'string',
      displayName: 'Video URL (YouTube or Vimeo)',
      description: 'Paste a full YouTube (youtube.com/watch?v= or youtu.be/) or Vimeo (vimeo.com/) URL.',
      pattern: '^https?://(www\\.)?(youtube\\.com/watch\\?v=|youtu\\.be/|vimeo\\.com/)[^\\s]+$',
      maxLength: 300,
      group: 'OT_Content',
      sortOrder: 10,
    },
    title:    { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Title',   group: 'OT_Content', sortOrder: 20, indexingType: 'searchable' },
    caption:  { type: 'string', isLocalized: true, maxLength: 200, displayName: 'Caption', group: 'OT_Content', sortOrder: 30 },
  },
})
