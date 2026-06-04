import { contentType } from '@optimizely/cms-sdk'

/**
 * OT_StatItem — a single metric callout within OT_StatBlock.
 * Not a standalone block; only appears as an array item inside OT_StatBlock.
 *
 * Icon selection is handled via OT_StatBlockDefault display template settings
 * (stat1Icon … stat4Icon) rather than as a content property, because
 * Optimizely SaaS CMS only supports choice/dropdown editors in display
 * template settings — not on content type string properties.
 */
export const OT_StatItem = contentType({
  key:         'OT_StatItem',
  displayName: 'Stat Item',
  description: 'Single metric tile used inside a Stat Block.',
  baseType:    '_component',
  properties: {
    value: {
      type:        'string',
      maxLength:   20,
      displayName: 'Value',
      description: 'The metric value — e.g. "40%", "2M+", "$4.2B", "99.99%"',
      group:       'OT_Content',
      sortOrder:   10,
    },
    label: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'Label',
      description: 'Short descriptor shown below the value. e.g. "Faster deployment"',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    context: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Context',
      description: 'Optional supporting line. e.g. "vs. industry average"',
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
  },
})
