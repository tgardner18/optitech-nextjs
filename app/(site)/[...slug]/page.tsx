import { cache }                from 'react'
import { notFound, redirect }  from 'next/navigation'
import { draftMode }           from 'next/headers'
import type { Metadata }       from 'next'
import {
  getClient,
  getLocalizedContentByPath,
  getRequestBaseUrl,
  getRequestDomain,
  getRequestLocale,
  getSiteSettings,
  setRequestContext,
} from '@/lib/optimizely'
import { getBlogPage, getLatestBlogPosts, getAuthorName } from '@/lib/blog'
import { withAppContext }       from '@optimizely/cms-sdk/react/server'
import { PreviewComponent }    from '@optimizely/cms-sdk/react/client'
import type { PreviewParams }  from '@optimizely/cms-sdk'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import BlogPage                from '@/components/pages/BlogPage'
import Script                  from 'next/script'
import { DraftStateBanner }    from '@/components/preview/DraftStateBanner'
import { ExternalPreviewLinkPanel } from '@/components/preview/ExternalPreviewLinkPanel'
import { buildPageMetadata, type PageSeoFields } from '@/lib/metadata'
import { buildJsonLd }         from '@/lib/structured-data'
import JsonLd                  from '@/components/seo/JsonLd'
import type { Locale }         from '@/lib/i18n/config'

type Props = {
  params:       Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ── Per-request content cache ─────────────────────────────────────────────────
//
// React cache() deduplicates calls with the same arguments within one React
// render tree. generateMetadata and CmsPage both call this for the same path,
// locale, and baseUrl — the second call is a no-op (same cached result).
const fetchPageContent = cache(async (path: string, locale: Locale, baseUrl: string) =>
  getLocalizedContentByPath(path, locale, baseUrl),
)

// Resolves an absolute or relative URL string to just the pathname.
function toPathname(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    return raw.startsWith('http') ? new URL(raw).pathname : raw
  } catch {
    return raw.startsWith('/') ? raw : null
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug }   = await params
  const path       = '/' + slug.join('/')
  const locale     = await getRequestLocale()
  const domain     = await getRequestDomain()
  const baseUrl    = await getRequestBaseUrl()

  const [exp, settings] = await Promise.all([
    fetchPageContent(path, locale, baseUrl),
    getSiteSettings(domain, locale),
  ])

  // Blog page — fetch the full content record (includes SEO fields)
  if (exp?.__typename === 'OT_BlogPage' && exp?._metadata?.key) {
    const blogContent = await getBlogPage(exp._metadata.key as string, locale)
    return buildPageMetadata(
      (blogContent ?? {}) as PageSeoFields,
      settings ?? {},
      path,
    )
  }

  return buildPageMetadata((exp ?? {}) as PageSeoFields, settings ?? {}, path)
}

// ── Page component ────────────────────────────────────────────────────────────

async function CmsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp        = await searchParams
  const path      = '/' + slug.join('/')
  const cmsUrl    = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
  const dm        = await draftMode()
  const locale    = await getRequestLocale()
  const domain    = await getRequestDomain()
  const baseUrl   = await getRequestBaseUrl()

  const sp_str = (key: string) => {
    const v = sp[key]
    return typeof v === 'string' ? v : ''
  }

  // Site settings needed for buildJsonLd (Organization node) on every path.
  // getSiteSettings is React cache()-wrapped — no extra round-trip.
  const settings = await getSiteSettings(domain, locale)

  // Full page URL for JSON-LD — prefer the configured site URL so canonical
  // references in structured data always point to the production domain.
  const siteOrigin  = process.env.NEXT_PUBLIC_SITE_URL ?? baseUrl
  const fullPageUrl = `${siteOrigin}${path}`

  let exp: any
  if (dm.isEnabled && sp_str('preview_token')) {
    // Preview: locale comes from the CMS editor (sp loc param)
    const previewLocale = sp_str('loc') || locale
    await setRequestContext(previewLocale as any)

    const previewParams: PreviewParams = {
      preview_token: sp_str('preview_token'),
      key:           sp_str('key'),
      ctx:           'edit',
      ver:           sp_str('ver'),
      loc:           previewLocale,
    }
    exp = await getClient().getPreviewContent(previewParams, { cache: false })
  } else {
    // Shared cache with generateMetadata when both run in the same render.
    exp = await fetchPageContent(path, locale, baseUrl)
  }

  if (!exp?.composition?.nodes) {
    // Blog page — _page type rendered by its own component, not a composition
    if (exp?.__typename === 'OT_BlogPage') {
      const contentKey = exp._metadata?.key as string | undefined
      // For preview, getPreviewContent already returns all fields.
      // For public, make a targeted query to ensure all fields are present
      // (including the new SEO fields added to BLOG_PAGE_QUERY).
      const blogContent = dm.isEnabled
        ? exp
        : (contentKey ? await getBlogPage(contentKey, locale) : null)
      const latestPosts = await getLatestBlogPosts(contentKey, locale, baseUrl)

      if (blogContent) {
        // ── Draft mode context ──────────────────────────────────────────────────
        // ext_preview=1 means this was reached via an External Preview Link
        // (the reviewer followed the shareable URL, not the CMS editor's own
        // preview frame). Without this flag, dm.isEnabled means CMS edit mode.
        const isExternalPreview = dm.isEnabled && sp_str('ext_preview') === '1'
        const isCmsEdit         = dm.isEnabled && !isExternalPreview

        // ── Author name for the draft banner ────────────────────────────────────
        // In preview mode blogContent comes from getPreviewContent which returns
        // the raw ContentReference (just { key }), not the resolved AuthorData.
        // We do a single targeted fetch here — only for external preview so the
        // extra round-trip doesn't affect the CMS editor path.
        let draftAuthorName: string | undefined
        if (isExternalPreview) {
          const authorKey = (blogContent.authorRef as any)?.key as string | undefined
          if (authorKey) {
            draftAuthorName = (await getAuthorName(authorKey)) ?? undefined
          }
        }

        // ── CMS-side external preview link ──────────────────────────────────────
        // Shown in the slug route when the CMS editor is viewing the blog page
        // in draft mode and the content has enableExternalPreview: true.
        // (Also shown in /preview page via ExternalPreviewLinkPanel — this
        // covers the case where the CMS opens the draft through the slug URL.)
        let externalPreviewUrl: string | null = null
        if (isCmsEdit && blogContent.enableExternalPreview === true) {
          const contentSlug = toPathname(
            blogContent._metadata?.url?.hierarchical ??
            blogContent._metadata?.url?.default
          ) ?? path

          const qs = new URLSearchParams({
            preview_token: sp_str('preview_token'),
            key:           sp_str('key'),
            ver:           sp_str('ver'),
            loc:           sp_str('loc') || locale,
            ctx:           contentSlug,
            ext_preview:   '1',
          })
          if (baseUrl) {
            externalPreviewUrl = `${baseUrl}/api/draft?${qs}`
          }
        }
        // ───────────────────────────────────────────────────────────────────────

        const blogJsonLd = buildJsonLd(
          blogContent as PageSeoFields,
          settings ?? {},
          fullPageUrl,
        )

        return (
          <>
            <JsonLd data={blogJsonLd} />
            {dm.isEnabled && cmsUrl && (
              <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
            )}
            {dm.isEnabled && <PreviewComponent />}

            {/* External reviewer's draft-state banner */}
            {isExternalPreview && (
              <DraftStateBanner
                headline={blogContent.headline ?? ''}
                topic={blogContent.topic    ?? undefined}
                version={sp_str('ver')      || undefined}
                locale={sp_str('loc')       || locale}
                authorName={draftAuthorName}
              />
            )}

            {/* CMS editor's shareable-link panel */}
            {externalPreviewUrl && (
              <ExternalPreviewLinkPanel
                url={externalPreviewUrl}
                topic={blogContent.topic ?? undefined}
              />
            )}

            <BlogPage content={blogContent} latestPosts={latestPosts} />
          </>
        )
      }
    }

    // Standalone block content (not an experience) — send to the isolated preview route
    // so it renders without site chrome and with proper communicationinjector.js setup.
    if (dm.isEnabled && exp?.__typename) {
      const qs = new URLSearchParams({
        preview_token: sp_str('preview_token'),
        key:           sp_str('key'),
        ver:           sp_str('ver'),
        loc:           sp_str('loc') || locale,
        ctx:           'edit',
      })
      redirect(`/preview?${qs}`)
    }
    notFound()
  }

  const expJsonLd = buildJsonLd(exp as PageSeoFields, settings ?? {}, fullPageUrl)

  return (
    <>
      <JsonLd data={expJsonLd} />
      {dm.isEnabled && cmsUrl && (
        <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
      )}
      {dm.isEnabled && <PreviewComponent />}
      <CompositionRenderer nodes={exp.composition.nodes} />
    </>
  )
}

export default withAppContext(CmsPage)
