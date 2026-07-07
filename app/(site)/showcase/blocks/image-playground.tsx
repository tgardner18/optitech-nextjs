'use client'

import { BlockPlayground } from '../playground'
import OT_ImageBlock from '@/cms/components/OT_ImageBlock'

const IMG_SRC = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop'
const IMG_ALT = 'Business professionals walking past glass skyscrapers in a modern city financial district'

export default function ImagePlayground() {
  return (
    <BlockPlayground
      defaults={{ layout: 'full', frame: 'none', ratio: 'r16_9', overlay: 'no', shadow: 'no', mediaSide: 'right' }}
      controls={[
        {
          type: 'buttons',
          key: 'layout',
          label: 'Layout',
          options: [
            { label: 'Full Width', value: 'full'      },
            { label: 'Editorial',  value: 'editorial' },
          ],
        },
        {
          type: 'buttons',
          key: 'frame',
          label: 'Frame',
          options: [
            { label: 'None',   value: 'none'   },
            { label: 'Offset', value: 'offset' },
            { label: 'Glow',   value: 'glow'   },
          ],
        },
        {
          type: 'buttons',
          key: 'ratio',
          label: 'Ratio',
          options: [
            { label: '16:9', value: 'r16_9' },
            { label: '4:3',  value: 'r4_3'  },
            { label: '1:1',  value: 'r1_1'  },
          ],
        },
        {
          type: 'buttons',
          key: 'overlay',
          label: 'Overlay',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
        {
          type: 'buttons',
          key: 'shadow',
          label: 'Shadow',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
        {
          type: 'buttons',
          key: 'mediaSide',
          label: 'Media',
          visible: s => s.layout === 'editorial',
          options: [
            { label: 'Right', value: 'right' },
            { label: 'Left',  value: 'left'  },
          ],
        },
      ]}
    >
      {s => {
        const isEditorial = s.layout === 'editorial'
        const ds: Record<string, string | boolean> = {
          ratio:     s.ratio,
          overlay:   s.overlay === 'yes',
          shadow:    s.shadow === 'yes',
          mediaSide: s.mediaSide,
          ...(s.frame !== 'none' && { frame: s.frame }),
        }
        return isEditorial ? (
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: IMG_ALT, eyebrow: 'Infrastructure', heading: 'Precision at every layer, at any scale.', ctaUrl: { default: '#' }, ctaLabel: 'View architecture' } as any}
            displaySettings={ds}
          />
        ) : (
          <OT_ImageBlock
            content={{ image: IMG_SRC, alt: IMG_ALT } as any}
            displaySettings={ds}
          />
        )
      }}
    </BlockPlayground>
  )
}
