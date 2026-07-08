'use client'

import { BlockPlayground } from '../playground'
import OT_PrimaryTextBlock from '@/cms/components/OT_PrimaryTextBlock'

export default function PrimaryTextPlayground() {
  return (
    <BlockPlayground
      defaults={{ size: 'headline', color: 'canvas', effect: 'none', alignment: 'left' }}
      controls={[
        {
          type: 'buttons',
          key: 'size',
          label: 'Size',
          options: [
            { label: 'Display',  value: 'display'  },
            { label: 'Headline', value: 'headline' },
            { label: 'Title',    value: 'title'    },
            { label: 'Label',    value: 'label'    },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
            { label: 'Brand',   value: 'brand'   },
          ],
        },
        {
          type: 'select',
          key: 'effect',
          label: 'Effect',
          options: [
            { label: 'None',              value: 'none'              },
            { label: 'Gradient',          value: 'gradient'          },
            { label: 'Animated Gradient', value: 'animatedGradient'  },
            { label: '3D Depth',          value: 'depth3d'           },
            { label: 'Glitch',            value: 'glitch'            },
            { label: 'Outline',           value: 'outline'           },
            { label: 'Neon',              value: 'neon'              },
            { label: 'Highlight',         value: 'highlight'         },
            { label: 'Glow',              value: 'glow'              },
          ],
        },
        {
          type: 'buttons',
          key: 'alignment',
          label: 'Alignment',
          options: [
            { label: 'Left',   value: 'left'   },
            { label: 'Center', value: 'center' },
          ],
        },
      ]}
    >
      {s => (
        <OT_PrimaryTextBlock
          content={{ eyebrow: 'The platform', headline: 'Speed that compounds into advantage.' } as any}
          displaySettings={{ size: s.size, color: s.color, headerEffect: s.effect, alignment: s.alignment }}
        />
      )}
    </BlockPlayground>
  )
}
