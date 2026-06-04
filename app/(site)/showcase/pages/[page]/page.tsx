import type { Metadata }       from 'next'
import { notFound }             from 'next/navigation'
import { SectionLabel }         from '../../components'
import BlogPage                 from '@/components/pages/BlogPage'
import CampaignPage             from '@/components/pages/CampaignPage'
import type { CampaignPageProps } from '@/components/pages/CampaignPage'
import type { CampaignHeroSlot, CampaignBodyItem, CampaignClosingItem } from '@/lib/campaign'

// ─── Static params ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return [{ page: 'blog' }, { page: 'folder' }, { page: 'campaign-page' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const labels: Record<string, string> = {
    blog:            'Blog Page',
    folder:          'Folder Page',
    'campaign-page': 'Campaign Page',
  }
  const label = labels[page]
  if (!label) return {}
  return { title: `${label} — Pages — Showcase — OptiTech` }
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_AUTHOR = {
  name:  'Nadia Okafor',
  role:  'Staff Infrastructure Engineer',
  photo: { url: { default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=faces' } },
  bio:   { html: '<p>Nadia leads infrastructure reliability at OptiTech, specialising in distributed evaluation systems and edge-state propagation. She speaks at QCon and writes about systems design on her personal blog.</p>' },
  linkedIn: 'https://linkedin.com',
  twitter:  'https://x.com',
}

const MOCK_BASE = {
  _metadata: {
    key:       'showcase-blog-article',
    published: '2026-05-15T09:00:00Z',
    url:       { default: '/blog/architecture-sub-millisecond-delivery' },
  },
  headline:    'How OptiTech Builds for Speed: Architecture Behind Sub-Millisecond Feature Delivery',
  subHeadline: 'A look inside the evaluation hot path, edge-distributed state, and the targeting rule compiler that makes it possible.',
  topic:       'engineering',
  authorRef:   MOCK_AUTHOR,
  readTime:    '8 min read',
  featuredImage: { url: { default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop' } },
  body: {
    html: `
      <p>At OptiTech, we have spent the last three years obsessing over a single question: what does it take to deliver feature evaluations at sub-millisecond latency, at global scale, without sacrificing correctness?</p>
      <p>The answer is not a single clever trick. It is a systems-level commitment to speed at every layer — from how we store flag state to how we propagate changes across regions.</p>
      <h2>The evaluation hot path</h2>
      <p>Every feature flag evaluation follows the same path. A request comes in, we look up the flag configuration, evaluate the targeting rules against the user context, and return a variation. Simple in description, brutal in practice when you are doing it 50,000 times per second per customer.</p>
      <p>The key insight that unlocked our current performance is that flag configuration changes far less frequently than it is read. A flag might change once a day; it is evaluated millions of times. This asymmetry is the foundation of everything else.</p>
      <h2>In-memory state, edge-distributed</h2>
      <p>We keep the entire flag state in memory — no database round-trips on the hot path. Changes are pushed to evaluation nodes within 200 milliseconds of a save in the CMS.</p>
      <h2>Targeting rule compilation</h2>
      <p>Targeting rules are pre-compiled into a decision tree on flag save, not at evaluation time. The compiler produces a compact bytecode representation that the evaluation engine walks in a single pass.</p>
    `,
  },
}

const MOCK_LATEST = [
  { _metadata: { key: 'sc-blog-1', published: '2026-05-10T08:00:00Z', url: { default: '/blog/future-of-personalization' } }, headline: 'The Future of Personalization: How AI Is Reshaping User Experiences', topic: 'innovation', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop' } }, authorRef: { name: 'Marcus Webb' }, readTime: '5 min read' },
  { _metadata: { key: 'sc-blog-2', published: '2026-05-06T10:30:00Z', url: { default: '/blog/zero-downtime-deployments' } }, headline: 'Why Feature Flags Are the Foundation of Modern Product Development', topic: 'product', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop' } }, authorRef: { name: 'Priya Nair' }, readTime: '6 min read' },
  { _metadata: { key: 'sc-blog-3', published: '2026-04-28T14:00:00Z', url: { default: '/blog/observability-trends-2026' } }, headline: 'Observability in 2026: Five Trends Redefining How Teams Monitor Production', topic: 'trends', featuredImage: undefined, authorRef: { name: 'James Okonkwo' }, readTime: '4 min read' },
]

// ─── Blog page showcase ─────────────────────────────────────────────────────

function BlogPageShowcase() {
  return (
    <>
      <section className="px-md pt-xl pb-lg lg:px-lg">
        <SectionLabel index="Pages · OT_BlogPage" title="Blog Page" />
        <p className="text-body leading-body text-fg-muted max-w-[65ch]">
          Three display styles for the blog article page type, each serving a different editorial register. Style is a display template setting — the same content renders differently depending on which style the author chooses.
        </p>
      </section>

      {/* Impact */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">01</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">Impact</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            <code className="font-mono text-accent">blogStyle: impact</code> — poster-format header at display scale with a 3D extruded text-shadow. Suited to announcements and flagship engineering posts.
          </p>
        </div>
        <BlogPage content={{ ...MOCK_BASE, blogStyle: 'impact' }} latestPosts={[]} />
        <div className="pb-xl" />
      </section>

      {/* Atmospheric */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">02</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">Atmospheric</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            <code className="font-mono text-accent">blogStyle: atmospheric</code> — featured image bleeds full-height into the header; a glass panel anchors the article metadata over the blurred backdrop.
          </p>
        </div>
        <BlogPage content={{ ...MOCK_BASE, blogStyle: 'atmospheric' }} latestPosts={[]} />
        <div className="pb-xl" />
      </section>

      {/* Editorial */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">03</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">Editorial</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            <code className="font-mono text-accent">blogStyle: editorial</code> — asymmetric two-column header: headline occupies the wide left column, topic mark and author stack in the right sidebar.
          </p>
        </div>
        <BlogPage content={{ ...MOCK_BASE, blogStyle: 'editorial' }} latestPosts={MOCK_LATEST} />
        <div className="pb-xl" />
      </section>
    </>
  )
}

// ─── Campaign page mock data ────────────────────────────────────────────────

const CAMPAIGN_HERO_AI: CampaignHeroSlot = {
  __typename:        'OT_HeroBlock',
  headline:          'Intelligence at the Speed of Your Ambition',
  eyebrow:           'OptiTech AI',
  body:              'AI-powered digital experiences that adapt to every visitor in real time — from content sequencing to offer logic to performance optimization. No configuration lag.',
  primaryCtaLabel:   'Start Free Trial',
  primaryCtaUrl:     '#',
  secondaryCtaLabel: 'See the Demo',
  secondaryCtaUrl:   '#',
  visualSrc:         null,
  visualAlt:         null,
}

const CAMPAIGN_BODY_AI: CampaignBodyItem[] = [
  {
    __typename:   'OT_PrimaryTextBlock',
    eyebrow:      'Why OptiTech AI',
    headline:     'Transform content operations without hiring a team of data scientists.',
    headingLevel: 'h2',
    body:         null,
  },
  {
    __typename: 'OT_FeatureGridBlock',
    eyebrow:    'Capabilities',
    heading:    'Built for content teams that move fast.',
    subheading: 'From automated tagging to predictive publishing — AI handles the overhead.',
    ctaLabel:   undefined,
    ctaUrl:     undefined,
    features: [
      { headline: 'Automated Tagging',     body: null, ctaLabel: undefined, ctaUrl: undefined },
      { headline: 'Predictive Publishing', body: null, ctaLabel: undefined, ctaUrl: undefined },
      { headline: 'Performance Signals',   body: null, ctaLabel: undefined, ctaUrl: undefined },
    ],
  },
]

const CAMPAIGN_CLOSING_AI: CampaignClosingItem[] = [
  {
    __typename:       'OT_QuoteBlock',
    quote:            'OptiTech AI reduced our content review cycle from four days to four hours. My team stopped debating what to publish and started measuring what actually drives pipeline.',
    attributionName:  'Jordan Mercer',
    attributionTitle: 'CTO, Vantage Systems',
  },
]

const CAMPAIGN_HERO_ASSOC: CampaignHeroSlot = {
  __typename:        'OT_HeroBlock',
  headline:          'Your Members Deserve Better',
  eyebrow:           'Associations',
  body:              'Modern digital experiences for membership organizations — portal access, event registration, and content personalization built for the communities you serve.',
  primaryCtaLabel:   'See It in Action',
  primaryCtaUrl:     '#',
  secondaryCtaLabel: 'Talk to Sales',
  secondaryCtaUrl:   '#',
  visualSrc:         null,
  visualAlt:         null,
}

const CAMPAIGN_BODY_ASSOC: CampaignBodyItem[] = [
  {
    __typename: 'OT_FeatureGridBlock',
    eyebrow:    'Platform',
    heading:    'Everything Your Team Needs',
    subheading: 'One platform for member engagement, event management, and content delivery.',
    ctaLabel:   undefined,
    ctaUrl:     undefined,
    features: [
      { headline: 'Member Portal',      body: null, ctaLabel: undefined, ctaUrl: undefined },
      { headline: 'Event Management',   body: null, ctaLabel: undefined, ctaUrl: undefined },
      { headline: 'Content Workflows',  body: null, ctaLabel: undefined, ctaUrl: undefined },
      { headline: 'Real-Time Analytics',body: null, ctaLabel: undefined, ctaUrl: undefined },
    ],
  },
]

const CAMPAIGN_CLOSING_ASSOC: CampaignClosingItem[] = [
  {
    __typename: 'OT_VideoBlock',
    src:        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title:      'OptiTech for Associations: Platform Overview',
    caption:    'See how forward-thinking associations run their digital experience on OptiTech.',
  },
]

const CAMPAIGN_HERO_PERSONALIZATION: CampaignHeroSlot = {
  __typename:        'OT_HeroBlock',
  headline:          'Every Visitor. One Experience.',
  eyebrow:           'Personalization',
  body:              'Deliver individually tailored content, offers, and navigation paths at scale — without writing a single targeting rule by hand. OptiTech Personalization learns, decides, and adapts.',
  primaryCtaLabel:   'Start Personalizing',
  primaryCtaUrl:     '#',
  secondaryCtaLabel: 'View Pricing',
  secondaryCtaUrl:   '#',
  visualSrc:         null,
  visualAlt:         null,
}

const CAMPAIGN_BODY_PERSONALIZATION: CampaignBodyItem[] = [
  {
    __typename: 'OT_TabsBlock',
    heading:    'How It Works',
    eyebrow:    'Personalization at Scale',
    tabs: [
      { tabLabel: 'How It Works', tabIcon: 'zap',      heading: 'Signal-to-action in milliseconds', body: null, ctaLabel: undefined, ctaUrl: undefined },
      { tabLabel: 'Integrations', tabIcon: 'layers',   heading: 'Connects to your existing stack',   body: null, ctaLabel: undefined, ctaUrl: undefined },
      { tabLabel: 'Pricing',      tabIcon: 'barChart', heading: 'Usage-based, no surprise bills',    body: null, ctaLabel: undefined, ctaUrl: undefined },
    ],
  },
]

const CAMPAIGN_CLOSING_PERSONALIZATION: CampaignClosingItem[] = [
  {
    __typename: 'OT_ImageBlock',
    src:        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop',
    alt:        'Abstract technology visualization showing data flows and network connections',
    caption:    'OptiTech Personalization — precision-targeted, at scale.',
  },
]

// ─── Campaign page showcase ─────────────────────────────────────────────────

function CampaignPageShowcase() {
  return (
    <>
      <section className="px-md pt-xl pb-lg lg:px-lg">
        <SectionLabel index="Pages · OT_CampaignPage" title="Campaign Page" />
        <p className="text-body leading-body text-fg-muted max-w-[65ch]">
          A slotted landing page type with three fixed content sections: hero, body, and closing.
          Each slot accepts a specific set of block types referenced from the CMS library.
          Editors choose which block to slot; the page renders them in a fixed editorial layout.
        </p>
      </section>

      {/* Variant 1: AI Product Launch */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">01</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">OptiTech AI: Product Launch</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            Hero + stacked body (Primary Text + Feature Grid) + Quote closing. Demonstrates multiple body blocks in one section.
          </p>
        </div>
        <CampaignPage
          heroSection={CAMPAIGN_HERO_AI}
          bodySection={CAMPAIGN_BODY_AI}
          closingSection={CAMPAIGN_CLOSING_AI}
        />
        <div className="pb-xl" />
      </section>

      {/* Variant 2: CMS for Associations */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">02</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">OptiTech CMS for Associations</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            Hero + Feature Grid body + Video closing. Audience-specific page with feature proof points and social evidence.
          </p>
        </div>
        <CampaignPage
          heroSection={CAMPAIGN_HERO_ASSOC}
          bodySection={CAMPAIGN_BODY_ASSOC}
          closingSection={CAMPAIGN_CLOSING_ASSOC}
        />
        <div className="pb-xl" />
      </section>

      {/* Variant 3: Personalization */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">03</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">OptiTech Personalization</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            Hero + Tabs body + Image closing. Editorial tabs for deeper product exploration with a visual closing moment.
          </p>
        </div>
        <CampaignPage
          heroSection={CAMPAIGN_HERO_PERSONALIZATION}
          bodySection={CAMPAIGN_BODY_PERSONALIZATION}
          closingSection={CAMPAIGN_CLOSING_PERSONALIZATION}
        />
        <div className="pb-xl" />
      </section>
    </>
  )
}

// ─── Folder page showcase ───────────────────────────────────────────────────

function FolderPageShowcase() {
  return (
    <section className="px-md pt-xl pb-xl lg:px-lg">
      <SectionLabel index="Pages · OT_FolderPage" title="Folder Page" />
      <p className="text-body leading-body text-fg-muted max-w-[65ch]">
        Folder pages are structural navigation containers in the content hierarchy. They appear in the CMS as parent nodes for groups of blog articles or section collections, and render in the URL path without displaying UI of their own.
      </p>
      <div className="mt-lg bg-surface border border-fg/10 px-lg py-xl">
        <p className="text-label tracking-label uppercase text-brand font-semibold mb-sm">CMS key</p>
        <code className="font-mono text-title text-fg">OT_FolderPage</code>
        <p className="text-body text-fg-muted mt-md max-w-[50ch]">
          No visual output. In the URL tree, a folder page at <code className="font-mono text-fg">/blog</code> acts as the article root — all child blog posts resolve under it. The catch-all route skips rendering and passes folder pages transparently to their children.
        </p>
      </div>
    </section>
  )
}

// ─── Page component ─────────────────────────────────────────────────────────

type Props = { params: Promise<{ page: string }> }

export default async function ShowcasePageTypePage({ params }: Props) {
  const { page } = await params

  switch (page) {
    case 'blog':          return <BlogPageShowcase />
    case 'folder':        return <FolderPageShowcase />
    case 'campaign-page': return <CampaignPageShowcase />
    default:              return notFound()
  }
}
