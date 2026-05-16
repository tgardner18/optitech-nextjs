import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_LandingColumn = displayTemplate({
  key: 'OT_LandingColumn',
  displayName: 'Landing Column',
  nodeType: 'column',
  isDefault: true,
  settings: {
    gridSpan: {
      displayName: 'Column width',
      editor: 'select',
      sortOrder: 10,
      choices: {
        auto:  { displayName: 'Auto (equal)',  sortOrder: 10 },
        col1:  { displayName: '1/12',         sortOrder: 20 },
        col2:  { displayName: '2/12',         sortOrder: 30 },
        col3:  { displayName: '3/12 (25%)',   sortOrder: 40 },
        col4:  { displayName: '4/12 (33%)',   sortOrder: 50 },
        col5:  { displayName: '5/12',         sortOrder: 60 },
        col6:  { displayName: '6/12 (50%)',   sortOrder: 70 },
        col7:  { displayName: '7/12',         sortOrder: 80 },
        col8:  { displayName: '8/12 (67%)',   sortOrder: 90 },
        col9:  { displayName: '9/12 (75%)',   sortOrder: 100 },
        col10: { displayName: '10/12',        sortOrder: 110 },
        col11: { displayName: '11/12',        sortOrder: 120 },
        col12: { displayName: '12/12 (full)', sortOrder: 130 },
      },
    },
    contentSpacing: {
      displayName: 'Content spacing',
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
    verticalPadding: {
      displayName: 'Vertical padding',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
        xl:     { displayName: 'XL',     sortOrder: 50 },
      },
    },
    horizontalPadding: {
      displayName: 'Horizontal padding',
      editor: 'select',
      sortOrder: 40,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
      },
    },
    justifyContent: {
      displayName: 'Justify content',
      editor: 'select',
      sortOrder: 50,
      choices: {
        start:  { displayName: 'Start',  sortOrder: 10 },
        center: { displayName: 'Center', sortOrder: 20 },
        end:    { displayName: 'End',    sortOrder: 30 },
      },
    },
    alignContent: {
      displayName: 'Align content',
      editor: 'select',
      sortOrder: 60,
      choices: {
        start:  { displayName: 'Start',  sortOrder: 10 },
        center: { displayName: 'Center', sortOrder: 20 },
        end:    { displayName: 'End',    sortOrder: 30 },
      },
    },
  },
})
