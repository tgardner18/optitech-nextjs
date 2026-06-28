import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ImageDefault = displayTemplate({
  key: 'OT_ImageDefault',
  displayName: 'Image Default',
  contentType: 'OT_ImageBlock',
  isDefault: true,
  settings: {
    maxHeight: {
      displayName: 'Max height',
      editor: 'select',
      sortOrder: 5,
      choices: {
        none: { displayName: 'None — natural aspect ratio (Default)', sortOrder: 10 },
        xs:   { displayName: 'Short — 200px',                        sortOrder: 20 },
        sm:   { displayName: 'Small — 320px',                        sortOrder: 30 },
        md:   { displayName: 'Medium — 480px',                       sortOrder: 40 },
        lg:   { displayName: 'Large — 640px',                        sortOrder: 50 },
      },
    },
    ratio: {
      displayName: 'Aspect ratio',
      editor: 'select',
      sortOrder: 10,
      choices: {
        auto:  { displayName: 'Natural (Default)', sortOrder: 10 },
        r16_9: { displayName: '16:9 Widescreen',   sortOrder: 20 },
        r4_3:  { displayName: '4:3',               sortOrder: 30 },
        r3_2:  { displayName: '3:2',               sortOrder: 40 },
        r1_1:  { displayName: 'Square',            sortOrder: 50 },
      },
    },
    overlay: {
      displayName: 'Brand overlay',
      editor: 'select',
      sortOrder: 20,
      choices: {
        false: { displayName: 'Off (Default)', sortOrder: 10 },
        true:  { displayName: 'Brand wash',    sortOrder: 20 },
      },
    },
    frame: {
      displayName: 'Frame treatment',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:   { displayName: 'None (Default)',          sortOrder: 10 },
        offset: { displayName: 'Offset — bold editorial', sortOrder: 20 },
        glow:   { displayName: 'Glow — atmospheric',      sortOrder: 30 },
      },
    },
    animate: {
      displayName: 'Scroll reveal',
      editor: 'select',
      sortOrder: 40,
      choices: {
        false: { displayName: 'Off (Default)', sortOrder: 10 },
        true:  { displayName: 'Wipe reveal',   sortOrder: 20 },
      },
    },
    captionPosition: {
      displayName: 'Caption position',
      editor: 'select',
      sortOrder: 50,
      choices: {
        below:  { displayName: 'Below (Default)',     sortOrder: 10 },
        inset:  { displayName: 'Inset over image',    sortOrder: 20 },
      },
    },
    shadow: {
      displayName: 'Chromatic shadow',
      editor: 'select',
      sortOrder: 60,
      choices: {
        false: { displayName: 'Off (Default)',        sortOrder: 10 },
        true:  { displayName: 'Chromatic bloom',      sortOrder: 20 },
      },
    },
    lightbox: {
      displayName: 'Click to expand',
      editor: 'select',
      sortOrder: 70,
      choices: {
        false: { displayName: 'Off (Default)',                              sortOrder: 10 },
        true:  { displayName: 'Lightbox — click image to view full screen', sortOrder: 20 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor:      'select',
      sortOrder:   80,
      choices: {
        none:     { displayName: 'None (Default)', sortOrder: 10 },
        fade:     { displayName: 'Fade in',        sortOrder: 20 },
        slide:    { displayName: 'Slide up',       sortOrder: 30 },
        parallax: { displayName: 'Parallax',       sortOrder: 40 },
      },
    },
  },
})
