import { contentType } from '@optimizely/cms-sdk'

export const OT_TokenEntry = contentType({
  key:         'OT_TokenEntry',
  displayName: 'Token Entry',
  baseType:    '_component',
  properties: {
    tokenKey: {
      type:        'string',
      maxLength:   100,
      displayName: 'Token Key',
      description: 'The token identifier, no braces needed — e.g. product-name. Authors use it as {{product-name}} in any content field.',
    },
    tokenValue: {
      type:        'string',
      maxLength:   500,
      isLocalized: true,
      displayName: 'Token Value',
      description: 'The text that replaces {{token-key}} when the page renders. Translate this value per locale as needed.',
    },
  },
})
