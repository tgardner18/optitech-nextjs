'use client'

import { BlockPlayground } from '../playground'
import TrustRail from '@/components/blocks/TrustRail'

const LOGOS = [
  { imageUrl: '/SVG/northwind.svg',      altText: 'Northwind'       },
  { imageUrl: '/SVG/quanta.svg',         altText: 'Quanta'          },
  { imageUrl: '/SVG/vantage.svg',        altText: 'Vantage'         },
  { imageUrl: '/SVG/mosey-bank.svg',     altText: 'Mosey Bank'      },
  { imageUrl: '/SVG/forge-company.svg',  altText: 'Forge & Company' },
  { imageUrl: '/SVG/atlas-retail.svg',   altText: 'Atlas Retail'    },
  { imageUrl: '/SVG/bloom.svg',          altText: 'Bloom'           },
]

export default function TrustRailPlayground() {
  return (
    <BlockPlayground
      defaults={{ motion: 'scroll', background: 'canvas', treatment: 'auto', density: 'compact' }}
      controls={[
        {
          type: 'buttons',
          key: 'motion',
          label: 'Motion',
          options: [
            { label: 'Scroll', value: 'scroll' },
            { label: 'Fade',   value: 'fade'   },
            { label: 'Static', value: 'static' },
          ],
        },
        {
          type: 'buttons',
          key: 'background',
          label: 'Color',
          options: [
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
            { label: 'Brand',   value: 'brand'   },
          ],
        },
        {
          type: 'buttons',
          key: 'treatment',
          label: 'Treatment',
          options: [
            { label: 'Auto',  value: 'auto'  },
            { label: 'Mono',  value: 'mono'  },
            { label: 'Color', value: 'color' },
          ],
        },
        {
          type: 'buttons',
          key: 'density',
          label: 'Density',
          options: [
            { label: 'Compact',     value: 'compact'     },
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Spacious',    value: 'spacious'    },
          ],
        },
      ]}
    >
      {s => (
        <TrustRail
          headline="Trusted by teams who move fast"
          logos={LOGOS}
          styleOptions={{
            motion:     s.motion     as any,
            background: s.background as any,
            treatment:  s.treatment  as any,
            density:    s.density    as any,
            size:       'md',
            glass:      false,
          }}
        />
      )}
    </BlockPlayground>
  )
}
