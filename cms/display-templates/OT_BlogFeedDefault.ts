import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_BlogFeedDefault = displayTemplate({
  key:         'OT_BlogFeedDefault',
  displayName: 'Blog Feed',
  contentType: 'OT_BlogFeedBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    defaultView: {
      displayName: 'Default View',
      editor:      'select',
      sortOrder:   15,
      choices: {
        grid: { displayName: 'Grid / Cards (Default)', sortOrder: 10 },
        list: { displayName: 'List',                   sortOrder: 20 },
      },
    },
    columns: {
      displayName: 'Grid Columns',
      editor:      'select',
      sortOrder:   20,
      choices: {
        col3: { displayName: '3 columns (Default)', sortOrder: 10 },
        col2: { displayName: '2 columns — larger cards', sortOrder: 20 },
      },
    },
    headingSize: {
      displayName: 'Heading Size',
      editor:      'select',
      sortOrder:   30,
      choices: {
        headline: { displayName: 'Headline (Default)', sortOrder: 10 },
        display:  { displayName: 'Display — larger',   sortOrder: 20 },
        title:    { displayName: 'Title — smaller',    sortOrder: 30 },
      },
    },
  },
})
