'use client'

import { BlockPlayground } from '../playground'
import OT_HeroBlock from '@/cms/components/OT_HeroBlock'

const HERO_IMG = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop'
const HERO_ALT = 'Glass skyscrapers in a modern city financial district'

const DEMO_CONTENT = {
  eyebrow:           'A better way to work',
  headline:          'Move at the speed of certainty.',
  body:              'Everything your team needs to launch faster, work smarter, and see what is working in real time.',
  primaryCtaLabel:   'Get started',
  primaryCtaUrl:     { default: '#' },
  secondaryCtaLabel: 'Learn more',
  secondaryCtaUrl:   { default: '#' },
  visual:            HERO_IMG,
  visualAlt:         HERO_ALT,
}

export default function HeroPlayground() {
  return (
    <BlockPlayground
      defaults={{ direction: 'spotlight', color: 'brand', layout: 'imageRight', animation: 'none' }}
      controls={[
        {
          type: 'buttons',
          key: 'direction',
          label: 'Direction',
          options: [
            { label: 'Spotlight',  value: 'spotlight' },
            { label: 'Overlap',    value: 'overlap'   },
            { label: 'Diagonal',   value: 'diagonal'  },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Brand',   value: 'brand'   },
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
          ],
        },
        {
          type: 'buttons',
          key: 'layout',
          label: 'Image',
          options: [
            { label: 'Right', value: 'imageRight' },
            { label: 'Left',  value: 'imageLeft'  },
          ],
        },
        {
          type: 'buttons',
          key: 'animation',
          label: 'Entrance',
          options: [
            { label: 'None',     value: 'none'     },
            { label: 'Fade',     value: 'fade'     },
            { label: 'Slide',    value: 'slide'    },
            { label: 'Parallax', value: 'parallax' },
          ],
        },
      ]}
    >
      {s => (
        <OT_HeroBlock
          content={{ ...DEMO_CONTENT, direction: s.direction } as any}
          displaySettings={{ layout: s.layout, color: s.color, animation: s.animation }}
        />
      )}
    </BlockPlayground>
  )
}
