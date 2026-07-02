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
import { getBlogPage, getLatestBlogPosts, getAuthorName, fetchAuthorByKey } from '@/lib/blog'
import { getCampaignPage, getCampaignPageMeta, mapCampaignPageRaw } from '@/lib/campaign'
import { getEventPage } from '@/lib/events'
import { getPractitioner } from '@/lib/practitioners'
import { practitionerName, primaryArea, bioPreview } from '@/lib/practitionerFormat'
import PractitionerHeader from '@/components/practitioner/PractitionerHeader'
import { withAppContext }       from '@optimizely/cms-sdk/react/server'
import { PreviewComponent }    from '@optimizely/cms-sdk/react/client'
import type { PreviewParams }  from '@optimizely/cms-sdk'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import BlogPage                from '@/components/pages/BlogPage'
import CampaignPage            from '@/components/pages/CampaignPage'
import EventPage               from '@/components/pages/EventPage'
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

// Recursively walks a Visual Builder composition tree and collects all
// OT_AccordionBlock question/answer pairs. Used to populate FAQPage
// JSON-LD when the editor sets schemaType = 'FAQPage' on the experience.
//
// Node shapes in the tree:
//   CompositionComponentNode  → { __typename: 'CompositionComponentNode', component: { __typename, items, ... } }
//   Structure nodes (section/row/column) → { nodes: [...children] }
function extractAccordionFaqs(
  nodes: any[],
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []

  function traverse(list: any[]) {
    for (const node of list ?? []) {
      if (
        node.__typename === 'CompositionComponentNode' &&
        node.component?.__typename === 'OT_AccordionBlock'
      ) {
        for (const item of node.component.items ?? []) {
          const q = item.question as string | null | undefined
          const a = item.answer   as string | null | undefined
          if (q && a) faqs.push({ question: q, answer: a })
        }
      }
      if (node.nodes?.length) traverse(node.nodes)
    }
  }

  traverse(nodes)
  return faqs
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

  // Campaign page — fetch SEO fields only (slots not needed for metadata)
  if (exp?.__typename === 'OT_CampaignPage' && exp?._metadata?.key) {
    const campaignMeta = await getCampaignPageMeta(exp._metadata.key as string)
    return buildPageMetadata(
      (campaignMeta ?? {}) as PageSeoFields,
      settings ?? {},
      path,
    )
  }

  // Event page — fetch the full content record (includes SEO fields); fall back
  // to the event title when no explicit SEO title is set.
  if (exp?.__typename === 'OT_EventPage' && exp?._metadata?.key) {
    const eventContent = await getEventPage(exp._metadata.key as string, locale)
    const seoFields: PageSeoFields = {
      ...(eventContent ?? {}),
      seoTitle: eventContent?.seoTitle ?? eventContent?.title ?? undefined,
      ogImage:  eventContent?.ogImage ?? eventContent?.featuredImage ?? undefined,
      schemaType: eventContent?.schemaType || 'Event',
    }
    return buildPageMetadata(seoFields, settings ?? {}, path)
  }

  // Practitioner page — _experience; build SEO from page fields with a smart
  // fallback to the referenced practitioner's name + credentials + primary area.
  if (exp?.__typename === 'OT_PractitionerPage') {
    const refKey = (exp as any)?.practitionerRef?.key as string | undefined
    const practitioner = refKey ? await getPractitioner(refKey, locale) : null

    let fallbackTitle: string | undefined
    if (practitioner) {
      const name    = practitionerName(practitioner, false)
      const creds    = practitioner.credentials ? `, ${practitioner.credentials}` : ''
      const primary  = primaryArea(practitioner.practiceAreas)
      const areaPart = primary?.areaName ? ` — ${primary.areaName}` : ''
      fallbackTitle  = `${name}${creds}${areaPart}`.trim() || undefined
    }

    const headshotOg = practitioner?.headshotUrl
      ? { url: { default: practitioner.headshotUrl } }
      : undefined

    const seoFields: PageSeoFields = {
      ...((exp ?? {}) as PageSeoFields),
      seoTitle:   (exp as any)?.seoTitle ?? fallbackTitle,
      ogImage:    (exp as any)?.ogImage ?? headshotOg,
      schemaType: (exp as any)?.schemaType || 'Person',
    }
    return buildPageMetadata(seoFields, settings ?? {}, path)
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
    try {
      exp = await getClient().getPreviewContent(previewParams, { cache: false })
    } catch {
      exp = null
    }

    const previewResolveFailed = !exp || exp.__typename === '_Page'
    if (previewResolveFailed && sp_str('key')) {
      const fallbackKey = sp_str('key')
      try {
        const fallback = await getClient().request(
          `query FallbackPreview($key: String!) {
             OT_CampaignPage(where: { _metadata: { key: { eq: $key } } }, limit: 1) {
               items { __typename _metadata { key url { default } } }
             }
           }`,
          { key: fallbackKey },
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const campaignExp = (fallback as any)?.OT_CampaignPage?.items?.[0] ?? null
        if (campaignExp) exp = campaignExp
      } catch {
        // fallback failed — leave exp as-is
      }
    }
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
      let blogContent = dm.isEnabled
        ? exp
        : (contentKey ? await getBlogPage(contentKey, locale) : null)

      // In preview/draft mode `exp` comes straight from getPreviewContent, so
      // authorRef is the unresolved ContentReference ({ key }) — BlogPage reads
      // authorRef.name/role/photo and finds nothing. Resolve it here so the
      // byline renders in the editor/external preview, matching the public path
      // (getBlogPage already resolves it for published pages).
      if (dm.isEnabled && blogContent) {
        const authorKey = (blogContent.authorRef as any)?.key as string | undefined
        const resolvedAuthor = authorKey ? await fetchAuthorByKey(authorKey) : null
        blogContent = { ...blogContent, authorRef: resolvedAuthor } as typeof blogContent
      }

      const latestPosts = await getLatestBlogPosts(contentKey, locale, baseUrl)

      if (blogContent) {
        // ── Draft mode context ──────────────────────────────────────────────────
        // ext_preview=1 means this was reached via an External Preview Link
        // (the reviewer followed the shareable URL, not the CMS editor's own
        // preview frame). Without this flag, dm.isEnabled means CMS edit mode.
        const isExternalPreview = dm.isEnabled && sp_str('ext_preview') === '1'
        const isCmsEdit         = dm.isEnabled && !!sp_str('preview_token') && !isExternalPreview

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

    // Campaign page — three-slot landing page type
    if (exp?.__typename === 'OT_CampaignPage') {
      const contentKey = exp._metadata?.key as string | undefined

      // In preview mode, map the preview response first. getPreviewContent may
      // not fully resolve slot items for unpublished content (they're not yet
      // indexed in Content Graph), so try the published page query as a fallback
      // when the preview mapping yields no sections.
      // IMPORTANT: only replace campaignContent with the published result if it
      // is non-null — a brand-new unsaved page has no published record yet and
      // getCampaignPage returns null. In that case we keep the (empty) preview
      // content so the editor sees the page shell rather than a 404.
      let campaignContent = dm.isEnabled ? mapCampaignPageRaw(exp) : null
      const previewHasContent = !!(
        campaignContent?.heroSection ||
        (campaignContent?.bodySection?.length ?? 0) > 0 ||
        (campaignContent?.closingSection?.length ?? 0) > 0
      )
      if (!previewHasContent && contentKey) {
        const published = await getCampaignPage(contentKey)
        if (published) campaignContent = published
      }
      if (!campaignContent) return notFound()

      // Require an actual preview_token so a stale draft-mode cookie on the
      // public site never triggers editor-only UI (ExternalPreviewLinkPanel).
      const isExternalPreview = dm.isEnabled && sp_str('ext_preview') === '1'
      const isCmsEdit         = dm.isEnabled && !!sp_str('preview_token') && !isExternalPreview

      let externalPreviewUrl: string | null = null
      if (isCmsEdit && campaignContent.enableExternalPreview === true) {
        const contentSlug = toPathname(
          campaignContent._metadata?.url?.default
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

      const campaignJsonLd = buildJsonLd(
        campaignContent as PageSeoFields,
        settings ?? {},
        fullPageUrl,
      )

      return (
        <>
          <JsonLd data={campaignJsonLd} />
          {dm.isEnabled && cmsUrl && (
            <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
          )}
          {dm.isEnabled && <PreviewComponent />}

          {isExternalPreview && (
            <DraftStateBanner
              headline={campaignContent.seoTitle ?? campaignContent.heroSection?.headline ?? ''}
              version={sp_str('ver') || undefined}
              locale={sp_str('loc')  || locale}
            />
          )}

          {externalPreviewUrl && (
            <ExternalPreviewLinkPanel url={externalPreviewUrl} />
          )}

          <CampaignPage
            heroSection={campaignContent.heroSection ?? undefined}
            bodySection={campaignContent.bodySection ?? undefined}
            closingSection={campaignContent.closingSection ?? undefined}
          />
        </>
      )
    }

    // Event page — _page type rendered by its own component, not a composition
    if (exp?.__typename === 'OT_EventPage') {
      const contentKey = exp._metadata?.key as string | undefined
      // Preview: getPreviewContent returns all fields. Public: targeted query.
      const eventContent = dm.isEnabled
        ? exp
        : (contentKey ? await getEventPage(contentKey, locale) : null)

      if (eventContent) {
        const eventJsonLd = buildJsonLd(
          { ...(eventContent as PageSeoFields), schemaType: (eventContent as PageSeoFields).schemaType || 'Event' },
          settings ?? {},
          fullPageUrl,
        )

        return (
          <>
            <JsonLd data={eventJsonLd} />
            {dm.isEnabled && cmsUrl && (
              <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
            )}
            {dm.isEnabled && <PreviewComponent />}
            <EventPage content={eventContent as any} />
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

  // Practitioner page — _experience type. The referenced practitioner record
  // populates a locked PractitionerHeader rendered OUTSIDE the composition tree;
  // everything below is the editor's free Visual Builder composition. This is
  // the architectural guarantee that the header always appears and cannot be
  // moved or deleted.
  if (exp?.__typename === 'OT_PractitionerPage') {
    const refKey = (exp as any).practitionerRef?.key as string | undefined
    const practitioner = refKey ? await getPractitioner(refKey, locale) : null

    const primary = practitioner ? primaryArea(practitioner.practiceAreas) : null
    const personSeo: PageSeoFields = {
      ...(exp as PageSeoFields),
      schemaType: (exp as PageSeoFields).schemaType || 'Person',
      person: practitioner
        ? {
            name:        practitionerName(practitioner, false),
            jobTitle:    practitioner.title ?? undefined,
            description: bioPreview(practitioner.bio, 300) || undefined,
            worksFor:    primary?.facility ?? undefined,
          }
        : null,
    }
    const practitionerJsonLd = buildJsonLd(personSeo, settings ?? {}, fullPageUrl)

    return (
      <>
        <JsonLd data={practitionerJsonLd} />
        {dm.isEnabled && cmsUrl && (
          <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
        )}
        {dm.isEnabled && <PreviewComponent />}
        {practitioner && (
          <PractitionerHeader
            practitioner={practitioner}
            profileLabel={(exp as any).profileLabel ?? undefined}
          />
        )}
        <CompositionRenderer nodes={exp.composition.nodes} />
      </>
    )
  }

  // Always extract accordion items — buildJsonLd decides whether to emit them
  // based on whether any are present, independent of schemaType.
  const faqItems = exp?.composition?.nodes
    ? extractAccordionFaqs(exp.composition.nodes)
    : undefined

  const expJsonLd = buildJsonLd(
    { ...(exp as PageSeoFields), faqItems } as PageSeoFields,
    settings ?? {},
    fullPageUrl,
  )

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
