'use client'

import { BlockPlayground } from '../playground'
import OT_FeatureGridBlock from '@/cms/components/OT_FeatureGridBlock'

// OT_FeatureGridBlockAdapter (cms/components/OT_FeatureGridBlock.tsx) reads body copy
// from item.body.json — the CMS SDK's Slate.js JSON shape, double-nested under `json`
// the same way RichTextBlock's showcase content is (see the note in
// app/(site)/showcase/blocks/[block]/page.tsx's Rich Text section). A bare string, or
// an unwrapped Slate doc, resolves to `undefined` and RichText silently renders nothing
// — every tile then looks like a bare heading, indistinguishable from the "identical
// card grid" pattern DESIGN.md bans.
//
// Per-item `icon` fields are also NOT read by the adapter — icons are assigned by
// *slot position* via displaySettings.feature1Icon..feature6Icon (getFeatureGridIcons
// in cms/styling/OT_FeatureGridBlock.styling.ts), matching how the CMS display
// template exposes them to editors. Icons are wired below on the playground settings,
// not on the FEATURES content array.
const bodyDoc = (text: string) => ({
  json: {
    type: 'richText',
    children: [{ type: 'paragraph', children: [{ text }] }],
  },
})

const FEATURES = [
  { headline: 'Fast by default',            body: bodyDoc('Every experience loads quickly for your audience, wherever they are. Speed is built in, not bolted on.') },
  { headline: 'Always up to date',          body: bodyDoc('Changes go live the moment you publish them, with no waiting and no technical help required.') },
  { headline: 'Reach the right people',     body: bodyDoc('Tailor what each audience sees in a few clicks. Target by location, behaviour, or any detail you already know.') },
  { headline: 'Test several ideas at once', body: bodyDoc('Run multiple tests side by side and the platform keeps the results clean, with no overlap to untangle.') },
  { headline: 'Confidence built in',        body: bodyDoc('Clear measurement and sensible defaults tell you when a result is ready to act on, with no spreadsheet needed.') },
  { headline: 'Easy to undo',               body: bodyDoc('One click reverts any change in seconds, with a full history of who changed what and when.') },
]

// Slot-indexed icon keys — mirrors FEATURES order, consumed via feature{N}Icon below.
const FEATURE_ICONS = ['gauge', 'clock', 'target', 'layers', 'shield', 'wrench']

export default function FeatureGridPlayground() {
  return (
    <BlockPlayground
      defaults={{ color: 'canvas', layout: 'grid', columns: 'col3', iconStyle: 'accent' }}
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
      {s => (
        <OT_FeatureGridBlock
          content={{
            eyebrow: 'Platform',
            heading: 'Everything your team needs',
            features: FEATURES,
          } as any}
          displaySettings={{
            color: s.color, layout: s.layout, columns: s.columns, iconStyle: s.iconStyle, animate: false,
            feature1Icon: FEATURE_ICONS[0], feature2Icon: FEATURE_ICONS[1], feature3Icon: FEATURE_ICONS[2],
            feature4Icon: FEATURE_ICONS[3], feature5Icon: FEATURE_ICONS[4], feature6Icon: FEATURE_ICONS[5],
          }}
        />
      )}
    </BlockPlayground>
  )
}
