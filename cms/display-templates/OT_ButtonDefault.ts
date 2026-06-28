import { displayTemplate }    from '@optimizely/cms-sdk'
import { ICON_CHOICES_WITH_NONE } from './_shared/iconChoices'

export const OT_ButtonDefault = displayTemplate({
  key: 'OT_ButtonDefault',
  displayName: 'Button Default',
  contentType: 'OT_ButtonBlock',
  isDefault: true,
  settings: {
    size: {
      displayName: 'Size',
      editor: 'select',
      sortOrder: 20,
      choices: {
        sm: { displayName: 'Small',            sortOrder: 10 },
        md: { displayName: 'Medium (Default)', sortOrder: 20 },
        lg: { displayName: 'Large',            sortOrder: 30 },
      },
    },
    icon: {
      displayName: 'Icon',
      editor:      'select',
      sortOrder:   30,
      choices:     ICON_CHOICES_WITH_NONE,
    },
    iconPosition: {
      displayName: 'Icon position',
      editor: 'select',
      sortOrder: 40,
      choices: {
        trailing: { displayName: 'Trailing — after label (Default)', sortOrder: 10 },
        leading:  { displayName: 'Leading — before label',           sortOrder: 20 },
      },
    },
    alignment: {
      displayName: 'Alignment',
      editor: 'select',
      sortOrder: 50,
      choices: {
        left:   { displayName: 'Left (Default)', sortOrder: 10 },
        center: { displayName: 'Center',         sortOrder: 20 },
        right:  { displayName: 'Right',          sortOrder: 30 },
      },
    },
    fullWidth: {
      displayName: 'Full width',
      editor: 'select',
      sortOrder: 60,
      choices: {
        false: { displayName: 'No — inline size (Default)', sortOrder: 10 },
        true:  { displayName: 'Yes — stretch to container', sortOrder: 20 },
      },
    },
  },
})
