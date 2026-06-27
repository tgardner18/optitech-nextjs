import { displayTemplate } from '@optimizely/cms-sdk'

// Visual options for the Location Listing block. Every setting is a `select`
// with named choices (the CMS editor surface). Choice keys are ≥2 chars (CMS
// requirement) — booleans come through as the literal strings 'true' / 'false',
// columns as 'col2' | 'col3' | 'col4', and map height / default view as their
// own keys. The styling helper (cms/styling) casts these to typed unions.

export const OT_LocationListingDefault = displayTemplate({
  key:         'OT_LocationListingDefault',
  displayName: 'Location Listing',
  contentType: 'OT_LocationListingBlock',
  isDefault:   true,
  settings: {
    defaultView: {
      displayName: 'Default View',
      editor:      'select',
      sortOrder:   10,
      choices: {
        map:  { displayName: 'Map (with location rail)', sortOrder: 10 },
        grid: { displayName: 'Grid (cards)',             sortOrder: 20 },
        list: { displayName: 'List (rows)',              sortOrder: 30 },
      },
    },
    showViewToggle: {
      displayName: 'Show View Toggle',
      editor:      'select',
      sortOrder:   20,
      choices: {
        'true':  { displayName: 'Yes', sortOrder: 10 },
        'false': { displayName: 'No',  sortOrder: 20 },
      },
    },
    mapHeight: {
      displayName: 'Map Height',
      editor:      'select',
      sortOrder:   30,
      choices: {
        standard: { displayName: 'Standard', sortOrder: 10 },
        tall:     { displayName: 'Tall',     sortOrder: 20 },
      },
    },
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   40,
      choices: {
        canvas:  { displayName: 'Canvas',  sortOrder: 10 },
        surface: { displayName: 'Surface', sortOrder: 20 },
      },
    },
    columns: {
      displayName: 'Columns (grid only)',
      editor:      'select',
      sortOrder:   50,
      choices: {
        col2: { displayName: '2 columns', sortOrder: 10 },
        col3: { displayName: '3 columns', sortOrder: 20 },
        col4: { displayName: '4 columns', sortOrder: 30 },
      },
    },
    showSearch: {
      displayName: 'Show Search',
      editor:      'select',
      sortOrder:   60,
      choices: {
        'true':  { displayName: 'Yes', sortOrder: 10 },
        'false': { displayName: 'No',  sortOrder: 20 },
      },
    },
    showLabelFilter: {
      displayName: 'Show Label Filter',
      editor:      'select',
      sortOrder:   70,
      choices: {
        'true':  { displayName: 'Yes', sortOrder: 10 },
        'false': { displayName: 'No',  sortOrder: 20 },
      },
    },
    density: {
      displayName: 'Density',
      editor:      'select',
      sortOrder:   80,
      choices: {
        comfortable: { displayName: 'Comfortable', sortOrder: 10 },
        compact:     { displayName: 'Compact',     sortOrder: 20 },
      },
    },
  },
})
