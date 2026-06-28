import { contentType } from '@optimizely/cms-sdk'

// ─── OT_EventListingBlock ───────────────────────────────────────────────────────
// A CMS-driven listing of OT_EventPage items with three toggleable views:
// card grid, list, and calendar. Events are fetched at render time in the
// adapter (cms/components/OT_EventListingBlock.tsx) — view switching, type
// filtering, past-events toggle, and calendar navigation are all client-side
// with no re-fetch.
//
// NOTE: property forms follow the SDK's learned-the-hard-way rules (CLAUDE.md):
//   isLocalized (not `localized`), top-level maxLength (no `validation` wrapper),
//   enum items use `value` (not `key`). The "All Types" state is the unset value
//   of filterByType — there is no empty-string enum entry.

export const OT_EventListingBlock = contentType({
  key:         'OT_EventListingBlock',
  displayName: 'Event Listing',
  description: 'Card / list / calendar listing of events, pulled from Event Pages.',
  baseType:    '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    defaultView: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Default View',
      description: 'Which view loads first.',
      enum: [
        { value: 'card', displayName: 'Card Grid' },
        { value: 'list', displayName: 'List' },
        { value: 'calendar', displayName: 'Calendar' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    heading: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'Heading',
      description: 'Optional section heading above the event listing.',
      group:       'OT_Content',
      sortOrder:   10,
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
    maxItems: {
      type:        'integer',
      displayName: 'Max Events',
      description: 'Maximum number of events to load. Calendar view loads all events in the visible date range regardless of this setting.',
      group:       'OT_Content',
      sortOrder:   30,
    },
    filterByType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Filter by Event Type',
      description: 'Restrict this listing to a specific event type. Leave blank to show all types.',
      group:       'OT_Content',
      sortOrder:   40,
      enum: [
        { value: 'webinar',    displayName: 'Webinars Only' },
        { value: 'conference', displayName: 'Conferences Only' },
        { value: 'workshop',   displayName: 'Workshops Only' },
        { value: 'seminar',    displayName: 'Seminars Only' },
        { value: 'community',  displayName: 'Community Events Only' },
        { value: 'screening',  displayName: 'Health Screenings Only' },
        { value: 'training',   displayName: 'Training Only' },
      ],
    },
  },
})
