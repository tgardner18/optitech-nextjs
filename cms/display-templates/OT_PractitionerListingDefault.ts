import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_PractitionerListingDefault = displayTemplate({
  key:         'OT_PractitionerListingDefault',
  displayName: 'Practitioner Listing',
  contentType: 'OT_PractitionerListingBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Color',
      editor:      'select',
      sortOrder:   20,
      choices: {
        canvas:  { displayName: 'Canvas',  sortOrder: 10 },
        surface: { displayName: 'Surface', sortOrder: 20 },
      },
    },
    columns: {
      displayName: 'Columns (grid only)',
      editor:      'select',
      sortOrder:   30,
      choices: {
        col2: { displayName: '2 columns', sortOrder: 10 },
        col3: { displayName: '3 columns', sortOrder: 20 },
        col4: { displayName: '4 columns', sortOrder: 30 },
      },
    },
    showSearchFilters: {
      displayName: 'Show Search & Filters',
      editor:      'select',
      sortOrder:   40,
      choices: {
        'true':  { displayName: 'Yes', sortOrder: 10 },
        'false': { displayName: 'No',  sortOrder: 20 },
      },
    },
    density: {
      displayName: 'Density',
      editor:      'select',
      sortOrder:   60,
      choices: {
        comfortable: { displayName: 'Comfortable', sortOrder: 10 },
        compact:     { displayName: 'Compact',     sortOrder: 20 },
      },
    },
  },
})
