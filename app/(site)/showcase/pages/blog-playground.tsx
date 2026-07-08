'use client'

import { BlockPlayground } from '../playground'
import BlogPage from '@/components/pages/BlogPage'

const MOCK_AUTHOR = {
  name:  'Nadia Okafor',
  role:  'Staff Platform Engineer',
  photo: { url: { default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=faces' } },
  bio:   { html: '<p>Nadia leads platform reliability at Acme, specialising in resilient systems and fast, dependable delivery. She speaks at industry conferences and writes about systems design on her personal blog.</p>' },
  linkedIn: 'https://linkedin.com',
  twitter:  'https://x.com',
}

const MOCK_CONTENT = {
  _metadata: {
    key:       'showcase-blog-article',
    published: '2026-05-15T09:00:00Z',
    url:       { default: '/blog/architecture-sub-millisecond-delivery' },
  },
  headline:    'Built for Speed: How We Keep Every Experience Fast at Any Scale',
  subHeadline: 'A look inside the choices that keep the platform quick and dependable, even at the busiest moments.',
  topic:       'engineering',
  authorRef:   MOCK_AUTHOR,
  readTime:    '8 min read',
  featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop' } },
  body: {
    html: `
      <p>At Acme, we have spent the last three years obsessing over a single question: what does it take to deliver a fast, reliable experience at global scale, even at the busiest moments, without ever cutting corners?</p>
      <p>The answer is not a single clever trick. It is a commitment to speed at every layer — from how we store your content to how we deliver changes everywhere your audience is.</p>
      <h2>Where speed comes from</h2>
      <p>Every page request follows the same path. A visitor arrives, we find the right content, match it to who they are, and serve the right experience. Simple to describe, demanding in practice when you are doing it thousands of times every second.</p>
      <p>The insight that unlocked our performance is that content changes far less often than it is viewed. A page might change once a day; it is seen thousands of times. That difference is the foundation of everything else.</p>
      <h2>Ready close to your audience</h2>
      <p>We keep your content ready to serve wherever your audience is, so there is no waiting behind the scenes. Updates reach every region within moments of you pressing publish.</p>
      <h2>The right experience, instantly</h2>
      <p>The work of matching each visitor to the right experience is done ahead of time, not while they wait. That keeps every page fast, no matter how detailed the targeting behind it.</p>
    `,
  },
}

export default function BlogPlayground() {
  return (
    <BlockPlayground
      defaults={{ style: 'impact' }}
      controls={[
        {
          type: 'buttons',
          key: 'style',
          label: 'Blog Style',
          options: [
            { label: 'Impact',      value: 'impact'      },
            { label: 'Atmospheric', value: 'atmospheric' },
            { label: 'Editorial',   value: 'editorial'   },
          ],
        },
      ]}
    >
      {s => (
        <BlogPage
          content={{ ...MOCK_CONTENT, blogStyle: s.style } as any}
          latestPosts={[]}
        />
      )}
    </BlockPlayground>
  )
}
