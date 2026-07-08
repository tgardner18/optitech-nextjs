'use client'

import { BlockPlayground } from '../playground'
import OT_DividerBlock from '@/cms/components/OT_DividerBlock'

// Minimal content bands to give the divider realistic context.
function Band({ eyebrow, children, surface }: { eyebrow: string; children: string; surface?: boolean }) {
  return (
    <div className={surface ? 'bg-surface' : 'bg-canvas'}>
      <div className="px-md lg:px-lg py-lg max-w-[65ch]">
        <p className="text-label tracking-label uppercase text-fg-muted font-semibold mb-xs">{eyebrow}</p>
        <p className="text-body leading-body text-fg text-pretty">{children}</p>
      </div>
    </div>
  )
}

export default function DividerPlayground() {
  return (
    <BlockPlayground
      defaults={{ style: 'glow', tone: 'spectrum', weight: 'slim', space: 'lg', ornament: 'pendant', reveal: 'static' }}
      controls={[
        {
          type: 'buttons',
          key: 'style',
          label: 'Style',
          options: [
            { label: 'Mark',  value: 'mark'  },
            { label: 'Glow',  value: 'glow'  },
            { label: 'Bleed', value: 'bleed' },
          ],
        },
        {
          type: 'buttons',
          key: 'tone',
          label: 'Tone',
          options: [
            { label: 'Neutral',  value: 'neutral'  },
            { label: 'Brand',    value: 'brand'    },
            { label: 'Accent',   value: 'accent'   },
            { label: 'Spectrum', value: 'spectrum' },
            { label: 'Aurora',   value: 'aurora'   },
          ],
        },
        {
          type: 'buttons',
          key: 'weight',
          label: 'Weight',
          // Weight applies to glow (rule + bloom size) and bleed (seam height + peak).
          visible: s => s.style !== 'mark',
          options: [
            { label: 'Slim', value: 'slim' },
            { label: 'Bold', value: 'bold' },
          ],
        },
        {
          type: 'buttons',
          key: 'ornament',
          label: 'Ornament',
          // Ornament only applies to the mark style (overridden by a text label if set).
          visible: s => s.style === 'mark',
          options: [
            { label: 'Pendant',   value: 'pendant'   },
            { label: 'Asterism',  value: 'asterism'  },
            { label: 'Dot',       value: 'dot'       },
            { label: 'None',      value: 'none'      },
          ],
        },
        {
          type: 'buttons',
          key: 'space',
          label: 'Space',
          options: [
            { label: 'SM', value: 'sm' },
            { label: 'MD', value: 'md' },
            { label: 'LG', value: 'lg' },
            { label: 'XL', value: 'xl' },
          ],
        },
        {
          type: 'buttons',
          key: 'reveal',
          label: 'Reveal',
          options: [
            { label: 'Static', value: 'static' },
            { label: 'Draw',   value: 'draw'   },
          ],
        },
      ]}
    >
      {s => (
        <div>
          <Band eyebrow="The platform" surface>
            The platform gives your team the tools to move step by step, measure precisely, and respond in real time.
          </Band>
          <OT_DividerBlock
            content={{ label: s.style === 'mark' ? 'Continue' : '' } as any}
            displaySettings={{
              style:    s.style,
              tone:     s.tone,
              weight:   s.weight,
              ornament: s.ornament,
              space:    s.space,
              reveal:   s.reveal,
            }}
          />
          <Band eyebrow="The method">
            Decisions are made where the work happens, not in a meeting three weeks later.
          </Band>
        </div>
      )}
    </BlockPlayground>
  )
}
