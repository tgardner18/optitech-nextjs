import type { BlogPageContent, BlogPostSummary } from '@/lib/blog'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogStyle = 'impact' | 'atmospheric' | 'editorial'

// ─── Config ───────────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  innovation: 'Innovation',
  engineering: 'Engineering',
  product:     'Product',
  trends:      'Trends',
  community:   'Community',
}

const TOPIC_INDEX: Record<string, string> = {
  innovation: '01',
  engineering: '02',
  product:    '03',
  trends:     '04',
  community:  '05',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch { return '' }
}

function authorInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── TopicMark — horizontal rule + label (atmospheric glass panel) ────────────

function TopicMark({ topic, onBrand = false }: { topic: string; onBrand?: boolean }) {
  const label = TOPIC_LABELS[topic] ?? topic
  return (
    <div className="inline-flex items-center gap-sm">
      <span
        className={`block w-6 h-px flex-none ${onBrand ? 'bg-fg-on-brand/40' : 'bg-accent'}`}
        aria-hidden
      />
      <span className={`text-label uppercase tracking-label font-semibold ${onBrand ? 'text-fg-on-brand/70' : 'text-accent'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── TopicPill — filled accent badge (editorial header) ───────────────────────

function TopicPill({ topic }: { topic: string }) {
  const label = TOPIC_LABELS[topic] ?? topic
  return (
    <span className="inline-flex items-center px-sm py-[3px] rounded-[4px] bg-accent text-fg-on-accent text-label uppercase tracking-label font-semibold">
      {label}
    </span>
  )
}

// ─── TopicTag — small dot + label (post cards) ────────────────────────────────

function TopicTag({ topic }: { topic: string }) {
  const label = TOPIC_LABELS[topic] ?? topic
  return (
    <div className="inline-flex items-center gap-xs">
      <span className="block w-1.5 h-1.5 bg-accent flex-none" aria-hidden />
      <span className="text-label uppercase tracking-label text-accent font-semibold">{label}</span>
    </div>
  )
}

// ─── BlogCard ─────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPostSummary }) {
  const imageUrl  = post.featuredImage?.url?.default
  const postUrl   = post._metadata?.url?.default ?? '#'
  const published = post._metadata?.published
  const topic     = post.topic

  return (
    <a href={postUrl} className="group block card-hover-lift bg-canvas border border-fg/[0.08]">
      <div className="aspect-video overflow-hidden bg-surface">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.headline}
            className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/20 to-canvas" />
        )}
      </div>
      <div className="px-md pt-md pb-lg">
        {topic && (
          <div className="mb-sm">
            <TopicTag topic={topic} />
          </div>
        )}
        <h3 className="text-title leading-title font-semibold text-fg [text-wrap:balance] line-clamp-3">
          {post.headline}
        </h3>
        <div className="mt-sm flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
          {post.author && <span>{post.author}</span>}
          {post.author && published && <span aria-hidden>·</span>}
          {published && <time dateTime={published}>{formatDate(published)}</time>}
          {post.readTime && <><span aria-hidden>·</span><span>{post.readTime}</span></>}
        </div>
      </div>
    </a>
  )
}

// ─── Shared header props ──────────────────────────────────────────────────────

type PreviewAttrs = (field: string) => Record<string, unknown>

type HeaderProps = {
  headline:        string
  subHeadline?:    string
  topic?:          string
  author?:         string
  authorRole?:     string
  authorPhotoUrl?: string | null
  published?:      string
  readTime?:       string
  initials:        string
  imageUrl?:       string | null
  videoUrl?:       string | null
  pa?:             PreviewAttrs
}

// ─── Impact Header ────────────────────────────────────────────────────────────
// Canvas background with horizontal ruled texture. Exaggerated hollow Syne
// display type with ambient brand glow. Ghost ordinal watermark in brand color.

function ImpactHeader({
  headline, subHeadline, topic,
  author, authorRole, authorPhotoUrl, published, readTime, initials,
  pa,
}: HeaderProps) {
  const topicIndex = topic ? (TOPIC_INDEX[topic] ?? '—') : null

  return (
    <header className="bg-canvas blog-impact-ruled-bg overflow-hidden">
      <div className="relative">
        {topicIndex && (
          <span
            aria-hidden
            className="blog-impact-index select-none pointer-events-none absolute -right-4 top-0 font-extrabold"
          >
            {topicIndex}
          </span>
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-md lg:px-xl pt-xl pb-xl">
          {topic && (
            <div className="mb-lg" {...pa?.('topic')}>
              <TopicMark topic={topic} />
            </div>
          )}

          <h1 className="blog-impact-hollow-text [text-wrap:balance] max-w-[12ch]" {...pa?.('headline')}>
            {headline}
          </h1>

          {subHeadline && (
            <p className="mt-lg text-title leading-title text-fg-muted max-w-[56ch] [text-wrap:pretty]" {...pa?.('subHeadline')}>
              {subHeadline}
            </p>
          )}

          {(author || published || readTime) && (
            <div className="mt-xl pt-lg border-t border-fg/[0.08]">
              <div className="flex items-center gap-md flex-wrap">
                {author && (
                  <div className="flex-none w-9 h-9 overflow-hidden bg-surface flex items-center justify-center">
                    {authorPhotoUrl ? (
                      <img src={authorPhotoUrl} alt={author} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-label font-semibold text-fg-muted">{initials}</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
                  {author && <span className="text-fg font-semibold" {...pa?.('author')}>{author}</span>}
                  {author && authorRole && <><span aria-hidden>·</span><span {...pa?.('authorRole')}>{authorRole}</span></>}
                  {published && <><span aria-hidden>·</span><time dateTime={published}>{formatDate(published)}</time></>}
                  {readTime && <><span aria-hidden>·</span><span {...pa?.('readTime')}>{readTime}</span></>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Atmospheric Header ───────────────────────────────────────────────────────
// Featured image or video fills the header. Heavy darkening gradient ensures
// the glass panel text is always readable. data-theme="dark" forces light text
// tokens regardless of the page-level theme, since the content sits over a dark
// overlay. When a video is provided it replaces the image as the background.

function AtmosphericHeader({
  headline, subHeadline, topic,
  author, authorRole, authorPhotoUrl, published, readTime, initials,
  imageUrl, videoUrl,
  pa,
}: HeaderProps) {
  const hasMedia = videoUrl || imageUrl

  return (
    <header
      data-theme="dark"
      className="relative bg-canvas overflow-hidden flex flex-col justify-end min-h-[68vh]"
    >
      {hasMedia ? (
        <>
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              {...pa?.('featuredVideo')}
            />
          ) : (
            <img
              src={imageUrl!}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              {...pa?.('featuredImage')}
            />
          )}
          <div className="blog-atmospheric-overlay absolute inset-0" />
        </>
      ) : (
        <div className="absolute inset-0 bg-brand" />
      )}

      {/* Glass content panel */}
      <div className="relative z-10 px-md lg:px-xl pb-xl">
        <div className="mx-auto max-w-4xl">
          <div className="bg-glass px-lg py-lg lg:px-xl lg:py-xl">
            {topic && (
              <div className="mb-md" {...pa?.('topic')}>
                <TopicMark topic={topic} />
              </div>
            )}

            <h1 className="text-headline leading-headline tracking-headline text-fg [text-wrap:balance]" {...pa?.('headline')}>
              {headline}
            </h1>

            {subHeadline && (
              <p className="mt-sm text-title leading-title text-fg-muted [text-wrap:pretty] max-w-[52ch]" {...pa?.('subHeadline')}>
                {subHeadline}
              </p>
            )}

            {(author || published || readTime) && (
              <div className="mt-lg pt-lg border-t border-fg/[0.08] flex items-center gap-md flex-wrap">
                {author && (
                  <div className="flex-none w-8 h-8 overflow-hidden bg-surface flex items-center justify-center">
                    {authorPhotoUrl ? (
                      <img src={authorPhotoUrl} alt={author} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-label font-semibold text-fg-muted">{initials}</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
                  {author && <span className="text-fg font-semibold" {...pa?.('author')}>{author}</span>}
                  {author && authorRole && <><span aria-hidden>·</span><span {...pa?.('authorRole')}>{authorRole}</span></>}
                  {published && <><span aria-hidden>·</span><time dateTime={published}>{formatDate(published)}</time></>}
                  {readTime && <><span aria-hidden>·</span><span {...pa?.('readTime')}>{readTime}</span></>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Editorial Header ─────────────────────────────────────────────────────────
// Split layout: headline fills the wide left column, topic pill and author
// stack in the right sidebar. Surface background with a 3px brand bar at top.

function EditorialHeader({
  headline, subHeadline, topic,
  author, authorRole, authorPhotoUrl, published, readTime, initials,
  pa,
}: HeaderProps) {
  return (
    <header className="bg-surface">
      <div className="h-[3px] bg-brand" />

      <div className="mx-auto max-w-6xl px-md lg:px-xl pt-xl pb-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-xl items-start">

          {/* Headline column */}
          <div>
            <h1 className="text-headline leading-headline tracking-headline text-fg [text-wrap:balance]" {...pa?.('headline')}>
              {headline}
            </h1>
            {subHeadline && (
              <p className="mt-md text-title leading-title text-fg-muted [text-wrap:pretty]" {...pa?.('subHeadline')}>
                {subHeadline}
              </p>
            )}
          </div>

          {/* Sidebar: topic pill + author stacked */}
          <div className="flex flex-col gap-lg lg:border-l lg:border-fg/[0.08] lg:pl-xl">
            {topic && (
              <div {...pa?.('topic')}>
                <TopicPill topic={topic} />
              </div>
            )}

            {(author || published || readTime) && (
              <div className="flex flex-col gap-sm">
                {author && (
                  <div className="flex items-center gap-sm">
                    <div className="flex-none w-8 h-8 bg-canvas overflow-hidden flex items-center justify-center">
                      {authorPhotoUrl ? (
                        <img src={authorPhotoUrl} alt={author} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-label font-semibold text-fg-muted">{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-label font-semibold text-fg leading-tight" {...pa?.('author')}>{author}</p>
                      {authorRole && <p className="text-label text-fg-muted" {...pa?.('authorRole')}>{authorRole}</p>}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-xs text-label text-fg-muted">
                  {published && <time dateTime={published}>{formatDate(published)}</time>}
                  {readTime && <span {...pa?.('readTime')}>{readTime}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────

type Props = {
  content:     BlogPageContent
  latestPosts: BlogPostSummary[]
  pa?:         PreviewAttrs
}

const VALID_STYLES: BlogStyle[] = ['impact', 'atmospheric', 'editorial']

export default function BlogPage({ content, latestPosts, pa }: Props) {
  const {
    headline, subHeadline, topic,
    author, authorRole, authorPhoto, readTime,
    body, featuredImage, featuredVideo, _metadata,
  } = content

  const blogStyle: BlogStyle = VALID_STYLES.includes(content.blogStyle as BlogStyle)
    ? (content.blogStyle as BlogStyle)
    : 'editorial'

  const published      = _metadata?.published
  const videoUrl       = featuredVideo?.url?.default
  const imageUrl       = featuredImage?.url?.default
  const mediaType      = videoUrl ? 'video' : imageUrl ? 'image' : null
  const authorPhotoUrl = authorPhoto?.url?.default
  const initials       = author ? authorInitials(author) : ''

  const headerProps: HeaderProps = {
    headline, subHeadline, topic,
    author, authorRole, authorPhotoUrl, published, readTime,
    initials, imageUrl, videoUrl,
    pa,
  }

  // Atmospheric embeds the featured media in the header — skip the zone below
  const showMedia  = mediaType !== null && blogStyle !== 'atmospheric'
  const bodyTopPad = showMedia ? 'pt-xl' : 'pt-2xl'

  return (
    <article>
      {blogStyle === 'impact'      && <ImpactHeader      {...headerProps} />}
      {blogStyle === 'atmospheric' && <AtmosphericHeader  {...headerProps} />}
      {blogStyle === 'editorial'   && <EditorialHeader    {...headerProps} />}

      {/* ── Featured media ───────────────────────────────────────────────── */}
      {showMedia && (
        <div className="bg-canvas pt-xl pb-0">
          <div className="mx-auto max-w-4xl px-md">
            {mediaType === 'video' ? (
              <video
                src={videoUrl!}
                controls
                className="w-full aspect-video object-cover shadow-[0_16px_48px_var(--ot-bloom-brand-faint)]"
                {...pa?.('featuredVideo')}
              />
            ) : (
              <img
                src={imageUrl!}
                alt={headline}
                className="w-full aspect-video object-cover shadow-[0_16px_48px_var(--ot-bloom-brand-faint)]"
                {...pa?.('featuredImage')}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Article body ─────────────────────────────────────────────────── */}
      <section className={`bg-canvas ${bodyTopPad} pb-2xl`}>
        <div
          data-rich-text=""
          data-color="canvas"
          data-scale={blogStyle === 'editorial' ? 'large' : undefined}
          className="mx-auto max-w-5xl px-md"
          {...pa?.('body')}
          // CMS-managed rich text — not user input
          dangerouslySetInnerHTML={{ __html: body?.html ?? '' }}
        />
      </section>

      {/* ── Latest posts ─────────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="bg-surface pt-xl pb-2xl">
          <div className="mx-auto max-w-5xl px-md">
            <p className="text-label uppercase tracking-label text-fg-muted mb-lg">
              More from the blog
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {latestPosts.map(post => (
                <BlogCard key={post._metadata.key} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
