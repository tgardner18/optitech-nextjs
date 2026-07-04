import type { BlogPageContent, BlogPostSummary } from '@/lib/blog'
import PrimaryTextDepth3D from '@/components/blocks/PrimaryTextDepth3D.client'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogStyle = 'impact' | 'atmospheric' | 'editorial'

// ─── Config ───────────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  news:       'News',
  insights:   'Insights',
  leadership: 'Leadership',
  stories:    'Stories',
  innovation: 'Innovation',
  culture:    'Culture',
  events:     'Events',
  resources:  'Resources',
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
        className={`block w-6 h-px flex-none ${onBrand ? 'bg-fg-on-brand/40' : 'bg-accent-ground'}`}
        aria-hidden
      />
      <span className={`text-label uppercase tracking-label font-semibold ${onBrand ? 'text-fg-on-brand/80' : 'text-accent-ground'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── TopicPill — filled accent badge (editorial + atmospheric headers) ────────
// Accent fill + fg-on-accent text. Used wherever the label sits over an image or
// busy surface, where accent-as-text would be hard to read.

function TopicPill({ topic, brandLabel = false }: { topic: string; brandLabel?: boolean }) {
  const label = TOPIC_LABELS[topic] ?? topic
  return (
    <span className={`inline-flex items-center px-sm py-0.75 bg-accent text-label uppercase tracking-label font-semibold ${brandLabel ? 'text-brand' : 'text-fg-on-accent'}`}>
      {label}
    </span>
  )
}

// ─── TopicTag — small dot + label (post cards) ────────────────────────────────

function TopicTag({ topic }: { topic: string }) {
  const label = TOPIC_LABELS[topic] ?? topic
  return (
    <div className="inline-flex items-center gap-xs">
      <span className="block w-1.5 h-1.5 bg-accent-ground flex-none" aria-hidden />
      <span className="text-label uppercase tracking-label text-accent-ground font-semibold">{label}</span>
    </div>
  )
}

// ─── BlogCard ─────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPostSummary }) {
  const imageUrl   = post.featuredImage?.url?.default
  const postUrl    = post._metadata?.url?.default ?? '#'
  const published  = post._metadata?.published
  const topic      = post.topic
  const authorName = post.authorRef?.name

  return (
    <a href={postUrl} className="group block card-hover-lift bg-canvas border border-fg/8">
      <div className="aspect-video overflow-hidden bg-surface">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.headline}
            className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand/20 to-canvas" />
        )}
      </div>
      <div className="px-md pt-md pb-lg">
        {topic && (
          <div className="mb-sm">
            <TopicTag topic={topic} />
          </div>
        )}
        <h3 className="text-title leading-title font-semibold text-fg text-balance line-clamp-3">
          {post.headline}
        </h3>
        <div className="mt-sm flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
          {authorName && <span>{authorName}</span>}
          {authorName && published && <span aria-hidden>·</span>}
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
  authorName?:     string
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
// Canvas "cover statement" — the poster register. An oversized primary-font
// (--ot-font-sans via font-sans) display headline runs the full header width and
// carries the same layered 3D extrude as the PrimaryText block's "3D Depth"
// effect: PrimaryTextDepth3D renders real stacked DOM layers (.ot-extrude3d) —
// a bright face over evenly-stepped receding duplicates, each with a ridge
// outline stroke. Token-derived, theme-aware (light mode gets the 3D-sticker
// look), fully static so it is reduced-motion safe by construction. Behind it,
// a chromatic bloom (brand + accent radial light anchored to the edges, so the
// centre stays legible) gives the canvas depth. The extrusion is what separates
// this register from the Editorial masthead — same content, unmistakably
// different voice.

function ImpactHeader({
  headline, subHeadline, topic,
  authorName, authorRole, authorPhotoUrl, published, readTime, initials,
  pa,
}: HeaderProps) {
  return (
    <header className="relative overflow-hidden bg-canvas">
      {/* Chromatic bloom — brand + accent radial light anchored to opposite edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(62% 85% at 10% -8%, oklch(from var(--ot-brand) l c h / 0.34) 0%, transparent 58%), ' +
            'radial-gradient(58% 82% at 96% 110%, oklch(from var(--ot-accent) l c h / 0.28) 0%, transparent 58%)',
        }}
      />

      <div className="relative px-md lg:px-xl pt-lg lg:pt-xl pb-xl">
        {topic && (
          <div className="mb-md motion-safe:animate-fade-in" {...pa?.('topic')}>
            <TopicMark topic={topic} />
          </div>
        )}

        {/* extrude3d-compact: shallower layer fan + the 1.16 leading give the
            receding layers room between wrapped lines — the full-depth fan is
            sized for PrimaryText's single-line statements */}
        <h1
          className="extrude3d-compact font-extrabold text-[clamp(2.75rem,8vw,7rem)] leading-[1.16] tracking-[-0.03em] motion-safe:animate-slide-up"
          style={{ animationDelay: '60ms' }}
          {...pa?.('headline')}
        >
          <PrimaryTextDepth3D text={headline} />
        </h1>

        {subHeadline && (
          <p
            className="mt-xl text-title leading-title text-fg-muted max-w-(--ot-measure) text-pretty motion-safe:animate-slide-up"
            style={{ animationDelay: '140ms' }}
            {...pa?.('subHeadline')}
          >
            {subHeadline}
          </p>
        )}

        {(authorName || published || readTime) && (
          <div className="mt-xl">
            <div className="flex items-center gap-md flex-wrap" {...pa?.('authorRef')}>
              {authorName && (
                <div className="flex-none w-9 h-9 overflow-hidden bg-surface flex items-center justify-center">
                  {authorPhotoUrl ? (
                    <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" />
                  ) : initials ? (
                    <span className="text-label font-semibold text-fg-muted">{initials}</span>
                  ) : (
                    <div className="w-full h-full bg-fg/5" aria-hidden />
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
                {authorName && <span className="text-fg font-semibold">{authorName}</span>}
                {authorName && authorRole && <><span aria-hidden>·</span><span>{authorRole}</span></>}
                {published && <><span aria-hidden>·</span><time dateTime={published}>{formatDate(published)}</time></>}
                {readTime && <><span aria-hidden>·</span><span {...pa?.('readTime')}>{readTime}</span></>}
              </div>
            </div>
          </div>
        )}
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
  authorName, authorRole, authorPhotoUrl, published, readTime, initials,
  imageUrl, videoUrl,
  pa,
}: HeaderProps) {
  const hasMedia = videoUrl || imageUrl

  return (
    <header
      data-theme="dark"
      className="relative overflow-hidden flex flex-col justify-end min-h-[clamp(350px,55vh,600px)] lg:min-h-[clamp(450px,68vh,700px)]"
      style={{ backgroundColor: 'oklch(38% 0.16 195)' }}
    >
      {/* Hardcoded brand-hover base — ensures a recognisable branded background
          when the featured image fails to load (e.g. in CMS preview before the
          draft content is fully indexed) or when no media is set. The image
          overlays and covers this colour when it loads successfully. */}
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
      ) : null}

      {/* Glass content panel */}
      <div className="relative z-10 px-md lg:px-xl pb-xl">
        <div className="mx-auto max-w-4xl">
          <div className="bg-glass px-lg py-lg lg:px-xl lg:py-xl">
            {topic && (
              <div className="mb-md" {...pa?.('topic')}>
                {/* Filled accent pill — over the featured image the accent-as-text
                    TopicMark is hard to read, so use the accent background with the
                    assigned fg-on-accent text for guaranteed contrast. */}
                <TopicPill topic={topic} />
              </div>
            )}

            <h1 className="text-headline leading-headline tracking-headline text-fg text-balance" {...pa?.('headline')}>
              {headline}
            </h1>

            {subHeadline && (
              <p className="mt-sm text-title leading-title text-fg-muted text-pretty max-w-(--ot-measure-tight)" {...pa?.('subHeadline')}>
                {subHeadline}
              </p>
            )}

            {(authorName || published || readTime) && (
              <div className="mt-lg pt-lg border-t border-fg/8 flex items-center gap-md flex-wrap" {...pa?.('authorRef')}>
                {authorName && (
                  <div className="flex-none w-8 h-8 overflow-hidden bg-surface flex items-center justify-center">
                    {authorPhotoUrl ? (
                      <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" />
                    ) : initials ? (
                      <span className="text-label font-semibold text-fg-muted">{initials}</span>
                    ) : (
                      <div className="w-full h-full bg-fg/5" aria-hidden />
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-sm gap-y-xs text-label text-fg-muted">
                  {authorName && <span className="text-fg font-semibold">{authorName}</span>}
                  {authorName && authorRole && <><span aria-hidden>·</span><span>{authorRole}</span></>}
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
// Surface-grounded masthead. A mono folio line carries topic + dateline across
// the full width; the headline runs wide at a restrained display scale; the
// standfirst and byline share the bottom rule side by side so the panel uses its
// width instead of stacking tall. A brand-hued bottom shadow separates the
// surface panel from the canvas body below.

function EditorialHeader({
  headline, subHeadline, topic,
  authorName, authorRole, authorPhotoUrl, published, readTime, initials,
  pa,
}: HeaderProps) {
  const hasByline = authorName || authorRole

  return (
    <header className="relative bg-surface text-fg shadow-[0_4px_16px_var(--ot-bloom-brand-faint)]">
      <div className="px-md lg:px-xl pt-lg lg:pt-xl pb-lg">

        {/* Folio line: topic mark + mono dateline, masthead-style */}
        {(topic || published || readTime) && (
          <div className="flex flex-wrap items-center justify-between gap-md pb-md motion-safe:animate-fade-in">
            {topic ? (
              <div {...pa?.('topic')}>
                <TopicPill topic={topic} brandLabel />
              </div>
            ) : (
              <span />
            )}
            {(published || readTime) && (
              <div className="flex items-center gap-sm font-mono text-label uppercase tracking-label text-fg-muted">
                {published && <time dateTime={published}>{formatDate(published)}</time>}
                {published && readTime && <span aria-hidden>·</span>}
                {readTime && <span {...pa?.('readTime')}>{readTime}</span>}
              </div>
            )}
          </div>
        )}

        {/* Headline — wide and restrained-display, runs the full column width */}
        <h1
          className="text-[clamp(2rem,4.4vw,3.5rem)] leading-headline tracking-headline font-extrabold text-fg text-balance motion-safe:animate-slide-up"
          style={{ animationDelay: '60ms' }}
          {...pa?.('headline')}
        >
          {headline}
        </h1>

        {/* Standfirst + byline share the bottom rule, side by side on desktop */}
        {(subHeadline || hasByline) && (
          <div
            className="mt-lg lg:mt-xl pt-lg border-t border-fg/10 flex flex-col gap-lg lg:flex-row lg:items-end lg:justify-between motion-safe:animate-slide-up"
            style={{ animationDelay: '140ms' }}
          >
            {subHeadline ? (
              <p
                className="text-title leading-title font-normal text-fg-muted text-pretty max-w-(--ot-measure-tight) lg:flex-1"
                {...pa?.('subHeadline')}
              >
                {subHeadline}
              </p>
            ) : (
              <span className="hidden lg:block lg:flex-1" />
            )}

            {hasByline && (
              <div className="flex items-center gap-md flex-none" {...pa?.('authorRef')}>
                {authorName && (
                  <div className="flex-none w-11 h-11 overflow-hidden bg-canvas flex items-center justify-center">
                    {authorPhotoUrl ? (
                      <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" />
                    ) : initials ? (
                      <span className="text-label font-semibold text-fg-muted">{initials}</span>
                    ) : (
                      <div className="w-full h-full bg-fg/5" aria-hidden />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  {authorName && (
                    <p className="text-title leading-title font-semibold text-fg">{authorName}</p>
                  )}
                  {authorRole && (
                    <p className="text-label uppercase tracking-label font-semibold text-fg-muted">{authorRole}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
    authorRef, readTime,
    body, featuredImage, featuredVideo, _metadata,
  } = content

  const blogStyle: BlogStyle = VALID_STYLES.includes(content.blogStyle as BlogStyle)
    ? (content.blogStyle as BlogStyle)
    : 'editorial'

  const published      = _metadata?.published
  const videoUrl       = featuredVideo?.url?.default
  const imageUrl       = featuredImage?.url?.default
  const mediaType      = videoUrl ? 'video' : imageUrl ? 'image' : null
  const authorName     = authorRef?.name
  const authorRole     = authorRef?.role
  const authorPhotoUrl = authorRef?.photo?.url?.default || null
  const initials       = authorName ? authorInitials(authorName) : ''

  const headerProps: HeaderProps = {
    headline, subHeadline, topic,
    authorName, authorRole, authorPhotoUrl, published, readTime,
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
      {/* Impact: full-bleed cinematic band. The header's canvas dissolves into
          the top of the image via a gradient, so the poster header and the
          artwork read as one continuous surface — the register break from
          editorial's contained panel. A 2px accent seam closes the band.
          Token-driven: the blend uses the canvas color, so it adapts to light
          mode and CMS theme overrides. The blend is shallower over video to
          keep the frame unobscured. */}
      {showMedia && blogStyle === 'impact' ? (
        <div className="relative bg-canvas">
          <div className="relative w-full h-[clamp(340px,56vh,640px)] overflow-hidden">
            {mediaType === 'video' ? (
              <video
                src={videoUrl!}
                controls
                className="absolute inset-0 w-full h-full object-cover"
                {...pa?.('featuredVideo')}
              />
            ) : (
              <img
                src={imageUrl!}
                alt={headline}
                className="absolute inset-0 w-full h-full object-cover"
                {...pa?.('featuredImage')}
              />
            )}
            {/* top blend — header canvas dissolves into the artwork */}
            <div
              aria-hidden
              className={`absolute inset-x-0 top-0 bg-linear-to-b from-canvas via-canvas/55 to-transparent pointer-events-none ${
                mediaType === 'video' ? 'h-1/5' : 'h-2/5'
              }`}
            />
            {/* bottom accent seam */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-accent/80 pointer-events-none" />
          </div>
        </div>
      ) : showMedia ? (
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
      ) : null}

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

      {/* ── Author bio ───────────────────────────────────────────────────── */}
      {authorRef?.name && (
        <>
          {/* 3px brand bar replaces the thin separator — stronger material boundary */}
          <section
            className="relative bg-brand/10 border-t-[3px] border-brand py-xl overflow-hidden"
            aria-label="About the author"
          >
            {/* Radial bloom anchored to the photo column position */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden
              style={{
                background: 'radial-gradient(ellipse 400px 340px at 80px 55%, oklch(from var(--ot-brand) l c h / 0.15) 0%, transparent 68%)',
              }}
            />

            <div className="relative mx-auto max-w-5xl px-md">
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-lg lg:gap-xl items-start">

                {/* ── Left column: photo + social ──────────────────── */}
                <div className="flex flex-col items-start gap-md">

                  {/* Photo — 128px with chromatic bloom ring */}
                  <div
                    className="w-32 h-32 overflow-hidden bg-canvas flex-none"
                    style={{
                      boxShadow: '0 16px 48px var(--ot-bloom-brand-faint)',
                    }}
                    {...pa?.('authorRef')}
                  >
                    {authorPhotoUrl ? (
                      <img
                        src={authorPhotoUrl}
                        alt={authorName ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : initials ? (
                      <div className="w-full h-full bg-brand/20 flex items-center justify-center">
                        <span
                          className="font-display text-[2rem] font-bold text-brand select-none"
                          style={{ fontVariationSettings: "'wght' 500" }}
                        >
                          {initials}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-fg/5" aria-hidden />
                    )}
                  </div>

                  {/* Social links — desktop: stacked under photo */}
                  {(authorRef.linkedIn || authorRef.twitter) && (
                    <div className="hidden sm:flex flex-col gap-sm">
                      {authorRef.linkedIn && (
                        <a
                          href={authorRef.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-xs text-[13px] font-medium text-fg-muted hover:text-brand transition-colors duration-150 ease-quick"
                        >
                          LinkedIn
                          <span
                            aria-hidden
                            className="accent-ink motion-safe:transition-transform duration-150 ease-quick group-hover:translate-x-0.75"
                          >
                            ↗
                          </span>
                        </a>
                      )}
                      {authorRef.twitter && (
                        <a
                          href={authorRef.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-xs text-[13px] font-medium text-fg-muted hover:text-brand transition-colors duration-150 ease-quick"
                        >
                          X / Twitter
                          <span
                            aria-hidden
                            className="accent-ink motion-safe:transition-transform duration-150 ease-quick group-hover:translate-x-0.75"
                          >
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Right column: identity + bio ─────────────────── */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-brand/70 mb-xs">
                    Written by
                  </p>
                  <p className="text-headline leading-headline font-bold text-fg tracking-headline">
                    {authorName}
                  </p>
                  {authorRole && (
                    <p className="text-label uppercase tracking-label font-semibold accent-ink mt-xs">
                      {authorRole}
                    </p>
                  )}

                  {authorRef.bio?.html && (
                    <div
                      className="accent-ink-prose mt-md text-body leading-body text-fg max-w-(--ot-measure-tight) [&_p]:m-0 [&_p+p]:mt-[0.75em] [&_strong]:font-semibold [&_strong]:text-fg"
                      dangerouslySetInnerHTML={{ __html: authorRef.bio.html }}
                    />
                  )}

                  {/* Social links — mobile only (desktop shows in left column) */}
                  {(authorRef.linkedIn || authorRef.twitter) && (
                    <div className="mt-md sm:hidden flex items-center gap-md">
                      {authorRef.linkedIn && (
                        <a
                          href={authorRef.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-xs text-[13px] font-medium text-fg-muted hover:text-brand transition-colors duration-150 ease-quick"
                        >
                          LinkedIn
                          <span aria-hidden className="accent-ink group-hover:translate-x-0.75 motion-safe:transition-transform duration-150 ease-quick">↗</span>
                        </a>
                      )}
                      {authorRef.twitter && (
                        <a
                          href={authorRef.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-xs text-[13px] font-medium text-fg-muted hover:text-brand transition-colors duration-150 ease-quick"
                        >
                          X / Twitter
                          <span aria-hidden className="accent-ink group-hover:translate-x-0.75 motion-safe:transition-transform duration-150 ease-quick">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        </>
      )}

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
