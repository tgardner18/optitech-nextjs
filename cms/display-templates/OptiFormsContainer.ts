import { displayTemplate } from '@optimizely/cms-sdk'

export const OptiFormsContainerDefault = displayTemplate({
  key:         'OptiFormsContainerData',
  displayName: 'Form Container',
  baseType:    '_section',
  isDefault:   true,
  settings: {
    contentWidth: {
      displayName: 'Content width',
      editor:      'select',
      sortOrder:   10,
      choices: {
        narrow:  { displayName: 'Narrow (max-2xl)',  sortOrder: 10 },
        default: { displayName: 'Default',           sortOrder: 20 },
        wide:    { displayName: 'Wide (max-5xl)',     sortOrder: 30 },
        full:    { displayName: 'Full bleed',         sortOrder: 40 },
      },
    },
    verticalSpacing: {
      displayName: 'Vertical spacing',
      editor:      'select',
      sortOrder:   20,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
      },
    },
    backgroundColor: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   30,
      choices: {
        none:    { displayName: 'None',    sortOrder: 10 },
        canvas:  { displayName: 'Canvas',  sortOrder: 20 },
        surface: { displayName: 'Surface', sortOrder: 30 },
      },
    },
  },
})
