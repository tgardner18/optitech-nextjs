import type { PreviewParams } from '@optimizely/cms-sdk'
import {
  OptimizelyComponent,
  withAppContext,
} from '@optimizely/cms-sdk/react/server'
import { NextPreviewComponent } from '@optimizely/cms-sdk/react/nextjs'
import { getClient, getRequestBaseUrl, getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { resolveNavbarStyle } from '@/lib/theme-axes'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import { getPractitioner } from '@/lib/practitioners'
import PractitionerHeader from '@/components/practitioner/PractitionerHeader'
import Header from '@/components/layout/Header'
import SplitHeader from '@/components/layout/SplitHeader'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'
import { redirect } from 'next/navigation'
import { ExternalPreviewLinkPanel } from '@/components/preview/ExternalPreviewLinkPanel'

export const dynamic  = 'force-dynamic'
export const revalidate = 0

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Resolves an absolute or relative URL to just the pathname.
function toPathname(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    return raw.startsWith('http') ? new URL(raw).pathname : raw
  } catch {
    return raw.startsWith('/') ? raw : null
  }
}

async function PreviewPage({ searchParams }: Props) {
  const params  = await searchParams
  const cmsUrl  = process.env.OPTIMIZELY_CMS_URL?.replace(/\/$/, '') ?? ''

  // Normalise string params from the search-param map
  const sp = (key: string) => {
    const v = params[key]
    return typeof v === 'string' ? v : ''
  }

  // Graph may not have indexed the newly-saved version yet — retry briefly.
  let content: any
  let lastErr: unknown
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      lastErr = undefined
      content = await getClient().getPreviewContent(
        params as unknown as PreviewParams,
      )
      break
    } catch (err) {
      lastErr = err
      const notIndexed =
        err instanceof Error && err.message.includes('No content found for key')
      if (notIndexed && attempt < 3) {
        await new Promise(r => setTimeout(r, 250))
        continue
      }
      break
    }
  }

  // ── Page type redirect ────────────────────────────────────────────────────────
  // _page content types (OT_CampaignPage, OT_BlogPage, etc.) are not registered
  // in initReactComponentRegistry and cannot be rendered by OptimizelyComponent.
  // They also fail getPreviewContent because the SDK auto-generates inline
  // fragments for content-area arrays that the preview API doesn't support.
  // Detect the page type via a minimal fallback query and redirect through
  // /api/draft so draft mode is activated before the slug route handles the page.
  const isPageType =
    content?._metadata?.types?.includes('_Page') ||
    (lastErr && !content)

  // Only redirect page types that have a dedicated handler in the slug route.
  // Other _page types (OT_FolderPage, etc.) must NOT be redirected there or they
  // create an infinite loop: slug route → /preview → slug route → …
  const SLUG_HANDLED_TYPES = new Set(['OT_CampaignPage', 'OT_BlogPage'])
  const isSlugHandledPage = isPageType && SLUG_HANDLED_TYPES.has(content?.__typename ?? '')

  if (isSlugHandledPage) {
    const fallbackKey = sp('key')
    let pageRedirectUrl: string | null = null
    if (fallbackKey) {
      // 1. Use the URL already present in the preview-fetched content — this
      //    works for draft-only pages because getPreviewContent (with preview_token)
      //    returns _metadata.url even before first publish.
      let pageUrl = toPathname(
        content?._metadata?.url?.hierarchical ?? content?._metadata?.url?.default
      )

      // 2. Fall back to Content Graph for published pages whose URL wasn't
      //    present in the preview response. Use _Content (generic) rather than
      //    OT_CampaignPage so this covers blog pages and any future page type.
      if (!pageUrl) {
        try {
          const fallback = await getClient().request(
            `query PreviewPageFallback($key: String!) {
               _Content(
                 where: { _metadata: { key: { eq: $key } } }
                 limit: 1
               ) {
                 items { _metadata { url { default hierarchical } } }
               }
             }`,
            { key: fallbackKey },
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const meta = (fallback as any)?._Content?.items?.[0]?._metadata
          pageUrl = toPathname(meta?.url?.hierarchical ?? meta?.url?.default)
        } catch {
          // Fallback query failed — fall through to the error display below
        }
      }

      if (pageUrl) {
        const baseUrl = await getRequestBaseUrl()
        const qs = new URLSearchParams({
          preview_token: sp('preview_token'),
          key:           fallbackKey,
          ver:           sp('ver'),
          loc:           sp('loc'),
          ctx:           pageUrl,
        })
        pageRedirectUrl = `${baseUrl}/api/draft?${qs}`
      }
    }
    // redirect() throws a special Next.js error — must be called outside try/catch
    // so it isn't accidentally swallowed by the catch block above.
    if (pageRedirectUrl) redirect(pageRedirectUrl)
  }

  if (lastErr || !content) {
    const msg = lastErr instanceof Error ? lastErr.message : 'Unknown error'
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <p><strong>Preview unavailable</strong></p>
        <p>{msg}</p>
        <p>The content may not be published or the preview session may have expired. Reload the Visual Builder to get a fresh preview token.</p>
      </div>
    )
  }

  const isExperience = Array.isArray(content?.composition?.nodes)

  // Practitioner experience pages render a locked profile header OUTSIDE the
  // composition tree — the live slug route does this in its OT_PractitionerPage
  // branch. Mirror it here so the header previews alongside the editable
  // composition below; without this the top profile section is invisible in the
  // Visual Builder while the sections under it render normally.
  let practitioner = null
  if (isExperience && content?.__typename === 'OT_PractitionerPage') {
    const refKey = content?.practitionerRef?.key as string | undefined
    if (refKey) {
      practitioner = await getPractitioner(refKey, sp('loc') || 'en')
    }
  }

  // For standalone blocks synthesize __composition so pa(content.__composition)
  // generates the data-epi-block-id attribute needed for on-page editing.
  const contentKey = typeof params.key === 'string' ? params.key : ''
  const standaloneContent = !isExperience && contentKey
    ? { ...content, __composition: { key: contentKey } }
    : content

  // ── External Preview Link panel ──────────────────────────────────────────────
  // Shown in the CMS editor preview when a blog page has enableExternalPreview
  // set to true. Generates a shareable URL that enables draft mode for an
  // external reviewer without requiring a CMS login.
  let externalPreviewUrl: string | null = null

  if (
    !isExperience &&
    content?.__typename === 'OT_BlogPage' &&
    content?.enableExternalPreview === true
  ) {
    const previewToken = sp('preview_token')
    if (previewToken) {
      const baseUrl = await getRequestBaseUrl()
      // Prefer the hierarchical (ancestor-resolved) URL; fall back to default
      const slug = toPathname(
        content._metadata?.url?.hierarchical ?? content._metadata?.url?.default
      )

      if (baseUrl && slug) {
        const qs = new URLSearchParams({
          preview_token: previewToken,
          key:           sp('key'),
          ver:           sp('ver'),
          loc:           sp('loc'),
          ctx:           slug,
          ext_preview:   '1',
        })
        externalPreviewUrl = `${baseUrl}/api/draft?${qs}`
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Resolve which header variant the site is configured to use. Sidebar is
  // deliberately excluded — it would overlay the Visual Builder canvas.
  const previewDomain      = await getRequestDomain()
  const previewLocale      = await getRequestLocale()
  const previewSettings    = await getSiteSettings(previewDomain, previewLocale)
  const navbarStyle        = resolveNavbarStyle(previewSettings?.navbarStyle)
  const PreviewHeader      = navbarStyle === 'split-bar' ? SplitHeader : Header

  return (
    <>
      {cmsUrl && (
        <Script
          src={`${cmsUrl}/util/javascript/communicationinjector.js`}
          strategy="afterInteractive"
          id="optimizely-communication-injector"
        />
      )}
      <NextPreviewComponent />

      {/* CMS-side external preview link — above all site chrome */}
      {externalPreviewUrl && (
        <ExternalPreviewLinkPanel
          url={externalPreviewUrl}
          topic={content?.topic ?? undefined}
        />
      )}

      {isExperience ? (
        <>
          <PreviewHeader />
          <main className="flex-1">
            {practitioner && (
              <PractitionerHeader
                practitioner={practitioner}
                profileLabel={content.profileLabel ?? undefined}
              />
            )}
            <CompositionRenderer nodes={content.composition.nodes} />
          </main>
          <Footer />
        </>
      ) : (
        <OptimizelyComponent content={standaloneContent} />
      )}
    </>
  )
}

export default withAppContext(PreviewPage)
