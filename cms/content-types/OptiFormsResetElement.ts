import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsResetElement = contentType({
  key: 'OptiFormsResetElement',
  displayName: 'Reset button',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:  { type: 'string', displayName: 'Label',   isLocalized: true },
    Tooltip:{ type: 'string', displayName: 'Tooltip', isLocalized: true },
  },
})
