'use client'

import { BlockPlayground } from '../playground'
import OT_TabsBlock from '@/cms/components/OT_TabsBlock'

const IMG_SRC = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop'
const IMG_ALT = 'Glass skyscrapers in a modern city financial district'

const TABS = [
  { tabLabel: 'Speed',     heading: 'Fast for everyone, everywhere',      body: 'Every experience loads quickly for your audience, wherever they are. Speed is built into the platform, so you never have to choose between rich content and a fast page.', imageSrc: IMG_SRC, imageAlt: IMG_ALT },
  { tabLabel: 'Testing',   heading: 'Test ideas side by side',            body: 'Run multiple tests at once. The platform keeps the results clean and tells you when each one is ready to act on — no spreadsheets required.' },
  { tabLabel: 'Targeting', heading: 'Reach the right audience every time', body: 'Tailor what each audience sees in a few clicks. Target by location, behaviour, or any detail you already know — the right experience reaches the right people instantly.' },
  { tabLabel: 'Insights',  heading: 'A full history and clear reporting', body: 'Every change, result, and update is recorded. Real-time dashboards surface the patterns that matter before they become problems.' },
]

export default function TabsPlayground() {
  return (
    <BlockPlayground
      defaults={{ style: 'underline', color: 'canvas', position: 'top', layout: 'textOnly' }}
      controls={[
        {
          type: 'buttons',
          key: 'style',
          label: 'Tab Style',
          options: [
            { label: 'Underline',    value: 'underline'    },
            { label: 'Pill',         value: 'pill'         },
            { label: 'Button Group', value: 'buttonGroup'  },
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
            { label: 'Glass',   value: 'glass'   },
          ],
        },
        {
          type: 'buttons',
          key: 'position',
          label: 'Position',
          options: [
            { label: 'Top',  value: 'top'  },
            { label: 'Side', value: 'side' },
          ],
        },
        {
          type: 'buttons',
          key: 'layout',
          label: 'Content',
          visible: s => s.position === 'top',
          options: [
            { label: 'Text Only',    value: 'textOnly'   },
            { label: 'Image Right',  value: 'imageRight' },
            { label: 'Image Left',   value: 'imageLeft'  },
          ],
        },
      ]}
    >
      {s => (
        <OT_TabsBlock
          content={{ tabs: TABS } as any}
          displaySettings={{
            tabStyle:      s.style,
            tabPosition:   s.position,
            color:         s.color,
            contentLayout: s.position === 'side' ? 'textOnly' : s.layout,
            triggerAlign:  'left',
            autoPlay:      'off',
          }}
        />
      )}
    </BlockPlayground>
  )
}
