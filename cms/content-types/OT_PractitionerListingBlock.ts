import { contentType } from '@optimizely/cms-sdk'

// ─── OT_PractitionerListingBlock ──────────────────────────────────────────────
// A CMS-driven directory of OT_PractitionerProfile records with grid and list
// layouts, client-side search, and dynamically-derived filters. Editors drop it
// onto any page in the Visual Builder.
//
// `groupTagFilter` restricts the listing to a vertical subset — "medical"
// shows only medical practitioners, "legal" only legal — which is how one
// block type serves every vertical without code changes. Leave it blank to show
// all practitioners. Practitioners are fetched at render time in the adapter
// (cms/components/OT_PractitionerListingBlock.tsx); search and filtering happen
// client-side from the loaded set, with filter options derived from the data.
//
// Property forms follow the SDK's learned-the-hard-way rules (CLAUDE.md):
// isLocalized (not `localized`), top-level maxLength (no `validation` wrapper).

export const OT_PractitionerListingBlock = contentType({
  key:         'OT_PractitionerListingBlock',
  displayName: 'Practitioner Listing',
  description: 'Searchable, filterable directory of practitioners pulled from Practitioner Profiles. Scope it to a vertical with the Group Tag Filter.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    heading: {
      type:         'string',
      isLocalized:  true,
      maxLength:    80,
      displayName:  'Heading',
      description:  'Optional section heading — "Find a Doctor", "Our Attorneys", "Meet the Team".',
      group:        'OT_Content',
      sortOrder:    10,
      indexingType: 'searchable',
    },
    subtext: {
      type:        'string',
      isLocalized: true,
      maxLength:   160,
      displayName: 'Subtext',
      description: 'Optional supporting text below the heading.',
      group:       'OT_Content',
      sortOrder:   20,
    },
    groupTagFilter: {
      type:        'string',
      maxLength:   40,
      displayName: 'Group Tag Filter',
      description: 'Restricts the listing to practitioners whose Group Tag matches this value — e.g. "medical", "legal", "technology". Leave blank to show all practitioners.',
      group:       'OT_Content',
      sortOrder:   30,
    },
    maxItems: {
      type:        'integer',
      displayName: 'Max Practitioners',
      description: 'Maximum number of practitioners to load. Defaults to 24 when unset.',
      group:       'OT_Content',
      sortOrder:   40,
    },
    emptyMessage: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Empty Message',
      description: 'Shown when no practitioners match the active search and filters. Defaults to "No results found." when blank.',
      group:       'OT_Content',
      sortOrder:   50,
    },
  },
})
