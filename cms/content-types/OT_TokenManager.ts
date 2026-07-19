import { contentType } from '@optimizely/cms-sdk'
import { OT_TokenEntry } from './OT_TokenEntry'

export const OT_TokenManager = contentType({
  key:         'OT_TokenManager',
  displayName: 'Token Manager',
  description: 'Define dynamic text tokens ({{key}} → value) used across site content. Token keys are language-neutral; values can be translated per locale.',
  baseType:    '_component',
  // No compositionBehaviors — shared-block only, not composable into pages
  properties: {
    domains: {
      type:        'array',
      displayName: 'Associated Domains',
      description: 'Informational — the hostnames this token list is associated with, one per entry (e.g. mysite.vercel.app). Does not affect which tokens are applied.',
      items:       { type: 'string' },
    },
    tokens: {
      type:        'array',
      displayName: 'Token Definitions',
      description: 'Each entry maps a token key to a replacement value. Enter keys without braces; authors use {{key}} in any content field.',
      items:       { type: 'component', contentType: OT_TokenEntry },
    },
  },
})
