import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ChartDefault = displayTemplate({
  key: 'OT_ChartDefault',
  displayName: 'Chart Default',
  contentType: 'OT_ChartBlock',
  isDefault: true,
  settings: {
    color: {
      displayName: 'Color',
      editor: 'select',
      sortOrder: 10,
      choices: {
        canvas:  { displayName: 'Canvas',  sortOrder: 10 },
        surface: { displayName: 'Surface', sortOrder: 20 },
        brand:   { displayName: 'Brand',   sortOrder: 30 },
        glass:   { displayName: 'Glass (use over imagery or brand sections)', sortOrder: 40 },
      },
    },
    height: {
      displayName: 'Chart Height',
      editor: 'select',
      sortOrder: 20,
      choices: {
        sm: { displayName: 'Small (240px)',  sortOrder: 10 },
        md: { displayName: 'Medium (320px)', sortOrder: 20 },
        lg: { displayName: 'Large (420px)',  sortOrder: 30 },
      },
    },
    aspectRatio: {
      displayName: 'Aspect Ratio',
      editor: 'select',
      sortOrder: 30,
      choices: {
        wide:     { displayName: 'Wide (16:9)',     sortOrder: 10 },
        standard: { displayName: 'Standard (4:3)', sortOrder: 20 },
        square:   { displayName: 'Square (1:1)',    sortOrder: 30 },
      },
    },
  },
})
