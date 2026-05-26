import type { PreviewParams } from '@optimizely/cms-sdk'
import {
  OptimizelyComponent,
  withAppContext,
} from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import { getClient, getRequestBaseUrl } from '@/lib/optimizely'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'
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

  return (
    <>
      {cmsUrl && (
        <Script
          src={`${cmsUrl}/util/javascript/communicationinjector.js`}
          strategy="afterInteractive"
          id="optimizely-communication-injector"
        />
      )}
      <PreviewComponent />

      {/* CMS-side external preview link — above all site chrome */}
      {externalPreviewUrl && (
        <ExternalPreviewLinkPanel
          url={externalPreviewUrl}
          topic={content?.topic ?? undefined}
        />
      )}

      {isExperience ? (
        <>
          <Header />
          <main className="flex-1">
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
