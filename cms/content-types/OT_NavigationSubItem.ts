import { contentType } from '@optimizely/cms-sdk'
import { ICON_ENUM_WITH_NONE } from '../display-templates/_shared/iconChoices'

export const OT_NavigationSubItem = contentType({
  key: 'OT_NavigationSubItem',
  displayName: 'Navigation Sub-Item',
  baseType: '_component',
  properties: {
    menuLink:    { type: 'link',   displayName: 'Link',                                          group: 'OT_Content', sortOrder: 10 },
    description: { type: 'string', isLocalized: true, maxLength: 150, displayName: 'Description (optional — shown in mega menu)', group: 'OT_Content', sortOrder: 20 },
    icon: {
      type:        'string',
      displayName: 'Icon (optional — shown in the desktop dropdown)',
      description: 'Optional icon tile shown beside this menu item. Uses the shared canonical icon library.',
      format:      'selectOne',
      enum:        ICON_ENUM_WITH_NONE,
      group:       'OT_Content',
      sortOrder:   30,
      // Not localized — icon choice is structural, not language-dependent.
    },
  },
})
