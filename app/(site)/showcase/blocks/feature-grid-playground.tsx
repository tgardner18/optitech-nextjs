'use client'

import { BlockPlayground } from '../playground'
import OT_FeatureGridBlock from '@/cms/components/OT_FeatureGridBlock'

const FEATURES = [
  { headline: 'Fast by default',            body: 'Every experience loads quickly for your audience, wherever they are. Speed is built in, not bolted on.' },
  { headline: 'Always up to date',          body: 'Changes go live the moment you publish them, with no waiting and no technical help required.' },
  { headline: 'Reach the right people',     body: 'Tailor what each audience sees in a few clicks. Target by location, behaviour, or any detail you already know.' },
  { headline: 'Test several ideas at once', body: 'Run multiple tests side by side and the platform keeps the results clean, with no overlap to untangle.' },
  { headline: 'Confidence built in',        body: 'Clear measurement and sensible defaults tell you when a result is ready to act on, with no spreadsheet needed.' },
  { headline: 'Easy to undo',               body: 'One click reverts any change in seconds, with a full history of who changed what and when.' },
]

export default function FeatureGridPlayground() {
  return (
    <BlockPlayground
      defaults={{ color: 'canvas', layout: 'grid', columns: 'col3' }}
      controls={[
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
          type: 'buttons',
          key: 'layout',
          label: 'Style',
          options: [
            { label: 'Grid',  value: 'grid'  },
            { label: 'Ruled', value: 'ruled' },
          ],
        },
        {
          type: 'buttons',
          key: 'columns',
          label: 'Columns',
          options: [
            { label: '2', value: 'col2' },
            { label: '3', value: 'col3' },
            { label: '4', value: 'col4' },
          ],
        },
      ]}
    >
      {s => (
        <OT_FeatureGridBlock
          content={{
            eyebrow: 'Platform',
            heading: 'Everything your team needs',
            features: FEATURES,
          } as any}
          displaySettings={{ color: s.color, layout: s.layout, columns: s.columns, iconStyle: 'none', animate: false }}
        />
      )}
    </BlockPlayground>
  )
}
