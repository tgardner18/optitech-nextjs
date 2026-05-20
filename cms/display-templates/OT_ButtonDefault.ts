import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_ButtonDefault = displayTemplate({
  key: 'OT_ButtonDefault',
  displayName: 'Button Default',
  contentType: 'OT_ButtonBlock',
  isDefault: true,
  settings: {
    variant: {
      displayName: 'Variant',
      editor: 'select',
      sortOrder: 10,
      choices: {
        primary: { displayName: 'Primary — teal fill (Default)', sortOrder: 10 },
        ghost:   { displayName: 'Ghost — bordered, for dark surfaces', sortOrder: 20 },
        signal:  { displayName: 'Signal — kinetic fill sweep', sortOrder: 30 },
      },
    },
    size: {
      displayName: 'Size',
      editor: 'select',
      sortOrder: 20,
      choices: {
        sm: { displayName: 'Small',          sortOrder: 10 },
        md: { displayName: 'Medium (Default)', sortOrder: 20 },
        lg: { displayName: 'Large',          sortOrder: 30 },
      },
    },
    icon: {
      displayName: 'Icon',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:         { displayName: 'None (Default)',    sortOrder: 10 },
        arrowRight:   { displayName: 'Arrow right',      sortOrder: 20 },
        chevronRight: { displayName: 'Chevron right',    sortOrder: 30 },
        zap:          { displayName: 'Zap',              sortOrder: 40 },
        externalLink: { displayName: 'External link',    sortOrder: 50 },
        arrowUpRight: { displayName: 'Arrow up-right',   sortOrder: 60 },
      },
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
