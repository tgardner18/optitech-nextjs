import { contentType } from '@optimizely/cms-sdk'

/**
 * OT_AccordionItem — a single expandable panel within OT_AccordionBlock.
 * Not a standalone block; only appears as an array item inside OT_AccordionBlock.
 *
 * Each item has a question (the trigger label) and an answer (the panel body).
 * Min items: 2 | Max items: 12 — enforced in the UI component.
 */
export const OT_AccordionItem = contentType({
  key:         'OT_AccordionItem',
  displayName: 'Accordion Item',
  baseType:    '_component',
  properties: {
    question: {
      type:        'string',
      maxLength:   200,
      displayName: 'Question / Title',
      description: 'The trigger label shown in the collapsed row. e.g. "How does pricing work?"',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   10,
    },
    answer: {
      type:        'string',
      maxLength:   2000,
      displayName: 'Answer / Body',
      description: 'The panel content revealed when the item is expanded.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   20,
    },
  },
})
