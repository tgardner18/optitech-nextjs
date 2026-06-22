import { contentType } from '@optimizely/cms-sdk'
import { OT_PracticeArea } from './OT_PracticeArea'

// ─── OT_PractitionerProfile ───────────────────────────────────────────────────
// The canonical practitioner data record — the single source of truth for one
// person. Stored in CMS Shared Content and reused across contexts:
//   - the locked header of their OT_PractitionerPage (via practitionerRef)
//   - the OT_PractitionerListingBlock directory
//   - potentially a speaker card on an event page
//
// It is a reference-only `_component` (no compositionBehaviors) — created in CMS
// Shared Content and consumed by reference, never placed directly in a Visual
// Builder composition. This mirrors OT_ThemeManager, and is also required by the
// CMS: a content type with `elementEnabled` may NOT carry a nested component
// array, and this record needs the `practiceAreas` array. It is queried directly
// via lib/practitioners.ts rather than through a registered adapter.
//
// `groupTag` associates the record with a vertical or group ("medical",
// "legal", "technology") and must match the groupTagFilter on any listing
// block that should include this practitioner. Indexed `searchable` so the
// listing query and site search can find people by name, credentials, or city.

export const OT_PractitionerProfile = contentType({
  key:         'OT_PractitionerProfile',
  displayName: 'Practitioner Profile',
  description: 'A person record — name, credentials, headshot, bio, practice areas, contact, and a group tag. Reused across profile pages, directory listings, and speaker cards.',
  baseType:    '_component',
  properties: {
    // ── Identity ────────────────────────────────────────────────────────────
    firstName: {
      type:         'string',
      isLocalized:  true,
      maxLength:    60,
      displayName:  'First Name',
      group:        'OT_Content',
      sortOrder:    10,
      indexingType: 'searchable',
    },
    lastName: {
      type:         'string',
      isLocalized:  true,
      maxLength:    60,
      displayName:  'Last Name',
      group:        'OT_Content',
      sortOrder:    20,
      indexingType: 'searchable',
    },
    suffix: {
      type:        'string',
      maxLength:   40,
      displayName: 'Suffix',
      description: 'Post-nominal letters: MD, JD, PhD, RN, CPA, Esq. Rendered after the name.',
      group:       'OT_Content',
      sortOrder:   30,
    },
    credentials: {
      type:         'string',
      maxLength:    80,
      displayName:  'Credentials',
      description:  'Abbreviated display credentials — "MD, FACC" / "JD, LLM". Shown beneath the name.',
      group:        'OT_Content',
      sortOrder:    40,
      indexingType: 'searchable',
    },
    title: {
      type:        'string',
      isLocalized: true,
      maxLength:   100,
      displayName: 'Title',
      description: 'Role title — "Senior Partner", "Chief of Oncology".',
      group:       'OT_Content',
      sortOrder:   50,
    },
    headshot: {
      type:         'contentReference',
      allowedTypes: ['_image'],
      displayName:  'Headshot',
      description:  'Portrait image. When absent, an initials fallback renders in its place.',
      group:        'OT_Content',
      sortOrder:    60,
    },
    bio: {
      type:         'richText',
      isLocalized:  true,
      displayName:  'Biography',
      description:  'Full biography. The profile page renders it in full; cards truncate a stripped-text preview to ~200 characters.',
      group:        'OT_Content',
      sortOrder:    70,
      indexingType: 'searchable',
    },
    practiceAreas: {
      type:        'array',
      displayName: 'Practice Areas',
      description: 'Specialties or disciplines. Mark one as primary — that area leads on cards and the profile header.',
      items:       { type: 'component', contentType: OT_PracticeArea },
      group:       'OT_Content',
      sortOrder:   80,
    },

    // ── Contact ─────────────────────────────────────────────────────────────
    phone: {
      type:        'string',
      maxLength:   30,
      displayName: 'Phone',
      group:       'OT_Content',
      sortOrder:   90,
    },
    email: {
      type:        'string',
      maxLength:   120,
      displayName: 'Email',
      group:       'OT_Content',
      sortOrder:   100,
    },
    officeLocation: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Office Location',
      group:       'OT_Content',
      sortOrder:   110,
    },
    languages: {
      type:        'string',
      isLocalized: true,
      maxLength:   100,
      displayName: 'Languages',
      description: 'Comma-separated — "English, Spanish, Mandarin". Each value becomes a directory language filter option.',
      group:       'OT_Content',
      sortOrder:   120,
    },
    linkedIn: {
      type:        'url',
      displayName: 'LinkedIn URL',
      description: 'Optional link to the practitioner’s LinkedIn profile.',
      group:       'OT_Content',
      sortOrder:   130,
    },

    // ── Directory ─────────────────────────────────────────────────────────────
    groupTag: {
      type:         'string',
      maxLength:    40,
      displayName:  'Group Tag',
      description:  'Associates this practitioner with a vertical or group — e.g. "medical", "legal", "technology". Must match the Group Tag Filter on any listing block that should include this person.',
      group:        'OT_Content',
      sortOrder:    140,
      indexingType: 'queryable',
    },
  },
})
