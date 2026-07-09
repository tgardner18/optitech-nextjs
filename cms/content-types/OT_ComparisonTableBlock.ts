import { contentType } from '@optimizely/cms-sdk'
import { OT_ComparisonColumn } from './OT_ComparisonColumn'
import { OT_ComparisonRow }    from './OT_ComparisonRow'

export const OT_ComparisonTableBlock = contentType({
  key:                  'OT_ComparisonTableBlock',
  displayName:          'Comparison Table',
  description:          'Side-by-side feature comparison for plans, tiers, or account types. Supports grouped rows, a featured/recommended column, icon cells, short-text cells, and a mobile column selector.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    eyebrow: {
      type:        'string',
      maxLength:   80,
      displayName: 'Eyebrow',
      description: 'Optional uppercase label above the headline (e.g. "Account Options", "Compare Plans").',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   10,
    },
    headline: {
      type:        'string',
      maxLength:   120,
      displayName: 'Headline',
      description: 'Main heading above the table.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    subHeadline: {
      type:        'string',
      maxLength:   280,
      displayName: 'Sub-Headline',
      description: 'Optional supporting sentence below the headline.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   30,
    },
    columns: {
      type:        'array',
      displayName: 'Columns',
      description: 'The options being compared — plans, account types, service tiers. Add 2–4 columns. Set a Badge on one column to make it the featured/recommended option.',
      group:       'OT_Content',
      sortOrder:   40,
      items:       { type: 'component', contentType: OT_ComparisonColumn },
    },
    rows: {
      type:        'array',
      displayName: 'Rows',
      description: 'Mix Group Header rows (section dividers) with Data Rows (feature comparisons). Cell values in each Data Row are in column order.',
      group:       'OT_Content',
      sortOrder:   50,
      items:       { type: 'component', contentType: OT_ComparisonRow },
    },
  },
})
