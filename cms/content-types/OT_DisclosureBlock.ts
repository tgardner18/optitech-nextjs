import { contentType }       from '@optimizely/cms-sdk'
import { OT_DisclosureItem } from './OT_DisclosureItem'

export const OT_DisclosureBlock = contentType({
  key:                  'OT_DisclosureBlock',
  displayName:          'Disclosure Block',
  description:          'Legal and regulatory disclosures, rate notices, and footnotes. Typically placed at the bottom of a page composition.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    heading: {
      type:         'string',
      displayName:  'Section Heading',
      description:  'Optional label, e.g. "Rates & Fees" or "Important Disclosures". Leave blank to show disclosures only.',
      isLocalized:  true,
      maxLength:    80,
      group:        'OT_Content',
      sortOrder:    10,
    },
    style: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Display Style',
      description: 'Fine Print: minimal footnote treatment for bottom-of-page legal copy. Section: slightly elevated with more visual presence.',
      enum: [
        { value: 'finePrint', displayName: 'Fine Print (Default)' },
        { value: 'section',   displayName: 'Section' },
      ],
      group:     'OT_Content',
      sortOrder: 20,
    },
    markerStyle: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Marker Style',
      description: 'How each item is labeled. Single-item disclosures show no marker.',
      enum: [
        { value: 'numeric', displayName: 'Numeric — ¹ ² ³ (Default)' },
        { value: 'alpha',   displayName: 'Alpha — a  b  c' },
      ],
      group:     'OT_Content',
      sortOrder: 30,
    },
    items: {
      type:        'array',
      displayName: 'Disclosures',
      description: 'Add one entry per disclosure. Items are numbered automatically.',
      group:       'OT_Content',
      sortOrder:   40,
      items:       { type: 'component', contentType: OT_DisclosureItem },
    },
  },
})
