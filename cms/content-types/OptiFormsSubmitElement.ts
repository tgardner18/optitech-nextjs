import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsSubmitElement = contentType({
  key: 'OptiFormsSubmitElement',
  displayName: 'Submit button',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    Label:  { type: 'string', displayName: 'Label',   isLocalized: true },
    Tooltip:{ type: 'string', displayName: 'Tooltip', isLocalized: true },
  },
})
