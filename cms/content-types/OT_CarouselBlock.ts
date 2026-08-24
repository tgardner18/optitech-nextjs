import { contentType } from '@optimizely/cms-sdk'
import { OT_CarouselSlide } from './OT_CarouselSlide'

export const OT_CarouselBlock = contentType({
  key:                  'OT_CarouselBlock',
  displayName:          'Carousel Block',
  description:          'Slideshow block with 2–8 editorial slides. Supports full-bleed and split layouts.',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    eyebrow: {
      type:        'string',
      displayName: 'Eyebrow',
      description: 'Optional label above the block heading.',
      isLocalized: true,
      maxLength:   50,
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    heading: {
      type:        'string',
      displayName: 'Heading',
      description: 'Optional headline above the carousel.',
      isLocalized: true,
      maxLength:   80,
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    slides: {
      type:        'array',
      displayName: 'Slides',
      description: 'Carousel slides. Minimum 2, maximum 8.',
      items:       { type: 'component', contentType: OT_CarouselSlide },
      group:       'OT_Content',
      sortOrder:   30,
    },
  },
})
