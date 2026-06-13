import { contentType } from '@optimizely/cms-sdk'

export const OT_DividerBlock = contentType({
  key:                  'OT_DividerBlock',
  displayName:          'Divider Block',
  description:          'Structural section divider. Three treatments: angled slope, centered text mark, gradient bleed. Editor-controlled vertical spacing breaks up the rhythm between stacked sections.',
  baseType:             '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    label: {
      type:         'string',
      displayName:  'Mark label',
      description:  'Optional. Used only by the "Centered text mark" style. When empty the mark falls back to the chosen ornament.',
      isLocalized:  true,
      maxLength:    40,
      group:        'OT_Content',
      sortOrder:    10,
      indexingType: 'searchable',
    },
  },
})
