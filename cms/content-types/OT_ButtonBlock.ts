import { contentType } from '@optimizely/cms-sdk'

export const OT_ButtonBlock = contentType({
  key: 'OT_ButtonBlock',
  displayName: 'Button Block',
  description: 'Standalone CTA button with label and destination URL.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    variant: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Variant',
      description: 'The button style.',
      enum: [
        { value: 'brand', displayName: 'Brand — theme fill (Default)' },
        { value: 'accent', displayName: 'Accent — accent color fill' },
        { value: 'ghost', displayName: 'Ghost — bordered' },
        { value: 'signal', displayName: 'Signal — kinetic fill sweep' },
        { value: 'hoverFill', displayName: 'Hover Fill — fills on hover' },
        { value: 'glass', displayName: 'Glass — frosted' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    label: { type: 'string', isLocalized: true, maxLength: 40, displayName: 'Button Label', group: 'OT_Content', sortOrder: 10 },
    url:   { type: 'url',    displayName: 'Link URL',     group: 'OT_Content', sortOrder: 20 },
  },
})
