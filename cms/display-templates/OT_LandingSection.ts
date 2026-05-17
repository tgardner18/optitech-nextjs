import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_LandingSection = displayTemplate({
  key: 'OT_LandingSection',
  displayName: 'Landing Section',
  baseType: '_section',
  isDefault: true,
  settings: {
    gridWidth: {
      displayName: 'Content width',
      editor: 'select',
      sortOrder: 10,
      choices: {
        full:    { displayName: 'Full bleed',       sortOrder: 10 },
        default: { displayName: 'Default',          sortOrder: 20 },
        wide:    { displayName: 'Wide (max-7xl)',    sortOrder: 30 },
        narrow:  { displayName: 'Narrow (max-4xl)', sortOrder: 40 },
      },
    },
    verticalSpacing: {
      displayName: 'Vertical spacing',
      editor: 'select',
      sortOrder: 20,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
        xl:     { displayName: 'XL',     sortOrder: 50 },
      },
    },
    minHeight: {
      displayName: 'Minimum height',
      editor: 'select',
      sortOrder: 25,
      choices: {
        auto:         { displayName: 'Auto',         sortOrder: 10 },
        quarter:      { displayName: '25vh',         sortOrder: 20 },
        half:         { displayName: '50vh',         sortOrder: 30 },
        threequarter: { displayName: '75vh',         sortOrder: 40 },
        screen:       { displayName: '100vh (full)', sortOrder: 50 },
      },
    },
    backgroundColor: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:        { displayName: 'None',       sortOrder: 10 },
        canvas:      { displayName: 'Canvas',     sortOrder: 20 },
        surface:     { displayName: 'Surface',    sortOrder: 30 },
        brand:       { displayName: 'Brand',      sortOrder: 40 },
        brandDeep: { displayName: 'Brand deep', sortOrder: 50 },
      },
    },
  },
})
