'use client'

import { BlockPlayground } from '../playground'
import OT_StatBlock from '@/cms/components/OT_StatBlock'

const STATS_4 = [
  { value: '40%',    label: 'Faster deployment',   context: 'vs. baseline',        icon: 'zap'         },
  { value: '99.99%', label: 'Uptime SLA',           context: 'across all regions',  icon: 'shield'      },
  { value: '2M+',    label: 'Active users',         context: 'and growing',         icon: 'users'       },
  { value: '5x',     label: 'More content reuse',   context: 'across channels',     icon: 'trendingUp'  },
]

export default function StatPlayground() {
  return (
    <BlockPlayground
      defaults={{ color: 'brand', columns: '3', glass: 'no', effect: 'none', iconPlacement: 'inline', icons: 'no' }}
      controls={[
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
          key: 'columns',
          label: 'Columns',
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          type: 'buttons',
          key: 'glass',
          label: 'Glass',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
        {
          type: 'buttons',
          key: 'effect',
          label: 'Effect',
          options: [
            { label: 'None',     value: 'none'     },
            { label: 'Gradient', value: 'gradient' },
            { label: 'Glow',     value: 'glow'     },
          ],
        },
        {
          type: 'buttons',
          key: 'icons',
          label: 'Icons',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
        {
          type: 'buttons',
          key: 'iconPlacement',
          label: 'Icon placement',
          options: [
            { label: 'Inline', value: 'inline' },
            { label: 'Above',  value: 'above'  },
          ],
        },
      ]}
    >
      {s => (
        <OT_StatBlock
          content={{ stats: STATS_4.slice(0, parseInt(s.columns, 10)), effect: s.effect } as any}
          displaySettings={{
            color:         s.color,
            columns:       s.columns,
            glass:         s.glass === 'yes',
            animate:       false,
            showIcons:     s.icons === 'yes',
            iconPlacement: s.iconPlacement,
          }}
        />
      )}
    </BlockPlayground>
  )
}
