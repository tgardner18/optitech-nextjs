import { contentType } from '@optimizely/cms-sdk'

/**
 * OT_Author — shared author profile content type.
 *
 * Author items are managed centrally (e.g. in a dedicated /Authors folder)
 * and referenced from blog posts via a contentReference field. This keeps
 * author data canonical: one update propagates to all posts.
 *
 * Fields intentionally NOT localized:
 *  - name:     a person's name is the same across languages
 *  - photo:    one profile image shared across locales
 *  - linkedIn, twitter: external URLs not locale-specific
 *
 * Fields that ARE localized:
 *  - role:  job title may differ across language contexts
 *  - bio:   editorial biography should be authored per locale
 */
export const OT_Author = contentType({
  key: 'OT_Author',
  displayName: 'Author',
  baseType: '_component',
  properties: {
    name: {
      type: 'string',
      isLocalized: false,
      maxLength: 80,
      displayName: 'Full Name',
      group: 'OT_Content',
      sortOrder: 10,
    },
    role: {
      type: 'string',
      isLocalized: true,
      maxLength: 100,
      displayName: 'Role / Title',
      group: 'OT_Content',
      sortOrder: 20,
    },
    bio: {
      type: 'richText',
      isLocalized: true,
      displayName: 'Bio',
      group: 'OT_Content',
      sortOrder: 30,
    },
    photo: {
      type: 'contentReference',
      allowedTypes: ['_image'],
      displayName: 'Profile Photo',
      group: 'OT_Content',
      sortOrder: 40,
    },
    linkedIn: {
      type: 'url',
      isLocalized: false,
      displayName: 'LinkedIn URL',
      group: 'OT_Content',
      sortOrder: 50,
    },
    twitter: {
      type: 'url',
      isLocalized: false,
      displayName: 'Twitter / X URL',
      group: 'OT_Content',
      sortOrder: 60,
    },
  },
})
