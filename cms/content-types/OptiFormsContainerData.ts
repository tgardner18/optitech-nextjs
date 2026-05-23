import { contentType } from '@optimizely/cms-sdk'
import { OptiFormsDependencyRule } from './OptiFormsDependencyRule'

export const OptiFormsContainerData = contentType({
  key: 'OptiFormsContainerData',
  displayName: 'Form Container',
  baseType: '_section',
  properties: {
    Title:                            { type: 'string',  displayName: 'Title',                              isLocalized: true },
    Description:                      { type: 'string',  displayName: 'Description',                        isLocalized: true },
    SubmitUrl:                        { type: 'url',     displayName: 'Submit URL',                         isLocalized: true },
    ShowSummaryMessageAfterSubmission:{ type: 'boolean', displayName: 'Show Summary After Submission' },
    SubmitConfirmationMessage:        { type: 'string',  displayName: 'Submit Confirmation Message',        isLocalized: true },
    ResetConfirmationMessage:         { type: 'string',  displayName: 'Reset Confirmation Message',         isLocalized: true },
    DependencyRules:                  { type: 'array',   displayName: 'Dependency Rules', items: { type: 'component', contentType: OptiFormsDependencyRule } },
  },
})
