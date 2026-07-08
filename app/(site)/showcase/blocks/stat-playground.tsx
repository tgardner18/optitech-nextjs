'use client'

import { BlockPlayground } from '../playground'
import OT_StatBlock from '@/cms/components/OT_StatBlock'

const STATS_4 = [
  { value: '40%',    label: 'Faster deployment',   context: 'vs. baseline'       },
  { value: '99.99%', label: 'Uptime SLA',           context: 'across all regions' },
  { value: '2M+',    label: 'Active users',         context: 'and growing'        },
  { value: '5x',     label: 'More content reuse',   context: 'across channels'    },
]

export default function StatPlayground() {
  return (
    <BlockPlayground
      defaults={{ color: 'brand', columns: '3', glass: 'no' }}
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
      ]}
    >
      {s => (
        <OT_StatBlock
          content={{ stats: STATS_4.slice(0, parseInt(s.columns, 10)) } as any}
          displaySettings={{ color: s.color, columns: s.columns, glass: s.glass === 'yes', animate: false }}
        />
      )}
    </BlockPlayground>
  )
}
