import { contentType } from '@optimizely/cms-sdk'

export const OT_ResourceLibraryBlock = contentType({
  key:         'OT_ResourceLibraryBlock',
  displayName: 'Resource Library',
  description: 'Downloadable asset list powered by a DAM collection anchor.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    layout: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Layout',
      description: 'Which view to use.',
      enum: [
        { value: 'list', displayName: 'Dense List (Default)' },
        { value: 'grid', displayName: 'Card Grid' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    eyebrow: {
      type:        'string',
      displayName: 'Eyebrow',
      description: 'Optional tag above the title (e.g. "Download Center").',
      group:       'OT_Content',
      sortOrder:   10,
      isLocalized: true,
      maxLength:   60,
      indexingType: 'searchable',
    },
    title: {
      type:        'string',
      displayName: 'Title',
      description: 'Heading for the asset list (e.g. "Resources").',
      group:       'OT_Content',
      sortOrder:   20,
      isLocalized: true,
      maxLength:   80,
      indexingType: 'searchable',
    },
    damFolderId: {
      type:        'string',
      displayName: 'DAM Folder ID',
      description: 'Paste the ParentFolderGuid of the DAM folder (visible in the DAM URL bar). The block fetches and displays all assets in that folder.',
      group:       'OT_Content',
      sortOrder:   30,
      maxLength:   100,
    },
  },
})
