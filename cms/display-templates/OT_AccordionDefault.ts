import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_AccordionDefault = displayTemplate({
  key:         'OT_AccordionDefault',
  displayName: 'Accordion Block',
  contentType: 'OT_AccordionBlock',
  isDefault:   true,
  settings: {

    // ── Background color ─────────────────────────────────────────────────────
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)',  sortOrder: 10 },
        surface: { displayName: 'Surface',           sortOrder: 20 },
        brand:   { displayName: 'Brand',             sortOrder: 30 },
      },
    },

    // ── Border style ─────────────────────────────────────────────────────────
    borderStyle: {
      displayName: 'Border Style',
      editor:      'select',
      sortOrder:   20,
      choices: {
        ruled:  { displayName: 'Ruled — horizontal separator lines (Default)', sortOrder: 10 },
        boxed:  { displayName: 'Boxed — each item fully bordered',             sortOrder: 20 },
        clean:  { displayName: 'Clean — spacing only, no borders',             sortOrder: 30 },
      },
    },

    // ── Open mode ────────────────────────────────────────────────────────────
    openMode: {
      displayName: 'Open Mode',
      editor:      'select',
      sortOrder:   30,
      choices: {
        single:   { displayName: 'Single — one item open at a time (Default)', sortOrder: 10 },
        multiple: { displayName: 'Multiple — items open independently',        sortOrder: 20 },
      },
    },

    // ── Default open ─────────────────────────────────────────────────────────
    defaultOpen: {
      displayName: 'Default State',
      editor:      'select',
      sortOrder:   40,
      choices: {
        false: { displayName: 'All closed (Default)', sortOrder: 10 },
        true:  { displayName: 'First item open',      sortOrder: 20 },
      },
    },
  },
})
