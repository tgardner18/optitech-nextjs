'use client'

import { BlockPlayground } from '../playground'
import OT_VideoBlock from '@/cms/components/OT_VideoBlock'

const VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

export default function VideoPlayground() {
  return (
    <BlockPlayground
      defaults={{ layout: 'full', frame: 'none', overlay: 'no', mediaSide: 'left' }}
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
          key: 'overlay',
          label: 'Overlay',
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
            { label: 'Left',  value: 'left'  },
            { label: 'Right', value: 'right' },
          ],
        },
      ]}
    >
      {s => {
        const isEditorial = s.layout === 'editorial'
        const ds: Record<string, string | boolean> = {
          ratio:     'r16_9',
          overlay:   s.overlay === 'yes',
          mediaSide: s.mediaSide,
          ...(s.frame !== 'none' && { frame: s.frame }),
        }
        return isEditorial ? (
          <OT_VideoBlock
            content={{ videoUrl: VIDEO_URL, title: 'Platform Overview', eyebrow: 'Platform', heading: 'See it in motion, not just on paper.', ctaUrl: { default: '#' }, ctaLabel: 'Watch overview' } as any}
            displaySettings={ds}
          />
        ) : (
          <OT_VideoBlock
            content={{ videoUrl: VIDEO_URL, title: 'Platform Overview' } as any}
            displaySettings={ds}
          />
        )
      }}
    </BlockPlayground>
  )
}
