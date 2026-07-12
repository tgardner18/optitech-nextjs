import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_RichTextDefault = displayTemplate({
  key: 'OT_RichTextDefault',
  displayName: 'Rich Text Default',
  contentType: 'OT_RichTextBlock',
  isDefault: true,
  settings: {
    color: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 10,
      choices: {
        none:    { displayName: 'Transparent (inherit row/section)', sortOrder: 5  },
        canvas:  { displayName: 'Canvas (Default)',                  sortOrder: 10 },
        brand:   { displayName: 'Brand',                             sortOrder: 20 },
        surface: { displayName: 'Surface',                           sortOrder: 30 },
      },
    },
    alignment: {
      displayName: 'Alignment',
      editor: 'select',
      sortOrder: 20,
      choices: {
        left:   { displayName: 'Left (Default)', sortOrder: 10 },
        center: { displayName: 'Centered',        sortOrder: 20 },
      },
    },
    size: {
      displayName: 'Type scale',
      editor: 'select',
      sortOrder: 30,
      choices: {
        editorial: { displayName: 'Editorial (Default)', sortOrder: 10 },
        compact:   { displayName: 'Compact',             sortOrder: 20 },
      },
    },
    treatment: {
      displayName: 'Treatment',
      editor: 'select',
      sortOrder: 40,
      choices: {
        standard:         { displayName: 'Standard (Default)',           sortOrder: 10 },
        lead:             { displayName: 'Lead — Deck size',             sortOrder: 20 },
        toc:              { displayName: 'Contents — section navigator', sortOrder: 30 },
        'accent-callout': { displayName: 'Accent Bar Callout',           sortOrder: 40 },
        'glow-frame':     { displayName: 'Gradient Border Glow Frame',   sortOrder: 50 },
        'offset-panel':   { displayName: 'Asymmetric Offset Panel',      sortOrder: 60 },
      },
    },
  },
})
