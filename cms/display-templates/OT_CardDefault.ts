import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_CardDefault = displayTemplate({
  key: 'OT_CardDefault',
  displayName: 'Card Default',
  contentType: 'OT_CardBlock',
  isDefault: true,
  settings: {
    fill: {
      displayName: 'Card fill',
      editor: 'select',
      sortOrder: 10,
      choices: {
        ghost:   { displayName: 'Ghost (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
        light:   { displayName: 'Light',            sortOrder: 40 },
        glass:   { displayName: 'Glass',            sortOrder: 50 },
      },
    },
    border: {
      displayName: 'Border',
      editor: 'select',
      sortOrder: 20,
      choices: {
        none:   { displayName: 'None (Default)', sortOrder: 10 },
        subtle: { displayName: 'Subtle',         sortOrder: 20 },
        brand:  { displayName: 'Brand',          sortOrder: 30 },
      },
    },
    imageStyle: {
      displayName: 'Image treatment',
      editor: 'select',
      sortOrder: 30,
      choices: {
        top:        { displayName: 'Top (Default)', sortOrder: 10 },
        background: { displayName: 'Background',    sortOrder: 20 },
        side:       { displayName: 'Side',          sortOrder: 30 },
        float:      { displayName: 'Floating',      sortOrder: 40 },
      },
    },
    imageSide: {
      displayName: 'Image side',
      editor: 'select',
      sortOrder: 40,
      choices: {
        left:  { displayName: 'Left (Default)', sortOrder: 10 },
        right: { displayName: 'Right',          sortOrder: 20 },
      },
    },
    hover: {
      displayName: 'Hover effect',
      editor: 'select',
      sortOrder: 50,
      choices: {
        none: { displayName: 'None (Default)', sortOrder: 10 },
        lift: { displayName: 'Lift',           sortOrder: 20 },
        glow: { displayName: 'Glow',           sortOrder: 30 },
      },
    },
    density: {
      displayName: 'Padding density',
      editor: 'select',
      sortOrder: 60,
      choices: {
        default:  { displayName: 'Default',  sortOrder: 10 },
        compact:  { displayName: 'Compact',  sortOrder: 20 },
        spacious: { displayName: 'Spacious', sortOrder: 30 },
      },
    },
    noise: {
      displayName: 'Noise texture',
      editor: 'select',
      sortOrder: 70,
      choices: {
        false: { displayName: 'Off (Default)', sortOrder: 10 },
        true:  { displayName: 'On',            sortOrder: 20 },
      },
    },
    accentLine: {
      displayName: 'Accent line',
      editor: 'select',
      sortOrder: 80,
      choices: {
        none: { displayName: 'None (Default)', sortOrder: 10 },
        top:  { displayName: 'Top Edge',       sortOrder: 20 },
      },
    },
    maxHeight: {
      displayName: 'Max height',
      editor: 'select',
      sortOrder: 90,
      choices: {
        none: { displayName: 'None — natural content height (Default)', sortOrder: 10 },
        sm:   { displayName: 'Small — 320px',                           sortOrder: 20 },
        md:   { displayName: 'Medium — 480px',                          sortOrder: 30 },
        lg:   { displayName: 'Large — 640px',                           sortOrder: 40 },
      },
    },
  },
})
