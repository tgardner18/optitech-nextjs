'use client'

import { BlockPlayground } from '../playground'
import OT_CardBlock from '@/cms/components/OT_CardBlock'

const IMG_A = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop'
const IMG_B = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop'
const IMG_C = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop'

const CARDS = [
  { Heading: 'Built to Scale', Eyebrow: 'Platform', Description: 'Grow from your first launch to your busiest season without missing a beat.', ctaLabel: 'See how it works', ctaUrl: { default: '#' }, image: IMG_A, imageAlt: 'Glass skyscrapers' },
  { Heading: 'Everything in One View', Eyebrow: 'Insights', Description: 'Every signal in one place — activity, audience, and outcomes in real time.', ctaLabel: 'Explore insights', ctaUrl: { default: '#' }, image: IMG_B, imageAlt: 'Circuit board close-up' },
  { Heading: 'Results You Can Act On', Eyebrow: 'Analytics', Description: 'Clear answers, not raw numbers. See what changed, why it mattered, and what to do next.', ctaLabel: 'View analytics', ctaUrl: { default: '#' }, image: IMG_C, imageAlt: 'Analytics charts on screen' },
]

export default function CardPlayground() {
  return (
    <BlockPlayground
      defaults={{ count: '3', fill: 'surface', border: 'none', image: 'none', imageSide: 'left', hover: 'none' }}
      controls={[
        {
          type: 'buttons',
          key: 'count',
          label: 'Count',
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ],
        },
        {
          type: 'buttons',
          key: 'fill',
          label: 'Fill',
          options: [
            { label: 'Ghost',   value: 'ghost'   },
            { label: 'Surface', value: 'surface' },
            { label: 'Brand',   value: 'brand'   },
            { label: 'Light',   value: 'light'   },
          ],
        },
        {
          type: 'buttons',
          key: 'border',
          label: 'Border',
          options: [
            { label: 'None',   value: 'none'   },
            { label: 'Subtle', value: 'subtle' },
            { label: 'Brand',  value: 'brand'  },
          ],
        },
        {
          type: 'buttons',
          key: 'image',
          label: 'Image',
          options: [
            { label: 'None',       value: 'none'       },
            { label: 'Top',        value: 'top'        },
            { label: 'Background', value: 'background' },
            { label: 'Side',       value: 'side'       },
            { label: 'Float',      value: 'float'      },
          ],
        },
        {
          type: 'buttons',
          key: 'imageSide',
          label: 'Image Side',
          visible: s => s.image === 'side',
          options: [
            { label: 'Left',  value: 'left'  },
            { label: 'Right', value: 'right' },
          ],
        },
        {
          type: 'buttons',
          key: 'hover',
          label: 'Hover',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Lift', value: 'lift' },
            { label: 'Glow', value: 'glow' },
            { label: 'Tilt', value: 'tilt' },
          ],
        },
      ]}
    >
      {s => {
        const count   = parseInt(s.count, 10)
        const hasImg  = s.image !== 'none'
        const isSide  = s.image === 'side'
        const colCls  = isSide
          ? 'flex flex-col gap-md'
          : count === 1
            ? 'flex justify-center'
            : count === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-md'
              : 'grid grid-cols-1 sm:grid-cols-3 gap-md'
        const ds = {
          fill:   s.fill,
          border: s.border,
          hover:  s.hover,
          ...(hasImg ? { imageStyle: s.image, imageSide: s.imageSide } : {}),
        }
        const items = CARDS.slice(0, count)
        return (
          <div className={`px-md pb-xl lg:px-lg pt-lg ${colCls}`}>
            {items.map((card, i) => (
              <OT_CardBlock
                key={i}
                content={
                  hasImg
                    ? (card as any)
                    : ({ Heading: card.Heading, Eyebrow: card.Eyebrow, Description: card.Description, ctaLabel: card.ctaLabel, ctaUrl: card.ctaUrl } as any)
                }
                displaySettings={ds}
              />
            ))}
          </div>
        )
      }}
    </BlockPlayground>
  )
}
