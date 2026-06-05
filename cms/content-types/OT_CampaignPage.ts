import { contentType } from '@optimizely/cms-sdk'
import { OT_HeroBlock }        from './OT_HeroBlock'
import { OT_PrimaryTextBlock } from './OT_PrimaryTextBlock'
import { OT_FeatureGridBlock } from './OT_FeatureGridBlock'
import { OT_TabsBlock }        from './OT_TabsBlock'
import { OT_QuoteBlock }       from './OT_QuoteBlock'
import { OT_VideoBlock }       from './OT_VideoBlock'
import { OT_ImageBlock }       from './OT_ImageBlock'
import { OT_BannerBlock }      from './OT_BannerBlock'

export const OT_CampaignPage = contentType({
  key:             'OT_CampaignPage',
  displayName:     'Campaign Page',
  description:     'Slotted landing page with three constrained content sections: hero, body, and closing. Each slot references a shared block of a specific type.',
  baseType:        '_page',
  mayContainTypes: ['BlankExperience', 'OT_FolderPage', 'OT_BlogPage'],
  properties: {

    // ── Content slots ─────────────────────────────────────────────────────────

    heroSection: {
      type:        'array',
      displayName: 'Hero',
      description: 'Add one Hero block. Editors can create a new block or select an existing one. Limited to one item.',
      group:       'OT_Content',
      sortOrder:   10,
      maxItems:    1,
      items: {
        type:         'content',
        allowedTypes: [OT_HeroBlock],
      },
    },
    bodySection: {
      type:        'array',
      displayName: 'Body',
      description: 'Add one or more blocks: Primary Text, Feature Grid, or Tabs. Editors control order. Renders below the hero.',
      group:       'OT_Content',
      sortOrder:   20,
      items: {
        type:         'content',
        allowedTypes: [OT_PrimaryTextBlock, OT_FeatureGridBlock, OT_TabsBlock],
      },
    },
    closingSection: {
      type:        'array',
      displayName: 'Closing',
      description: 'Add one or more closing blocks: Quote, Video, or Image. Renders on an elevated surface as the page finale.',
      group:       'OT_Content',
      sortOrder:   30,
      items: {
        type:         'content',
        allowedTypes: [OT_QuoteBlock, OT_BannerBlock, OT_VideoBlock, OT_ImageBlock],
      },
    },

    // ── SEO / Search & Discovery ──────────────────────────────────────────────
    // Identical field keys to OT_BlogPage so lib/metadata.ts has one code path.

    seoTitle: {
      type:         'string',
      displayName:  'Page Title',
      description:  'Appears in the browser tab and search results. Recommended 50–60 characters. Falls back to Site Name if blank.',
      group:        'OT_SEO',
      sortOrder:    10,
      indexingType: 'searchable',
    },
    seoDescription: {
      type:         'string',
      displayName:  'Meta Description',
      description:  'Appears in search engine result snippets. Recommended 120–160 characters. Falls back to the site-level Default Meta Description.',
      group:        'OT_SEO',
      sortOrder:    20,
      indexingType: 'searchable',
    },
    canonicalUrl: {
      type:        'url',
      displayName: 'Canonical URL',
      description: "Override only. Leave blank to use the page's own URL. Use when this content is syndicated or duplicated from another URL.",
      group:       'OT_SEO',
      sortOrder:   30,
    },
    ogImage: {
      type:         'contentReference',
      displayName:  'Social Share Image',
      description:  'Image shown when this page is shared on social platforms. Recommended 1200×630px. Falls back to the site-level Default Social Share Image.',
      allowedTypes: ['_image'],
      group:        'OT_SEO',
      sortOrder:    40,
    },
    pageAnswer: {
      type:         'string',
      displayName:  'AI Answer Summary',
      description:  'A 1–3 sentence plain-language answer to the primary question this page addresses. Used in structured data and as a direct signal to AI answer engines (Perplexity, ChatGPT Browsing, Gemini). Write as if answering the question directly — no marketing language.',
      group:        'OT_SEO',
      sortOrder:    50,
      indexingType: 'searchable',
    },
    schemaType: {
      type:        'string',
      displayName: 'Schema Type',
      description: 'The structured data type for this page. Controls which JSON-LD block is generated.',
      format:      'selectOne',
      enum: [
        { value: 'none',    displayName: 'None' },
        { value: 'WebPage', displayName: 'Web Page' },
        { value: 'Article', displayName: 'Article' },
        { value: 'FAQPage', displayName: 'FAQ Page' },
        { value: 'Product', displayName: 'Product' },
        { value: 'Event',   displayName: 'Event' },
      ],
      group:     'OT_SEO',
      sortOrder: 60,
    },
    noIndex: {
      type:        'boolean',
      displayName: 'Hide from Search Engines',
      description: 'When enabled, adds noindex/nofollow robots directives and excludes this page from the sitemap.',
      group:       'OT_SEO',
      sortOrder:   70,
    },
    customSchemaJson: {
      type:        'string',
      displayName: 'Custom Schema JSON (Advanced)',
      description: 'Developer escape hatch. Paste a valid JSON-LD object here to override or extend the generated structured data. Must be valid JSON. Merged with the generated schema — do not include @context.',
      group:       'OT_SEO',
      sortOrder:   80,
    },
  },
})
