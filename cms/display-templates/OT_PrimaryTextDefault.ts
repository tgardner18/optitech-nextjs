import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_PrimaryTextDefault = displayTemplate({
  key: 'OT_PrimaryTextDefault',
  displayName: 'Primary Text Default',
  contentType: 'OT_PrimaryTextBlock',
  isDefault: true,
  settings: {
    alignment: {
      displayName: 'Alignment',
      editor: 'select',
      sortOrder: 10,
      choices: {
        left:   { displayName: 'Left (Default)', sortOrder: 10 },
        center: { displayName: 'Centered',        sortOrder: 20 },
      },
    },
    color: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 20,
      choices: {
        none:    { displayName: 'Transparent (inherit row/section)', sortOrder: 5  },
        canvas:  { displayName: 'Canvas (Default)',                  sortOrder: 10 },
        brand:   { displayName: 'Brand',                             sortOrder: 20 },
        surface: { displayName: 'Surface',                           sortOrder: 30 },
      },
    },
    size: {
      displayName: 'Heading scale',
      editor: 'select',
      sortOrder: 30,
      choices: {
        headline: { displayName: 'Headline (Default)',  sortOrder: 10 },
        display:  { displayName: 'Display — Largest',  sortOrder: 20 },
        title:    { displayName: 'Title',              sortOrder: 30 },
        label:    { displayName: 'Label',              sortOrder: 40 },
      },
    },
    headerEffect: {
      displayName: 'Header effect — applied to the heading (best at headline scale & up)',
      editor: 'select',
      sortOrder: 40,
      choices: {
        none:             { displayName: 'None (Default)',     sortOrder: 10 },
        gradient:         { displayName: 'Gradient',           sortOrder: 20 },
        animatedGradient: { displayName: 'Animated Gradient',  sortOrder: 30 },
        depth3d:          { displayName: '3D Depth',           sortOrder: 40 },
        embossed:         { displayName: 'Embossed',           sortOrder: 50 },
        outline:          { displayName: 'Outline',            sortOrder: 60 },
        neon:             { displayName: 'Neon',               sortOrder: 70 },
        highlight:        { displayName: 'Highlight',          sortOrder: 80 },
        glow:             { displayName: 'Glow',               sortOrder: 90 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor:      'select',
      sortOrder:   60,
      choices: {
        none:     { displayName: 'None (Default)', sortOrder: 10 },
        fade:     { displayName: 'Fade in',        sortOrder: 20 },
        slide:    { displayName: 'Slide up',       sortOrder: 30 },
        parallax: { displayName: 'Parallax',       sortOrder: 40 },
      },
    },
  },
})
