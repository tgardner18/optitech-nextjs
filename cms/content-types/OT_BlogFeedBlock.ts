import { contentType } from '@optimizely/cms-sdk'
import { BlankExperience } from './BlankExperience'

// ─── OT_BlogFeedBlock ─────────────────────────────────────────────────────────
// A paginated, filterable listing of OT_BlogPage items.
//
// heading       — per-language section title rendered above the feed.
// articleRoot   — content reference to the page/experience that acts as the
//                 folder root for blog posts. Only posts under this hierarchical
//                 URL prefix are returned; leave empty to show all published posts.
// topicFilter   — when set, only posts whose topic field matches this value are
//                 returned. The topic chip UI is hidden when a filter is locked
//                 here; editors use this to curate topic-specific feed sections.
// pageSize      — how many cards/rows appear per paginated page (default 9).
//
// View-mode toggle (grid / list) and topic filter chips are rendered by the
// client component. Chips are suppressed when topicFilter is set (locked feed).

export const OT_BlogFeedBlock = contentType({
  key:         'OT_BlogFeedBlock',
  displayName: 'Blog Feed',
  description: 'Filterable, paginated list of blog posts with optional topic lock.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    heading: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Feed Heading',
      description: 'Optional heading displayed above the blog grid. Localised so each language can carry a distinct label.',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    articleRoot: {
      type:         'contentReference',
      allowedTypes: ['_page', BlankExperience],
      displayName:  'Article Root',
      description:  'The page or Blank Experience that blog posts live under. Leave empty to show posts from anywhere on the site.',
      group:        'OT_Content',
      sortOrder:    20,
    },
    topicFilter: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Topic Filter',
      description: 'Restrict this feed to a single topic. When set, only posts matching the chosen topic are returned and the topic chip UI is hidden.',
      group:       'OT_Content',
      sortOrder:   25,
      enum: [
        { value: 'news',       displayName: 'News'       },
        { value: 'insights',   displayName: 'Insights'   },
        { value: 'leadership', displayName: 'Leadership' },
        { value: 'stories',    displayName: 'Stories'    },
        { value: 'innovation', displayName: 'Innovation' },
        { value: 'culture',    displayName: 'Culture'    },
        { value: 'events',     displayName: 'Events'     },
        { value: 'resources',  displayName: 'Resources'  },
      ],
    },
    pageSize: {
      type:        'integer',
      displayName: 'Posts Per Page',
      description: 'Number of posts shown per paginated page. Defaults to 9 when not set. Min 1, max 24.',
      group:       'OT_Content',
      sortOrder:   30,
    },
  },
})
