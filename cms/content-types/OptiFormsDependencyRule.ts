import { contentType } from '@optimizely/cms-sdk'
import { OptiFormsCondition } from './OptiFormsCondition'

export const OptiFormsDependencyRule = contentType({
  key: 'OptiFormsDependencyRule',
  displayName: 'Dependency Rule',
  baseType: '_component',
  properties: {
    TargetElement:        { type: 'string', displayName: 'Target Element' },
    SatisfiedAction:      { type: 'string', displayName: 'Satisfied Action' },
    ConditionCombination: { type: 'string', displayName: 'Condition Combination' },
    Conditions:           { type: 'array',  displayName: 'Conditions', items: { type: 'component', contentType: OptiFormsCondition } },
  },
})
