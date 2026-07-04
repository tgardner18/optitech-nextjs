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
  return { title: `${label} — Pages — Showcase — Site Accelerator` }
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_AUTHOR = {
  name:  'Nadia Okafor',
  role:  'Staff Platform Engineer',
  photo: { url: { default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=faces' } },
  bio:   { html: '<p>Nadia leads platform reliability at Acme, specialising in resilient systems and fast, dependable delivery. She speaks at industry conferences and writes about systems design on her personal blog.</p>' },
  linkedIn: 'https://linkedin.com',
  twitter:  'https://x.com',
}

const MOCK_BASE = {
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

const MOCK_LATEST = [
  { _metadata: { key: 'sc-blog-1', published: '2026-05-10T08:00:00Z', url: { default: '/blog/future-of-personalization' } }, headline: 'The Future of Personalization: How AI Is Reshaping Customer Experiences', topic: 'innovation', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop' } }, authorRef: { name: 'Marcus Webb' }, readTime: '5 min read' },
  { _metadata: { key: 'sc-blog-2', published: '2026-05-06T10:30:00Z', url: { default: '/blog/zero-downtime-deployments' } }, headline: 'Why Continuous Improvement Is the Foundation of Modern Teams', topic: 'product', featuredImage: { url: { default: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop' } }, authorRef: { name: 'Priya Nair' }, readTime: '6 min read' },
  { _metadata: { key: 'sc-blog-3', published: '2026-04-28T14:00:00Z', url: { default: '/blog/observability-trends-2026' } }, headline: 'Measurement in 2026: Five Trends Redefining How Teams Track What Works', topic: 'trends', featuredImage: undefined, authorRef: { name: 'James Okonkwo' }, readTime: '4 min read' },
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
            <code className="font-mono text-accent">blogStyle: impact</code> — poster-format header at display scale with the layered 3D extrude from the PrimaryText depth effect. Suited to announcements and flagship engineering posts.
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
    <p>Three days inside the work that makes great digital experiences possible. Acme Velocity brings together the people building the platform with the teams creating on top of it.</p>
    <p>The conference runs three tracks across two stages, with hands-on labs each afternoon. Every session is recorded, but the workshops, the hallway conversations, and the late-night debates only happen in the room.</p>
    <h2>What you will leave with</h2>
    <p>A clear picture of how the platform works, a set of practical ideas you can apply the following Monday, and a direct line to the people who build the product you depend on.</p>
    <p>Seats in the afternoon labs are capped at thirty. Register early to reserve your track.</p>
  `,
}

const MOCK_EVENT_CONFERENCE = {
  _metadata: {
    key:       'showcase-event-conference',
    published: '2026-05-01T09:00:00Z',
    url:       { default: '/events/acme-velocity-2026' },
  },
  title:       'Acme Velocity 2026: The Digital Experience Conference',
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
  agenda: [
    { time: '9:00 AM – 9:45 AM',   title: 'Keynote: The Experience Decade',         description: 'Where digital experience is heading, and why the next challenge is organisational, not technical.', speaker: 'Nadia Okafor' },
    { time: '10:00 AM – 11:30 AM', title: 'Lab: Delivering Fast, Everywhere',        description: 'Hands-on session building experiences that stay quick for audiences around the world.',              speaker: 'Marcus Webb' },
    { time: '1:00 PM – 1:45 PM',   title: 'Targeting Made Simple',                  description: 'A practical walk through reaching the right audience without the guesswork.',                       speaker: 'Priya Nair' },
    { time: '2:00 PM – 3:00 PM',   title: 'Panel: Quality at Scale',                description: 'Three platform leads on testing, safe launches, and the lessons that taught them the most.' },
  ],
  speakers: [
    { name: 'Nadia Okafor', title: 'Staff Platform Engineer', organization: 'Acme',     bio: 'Leads platform reliability, specialising in resilient systems and fast, dependable delivery.', headshot: { url: { default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fit=crop&crop=faces' } }, profileUrl: { default: 'https://example.com/speakers/nadia' } },
    { name: 'Marcus Webb',  title: 'Principal Engineer',     organization: 'Acme',     bio: 'Works on the systems that keep every experience quick and reliable for audiences worldwide.',        headshot: { url: { default: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop&crop=faces' } }, profileUrl: { default: 'https://example.com/speakers/marcus' } },
    { name: 'Priya Nair',   title: 'Product Engineer',       organization: 'Acme',     bio: 'Builds the tools that make reaching the right audience simple for everyone on the team.' },
  ],
}

const MOCK_EVENT_WEBINAR = {
  _metadata: {
    key:       'showcase-event-webinar',
    published: '2026-05-20T09:00:00Z',
    url:       { default: '/events/targeting-rules-deep-dive' },
  },
  title:       'Targeting Made Simple: A Deep Dive for Marketing Teams',
  eventType:   'webinar',
  description: {
    html: `
      <p>How the platform makes reaching the right audience simple, and what that means for the campaigns you run every day.</p>
      <p>A 45-minute session followed by live Q&amp;A. Bring your trickiest targeting questions.</p>
      <h2>Who should attend</h2>
      <p>Marketers and content teams responsible for reaching the right people, and anyone who has ever watched a campaign reach an audience they did not expect.</p>
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
            A multi-day in-person conference. The featured image bleeds into a full-height header with a brand-tinted scrim; the type badge and title anchor to the lower edge. Multi-day dates, venue, city, and CPE credit fill the facts rail. Below the description, the optional Agenda timeline and Speakers grid render from their sub-component arrays.
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
