import { contentType } from '@optimizely/cms-sdk'
import { OT_StatItem }  from './OT_StatItem'

/**
 * OT_StatBlock — a row of metric callouts for social proof and ROI messaging.
 *
 * Editors add up to 4 OT_StatItem entries via the CMS array UI.
 * Each item has a value, label, optional context, and an optional icon
 * selected from a fixed dropdown.
 */
export const OT_StatBlock = contentType({
  key:                  'OT_StatBlock',
  displayName:          'Stat Block',
  description:          'Row of up to 4 metric callouts, each with a value, label, and context.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    stats: {
      type:        'array',
      displayName: 'Stats',
      description: 'Add up to 4 stat items. Each has a value, label, optional context, and optional icon.',
      group:       'OT_Content',
      sortOrder:   10,
      items:       { type: 'component', contentType: OT_StatItem },
    },
  },
})
