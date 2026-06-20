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
    backgroundColor: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:      { displayName: 'None',          sortOrder: 10 },
        canvas:    { displayName: 'Canvas',        sortOrder: 20 },
        surface:   { displayName: 'Surface',       sortOrder: 30 },
        brand:     { displayName: 'Brand',         sortOrder: 40 },
        brandDeep: { displayName: 'Brand deep',    sortOrder: 50 },
        glass:     { displayName: 'Glass (frosted)', sortOrder: 60 },
      },
    },
    sectionOverlap: {
      displayName: 'Pull up into section above',
      editor: 'select',
      sortOrder: 35,
      choices: {
        none:    { displayName: 'None (flush)',     sortOrder: 10 },
        shallow: { displayName: 'Shallow (16px)',   sortOrder: 20 },
        mid:     { displayName: 'Mid (32px)',       sortOrder: 30 },
        deep:    { displayName: 'Deep (64px)',      sortOrder: 40 },
        full:    { displayName: 'Full (128px)',     sortOrder: 50 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor: 'select',
      sortOrder: 40,
      choices: {
        none:     { displayName: 'None (Default)', sortOrder: 10 },
        fade:     { displayName: 'Fade in',        sortOrder: 20 },
        slide:    { displayName: 'Slide up',       sortOrder: 30 },
        parallax: { displayName: 'Parallax',       sortOrder: 40 },
      },
    },
  },
})
