import { contentType } from '@optimizely/cms-sdk'
import { OT_TopicHubRecommendation } from './OT_TopicHubRecommendation'
import { OT_TopicHubBucket }         from './OT_TopicHubBucket'

export const OT_TopicHubPage = contentType({
  key:             'OT_TopicHubPage',
  displayName:     'Topic Hub Page',
  description:     'AI-powered topic discovery hub — configurable sections, search recommendations, and content buckets. Reusable across verticals.',
  baseType:        '_page',
  mayContainTypes: ['*'],
  properties: {

    // ── Identity ────────────────────────────────────────────────────────────
    headerName: {
      type:        'string',
      isLocalized: true,
      maxLength:   60,
      displayName: 'Page Title',
      description: 'The large display heading shown in the hero. Defaults to "Topic Hub".',
      group:       'OT_Content',
      sortOrder:   10,
    },
    headerEffect: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Title Style',
      description: 'Visual effect applied to the page title.',
      group:       'OT_Content',
      sortOrder:   20,
      enum: [
        { value: 'outline',          displayName: 'Outline (Default)' },
        { value: 'none',             displayName: 'None — Plain' },
        { value: 'gradient',         displayName: 'Gradient' },
        { value: 'animatedGradient', displayName: 'Animated Gradient' },
        { value: 'depth3d',          displayName: '3D Depth' },
        { value: 'glitch',           displayName: 'Glitch' },
        { value: 'neon',             displayName: 'Neon' },
        { value: 'highlight',        displayName: 'Highlight' },
        { value: 'glow',             displayName: 'Glow' },
      ],
    },

    // ── Search configuration ────────────────────────────────────────────────
    searchRecommendations: {
      type:        'array',
      displayName: 'Search Recommendations',
      description: 'Up to 5 topic pills shown below the search input as quick-start suggestions.',
      group:       'OT_Content',
      sortOrder:   30,
      items:       { type: 'component', contentType: OT_TopicHubRecommendation },
    },

    // ── Content buckets ─────────────────────────────────────────────────────
    contentBuckets: {
      type:        'array',
      displayName: 'Content Buckets',
      description: 'Ordered list of result sections. Each bucket defines a content type, section headline, and icon. Drag to reorder.',
      group:       'OT_Content',
      sortOrder:   40,
      items:       { type: 'component', contentType: OT_TopicHubBucket },
    },

    // ── DAM configuration ───────────────────────────────────────────────────
    damFolderContainerId: {
      type:        'string',
      maxLength:   64,
      displayName: 'DAM Folder ID',
      description: 'Content Graph folder GUID to scope document search. Only assets inside this folder will be returned. Leave blank to search all accessible assets.',
      group:       'OT_Content',
      sortOrder:   50,
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    seoTitle: {
      type:        'string',
      displayName: 'Page Title',
      description: 'Appears in the browser tab and search results. Falls back to the Page Title field above.',
      group:       'OT_SEO',
      sortOrder:   10,
    },
    seoDescription: {
      type:        'string',
      displayName: 'Meta Description',
      description: 'Appears in search engine snippets. Recommended 120–160 characters.',
      group:       'OT_SEO',
      sortOrder:   20,
    },
    ogImage: {
      type:         'contentReference',
      allowedTypes: ['_image'],
      displayName:  'Social Share Image',
      description:  'Image shown when this page is shared on social platforms.',
      group:        'OT_SEO',
      sortOrder:    30,
    },
    noIndex: {
      type:        'boolean',
      displayName: 'Hide from Search Engines',
      description: 'Adds noindex/nofollow and excludes from the sitemap.',
      group:       'OT_SEO',
      sortOrder:   40,
    },
  },
})
