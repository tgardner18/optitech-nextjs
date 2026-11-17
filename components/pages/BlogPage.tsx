import type { BlogPageContent, BlogPostSummary } from '@/lib/blog'
import CategoryChips from '@/components/taxonomy/CategoryChips'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'
import PrimaryTextFx from '@/components/blocks/PrimaryTextFx.client'
import BlogVideoBackdrop from './BlogVideoBackdrop.client'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { t } from '@/lib/i18n/t'

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

type PreviewAttrs = (field: string) => Record<string, unknown>

function Avatar({ name, photoUrl, initials, size }: { name?: string; photoUrl?: string | null; initials: string; size?: 'lg' }) {
  return (
    <span data-part="avatar" data-size={size} aria-hidden="true">
      {/* The name is printed beside the photo, so the photo is decorative */}
      {photoUrl ? <img src={photoUrl} alt="" /> : initials}
    </span>
  )
}

function ExtLink({ href, label, newTab }: { href: string; label: string; newTab: string }) {
  return (
    <a data-part="ext" href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <ExternalLink aria-hidden />
      <span className="sr-only"> ({newTab})</span>
    </a>
  )
}

function BlogCard({ post }: { post: BlogPostSummary }) {
  const imageUrl   = post.featuredImage?.url?.default
  const postUrl    = post._metadata?.url?.default ?? '#'
  const published  = post._metadata?.published
  const authorName = post.authorRef?.name
  return (
    <a href={postUrl} data-part="card">
      <span data-part="card-media">{imageUrl && <img src={imageUrl} alt="" />}</span>
      <span data-part="card-body">
        {post.topic && <span data-part="card-topic">{TOPIC_LABELS[post.topic] ?? post.topic}</span>}
        <span data-part="card-title">{post.headline}</span>
        <span data-part="card-meta">
          {[authorName, published && formatDate(published), post.readTime].filter(Boolean).join(' \u00b7 ')}
        </span>
      </span>
    </a>
  )
}

type Props = {
  content:     BlogPageContent
  latestPosts: BlogPostSummary[]
  pa?:         PreviewAttrs
  locale?:     string
  /** Where "back to all articles" goes: the nearest ancestor that is a real page (resolved by the route). */
  backUrl?:    string
}

const VALID_STYLES: BlogStyle[] = ['impact', 'atmospheric', 'editorial']

export default function BlogPage({ content, latestPosts, pa, locale = 'en', backUrl }: Props) {
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
  const topicLabel     = topic ? (TOPIC_LABELS[topic] ?? topic.replace(/^./, c => c.toUpperCase())) : null
  const newTab         = t(locale, 'a11y.externalLink').replace(/^./, c => c.toLowerCase())

  // The route resolves the nearest real ancestor page (folders don't render); without it, use the plain parent.
  const pageUrl  = _metadata?.url?.default ?? ''
  const indexUrl = backUrl ?? (pageUrl.replace(/\/[^/]+\/?$/, '') || '/')

  const hasMedia  = mediaType !== null
  const showFeature = hasMedia && blogStyle !== 'atmospheric'

  const back = (
    <a data-part="back" href={indexUrl}>
      <ArrowLeft aria-hidden />
      {t(locale, 'blog.backToIndex')}
    </a>
  )

  const byline = (authorName || published || readTime) && (
    <div data-part="byline" {...pa?.('authorRef')}>
      {authorName && <Avatar name={authorName} photoUrl={authorPhotoUrl} initials={initials} />}
      <div>
        {authorName && <p data-part="author">{authorName}</p>}
        <p data-part="meta">
          {[
            authorRole && <span key="r">{authorRole}</span>,
            published && <time key="p" dateTime={published}>{formatDate(published)}</time>,
            readTime && <span key="t" {...pa?.('readTime')}>{readTime}</span>,
          ].filter(Boolean).flatMap((el, i) => (i === 0 ? [el] : [<span key={`d${i}`} aria-hidden="true">{"\u00b7"}</span>, el]))}
        </p>
      </div>
    </div>
  )

  const topicEl = topicLabel && <p data-part="topic" {...pa?.('topic')}>{topicLabel}</p>
  const dek     = subHeadline && <p data-part="dek" {...pa?.('subHeadline')}>{subHeadline}</p>

  let header
  if (blogStyle === 'impact') {
    header = (
      <header data-part="masthead">
        <div data-part="mast-in">
          {back}
          {topicEl}
          {/* The Highlight effect from the Primary Text block: one marker stroke per rendered line */}
          <h1 data-part="title" {...pa?.('headline')}><span data-part="mark" suppressHydrationWarning>{headline}</span></h1>
          {dek}
          {byline}
        </div>
        <PrimaryTextFx effect="highlight" headline={headline} block="blog" />
      </header>
    )
  } else if (blogStyle === 'atmospheric') {
    header = (
      <header data-part="masthead" data-theme="dark" data-has-media={hasMedia ? '' : undefined}>
        {videoUrl ? (
          <BlogVideoBackdrop src={videoUrl} paEdit={pa?.('featuredVideo')} />
        ) : imageUrl ? (
          <img data-part="backdrop" src={imageUrl} alt="" {...pa?.('featuredImage')} />
        ) : null}
        <div data-part="mast-in">
          {back}
          <div data-part="panel">
            {topicEl}
            <h1 data-part="title" {...pa?.('headline')}>{headline}</h1>
            {dek}
            {byline}
          </div>
        </div>
      </header>
    )
  } else {
    header = (
      <header data-part="masthead">
        <div data-part="mast-in">
          {back}
          <div data-part="kicker">
            {topicEl}
            {(published || readTime) && (
              <p data-part="stamp">
                {published && <time dateTime={published}>{formatDate(published)}</time>}
                {published && readTime && <span aria-hidden="true">{"\u00b7"}</span>}
                {readTime && <span {...pa?.('readTime')}>{readTime}</span>}
              </p>
            )}
          </div>
          <h1 data-part="title" {...pa?.('headline')}>{headline}</h1>
          {(subHeadline || authorName) && (
            <div data-part="deck-row">
              {dek}
              {authorName && (
                <div data-part="byline" {...pa?.('authorRef')}>
                  <Avatar name={authorName} photoUrl={authorPhotoUrl} initials={initials} />
                  <div>
                    <p data-part="author">{authorName}</p>
                    {authorRole && <p data-part="meta"><span>{authorRole}</span></p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    )
  }

  return (
    <article
      data-block="blog"
      data-style={blogStyle}
      data-media={hasMedia ? '' : undefined}
      data-animate=""
    >
      {header}

      {/* ── Featured media (Atmospheric puts it in the header) ───────────── */}
      {showFeature && (
        <figure data-part="feature">
          {mediaType === 'video' ? (
            <video src={videoUrl!} controls {...pa?.('featuredVideo')} />
          ) : (
            // The title is printed right above, so the image is decorative unless the asset has its own alt text
            <img src={imageUrl!} alt={(featuredImage as { altText?: string } | undefined)?.altText ?? ''} {...pa?.('featuredImage')} />
          )}
        </figure>
      )}

      {/* ── Article body ─────────────────────────────────────────────────── */}
      <div
        data-part="body"
        data-scale={blogStyle === 'editorial' ? 'large' : undefined}
        {...pa?.('body')}
        // CMS-managed rich text — not user input
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(body?.html) }}
      />

      {/* ── Categories (CMS taxonomy) ────────────────────────────────────── */}
      {content.categories && content.categories.length > 0 && (
        <div data-part="categories">
          <CategoryChips categories={content.categories} locale={locale} hubUrl={content.topicHubUrl} fromKey={_metadata?.key} />
        </div>
      )}

      {/* ── Author ───────────────────────────────────────────────────────── */}
      {authorRef?.name && (
        <aside data-part="author-card" aria-labelledby="blog-author-name">
          <span {...pa?.('authorRef')}>
            <Avatar name={authorName} photoUrl={authorPhotoUrl} initials={initials} size="lg" />
          </span>
          <div>
            <p data-part="written">Written by</p>
            <h2 data-part="author-name" id="blog-author-name">{authorName}</h2>
            {authorRole && <p data-part="author-role">{authorRole}</p>}
            {authorRef.bio?.html && (
              <div data-part="bio" dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(authorRef.bio.html) }} />
            )}
            {(authorRef.linkedIn || authorRef.twitter) && (
              <p data-part="links">
                {authorRef.linkedIn && <ExtLink href={authorRef.linkedIn} label="LinkedIn" newTab={newTab} />}
                {authorRef.twitter && <ExtLink href={authorRef.twitter} label="X" newTab={newTab} />}
              </p>
            )}
          </div>
        </aside>
      )}

      {/* ── Latest posts ─────────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section data-part="more" aria-labelledby="blog-more">
          <div data-part="more-in">
            <h2 id="blog-more">More from the blog</h2>
            <ul data-part="cards" role="list">
              {latestPosts.map(post => (
                <li key={post._metadata.key}><BlogCard post={post} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
