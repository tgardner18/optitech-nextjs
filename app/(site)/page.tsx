import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getLocalizedContentByPath, getRequestBaseUrl, getRequestLocale } from '@/lib/optimizely'
import { withAppContext, OptimizelyComposition } from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import Script from 'next/script'

async function HomePage() {
  const cmsUrl  = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
  const dm      = await draftMode()
  const baseUrl = await getRequestBaseUrl()
  const locale  = await getRequestLocale()

  // Try root path first; fall back to common CMS home slugs.
  // '/home' is the Optimizely CMS convention; '/base-home' is the OTBase default slug.
  let exp: any
  for (const path of ['/', '/home', '/base-home']) {
    exp = await getLocalizedContentByPath(path, locale, baseUrl)
    if (exp?.composition?.nodes) break
  }

  if (!exp?.composition?.nodes) notFound()

  return (
    <>
      {dm.isEnabled && cmsUrl && (
        <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
      )}
      {dm.isEnabled && <PreviewComponent />}
      <OptimizelyComposition nodes={exp.composition.nodes} />
    </>
  )
}

export default withAppContext(HomePage)
