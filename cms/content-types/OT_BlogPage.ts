import { contentType } from '@optimizely/cms-sdk'
import { OT_Author } from './OT_Author'

export const OT_BlogPage = contentType({
  key: 'OT_BlogPage',
  displayName: 'Blog Article',
  baseType: '_page',
  properties: {
    blogStyle: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Blog Style',
      group: 'OT_Style',
      sortOrder: 5,
      enum: [
        { value: 'editorial',   displayName: 'Editorial (Split Layout)' },
        { value: 'atmospheric', displayName: 'Atmospheric (Glass)' },
        { value: 'impact',      displayName: 'Impact (Display Type)' },
      ],
    },
    headline:     { type: 'string', isLocalized: true, maxLength: 120, displayName: 'Headline',      group: 'OT_Content', sortOrder: 10 },
    subHeadline:  { type: 'string', isLocalized: true, maxLength: 200, displayName: 'Sub-headline',  group: 'OT_Content', sortOrder: 20 },
    topic: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Topic',
      group: 'OT_Content',
      sortOrder: 30,
      enum: [
        { value: 'news',       displayName: 'News' },
        { value: 'insights',   displayName: 'Insights' },
        { value: 'leadership', displayName: 'Leadership' },
        { value: 'stories',    displayName: 'Stories' },
        { value: 'innovation', displayName: 'Innovation' },
        { value: 'culture',    displayName: 'Culture' },
        { value: 'events',     displayName: 'Events' },
        { value: 'resources',  displayName: 'Resources' },
      ],
    },
    featuredImage: { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Featured Image', group: 'OT_Content', sortOrder: 40 },
    featuredVideo: { type: 'contentReference', allowedTypes: ['_video'], displayName: 'Featured Video', group: 'OT_Content', sortOrder: 50 },
    body:          { type: 'richText', isLocalized: true, displayName: 'Body', group: 'OT_Content', sortOrder: 60 },
    authorRef: {
      type: 'contentReference',
      allowedTypes: [OT_Author],
      displayName: 'Author',
      group: 'OT_Content',
      sortOrder: 70,
    },
    readTime: { type: 'string', isLocalized: true, maxLength: 20, displayName: 'Read Time (e.g. "8 min read")', group: 'OT_Content', sortOrder: 80 },
  },
})
