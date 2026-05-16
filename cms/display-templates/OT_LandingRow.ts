import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_LandingRow = displayTemplate({
  key: 'OT_LandingRow',
  displayName: 'Landing Row',
  nodeType: 'row',
  isDefault: true,
  settings: {
    showAsRowFrom: {
      displayName: 'Stack columns until',
      editor: 'select',
      sortOrder: 10,
      choices: {
        sm:    { displayName: 'Small (≥640px)',  sortOrder: 10 },
        md:    { displayName: 'Medium (≥768px)', sortOrder: 20 },
        lg:    { displayName: 'Large (≥1024px)', sortOrder: 30 },
        xl:    { displayName: 'XL (≥1280px)',    sortOrder: 40 },
        never: { displayName: 'Always stacked',  sortOrder: 50 },
      },
    },
    contentSpacing: {
      displayName: 'Column gap',
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
    justifyContent: {
      displayName: 'Justify content',
      editor: 'select',
      sortOrder: 40,
      choices: {
        start:   { displayName: 'Start',          sortOrder: 10 },
        center:  { displayName: 'Center',         sortOrder: 20 },
        end:     { displayName: 'End',            sortOrder: 30 },
        between: { displayName: 'Space between',  sortOrder: 40 },
        evenly:  { displayName: 'Space evenly',   sortOrder: 50 },
      },
    },
    alignItems: {
      displayName: 'Align items',
      editor: 'select',
      sortOrder: 50,
      choices: {
        start:    { displayName: 'Start',    sortOrder: 10 },
        center:   { displayName: 'Center',   sortOrder: 20 },
        end:      { displayName: 'End',      sortOrder: 30 },
        stretch:  { displayName: 'Stretch',  sortOrder: 40 },
        baseline: { displayName: 'Baseline', sortOrder: 50 },
      },
    },
    backgroundColor: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 70,
      choices: {
        none:        { displayName: 'None',       sortOrder: 10 },
        canvas:      { displayName: 'Canvas',     sortOrder: 20 },
        surface:     { displayName: 'Surface',    sortOrder: 30 },
        brand:       { displayName: 'Brand',      sortOrder: 40 },
        brandDeep: { displayName: 'Brand deep', sortOrder: 50 },
      },
    },
    backgroundImage: {
      displayName: 'Background image URL',
      editor: 'select',
      sortOrder: 80,
      choices: {},
    },
    imageOverlay: {
      displayName: 'Image overlay',
      editor: 'select',
      sortOrder: 90,
      choices: {
        none:  { displayName: 'None',  sortOrder: 10 },
        dark:  { displayName: 'Dark',  sortOrder: 20 },
        brand: { displayName: 'Brand', sortOrder: 30 },
      },
    },
    wrapColumns: {
      displayName: 'Wrap columns',
      editor: 'select',
      sortOrder: 100,
      choices: {
        false: { displayName: 'No (Default)', sortOrder: 10 },
        true:  { displayName: 'Yes',          sortOrder: 20 },
      },
    },
    reverseColumns: {
      displayName: 'Reverse column order',
      editor: 'select',
      sortOrder: 110,
      choices: {
        false: { displayName: 'No (Default)', sortOrder: 10 },
        true:  { displayName: 'Yes',          sortOrder: 20 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor: 'select',
      sortOrder: 120,
      choices: {
        none:  { displayName: 'None',     sortOrder: 10 },
        fade:  { displayName: 'Fade in',  sortOrder: 20 },
        slide: { displayName: 'Slide up', sortOrder: 30 },
      },
    },
  },
})
