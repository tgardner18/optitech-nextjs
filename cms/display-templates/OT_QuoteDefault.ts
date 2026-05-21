import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_QuoteDefault = displayTemplate({
  key: 'OT_QuoteDefault',
  displayName: 'Quote Default',
  contentType: 'OT_QuoteBlock',
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
      displayName: 'Quote scale',
      editor: 'select',
      sortOrder: 30,
      choices: {
        large: { displayName: 'Large (Default)', sortOrder: 10 },
        small: { displayName: 'Small',           sortOrder: 20 },
      },
    },
  },
})
