'use client'

import { BlockPlayground } from '../playground'
import OT_FeatureItemBlock from '@/cms/components/OT_FeatureItemBlock'
import OT_FeatureItemGroupAdapter from '@/cms/components/OT_FeatureItemGroup'
import { PlaceholderCard, ColumnMock } from './column-mock'

const bodyDoc = (text: string) => ({
  json: {
    type: 'richText',
    children: [{ type: 'paragraph', children: [{ text }] }],
  },
})

const FEATURES = [
  { headline: 'Fast by default',        body: bodyDoc('Every experience loads quickly for your audience, wherever they are. Speed is built in, not bolted on.'), icon: 'gauge'  },
  { headline: 'Always up to date',      body: bodyDoc('Changes go live the moment you publish them, with no waiting and no technical help required.'),           icon: 'clock'  },
  { headline: 'Reach the right people', body: bodyDoc('Tailor what each audience sees in a few clicks. Target by location, behavior, or any detail you know.'), icon: 'target' },
  { headline: 'Confidence built in',    body: bodyDoc('Clear measurement and sensible defaults tell you when a result is ready to act on.'),                     icon: 'shield' },
]

// Fake composition nodes — enough shape for getPreviewUtils(node) and
// buildFeatureItemFromContent to work outside a real CMS render.
function fakeNode(key: string, component: Record<string, unknown>) {
  return { __typename: 'CompositionComponentNode', nodeType: 'component', key, component }
}

export default function FeatureItemPlayground() {
  return (
    <BlockPlayground
      defaults={{ items: '2', color: 'canvas', iconStyle: 'accent' }}
      controls={[
        {
          type: 'buttons',
          key: 'items',
          label: 'Adjacent items in column',
          options: [
            { label: '1',         value: '1' },
            { label: '2 (2-col)', value: '2' },
            { label: '4 (2x2)',   value: '4' },
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
          type: 'buttons',
          key: 'iconStyle',
          label: 'Icon',
          options: [
            { label: 'None',       value: 'none'       },
            { label: 'Accent',     value: 'accent'     },
            { label: 'Structural', value: 'structural' },
          ],
        },
      ]}
    >
      {s => {
        const displaySettings = { color: s.color, iconStyle: s.iconStyle, animate: false }
        const count = parseInt(s.items, 10)

        const preview = count === 1
          ? (
            <OT_FeatureItemBlock content={FEATURES[0] as any} displaySettings={displaySettings} />
          )
          : (
            <OT_FeatureItemGroupAdapter
              content={{
                __groupNodes: FEATURES.slice(0, count).map((feature, i) =>
                  fakeNode(`demo-${i}`, { __typename: 'OT_FeatureItemBlock', ...feature }),
                ),
              }}
              displaySettings={displaySettings}
            />
          )

        return (
          <ColumnMock
            note="1 item renders as its own card; 2+ adjacent items merge into a 2-column grid that wraps into further rows (4 items -> 2x2)."
            left={preview}
            right={<PlaceholderCard />}
          />
        )
      }}
    </BlockPlayground>
  )
}
