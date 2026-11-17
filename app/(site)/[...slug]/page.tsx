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
import { getBlogIndexUrl } from '@/lib/blogIndexUrl'
import { getBlogPage, getLatestBlogPosts, getAuthorName, fetchAuthorByKey } from '@/lib/blog'
import { getCampaignPage, getCampaignPageMeta, mapCampaignPageRaw } from '@/lib/campaign'
import { getEventPage } from '@/lib/events'
import { getTopicHubPage } from '@/lib/topicHub'
import { getPractitioner } from '@/lib/practitioners'
import { practitionerName, primaryArea, bioPreview } from '@/lib/practitionerFormat'
import PractitionerHeader from '@/components/practitioner/PractitionerHeader'
import BookingPanel from '@/components/practitioner/booking/BookingPanel'
import { withAppContext }       from '@optimizely/cms-sdk/react/server'
import { NextPreviewComponent } from '@optimizely/cms-sdk/react/nextjs'
import type { PreviewParams }  from '@optimizely/cms-sdk'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import { resolveContentVariant } from '@/lib/fx'
import BlogPage                from '@/components/pages/BlogPage'
import CampaignPage            from '@/components/pages/CampaignPage'
import EventPage               from '@/components/pages/EventPage'
import TopicHubPage            from '@/components/pages/TopicHubPage'
import CampaignLandingFrame    from '@/components/campaign/CampaignLandingFrame'
import { fetchPageContent }    from '@/lib/pageContent'
import Script                  from 'next/script'
import { DraftStateBanner }    from '@/components/preview/DraftStateBanner'
import { ExternalPreviewLinkPanel } from '@/components/preview/ExternalPreviewLinkPanel'
import { ReviewCommentWidget }    from '@/components/preview/ReviewCommentWidget'
import { ReviewCommentsStrip }    from '@/components/preview/ReviewCommentsStrip'
import { reviewCommentsEnabled }  from '@/lib/review-comments'
import { buildExternalPreviewUrl, contentPathname, type PreviewableContent } from '@/lib/external-preview'
import { buildPageMetadata, type PageSeoFields } from '@/lib/metadata'
import { buildJsonLd }         from '@/lib/structured-data'
import JsonLd                  from '@/components/seo/JsonLd'
import type { Locale }         from '@/lib/i18n/config'
import { getCommerceSettings, currencyForLocale, getMarketCookie } from '@/lib/commerce/settings'
import { matchPdpPath, resolvePdp, previewProductFor } from '@/lib/commerce/pdp'
import ProductDetailPage from '@/components/pages/ProductDetailPage'
import { resolveCmsUrl } from '@/lib/resolveCmsUrl'

export const revalidate = 60

/** Fields the slug route reads from an OT_CampaignLandingPage (see cms/content-types). */
type CampaignLandingFields = PageSeoFields & {
  campaignLook?:   string | null
  accentOverride?: string | null
  motionLevel?:    string | null
  ctaLabel?:       string | null
  ctaUrl?:         { default?: string | null } | string | null
  returnLabel?:    string | null
  footerRef?:      { key?: string | null } | null
  formRef?:        { key?: string | null } | null
  formHeading?:    string | null
  _metadata?:      { displayName?: string | null } | null
}

type Props = {
  params:       Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
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

  // Topic Hub page — fetch SEO fields from the targeted query
  if (exp?.__typename === 'OT_TopicHubPage' && exp?._metadata?.key) {
    const hubContent = await getTopicHubPage(exp._metadata.key as string, locale)
    const meta = buildPageMetadata(
      (hubContent ?? {}) as PageSeoFields,
      settings ?? {},
      path,
    )
    // A filtered hub (?topics=, ?topic=, ?match=, ?from=) is a view of the hub, not a page of its own: keep it out of search
    // results (links still followed) and point its canonical at the plain hub URL, so filter combinations never compete with it.
    const sp = await searchParams
    const filtered = ['topics', 'topic', 'match', 'from'].some((k) => sp?.[k] !== undefined && sp[k] !== '')
    if (filtered) {
      return {
        ...meta,
        robots: { index: false, follow: true },
        alternates: { ...meta.alternates, canonical: meta.alternates?.canonical ?? path },
      }
    }
    return meta
  }

  // Campaign landing page — _experience; fall back to the page name when the
  // editor leaves the SEO title blank, so the tab/title is never just the site name.
  if (exp?.__typename === 'OT_CampaignLandingPage') {
    const landing = exp as CampaignLandingFields
    return buildPageMetadata(
      { ...landing, seoTitle: landing.seoTitle ?? landing._metadata?.displayName },
      settings ?? {},
      path,
    )
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

  // Product detail template (visited directly or in Visual Builder) — never
  // indexable; titled after its preview product.
  if (exp?.__typename === 'OT_ProductDetailTemplate') {
    const commerce = await getCommerceSettings(domain)
    const product = commerce ? await previewProductFor(commerce.catalogId, (exp as any).previewHandle) : null
    return buildPageMetadata(
      { ...(exp as PageSeoFields), seoTitle: (exp as any).seoTitle ?? product?.name, noIndex: true },
      settings ?? {},
      path,
    )
  }

  // Catalog product page — no CMS page at this path, commerce on, /products/<handle>.
  const pdpHandle = !exp ? matchPdpPath(path) : null
  if (pdpHandle) {
    const commerce = await getCommerceSettings(domain)
    const pdp = commerce ? await resolvePdp(pdpHandle, commerce.catalogId, locale, baseUrl, settings?.featureExperimentationSdkKey) : null
    if (pdp) {
      const t = pdp.template ?? {}
      const hero = pdp.product.colours[0]?.images?.[0]
      return buildPageMetadata(
        {
          seoTitle:       t.seoTitle ?? pdp.product.name,
          seoDescription: t.seoDescription ?? pdp.product.description,
          ogImage:        hero ? { url: { default: hero } } : undefined,
          noIndex:        t.noIndex ?? false,
          schemaType:     'Product',
        },
        settings ?? {},
        path,
      )
    }
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

  // ── External preview context ────────────────────────────────────────────────
  // ext_preview=1 means this was reached via an External Preview Link (the
  // reviewer followed the shareable URL, not the CMS editor's own preview
  // frame). Require an actual preview_token for CMS edit so a stale draft-mode
  // cookie on the public site never triggers editor-only UI.
  const isExternalPreview = dm.isEnabled && sp_str('ext_preview') === '1'
  const isCmsEdit         = dm.isEnabled && !!sp_str('preview_token') && !isExternalPreview

  // Draft banner for external reviewers + shareable-link panel for CMS editors.
  // Applies to every page type; the link only appears when the page has
  // enableExternalPreview: true.
  const renderPreviewChrome = (content: PreviewableContent | null | undefined, banner: { headline?: string | null; topic?: string | null; authorName?: string }) => {
    const externalPreviewUrl = isCmsEdit
      ? buildExternalPreviewUrl({
          enabled:      content?.enableExternalPreview,
          baseUrl,
          previewToken: sp_str('preview_token'),
          key:          sp_str('key'),
          ver:          sp_str('ver'),
          loc:          sp_str('loc') || locale,
          path:         contentPathname(content) ?? path,
        })
      : null
    return (
      <>
        {isExternalPreview && (
          <DraftStateBanner
            headline={banner.headline ?? ''}
            topic={banner.topic ?? undefined}
            version={sp_str('ver') || undefined}
            locale={sp_str('loc')  || locale}
            authorName={banner.authorName}
          />
        )}
        {isExternalPreview && sp_str('key') && reviewCommentsEnabled() && (
          <ReviewCommentWidget
            contentKey={sp_str('key')}
            version={sp_str('ver')}
            locale={sp_str('loc') || locale}
            path={contentPathname(content) ?? path}
            title={banner.headline ?? undefined}
          />
        )}
        {externalPreviewUrl && (
          <>
            <ExternalPreviewLinkPanel url={externalPreviewUrl} topic={banner.topic ?? undefined} />
            <ReviewCommentsStrip contentKey={sp_str('key')} />
          </>
        )}
      </>
    )
  }

  // Full page URL for JSON-LD — prefer the configured site URL so canonical
  // references in structured data always point to the production domain.
  const siteOrigin  = (process.env.NEXT_PUBLIC_SITE_URL ?? baseUrl).replace(/\/$/, '')
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
    // Retry up to 3 times — Content Graph can lag 5–30s behind a save, so the
    // first attempt may find the key not yet indexed. Short backoff covers this
    // without making the editor wait noticeably on the happy path.
    exp = null
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 600))
      try {
        exp = await getClient().getPreviewContent(previewParams, { cache: false })
        break
      } catch {
        // swallow — will retry or fall through to null
      }
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
    try {
      exp = await fetchPageContent(path, locale, baseUrl)
    } catch (err) {
      console.error('[slug] Content Graph fetch failed:', err)
      notFound()
    }

    // ── FX content experiment ──────────────────────────────────────────────
    // When the experience binds an FX flag (BlankExperience.FxFlagKey) and the
    // visitor is bucketed into a CMS variation, re-fetch that variation and
    // serve it instead of the default. The variation slug == the FX variation
    // key (lowercased). Never runs in preview/draft mode. The SDK key is
    // resolved per-domain from OT_ThemeManager.featureExperimentationSdkKey.
    if (exp?.FxFlagKey) {
      const decision = await resolveContentVariant({
        flagKey: exp.FxFlagKey,
        sdkKey:  settings?.featureExperimentationSdkKey,
        locale,
      })
      if (decision.contentVariation) {
        const variant = await getLocalizedContentByPath(
          path, locale, baseUrl, decision.contentVariation,
        )
        if (variant?.composition?.nodes) exp = variant
      }
    }
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
      const backUrl = await getBlogIndexUrl((exp._metadata?.url?.hierarchical ?? exp._metadata?.url?.default ?? path) as string, baseUrl)

      if (blogContent) {
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
            {dm.isEnabled && <NextPreviewComponent />}

            {renderPreviewChrome(blogContent, {
              headline:   blogContent.headline,
              topic:      blogContent.topic,
              authorName: draftAuthorName,
            })}

            <BlogPage content={blogContent} latestPosts={latestPosts} locale={locale} backUrl={backUrl} />
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
          {dm.isEnabled && <NextPreviewComponent />}

          {renderPreviewChrome(campaignContent, {
            headline: campaignContent.seoTitle ?? campaignContent.heroSection?.headline,
          })}

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
            {dm.isEnabled && <NextPreviewComponent />}
            {renderPreviewChrome(eventContent, { headline: eventContent.title })}
            <EventPage content={eventContent as any} />
          </>
        )
      }
    }

    // Topic Hub page — _page type, no composition nodes
    if (exp?.__typename === 'OT_TopicHubPage') {
      const contentKey = exp._metadata?.key as string | undefined
      const hubContent = dm.isEnabled
        ? exp
        : (contentKey ? await getTopicHubPage(contentKey, locale) : null)

      if (hubContent) {
        return (
          <>
            {dm.isEnabled && cmsUrl && (
              <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
            )}
            {dm.isEnabled && <NextPreviewComponent />}
            {renderPreviewChrome(hubContent, { headline: hubContent.headerName ?? hubContent.seoTitle })}
            <TopicHubPage config={hubContent as any} locale={locale} />
          </>
        )
      }
    }

    // Catalog product page — no CMS page exists at this path, the host has mock
    // commerce enabled, and the path is /products/<handle>. The product comes
    // from the Graph catalog; the below-the-fold layout is the matching
    // OT_ProductDetailTemplate. A CMS page at the same path always wins (it was
    // resolved above), so other sites' /products/* pages are unaffected.
    const pdpHandle = !exp && !dm.isEnabled ? matchPdpPath(path) : null
    if (pdpHandle) {
      const commerce = await getCommerceSettings(domain)
      const pdp = commerce ? await resolvePdp(pdpHandle, commerce.catalogId, locale, baseUrl, settings?.featureExperimentationSdkKey) : null
      if (commerce && pdp) {
        return (
          <ProductDetailPage
            product={pdp.product}
            template={pdp.template}
            currency={currencyForLocale(commerce, locale, await getMarketCookie())}
            locale={locale}
            site={settings ?? {}}
            pageUrl={fullPageUrl}
          />
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

  // Campaign landing page — _experience type rendered WITHOUT the site shell
  // (app/(site)/layout.tsx drops it via lib/shellMode.ts). The locked frame supplies
  // a slim campaign strip, the chosen look, the conversion form and a footer around
  // the editor's free composition.
  if (exp?.__typename === 'OT_CampaignLandingPage') {
    const landing = exp as CampaignLandingFields
    // Accordion FAQs on the page are emitted as FAQPage JSON-LD (answers in the
    // static HTML for crawlers), same as the generic experience path below.
    const landingFaqItems = exp?.composition?.nodes
      ? extractAccordionFaqs(exp.composition.nodes)
      : undefined
    const landingJsonLd = buildJsonLd(
      {
        ...landing,
        faqItems: landingFaqItems,
        schemaType: landing.schemaType && landing.schemaType !== 'none' ? landing.schemaType : 'WebPage',
      },
      settings ?? {},
      fullPageUrl,
    )
    return (
      <>
        <JsonLd data={landingJsonLd} />
        {dm.isEnabled && cmsUrl && (
          <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
        )}
        {dm.isEnabled && <NextPreviewComponent />}
        {renderPreviewChrome(exp, { headline: exp.seoTitle ?? null })}
        <CampaignLandingFrame
          locale={locale}
          look={landing.campaignLook}
          accentOverride={landing.accentOverride}
          motionLevel={landing.motionLevel}
          ctaLabel={landing.ctaLabel}
          ctaUrl={resolveCmsUrl(landing.ctaUrl)}
          returnLabel={landing.returnLabel}
          footerKey={landing.footerRef?.key}
          formKey={landing.formRef?.key}
          formHeading={landing.formHeading}
        >
          <CompositionRenderer nodes={exp.composition.nodes} />
        </CampaignLandingFrame>
      </>
    )
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
        {dm.isEnabled && <NextPreviewComponent />}
        {renderPreviewChrome(exp, {
          headline: exp.seoTitle ?? (practitioner ? practitionerName(practitioner, false) : null),
        })}
        {practitioner && (
          <>
            <PractitionerHeader
              practitioner={practitioner}
              profileLabel={(exp as any).profileLabel ?? undefined}
            />
            {practitioner.bookingEnabled && <BookingPanel practitioner={practitioner} />}
          </>
        )}
        <CompositionRenderer nodes={exp.composition.nodes} />
      </>
    )
  }

  // Product detail template — rendered with its preview product in the locked
  // header so editors compose the below-the-fold content in context.
  if (exp?.__typename === 'OT_ProductDetailTemplate') {
    const commerce = await getCommerceSettings(domain)
    const product = commerce ? await previewProductFor(commerce.catalogId, (exp as any).previewHandle) : null
    return (
      <>
        {dm.isEnabled && cmsUrl && (
          <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
        )}
        {dm.isEnabled && <NextPreviewComponent />}
        {renderPreviewChrome(exp, { headline: exp.seoTitle ?? product?.name ?? exp._metadata?.displayName })}
        {product && commerce ? (
          <ProductDetailPage
            product={product}
            template={exp}
            currency={currencyForLocale(commerce, locale, await getMarketCookie())}
            locale={locale}
            site={settings ?? {}}
            pageUrl={fullPageUrl}
          />
        ) : (
          <CompositionRenderer nodes={exp.composition.nodes} />
        )}
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
      {dm.isEnabled && <NextPreviewComponent />}
      {renderPreviewChrome(exp, { headline: exp.seoTitle ?? exp._metadata?.displayName })}
      <CompositionRenderer nodes={exp.composition.nodes} />
    </>
  )
}

export default withAppContext(CmsPage)
