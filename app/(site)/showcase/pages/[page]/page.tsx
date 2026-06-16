import type { Metadata }       from 'next'
import { notFound }             from 'next/navigation'
import { SectionLabel }         from '../../components'
import BlogPage from '@/components/pages/BlogPage'
import EventPage from '@/components/pages/EventPage'

// ─── Static params ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return [{ page: 'blog' }, { page: 'event' }, { page: 'folder' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const labels: Record<string, string> = {
    blog:   'Blog Page',
    event:  'Event Page',
    folder: 'Folder Page',
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

// ─── Event page showcase ────────────────────────────────────────────────────

const MOCK_EVENT_DESCRIPTION = {
  html: `
    <p>Three days inside the systems that make sub-millisecond feature delivery possible. OptiTech Velocity brings together the engineers building the evaluation hot path with the teams shipping on top of it.</p>
    <p>The conference runs three tracks across two stages, with hands-on labs each afternoon. Every session is recorded, but the workshops, the hallway track, and the late-night architecture debates only happen in the room.</p>
    <h2>What you will leave with</h2>
    <p>A working mental model of edge-distributed flag state, a set of targeting patterns you can apply the following Monday, and a direct line to the people who maintain the SDK you depend on.</p>
    <p>Seats in the afternoon labs are capped at thirty. Register early to reserve your track.</p>
  `,
}

const MOCK_EVENT_CONFERENCE = {
  _metadata: {
    key:       'showcase-event-conference',
    published: '2026-05-01T09:00:00Z',
    url:       { default: '/events/optitech-velocity-2026' },
  },
  title:       'OptiTech Velocity 2026: The Delivery Systems Conference',
  eventType:   'conference',
  description: MOCK_EVENT_DESCRIPTION,
  featuredImage: { url: { default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&fit=crop' } },
  startDate:   '2026-09-15T09:00:00Z',
  endDate:     '2026-09-17T17:00:00Z',
  locationType: 'inPerson',
  venueName:   'Pier 27 Conference Center',
  city:        'San Francisco, CA',
  creditType:  'CPE',
  creditHours: 18,
  registrationUrl: { default: 'https://example.com/register' },
}

const MOCK_EVENT_WEBINAR = {
  _metadata: {
    key:       'showcase-event-webinar',
    published: '2026-05-20T09:00:00Z',
    url:       { default: '/events/targeting-rules-deep-dive' },
  },
  title:       'Targeting Rules, Compiled: A Deep Dive for Platform Teams',
  eventType:   'webinar',
  description: {
    html: `
      <p>How OptiTech turns human-readable targeting rules into a compact decision tree that the evaluation engine walks in a single pass, and what that means for the rules you write.</p>
      <p>A 45-minute technical session followed by live Q&amp;A. Bring your gnarliest targeting edge cases.</p>
      <h2>Who should attend</h2>
      <p>Platform and infrastructure engineers responsible for feature delivery, and anyone who has ever watched a targeting rule behave in a way they did not expect.</p>
    `,
  },
  startDate:   '2026-07-08T17:00:00Z',
  endDate:     '2026-07-08T18:00:00Z',
  locationType: 'virtual',
  venueName:   'Zoom Webinar',
  registrationUrl: { default: 'https://example.com/register' },
}

function EventPageShowcase() {
  return (
    <>
      <section className="px-md pt-xl pb-lg lg:px-lg">
        <SectionLabel index="Pages · OT_EventPage" title="Event Page" />
        <p className="text-body leading-body text-fg-muted max-w-[65ch]">
          The event detail page type, served URL-addressably through the catch-all slug route. A single rich-text Description carries the page: its opening paragraph renders as the editorial lead-in, the remainder as the article body. The facts rail (date, time, location, credit) and registration CTA stay pinned alongside, and the header adapts to whether a featured image is set.
        </p>
      </section>

      {/* With featured image — multi-day, in-person, credit */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">01</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">Featured image header</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            A multi-day in-person conference. The featured image bleeds into a full-height header with a brand-tinted scrim; the type badge and title anchor to the lower edge. Multi-day dates, venue, city, and CPE credit fill the facts rail.
          </p>
        </div>
        <EventPage content={MOCK_EVENT_CONFERENCE as unknown as Parameters<typeof EventPage>[0]['content']} />
        <div className="pb-xl" />
      </section>

      {/* No image — virtual, single-session */}
      <section className="pt-xl border-t border-fg/5">
        <div className="px-md lg:px-lg pb-lg">
          <p className="text-label tracking-label uppercase text-brand font-semibold mb-xs">02</p>
          <h3 className="text-title font-semibold leading-title tracking-title text-fg">Brand-rule header (no image)</h3>
          <p className="text-body text-fg-muted mt-sm max-w-[60ch]">
            A single-session virtual webinar with no featured image. The header falls back to a brand rule over canvas; the location fact swaps to the virtual (video) treatment and the credit row drops out entirely.
          </p>
        </div>
        <EventPage content={MOCK_EVENT_WEBINAR as unknown as Parameters<typeof EventPage>[0]['content']} />
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
    case 'blog':   return <BlogPageShowcase />
    case 'event':  return <EventPageShowcase />
    case 'folder': return <FolderPageShowcase />
    default:       return notFound()
  }
}
