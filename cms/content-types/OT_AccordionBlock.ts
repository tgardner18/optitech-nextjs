import { contentType } from '@optimizely/cms-sdk'
import { OT_AccordionItem } from './OT_AccordionItem'

/**
 * OT_AccordionBlock — an expandable content block for FAQ, disclosure, and
 * general expandable content. Editors add 2–12 OT_AccordionItem entries.
 *
 * Each item has a question (trigger) and an answer (panel body).
 * Border style, open mode, and color scheme are controlled via the
 * OT_AccordionDefault display template — not as content properties.
 *
 * Min items: 2 (enforced in the UI — empty state shown below minimum).
 * Max items: 12 (excess items silently capped in the UI component).
 */
export const OT_AccordionBlock = contentType({
  key:                  'OT_AccordionBlock',
  displayName:          'Accordion Block',
  description:          'Expandable FAQ section with headline and collapsible question/answer items.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    eyebrow: {
      type:        'string',
      maxLength:   80,
      displayName: 'Eyebrow',
      description: 'Optional label above the headline. e.g. "FAQ" or "Common questions"',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    headline: {
      type:        'string',
      maxLength:   160,
      displayName: 'Headline',
      description: 'Optional section heading above the accordion items.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    items: {
      type:        'array',
      displayName: 'Items',
      description: 'Add 2–12 accordion items. Each has a question/title and an answer/body.',
      group:       'OT_Content',
      sortOrder:   30,
      items:       { type: 'component', contentType: OT_AccordionItem },
    },
  },
})
