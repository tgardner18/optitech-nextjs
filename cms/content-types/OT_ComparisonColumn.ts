import { contentType } from '@optimizely/cms-sdk'

export const OT_ComparisonColumn = contentType({
  key:         'OT_ComparisonColumn',
  displayName: 'Comparison Column',
  description: 'A single column in a Comparison Table — one option, plan, or tier. Setting a Badge Text marks it as the featured/recommended column.',
  baseType:    '_component',
  properties: {
    label: {
      type:        'string',
      maxLength:   40,
      isLocalized: true,
      displayName: 'Column Name',
      description: 'The option name (e.g. "Basic Checking", "Premium", "Enterprise Support").',
      group:       'OT_Content',
      sortOrder:   10,
    },
    subLabel: {
      type:        'string',
      maxLength:   60,
      isLocalized: true,
      displayName: 'Subtitle / Price',
      description: 'Optional descriptor below the name (e.g. "$0/month", "Free forever", "Custom pricing").',
      group:       'OT_Content',
      sortOrder:   20,
    },
    badgeText: {
      type:        'string',
      maxLength:   30,
      isLocalized: true,
      displayName: 'Badge',
      description: 'Optional pill label above the column name (e.g. "Most Popular", "Best Value"). When set, this column receives the featured visual treatment — brand color header and highlighted cells.',
      group:       'OT_Content',
      sortOrder:   30,
    },
    ctaLabel: {
      type:        'string',
      maxLength:   40,
      isLocalized: true,
      displayName: 'CTA Label',
      description: 'Button label in the column header (e.g. "Open Account", "Get Started").',
      group:       'OT_Content',
      sortOrder:   40,
    },
    ctaUrl: {
      type:        'url',
      displayName: 'CTA URL',
      group:       'OT_Content',
      sortOrder:   50,
    },
  },
})
