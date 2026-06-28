import { contentType } from '@optimizely/cms-sdk'

// ─── OT_LocationProfile ───────────────────────────────────────────────────────
// The canonical record for one physical location — the single source of truth
// reused across the directory listing and (potentially) any future map embed or
// contact page. Stored in CMS Shared Content and consumed by reference; queried
// directly via lib/locations.ts rather than through a registered adapter.
//
// Vertical-agnostic by design. `locationLabel` is FREE TEXT, never an enum, so a
// single CMS instance can host "Hospital" / "Branch" / "Campus" / "Office"
// across verticals without shared-enum contamination. The listing block derives
// its label filter chips dynamically from whatever label values appear in the
// loaded data — never a fixed list.
//
// `groupTag` associates the record with a vertical or brand ("optimedical",
// "optitech-offices") and must match the Group Tag Filter on any listing block
// that should include this location. Indexed `searchable`/`queryable` so the
// directory query and site search can find locations by name or label.
//
// Property forms follow the SDK's learned-the-hard-way rules (CLAUDE.md):
// `isLocalized` (not `localized`), top-level `maxLength` (no `validation`
// wrapper), and no `required` field (unsupported by the SDK types).

export const OT_LocationProfile = contentType({
  key:         'OT_LocationProfile',
  displayName: 'Location Profile',
  description: 'A physical location record — name, optional image, address, a free-text label, freeform details, and a group tag. Reused across location directory listings and map views.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    locationName: {
      type:         'string',
      isLocalized:  true,
      maxLength:    120,
      displayName:  'Location Name',
      description:  'e.g. "Downtown Branch", "Memorial Medical Center", "Chicago HQ".',
      group:        'OT_Content',
      sortOrder:    10,
      indexingType: 'searchable',
    },
    locationLabel: {
      type:         'string',
      isLocalized:  true,
      maxLength:    40,
      displayName:  'Location Label',
      description:  'Free text. Used as a display badge and as a dynamically-derived filter. e.g. "Hospital" / "Branch" / "Campus". Keep consistent within a vertical.',
      group:        'OT_Content',
      sortOrder:    20,
      indexingType: 'searchable',
    },
    image: {
      type:         'contentReference',
      allowedTypes: ['_image'],
      displayName:  'Location Image',
      description:  'Optional exterior or interior photo. When absent, a designed branded fallback plate renders in its place.',
      group:        'OT_Content',
      sortOrder:    30,
    },
    address: {
      type:        'string',
      maxLength:   200,
      displayName: 'Address',
      description: 'Full address as a single field. Geocoded to a map pin automatically. e.g. "429 11th Ave, New York, NY 10001, United States".',
      group:       'OT_Content',
      sortOrder:   40,
    },
    details: {
      type:        'richText',
      isLocalized: true,
      displayName: 'Details',
      description: 'Hours, services, parking, accessibility, contact info — anything specific to this location. Completely freeform.',
      group:       'OT_Content',
      sortOrder:   50,
    },
    groupTag: {
      type:         'string',
      maxLength:    40,
      displayName:  'Group Tag',
      description:  'Associates this location with a vertical or brand. Must match the Group Tag Filter on any listing block that should include this location. e.g. "optimedical" / "optitech-offices".',
      group:        'OT_Content',
      sortOrder:    60,
      indexingType: 'queryable',
    },
  },
})
