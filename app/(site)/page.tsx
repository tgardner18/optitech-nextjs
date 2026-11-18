import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getLocalizedContentByPath, getRequestBaseUrl, getRequestDomain, getRequestLocale, getSiteSettings } from '@/lib/optimizely'
import { buildPageMetadata, type PageSeoFields } from '@/lib/metadata'
import { buildJsonLd } from '@/lib/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { withAppContext } from '@optimizely/cms-sdk/react/server'
import { NextPreviewComponent } from '@optimizely/cms-sdk/react/nextjs'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import Script from 'next/script'
import CmsPage from './[...slug]/page'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Published homepage: root path first, then the common CMS home slugs
// ('/home' is the Optimizely CMS convention; '/base-home' is the OTBase default).
async function fetchHome(locale: Awaited<ReturnType<typeof getRequestLocale>>, baseUrl: string) {
  for (const path of ['/', '/home', '/base-home']) {
    const exp = await getLocalizedContentByPath(path, locale, baseUrl)
    if (exp?.composition?.nodes) return exp
  }
  return null
}

// The homepage had no generateMetadata, so it shipped without Open Graph or Twitter tags.
export async function generateMetadata(): Promise<Metadata> {
  const [locale, baseUrl, domain] = await Promise.all([getRequestLocale(), getRequestBaseUrl(), getRequestDomain()])
  const [exp, settings] = await Promise.all([fetchHome(locale, baseUrl), getSiteSettings(domain, locale)])
  return buildPageMetadata((exp ?? {}) as PageSeoFields, settings ?? {}, '/')
}

async function HomePage({ searchParams }: Props) {
  const cmsUrl  = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
  const dm      = await draftMode()

  // Draft/preview requests for "/" (CMS preview, External Preview Links) go
  // through the same renderer as every other page so they get the real draft
  // content and the preview chrome (draft banner, link panel, review widget).
  // Without a preview_token a stale draft cookie falls through to published.
  const sp = await searchParams
  if (dm.isEnabled && typeof sp.preview_token === 'string' && sp.preview_token) {
    return <CmsPage params={Promise.resolve({ slug: [] })} searchParams={searchParams} />
  }

  const baseUrl = await getRequestBaseUrl()
  const locale  = await getRequestLocale()

  const exp: any = await fetchHome(locale, baseUrl)
  if (!exp?.composition?.nodes) notFound()

  // Organization + WebSite graph, as on every inner page (the homepage had none).
  const settings = await getSiteSettings(await getRequestDomain(), locale)
  const homeJsonLd = buildJsonLd(exp as PageSeoFields, settings ?? {}, `${baseUrl}/`)

  return (
    <>
      <JsonLd data={homeJsonLd} />
      {dm.isEnabled && cmsUrl && (
        <Script src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
      )}
      {dm.isEnabled && <NextPreviewComponent />}
      <CompositionRenderer nodes={exp.composition.nodes} />
    </>
  )
}

export default withAppContext(HomePage)
