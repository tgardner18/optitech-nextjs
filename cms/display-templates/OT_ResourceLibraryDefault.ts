import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ResourceLibraryDefault = displayTemplate({
  key:         'OT_ResourceLibraryDefault',
  displayName: 'Resource Library Default',
  contentType: 'OT_ResourceLibraryBlock',
  isDefault:   true,
  settings: {
    filterType: {
      displayName: 'File Type Filter',
      editor:      'select',
      sortOrder:   10,
      choices: {
        all:       { displayName: 'All Files (Default)',     sortOrder: 10 },
        documents: { displayName: 'Documents — PDF & DOCX', sortOrder: 20 },
        images:    { displayName: 'Images Only',             sortOrder: 30 },
        video:     { displayName: 'Video Only',              sortOrder: 40 },
      },
    },
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   30,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',           sortOrder: 20 },
      },
    },
    showFileSize: {
      displayName: 'Show file size',
      editor:      'select',
      sortOrder:   40,
      choices: {
        hide: { displayName: 'Hidden (Default)', sortOrder: 10 },
        show: { displayName: 'Visible',          sortOrder: 20 },
      },
    },
    pageSize: {
      displayName: 'Items per page',
      editor:      'select',
      sortOrder:   50,
      choices: {
        ps6:  { displayName: '6 per page',            sortOrder: 10 },
        ps9:  { displayName: '9 per page',            sortOrder: 20 },
        ps12: { displayName: '12 per page (Default)', sortOrder: 30 },
        ps24: { displayName: '24 per page',           sortOrder: 40 },
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
