import { contentType } from '@optimizely/cms-sdk'

export const OptiFormsCondition = contentType({
  key: 'OptiFormsCondition',
  displayName: 'Dependency Condition',
  baseType: '_component',
  properties: {
    DependsOnField:     { type: 'string', displayName: 'Depends On Field' },
    ComparisonOperator: { type: 'string', displayName: 'Comparison Operator' },
    ComparisonValue:    { type: 'string', displayName: 'Comparison Value' },
  },
})
