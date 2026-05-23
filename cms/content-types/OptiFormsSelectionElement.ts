import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsSelectionElement = contentType({
  key: 'OptiFormsSelectionElement',
  displayName: 'Selection',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:           { type: 'string',  displayName: 'Label',            isLocalized: true },
    Placeholder:     { type: 'string',  displayName: 'Placeholder',      isLocalized: true },
    Tooltip:         { type: 'string',  displayName: 'Tooltip',          isLocalized: true },
    Options:         { type: 'json',    displayName: 'Options' },
    AllowMultiSelect:{ type: 'boolean', displayName: 'Allow Multi-Select' },
    Validators:      { type: 'json',    displayName: 'Validators' },
    AutoComplete:    { type: 'string',  displayName: 'Auto Complete' },
  },
})
