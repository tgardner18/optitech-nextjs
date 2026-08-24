'use client'

import { BlockPlayground } from '../playground'
import OT_CarouselBlock    from '@/cms/components/OT_CarouselBlock'

const SLIDES = [
  {
    imageSrc: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&fit=crop',
    imageAlt: 'Modern glass office building reflecting the sky',
    eyebrow:  'Experimentation',
    heading:  'Run tests that move the needle',
    body:     'Ship experiments in minutes and let the data make the call. Every test builds a clearer picture of what your audience actually wants.',
    ctaLabel: 'See how it works',
    ctaUrl:   '#',
  },
  {
    imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&fit=crop',
    imageAlt: 'Data dashboard on a laptop screen',
    eyebrow:  'Personalization',
    heading:  'Reach every visitor with the right experience',
    body:     'Tailor content to any segment — by behaviour, location, or intent — without waiting on a developer.',
    ctaLabel: 'Explore personalization',
    ctaUrl:   '#',
  },
  {
    imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&fit=crop',
    imageAlt: 'Analytics charts on a monitor',
    eyebrow:  'Insights',
    heading:  'Decisions backed by real data',
    body:     'Live dashboards surface the signals that matter, so your team can act before an opportunity closes.',
    ctaLabel: 'View reporting',
    ctaUrl:   '#',
  },
]

export default function CarouselPlayground() {
  return (
    <BlockPlayground
      defaults={{
        layout:     'fullBleed',
        transition: 'slide',
        controls:   'both',
        autoplay:   'off',
        color:      'canvas',
      }}
      controls={[
        {
          type:  'buttons',
          key:   'layout',
          label: 'Slide Layout',
          options: [
            { label: 'Full Bleed', value: 'fullBleed' },
            { label: 'Split',      value: 'split'     },
          ],
        },
        {
          type:  'buttons',
          key:   'transition',
          label: 'Transition',
          options: [
            { label: 'Slide', value: 'slide' },
            { label: 'Cover', value: 'cover' },
            { label: 'Fade',  value: 'fade'  },
            { label: 'Morph', value: 'morph' },
          ],
        },
        {
          type:  'buttons',
          key:   'controls',
          label: 'Controls',
          options: [
            { label: 'Both',   value: 'both'   },
            { label: 'Arrows', value: 'arrows' },
            { label: 'Dots',   value: 'dots'   },
            { label: 'None',   value: 'none'   },
          ],
        },
        {
          type:  'buttons',
          key:   'autoplay',
          label: 'Auto-Play',
          options: [
            { label: 'Off',    value: 'off'    },
            { label: 'Slow',   value: 'slow'   },
            { label: 'Medium', value: 'medium' },
          ],
        },
        {
          type:    'buttons',
          key:     'color',
          label:   'Panel Color',
          visible: s => s.layout === 'split',
          options: [
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
            { label: 'Brand',   value: 'brand'   },
          ],
        },
      ]}
    >
      {s => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <OT_CarouselBlock
          content={{ slides: SLIDES } as any}
          displaySettings={{
            slideLayout: s.layout,
            transition:  s.transition,
            controls:    s.controls,
            autoplay:    s.autoplay,
            loop:        'loop',
            peek:        'none',
            gap:         'none',
            color:       s.color,
          }}
        />
      )}
    </BlockPlayground>
  )
}
