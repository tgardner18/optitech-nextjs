'use client'

import { BlockPlayground } from '../playground'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function ButtonPlayground() {
  return (
    <BlockPlayground
      defaults={{ variant: 'brand', size: 'md', icon: 'none' }}
      controls={[
        {
          type: 'buttons',
          key: 'variant',
          label: 'Variant',
          options: [
            { label: 'Brand',      value: 'brand'      },
            { label: 'Accent',     value: 'accent'     },
            { label: 'Ghost',      value: 'ghost'      },
            { label: 'Signal',     value: 'signal'     },
            { label: 'Hover Fill', value: 'hover-fill' },
            { label: 'Glass',      value: 'glass'      },
          ],
        },
        {
          type: 'buttons',
          key: 'size',
          label: 'Size',
          options: [
            { label: 'SM', value: 'sm' },
            { label: 'MD', value: 'md' },
            { label: 'LG', value: 'lg' },
          ],
        },
        {
          type: 'buttons',
          key: 'icon',
          label: 'Icon',
          options: [
            { label: 'None',     value: 'none'     },
            { label: 'Trailing', value: 'trailing' },
          ],
        },
      ]}
    >
      {s => (
        <div className="px-md py-xl lg:px-lg flex flex-wrap gap-md items-center">
          <Button
            variant={s.variant as any}
            size={s.size as any}
            href="#"
            trailingIcon={s.icon === 'trailing' ? <ArrowRight size={14} /> : undefined}
          >
            Get started
          </Button>
          <Button
            variant={s.variant as any}
            size={s.size as any}
            href="#"
            trailingIcon={s.icon === 'trailing' ? <ArrowRight size={14} /> : undefined}
          >
            Learn more
          </Button>
          <Button
            variant={s.variant as any}
            size={s.size as any}
            href="#"
            trailingIcon={s.icon === 'trailing' ? <ArrowRight size={14} /> : undefined}
          >
            View the platform
          </Button>
        </div>
      )}
    </BlockPlayground>
  )
}
