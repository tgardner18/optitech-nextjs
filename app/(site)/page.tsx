import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getClient, getRequestBaseUrl } from '@/lib/optimizely'
import { withAppContext } from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import Script from 'next/script'

async function HomePage() {
  const cmsUrl  = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
  const dm      = await draftMode()
  const baseUrl = await getRequestBaseUrl()

  // Try root path first; fall back to /home which is the conventional CMS home path.
  let exp: any
  for (const path of ['/', '/home']) {
    const results = await getClient().getContentByPath(path, { host: baseUrl || undefined })
    exp = results?.[0]
    if (exp?.composition?.nodes) break
  }

  if (!exp?.composition?.nodes) notFound()

  return (
    <>
      {dm.isEnabled && cmsUrl && (
        <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
      )}
      {dm.isEnabled && <PreviewComponent />}
      <CompositionRenderer nodes={exp.composition.nodes} />
    </>
  )
}

export default withAppContext(HomePage)
