import { contentType } from '@optimizely/cms-sdk'
import { OT_TabItem }  from './OT_TabItem'

export const OT_TabsBlock = contentType({
  key:                  'OT_TabsBlock',
  displayName:          'Tabs Block',
  description:          'Tabbed content block with optional heading and 2–6 tab panels.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    tabStyle: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Tab Style',
      enum: [
        { value: 'underline', displayName: 'Underline (Default)' },
        { value: 'pill', displayName: 'Pill' },
        { value: 'buttonGroup', displayName: 'Button Group' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    eyebrow: {
      type:        'string',
      displayName: 'Eyebrow',
      description: 'Optional label above the heading.',
      isLocalized: true,
      maxLength:   50,
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    heading: {
      type:        'string',
      displayName: 'Heading',
      description: 'Optional headline above the tab set.',
      isLocalized: true,
      maxLength:   80,
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    tabs: {
      type:        'array',
      displayName: 'Tabs',
      description: 'Tab items. Minimum 2, maximum 6 tabs. Each tab has a label, optional icon, panel content, and optional CTA.',
      items:       { type: 'component', contentType: OT_TabItem },
      group:       'OT_Content',
      sortOrder:   30,
      // Not marked localized at the array level — localization is handled
      // field-by-field on OT_TabItem properties above.
    },
  },
})
