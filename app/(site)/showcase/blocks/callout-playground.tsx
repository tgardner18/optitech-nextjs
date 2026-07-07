'use client'

import { BlockPlayground } from '../playground'
import CalloutBlock from '@/components/blocks/CalloutBlock'

const CONTENT: Record<string, { heading: string; body: string; icon: string }> = {
  neutral: { heading: 'Platform maintenance scheduled Sunday 2:00–4:00 AM UTC.', body: 'Read operations will continue without interruption. Write operations may have increased latency during this window.', icon: 'clock' },
  info:    { heading: 'New: enterprise API rate limits increased to 10,000 req/min.', body: 'Review the updated rate limit docs before upgrading your integration tier.', icon: 'lightbulb' },
  success: { heading: 'Release 4.2.1 deployed successfully. All systems nominal.', body: 'Health checks passing across all regions. No action required.', icon: 'checkCircle' },
  warning: { heading: 'Your trial expires in 3 days.', body: 'Upgrade to a paid plan before your trial ends to avoid service interruption.', icon: 'timer' },
  danger:  { heading: 'Your primary API key expires in 24 hours.', body: 'Rotate it immediately to avoid authentication failures across all integrations.', icon: 'lock' },
  brand:   { heading: 'Our new analytics dashboard is now available to all plans.', body: 'Turn on richer reporting, scheduled exports, and shared views in your account settings.', icon: 'sparkles' },
}

export default function CalloutPlayground() {
  return (
    <BlockPlayground
      defaults={{ intent: 'info', variant: 'filled', dismissible: 'no' }}
      controls={[
        {
          type: 'buttons',
          key: 'intent',
          label: 'Intent',
          options: [
            { label: 'Neutral', value: 'neutral' },
            { label: 'Info',    value: 'info'    },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Danger',  value: 'danger'  },
            { label: 'Brand',   value: 'brand'   },
          ],
        },
        {
          type: 'buttons',
          key: 'variant',
          label: 'Variant',
          options: [
            { label: 'Filled',   value: 'filled'   },
            { label: 'Bordered', value: 'bordered' },
            { label: 'Bar',      value: 'bar'      },
          ],
        },
        {
          type: 'buttons',
          key: 'dismissible',
          label: 'Dismiss',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
      ]}
    >
      {s => {
        const c = CONTENT[s.intent]
        return (
          <div className="px-md py-lg lg:px-lg">
            <CalloutBlock
              heading={c.heading}
              body={s.variant === 'bar' ? undefined : c.body}
              ctaLabel="Learn more"
              ctaUrl="#"
              styleOptions={{
                intent:      s.intent as any,
                variant:     s.variant as any,
                dismissible: s.dismissible === 'yes',
                icon:        c.icon,
              }}
            />
          </div>
        )
      }}
    </BlockPlayground>
  )
}
