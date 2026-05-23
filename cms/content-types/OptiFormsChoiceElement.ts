import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsChoiceElement = contentType({
  key: 'OptiFormsChoiceElement',
  displayName: 'Multiple or single choice',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:           { type: 'string',  displayName: 'Label',            isLocalized: true },
    Tooltip:         { type: 'string',  displayName: 'Tooltip',          isLocalized: true },
    Options:         { type: 'json',    displayName: 'Options' },
    AllowMultiSelect:{ type: 'boolean', displayName: 'Allow Multi-Select' },
    Validators:      { type: 'json',    displayName: 'Validators' },
  },
})
