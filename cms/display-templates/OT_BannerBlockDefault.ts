import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_BannerBlockDefault = displayTemplate({
  key:         'OT_BannerBlockDefault',
  displayName: 'Banner Block',
  contentType: 'OT_BannerBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background color',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    treatment: {
      displayName: 'Overlay treatment',
      editor:      'select',
      sortOrder:   20,
      choices: {
        scrim: { displayName: 'Scrim (Default)', sortOrder: 10 },
        glass: { displayName: 'Glass panel',     sortOrder: 20 },
      },
    },
    alignment: {
      displayName: 'Content alignment',
      editor:      'select',
      sortOrder:   30,
      choices: {
        center: { displayName: 'Center (Default)', sortOrder: 10 },
        left:   { displayName: 'Left',             sortOrder: 20 },
      },
    },
    size: {
      displayName: 'Height',
      editor:      'select',
      sortOrder:   40,
      choices: {
        large:   { displayName: 'Large (Default)', sortOrder: 10 },
        compact: { displayName: 'Compact',         sortOrder: 20 },
        display: { displayName: 'Display',         sortOrder: 30 },
      },
    },
    imageBlend: {
      displayName: 'Image blend',
      editor:      'select',
      sortOrder:   50,
      choices: {
        overlay:  { displayName: 'Overlay (Default)', sortOrder: 10 },
        multiply: { displayName: 'Multiply',          sortOrder: 20 },
      },
    },
  },
})
