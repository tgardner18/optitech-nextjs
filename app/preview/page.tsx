import type { PreviewParams } from '@optimizely/cms-sdk'
import {
  OptimizelyComponent,
  OptimizelyComposition,
  withAppContext,
} from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import { getClient } from '@/lib/optimizely'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function PreviewPage({ searchParams }: Props) {
  const params = await searchParams
  const cmsUrl = process.env.OPTIMIZELY_CMS_URL?.replace(/\/$/, '') ?? ''

  let content: any
  try {
    content = await getClient().getPreviewContent(
      params as unknown as PreviewParams,
    )
  } catch (err: any) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <p><strong>Preview unavailable</strong></p>
        <p>{err?.message ?? 'Unknown error'}</p>
        <p>The content may not be published or the preview session may have expired. Reload the Visual Builder to get a fresh preview token.</p>
      </div>
    )
  }

  const isExperience = Array.isArray(content?.composition?.nodes)

  // For standalone blocks (not in an experience), synthesize __composition so
  // adapters' pa(content.__composition) call generates data-epi-block-id.
  const contentKey = typeof params.key === 'string' ? params.key : ''
  const standaloneContent = !isExperience && contentKey
    ? { ...content, __composition: { key: contentKey } }
    : content

  return (
    <>
      <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
      <PreviewComponent />
      {isExperience ? (
        <>
          <Header />
          <main className="flex-1">
            <OptimizelyComposition nodes={content.composition.nodes} />
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
