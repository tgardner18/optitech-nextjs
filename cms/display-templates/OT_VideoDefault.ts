import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_VideoDefault = displayTemplate({
  key: 'OT_VideoDefault',
  displayName: 'Video Default',
  contentType: 'OT_VideoBlock',
  isDefault: true,
  settings: {
    contentWidth: {
      displayName: 'Width',
      editor:      'select',
      sortOrder:   1,
      choices: {
        default: { displayName: 'Default (Recommended)', sortOrder: 10 },
        wide:    { displayName: 'Wide',                  sortOrder: 20 },
        full:    { displayName: 'Full bleed',             sortOrder: 30 },
      },
    },
    bgColor: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   5,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    ratio: {
      displayName: 'Aspect ratio',
      editor: 'select',
      sortOrder: 10,
      choices: {
        r16_9: { displayName: '16:9 (Default)', sortOrder: 10 },
        r4_3:  { displayName: '4:3',            sortOrder: 20 },
        r3_2:  { displayName: '3:2',            sortOrder: 30 },
        r1_1:  { displayName: 'Square',         sortOrder: 40 },
      },
    },
    overlay: {
      displayName: 'Brand overlay',
      editor: 'select',
      sortOrder: 20,
      choices: {
        false: { displayName: 'Off (Default)',          sortOrder: 10 },
        true:  { displayName: 'Brand wash on poster',   sortOrder: 20 },
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
    captionPosition: {
      displayName: 'Caption position',
      editor: 'select',
      sortOrder: 40,
      choices: {
        below: { displayName: 'Below (Default)',          sortOrder: 10 },
        inset: { displayName: 'Inset over thumbnail',     sortOrder: 20 },
      },
    },
    shadow: {
      displayName: 'Chromatic shadow',
      editor: 'select',
      sortOrder: 50,
      choices: {
        false: { displayName: 'Off (Default)',        sortOrder: 10 },
        true:  { displayName: 'Chromatic bloom',      sortOrder: 20 },
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
