import { contentType } from '@optimizely/cms-sdk'

export const OT_PrimaryTextBlock = contentType({
  key: 'OT_PrimaryTextBlock',
  displayName: 'Primary Text Block',
  description: 'Editorial text block with eyebrow, headline, and rich body copy.',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'],
  properties: {
    headerEffect: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Header Effect',
      description: 'Visual effect applied to the heading (best at headline scale and up).',
      enum: [
        { value: 'none', displayName: 'None (Default)' },
        { value: 'gradient', displayName: 'Gradient' },
        { value: 'animatedGradient', displayName: 'Animated Gradient' },
        { value: 'depth3d', displayName: '3D Depth' },
        { value: 'glitch', displayName: 'Glitch' },
        { value: 'outline', displayName: 'Outline' },
        { value: 'neon', displayName: 'Neon' },
        { value: 'highlight', displayName: 'Highlight' },
        { value: 'glow', displayName: 'Glow' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    eyebrow:      { type: 'string',   isLocalized: true, maxLength: 60,  displayName: 'Eyebrow',       group: 'OT_Content', sortOrder: 10, indexingType: 'searchable' },
    headline:     { type: 'string',   isLocalized: true, maxLength: 120, displayName: 'Headline',      group: 'OT_Content', sortOrder: 20, indexingType: 'searchable' },
    headingLevel: { type: 'string',   format: 'selectOne', displayName: 'Heading Level', group: 'OT_Content', sortOrder: 25, enum: [
      { value: 'h2', displayName: 'H2 – Section heading (default)' },
      { value: 'h1', displayName: 'H1 – Page title' },
    ] },
    body:         { type: 'richText', isLocalized: true,                 displayName: 'Body',          group: 'OT_Content', sortOrder: 30, indexingType: 'searchable' },
  },
})
