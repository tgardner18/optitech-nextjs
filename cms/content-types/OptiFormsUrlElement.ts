import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsUrlElement = contentType({
  key: 'OptiFormsUrlElement',
  displayName: 'Url',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:          { type: 'string', displayName: 'Label',           isLocalized: true },
    Placeholder:    { type: 'string', displayName: 'Placeholder',     isLocalized: true },
    Tooltip:        { type: 'string', displayName: 'Tooltip',         isLocalized: true },
    PredefinedValue:{ type: 'string', displayName: 'Predefined Value' },
    Validators:     { type: 'json',   displayName: 'Validators' },
  },
})
