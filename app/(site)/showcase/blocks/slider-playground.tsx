'use client'

import { BlockPlayground } from '../playground'
import OT_SliderBlock from '@/cms/components/OT_SliderBlock'

const IMG_1 = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop'
const IMG_2 = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop'
const IMG_3 = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&fit=crop'
const SAMPLE_VIDEO = '/video/background-sample.mp4'

// Background Color and Overlay are driven by the playground controls below
// and applied uniformly across all four slides, so it's easy to sweep every
// combination and check legibility — the thing most worth stress-testing
// here. Media (image, video, none) and Content Placement stay fixed per
// slide so the demo still shows a realistic spread of each.
const BASE_SLIDES = [
  {
    eyebrow: 'Platform',
    headline: 'Move at the speed of certainty.',
    body: 'Everything your team needs to launch faster, work smarter, and see what is working in real time.',
    buttonLabel: 'Get started', buttonUrl: { default: '#' },
    secondaryLabel: 'Learn more', secondaryUrl: { default: '#' },
    backgroundImage: IMG_1, backgroundImageAlt: 'Glass skyscrapers in a modern city financial district',
    contentPlacement: 'left',
  },
  {
    eyebrow: 'Insights',
    headline: 'Clear answers, not raw numbers.',
    body: 'See what changed, why it mattered, and what to do next — no spreadsheets required.',
    buttonLabel: 'See how it works', buttonUrl: { default: '#' },
    backgroundVideo: SAMPLE_VIDEO, backgroundImage: IMG_2, backgroundImageAlt: 'Team reviewing data on a shared screen',
    contentPlacement: 'center',
  },
  {
    eyebrow: 'Reliability',
    headline: 'Built to hold up at any scale.',
    body: 'From your first launch to your busiest season, without missing a beat.',
    buttonLabel: 'View the platform', buttonUrl: { default: '#' },
    secondaryLabel: 'Read the docs', secondaryUrl: { default: '#' },
    backgroundImage: IMG_3, backgroundImageAlt: 'Server infrastructure in a modern data center',
    contentPlacement: 'right',
  },
  {
    // No backgroundImage/backgroundVideo — the pure color-and-type slide the
    // spec calls out (§2.2): Background Color becomes the entire slide, with
    // no overlay to speak of (Overlay has no effect without media).
    eyebrow: 'Support',
    headline: 'Real people, real fast.',
    body: 'Every plan includes 24/7 support from engineers who know the platform inside and out — not a ticket queue.',
    buttonLabel: 'Talk to us', buttonUrl: { default: '#' },
    contentPlacement: 'center',
  },
]

export default function SliderPlayground() {
  return (
    <BlockPlayground
      defaults={{ style: 'cinematic', height: 'standard', autoPlay: 'off', loop: 'loop', navigation: 'both', overlay: 'leftFade', color: 'canvas' }}
      controls={[
        {
          type: 'buttons',
          key: 'style',
          label: 'Presentation Style',
          options: [
            { label: 'Cinematic',       value: 'cinematic'      },
            { label: 'Editorial Split', value: 'editorialSplit' },
            { label: 'Story Rail',      value: 'storyRail'      },
            { label: 'Emerge',          value: 'emerge'         },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Background Color',
          options: [
            { label: 'Canvas',    value: 'canvas'    },
            { label: 'Surface',   value: 'surface'   },
            { label: 'Brand',     value: 'brand'     },
            { label: 'BrandDeep', value: 'brandDeep' },
            { label: 'Accent',    value: 'accent'    },
          ],
        },
        {
          type: 'buttons',
          key: 'overlay',
          label: 'Overlay',
          options: [
            { label: 'None',        value: 'none'         },
            { label: 'Even Tint',   value: 'evenTint'     },
            { label: 'Left Fade',   value: 'leftFade'     },
            { label: 'Right Fade',  value: 'rightFade'    },
            { label: 'Bottom Fade', value: 'bottomFade'   },
            { label: 'Brand Wash',  value: 'brandWash'    },
            { label: 'Frosted Panel', value: 'frostedPanel' },
          ],
        },
        {
          type: 'buttons',
          key: 'height',
          label: 'Height',
          options: [
            { label: 'Compact',     value: 'compact'    },
            { label: 'Standard',    value: 'standard'   },
            { label: 'Large',       value: 'large'      },
            { label: 'Full Screen', value: 'fullScreen' },
            { label: 'Fit Content', value: 'fitContent' },
          ],
        },
        {
          type: 'buttons',
          key: 'autoPlay',
          label: 'Auto-Play',
          options: [
            { label: 'Off',    value: 'off'    },
            { label: 'Slow',   value: 'slow'   },
            { label: 'Fast',   value: 'fast'   },
          ],
        },
        {
          type: 'buttons',
          key: 'loop',
          label: 'Loop Mode',
          options: [
            { label: 'Loop',         value: 'loop'   },
            { label: 'Bounce',       value: 'bounce' },
            { label: 'Stop at ends', value: 'none'   },
          ],
        },
        {
          type: 'buttons',
          key: 'navigation',
          label: 'Navigation',
          options: [
            { label: 'Arrows + Dots', value: 'both'   },
            { label: 'Arrows only',   value: 'arrows' },
            { label: 'Dots only',     value: 'dots'   },
            { label: 'None',          value: 'none'   },
          ],
        },
      ]}
    >
      {s => (
        <OT_SliderBlock
          content={{
            presentationStyle: s.style,
            slideItems: BASE_SLIDES.map(slide => ({ ...slide, backgroundColor: s.color, overlay: s.overlay })),
          } as any}
          displaySettings={{
            width: 'fullBleed',
            height: s.height,
            autoPlay: s.autoPlay,
            loop: s.loop,
            navigation: s.navigation,
            headingLevel: 'h2',
            entranceAnimation: 'none',
          }}
        />
      )}
    </BlockPlayground>
  )
}
