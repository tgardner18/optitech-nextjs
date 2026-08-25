'use client'

import { BlockPlayground } from '../playground'
import OT_QuoteBlock from '@/cms/components/OT_QuoteBlock'

const DEMO = {
  quote: 'The platform gave us the confidence to move faster without second-guessing every decision. We went from monthly launches to weekly.',
  attributionName:  'Sarah Chen',
  attributionTitle: 'VP Operations, Meridian',
}

export default function QuotePlayground() {
  return (
    <BlockPlayground
      defaults={{ treatment: 'default', color: 'brand', size: 'large', alignment: 'left' }}
      controls={[
        {
          type: 'buttons',
          key: 'treatment',
          label: 'Treatment',
          options: [
            { label: 'Editorial Mark', value: 'default' },
            { label: 'Speech Bubble',  value: 'bubble'  },
            { label: 'Ambient Glow',   value: 'glow'    },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          // Glow forces its own dark canvas; color selector still wires through
          // for default/bubble but is less meaningful for glow.
          options: [
            { label: 'Brand',   value: 'brand'   },
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
          ],
        },
        {
          type: 'buttons',
          key: 'size',
          label: 'Size',
          options: [
            { label: 'Large', value: 'large' },
            { label: 'Small', value: 'small' },
          ],
        },
        {
          type: 'buttons',
          key: 'alignment',
          label: 'Alignment',
          // Alignment is only meaningful for the default treatment
          visible: s => s.treatment === 'default',
          options: [
            { label: 'Left',   value: 'left'   },
            { label: 'Center', value: 'center' },
          ],
        },
      ]}
    >
      {s => (
        <OT_QuoteBlock
          content={{ ...DEMO, treatment: s.treatment } as any}
          displaySettings={{ color: s.color, size: s.size, alignment: s.alignment }}
        />
      )}
    </BlockPlayground>
  )
}
