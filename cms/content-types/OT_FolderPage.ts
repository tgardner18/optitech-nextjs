import { contentType } from '@optimizely/cms-sdk'

/**
 * Folder — a tree-organizer page type.
 *
 * Never rendered on the public site: any visitor who navigates directly to a
 * Folder URL receives a 404. The page exists solely to group child pages under
 * a meaningful path segment (e.g. /solutions/enterprise/).
 *
 * The CMS editor preview shows a breadcrumb, the folder name, and an
 * explanation so editors understand the page's purpose at a glance.
 */
export const OT_FolderPage = contentType({
  key:         'OT_FolderPage',
  displayName: 'Folder',
  baseType:    '_page',
  mayContainTypes: ['_self', 'BlankExperience', 'OT_BlogPage'],
  properties: {
    notes: {
      type:        'string',
      displayName: 'Editor Notes',
      description: 'Internal notes for editors — never shown on the public site.',
      group:       'OT_Content',
      sortOrder:   10,
    },
  },
})
