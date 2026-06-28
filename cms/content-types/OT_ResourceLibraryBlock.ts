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
    // The editor clicks "Browse DAM" and picks any single asset from the target
    // collection. The front-end uses this asset's collectionId to query all
    // siblings from Optimizely Graph.
    //
    // allowedTypes is intentionally omitted here. The 'documents', 'images',
    // 'video' keywords that control DAM picker visibility are UI-layer settings
    // that can only be applied via the CMS Content Type Builder — they are not
    // valid code-first schema values and cause a push failure if included.
    // After pushing this type, open the property in the CMS builder and check
    // "documents" (and optionally "images", "video") to enable the DAM picker.
    anchorAsset: {
      type:        'contentReference',
      displayName: 'DAM Anchor Asset',
      description: 'Browse DAM and pick any asset from the target collection. The block displays all assets in that collection.',
      group:       'OT_Content',
      sortOrder:   30,
    },
  },
})
