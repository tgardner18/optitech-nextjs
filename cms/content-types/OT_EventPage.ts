import { contentType } from '@optimizely/cms-sdk'

// ─── OT_EventPage ───────────────────────────────────────────────────────────────
// A traditional CMS page (URL-addressable) representing a single event — webinar,
// conference, workshop, CLE seminar, community event, health screening, etc.
//
// Rendered by components/pages/EventPage.tsx via the catch-all slug route (not a
// Visual Builder composition). Events authored here also feed:
//   - OT_EventListingBlock  (card / list / calendar listing)
//   - site search           (app/api/search/route.ts → 'Event' results)
//
// Date fields are `dateTime` with indexingType: 'queryable' so Optimizely Graph
// can filter (upcoming vs past) and sort by start date.

export const OT_EventPage = contentType({
  key:         'OT_EventPage',
  displayName: 'Event Page',
  description: 'A single event with date, location, and registration details. Appears in event listings and site search.',
  baseType:    '_page',
  mayContainTypes: ['_self'],
  properties: {
    // ── Core content ──────────────────────────────────────────────────────────
    title: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Event Title',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    eventType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Event Type',
      description: 'Categorises the event. Drives the type badge and the listing block type filter.',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'queryable',
      enum: [
        { value: 'webinar',    displayName: 'Webinar' },
        { value: 'conference', displayName: 'Conference' },
        { value: 'workshop',   displayName: 'Workshop' },
        { value: 'seminar',    displayName: 'Seminar' },
        { value: 'community',  displayName: 'Community Event' },
        { value: 'screening',  displayName: 'Health Screening' },
        { value: 'training',   displayName: 'Training' },
      ],
    },
    description: {
      type:        'richText',
      isLocalized: true,
      displayName: 'Description',
      description: 'The event description. The opening paragraph renders as the page lead-in and also feeds listing/search excerpts; the remainder renders as the full article body.',
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
    featuredImage: {
      type:         'contentReference',
      allowedTypes: ['_image'],
      displayName:  'Featured Image',
      group:        'OT_Content',
      sortOrder:    50,
    },

    // ── Schedule ────────────────────────────────────────────────────────────────
    startDate: {
      type:         'dateTime',
      displayName:  'Start Date & Time',
      description:  'When the event begins. Used for ordering and the upcoming/past split.',
      group:        'OT_Content',
      sortOrder:    60,
      indexingType: 'queryable',
    },
    endDate: {
      type:         'dateTime',
      displayName:  'End Date & Time',
      description:  'Optional. Set for multi-day or multi-hour events (e.g. conferences).',
      group:        'OT_Content',
      sortOrder:    70,
      indexingType: 'queryable',
    },

    // ── Location ──────────────────────────────────────────────────────────────
    locationType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Location Type',
      group:       'OT_Content',
      sortOrder:   80,
      indexingType: 'queryable',
      enum: [
        { value: 'inPerson', displayName: 'In Person' },
        { value: 'virtual',  displayName: 'Virtual' },
        { value: 'hybrid',   displayName: 'Hybrid (In Person + Virtual)' },
      ],
    },
    venueName: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Venue Name',
      description: 'Name of the venue or platform (e.g. "Hilton Midtown" or "Zoom Webinar").',
      group:       'OT_Content',
      sortOrder:   90,
    },
    city: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'City',
      description: 'City for in-person/hybrid events. Leave blank for virtual.',
      group:       'OT_Content',
      sortOrder:   100,
      indexingType: 'searchable',
    },

    // ── Continuing-education credit ─────────────────────────────────────────────
    creditType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Credit Type',
      description: 'Continuing-education credit offered, if any (CLE for legal, CME/CE for health, CPE for finance).',
      group:       'OT_Content',
      sortOrder:   110,
      enum: [
        { value: 'none', displayName: 'No Credit' },
        { value: 'CLE',  displayName: 'CLE (Legal)' },
        { value: 'CME',  displayName: 'CME (Medical)' },
        { value: 'CE',   displayName: 'CE (Continuing Education)' },
        { value: 'CPE',  displayName: 'CPE (Accounting/Finance)' },
        { value: 'PDU',  displayName: 'PDU (Project Management)' },
      ],
    },
    creditHours: {
      type:        'float',
      displayName: 'Credit Hours',
      description: 'Number of credit hours awarded (e.g. 1.5). Only shown when a credit type is set.',
      group:       'OT_Content',
      sortOrder:   120,
    },

    // ── Registration ────────────────────────────────────────────────────────────
    registrationUrl: {
      type:        'url',
      displayName: 'Registration URL',
      description: 'Where attendees register or join. Drives the primary CTA on the event page and card.',
      group:       'OT_Content',
      sortOrder:   130,
    },

    // ── SEO / Search & Discovery ──────────────────────────────────────────────
    // Identical field keys to OT_BlogPage / BlankExperience so lib/metadata.ts
    // and lib/structured-data.ts have a single code path.
    seoTitle: {
      type:        'string',
      displayName: 'Page Title',
      description: 'Appears in the browser tab and search results. Recommended 50–60 characters. Falls back to Site Name if blank.',
      group:       'OT_SEO',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    seoDescription: {
      type:        'string',
      displayName: 'Meta Description',
      description: 'Appears in search engine result snippets. Recommended 120–160 characters. Falls back to the site-level Default Meta Description.',
      group:       'OT_SEO',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    canonicalUrl: {
      type:        'url',
      displayName: 'Canonical URL',
      description: "Override only. Leave blank to use the page's own URL.",
      group:       'OT_SEO',
      sortOrder:   30,
    },
    ogImage: {
      type:         'contentReference',
      displayName:  'Social Share Image',
      description:  'Image shown when this page is shared on social platforms. Recommended 1200×630px. Falls back to the Featured Image, then the site default.',
      allowedTypes: ['_image'],
      group:        'OT_SEO',
      sortOrder:    40,
    },
    pageAnswer: {
      type:        'string',
      displayName: 'AI Answer Summary',
      description: 'A 1–3 sentence plain-language answer to the primary question this page addresses. Used in structured data and as a direct signal to AI answer engines (Perplexity, ChatGPT Browsing, Gemini). Write as if answering the question directly — no marketing language.',
      group:       'OT_SEO',
      sortOrder:   50,
      indexingType: 'searchable',
    },
    schemaType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Schema Type',
      description: 'The structured data type for this page. Controls which JSON-LD block is generated. Defaults to Event when left as None.',
      enum: [
        { value: 'none',    displayName: 'None (defaults to Event)' },
        { value: 'WebPage', displayName: 'Web Page' },
        { value: 'Article', displayName: 'Article' },
        { value: 'FAQPage', displayName: 'FAQ Page' },
        { value: 'Product', displayName: 'Product' },
        { value: 'Event',   displayName: 'Event' },
      ],
      group:       'OT_SEO',
      sortOrder:   60,
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
      description: 'Developer escape hatch. Paste a valid JSON-LD object here to override or extend the generated structured data. Must be valid JSON. Merged with the generated schema — do not include @context. Leave blank unless the Schema Type options above do not cover your use case.',
      group:       'OT_SEO',
      sortOrder:   80,
    },
  },
})
