import { contentType } from '@optimizely/cms-sdk'

export const OT_VideoBlock = contentType({
  key: 'OT_VideoBlock',
  displayName: 'Video Block',
  description: 'YouTube or Vimeo embed with optional editorial context (eyebrow, heading, body, CTA). Populating any editorial field auto-enables a 2-column layout with configurable media side.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    mediaSide: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Media Side',
      description: 'Which side the media sits on in the editorial layout.',
      enum: [
        { value: 'left', displayName: 'Media left (Default)' },
        { value: 'right', displayName: 'Media right' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    videoUrl: {
      type: 'string',
      displayName: 'Video URL (YouTube or Vimeo)',
      description: 'Paste a full YouTube (youtube.com/watch?v= or youtu.be/) or Vimeo (vimeo.com/) URL.',
      pattern: '^https?://(www\\.)?(youtube\\.com/(watch|shorts|embed)|youtu\\.be/|vimeo\\.com/)[^\\s]+$',
      maxLength: 300,
      group: 'OT_Content',
      sortOrder: 10,
    },
    title:    { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Title',   group: 'OT_Content', sortOrder: 20, indexingType: 'searchable' },
    caption:  { type: 'string', isLocalized: true, maxLength: 200, displayName: 'Caption',  group: 'OT_Content', sortOrder: 30 },
    eyebrow:  { type: 'string', isLocalized: true, maxLength: 80,  displayName: 'Eyebrow',  group: 'OT_Content', sortOrder: 35 },
    heading:  { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Heading',  group: 'OT_Content', sortOrder: 40 },
    body:     { type: 'richText', isLocalized: true,               displayName: 'Body',      group: 'OT_Content', sortOrder: 50 },
    ctaLabel: { type: 'string', isLocalized: true, maxLength: 60, displayName: 'CTA Label', group: 'OT_Content', sortOrder: 60 },
    ctaUrl:   { type: 'url',                                      displayName: 'CTA URL',   group: 'OT_Content', sortOrder: 70 },
  },
})
