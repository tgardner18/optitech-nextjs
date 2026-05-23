import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsRangeElement = contentType({
  key: 'OptiFormsRangeElement',
  displayName: 'Range',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:          { type: 'string',  displayName: 'Label',           isLocalized: true },
    Tooltip:        { type: 'string',  displayName: 'Tooltip',         isLocalized: true },
    PredefinedValue:{ type: 'string',  displayName: 'Predefined Value' },
    Min:            { type: 'integer', displayName: 'Minimum' },
    Max:            { type: 'integer', displayName: 'Maximum' },
    Increment:      { type: 'integer', displayName: 'Increment' },
  },
})
