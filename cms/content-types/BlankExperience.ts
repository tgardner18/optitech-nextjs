import { contentType } from '@optimizely/cms-sdk'

export const BlankExperience = contentType({
  key: 'BlankExperience',
  displayName: 'Blank Experience',
  baseType: '_experience',
  mayContainTypes: ['_self', 'OT_BlogPage', 'OT_FolderPage', 'OT_CampaignPage'],
  properties: {
    // ── SEO / Search & Discovery ──────────────────────────────────────────────
    // Identical field keys to OT_BlogPage so lib/metadata.ts has one code path.
    seoTitle: {
      type: 'string',
      displayName: 'Page Title',
      description: 'Appears in the browser tab and search results. Recommended 50–60 characters. Falls back to Site Name if blank.',
      group: 'OT_SEO',
      sortOrder: 10,
    },
    seoDescription: {
      type: 'string',
      displayName: 'Meta Description',
      description: 'Appears in search engine result snippets. Recommended 120–160 characters. Falls back to the site-level Default Meta Description.',
      group: 'OT_SEO',
      sortOrder: 20,
    },
    canonicalUrl: {
      type: 'url',
      displayName: 'Canonical URL',
      description: "Override only. Leave blank to use the page's own URL. Use when this content is syndicated or duplicated from another URL.",
      group: 'OT_SEO',
      sortOrder: 30,
    },
    ogImage: {
      type: 'contentReference',
      displayName: 'Social Share Image',
      description: 'Image shown when this page is shared on social platforms. Recommended 1200×630px. Falls back to the site-level Default Social Share Image.',
      allowedTypes: ['_image'],
      group: 'OT_SEO',
      sortOrder: 40,
    },
    pageAnswer: {
      type: 'string',
      displayName: 'AI Answer Summary',
      description: 'A 1–3 sentence plain-language answer to the primary question this page addresses. Used in structured data and as a direct signal to AI answer engines (Perplexity, ChatGPT Browsing, Gemini). Write as if answering the question directly — no marketing language.',
      group: 'OT_SEO',
      sortOrder: 50,
    },
    schemaType: {
      type: 'string',
      displayName: 'Schema Type',
      description: 'The structured data type for this page. Controls which JSON-LD block is generated. When set to FAQ Page, pair with an Accordion block on the page to populate the question/answer pairs.',
      format: 'selectOne',
      enum: [
        { value: 'none',    displayName: 'None' },
        { value: 'WebPage', displayName: 'Web Page' },
        { value: 'Article', displayName: 'Article' },
        { value: 'FAQPage', displayName: 'FAQ Page' },
        { value: 'Product', displayName: 'Product' },
        { value: 'Event',   displayName: 'Event' },
      ],
      group: 'OT_SEO',
      sortOrder: 60,
    },
    noIndex: {
      type: 'boolean',
      displayName: 'Hide from Search Engines',
      description: 'When enabled, adds noindex/nofollow robots directives and excludes this page from the sitemap. Use for thank-you pages, campaign landing pages, or draft content.',
      group: 'OT_SEO',
      sortOrder: 70,
    },
    customSchemaJson: {
      type: 'string',
      displayName: 'Custom Schema JSON (Advanced)',
      description: 'Developer escape hatch. Paste a valid JSON-LD object here to override or extend the generated structured data. Must be valid JSON. Merged with the generated schema — do not include @context. Leave blank unless the Schema Type options above do not cover your use case.',
      group: 'OT_SEO',
      sortOrder: 80,
    },
    
  availableContentTypes: {
    "setting": "Selected",
    "allowedTypes": [
      "SysContentFolder"
    ]
  },
  },
})
