import { contentType } from '@optimizely/cms-sdk'

// ─── OT_LocationListingBlock ──────────────────────────────────────────────────
// A CMS-driven directory of OT_LocationProfile records with three views — a
// Mapbox map paired with a synchronized location rail, a card grid, and a
// compact list — plus client-side search and a dynamically-derived label
// filter. Editors drop it onto any page in the Visual Builder.
//
// `groupTagFilter` restricts the listing to a vertical subset — "optimedical"
// shows only that group's locations, "optitech-offices" only those — which is
// how one block type serves every vertical without code changes. Leave it blank
// to show all locations. Locations are fetched + geocoded at render time in the
// adapter / server wrapper; search and filtering happen client-side from the
// loaded set, with the label-filter chips derived from the data.
//
// Addresses that fail geocoding still appear in the grid and list views; they
// are silently omitted from the map only.
//
// Property forms follow the SDK's learned-the-hard-way rules (CLAUDE.md):
// `isLocalized` (not `localized`), top-level `maxLength` (no `validation`
// wrapper).

export const OT_LocationListingBlock = contentType({
  key:         'OT_LocationListingBlock',
  displayName: 'Location Listing',
  description: 'Searchable, filterable directory of locations pulled from Location Profiles, with a Mapbox map, card grid, and list views. Scope it to a vertical with the Group Tag Filter.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    heading: {
      type:         'string',
      isLocalized:  true,
      maxLength:    80,
      displayName:  'Heading',
      description:  'Optional section heading — "Find a Branch", "Our Hospitals", "Where to Find Us".',
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
      description: 'Filters to locations whose Group Tag matches this value — e.g. "optimedical", "optitech-offices". Leave blank to show all locations.',
      group:       'OT_Content',
      sortOrder:   30,
    },
    maxItems: {
      type:        'integer',
      displayName: 'Max Results',
      description: 'Maximum number of locations to load. Defaults to 50 when unset. The map view always renders all matching locations within this limit.',
      group:       'OT_Content',
      sortOrder:   40,
    },
    emptyMessage: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Empty State Message',
      description: 'Shown when no locations match the active search and filters. Defaults to "No locations found." when blank.',
      group:       'OT_Content',
      sortOrder:   50,
    },
  },
})
