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
        none: { displayName: 'None (Default)',  sortOrder: 10 },
        lift: { displayName: 'Lift',            sortOrder: 20 },
        glow: { displayName: 'Glow',            sortOrder: 30 },
        tilt: { displayName: 'Tilt',            sortOrder: 40 },
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
    minHeight: {
      displayName: 'Min height',
      editor: 'select',
      sortOrder: 92,
      choices: {
        none: { displayName: 'None — natural height (Default)', sortOrder: 10 },
        xs:   { displayName: 'Short — 200px',                  sortOrder: 20 },
        sm:   { displayName: 'Small — 280px',                  sortOrder: 30 },
        md:   { displayName: 'Medium — 380px',                 sortOrder: 40 },
        lg:   { displayName: 'Tall — 480px',                   sortOrder: 50 },
      },
    },
    aspectRatio: {
      displayName: 'Card aspect ratio',
      editor: 'select',
      sortOrder: 94,
      choices: {
        auto:      { displayName: 'Auto — natural content height (Default)', sortOrder: 10 },
        square:    { displayName: 'Square — 1:1',                            sortOrder: 20 },
        portrait:  { displayName: 'Portrait — 3:4',                          sortOrder: 30 },
        landscape: { displayName: 'Landscape — 4:3',                         sortOrder: 40 },
        wide:      { displayName: 'Wide — 16:9',                             sortOrder: 50 },
        cinema:    { displayName: 'Cinema — 21:9',                           sortOrder: 60 },
      },
    },
    imageAspectRatio: {
      displayName: 'Image area aspect ratio',
      editor: 'select',
      sortOrder: 96,
      choices: {
        auto:      { displayName: 'Auto — default per image style (Default)', sortOrder: 10 },
        square:    { displayName: 'Square — 1:1',                             sortOrder: 20 },
        portrait:  { displayName: 'Portrait — 3:4',                           sortOrder: 30 },
        landscape: { displayName: 'Landscape — 4:3',                          sortOrder: 40 },
        wide:      { displayName: 'Wide — 16:9',                              sortOrder: 50 },
      },
    },
  },
})
