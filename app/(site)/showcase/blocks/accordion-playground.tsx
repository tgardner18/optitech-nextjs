'use client'

import { BlockPlayground } from '../playground'
import OT_AccordionBlock from '@/cms/components/OT_AccordionBlock'

const ITEMS = [
  { question: 'How quickly can we get started?', answer: 'Most teams are up and running the same day. There is nothing to install — you sign in, connect your content, and start making changes right away.' },
  { question: 'Can we run more than one test at a time?', answer: 'Yes. You can run several tests side by side and the platform keeps the results clean, so you always know which change drove which result.' },
  { question: 'How fast do changes go live?', answer: 'Changes appear the moment you publish them. There is no waiting and no technical help required — what you see in the editor is what your audience sees, almost instantly.' },
  { question: 'What if we need to undo a change?', answer: 'One click reverts any change in seconds. The platform keeps a full history of who changed what and when, so you can always step back to a known good state.' },
]

export default function AccordionPlayground() {
  return (
    <BlockPlayground
      defaults={{ color: 'canvas', border: 'ruled', mode: 'single' }}
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
          key: 'border',
          label: 'Style',
          options: [
            { label: 'Ruled', value: 'ruled' },
            { label: 'Boxed', value: 'boxed' },
            { label: 'Clean', value: 'clean' },
          ],
        },
        {
          type: 'buttons',
          key: 'mode',
          label: 'Mode',
          options: [
            { label: 'Single',   value: 'single'   },
            { label: 'Multiple', value: 'multiple' },
          ],
        },
      ]}
    >
      {s => (
        <OT_AccordionBlock
          content={{ headline: 'Frequently asked questions', items: ITEMS } as any}
          displaySettings={{ color: s.color, borderStyle: s.border, openMode: s.mode, defaultOpen: false }}
        />
      )}
    </BlockPlayground>
  )
}
