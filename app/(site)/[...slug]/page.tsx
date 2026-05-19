import { notFound, redirect } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getClient, getRequestBaseUrl } from '@/lib/optimizely'
import { withAppContext } from '@optimizely/cms-sdk/react/server'
import { PreviewComponent } from '@optimizely/cms-sdk/react/client'
import type { PreviewParams } from '@optimizely/cms-sdk'
import { CompositionRenderer } from '@/lib/CompositionRenderer'
import Script from 'next/script'

type Props = {
  params:       Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function CmsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp        = await searchParams
  const path      = '/' + slug.join('/')
  const cmsUrl    = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
  const dm        = await draftMode()

  const sp_str = (key: string) => {
    const v = sp[key]
    return typeof v === 'string' ? v : ''
  }

  const baseUrl = await getRequestBaseUrl()

  let exp: any
  if (dm.isEnabled && sp_str('preview_token')) {
    const previewParams: PreviewParams = {
      preview_token: sp_str('preview_token'),
      key:           sp_str('key'),
      ctx:           'edit',
      ver:           sp_str('ver'),
      loc:           sp_str('loc'),
    }
    exp = await getClient().getPreviewContent(previewParams, { cache: false })
  } else {
    const results = await getClient().getContentByPath(path, { host: baseUrl || undefined })
    exp = results?.[0]
  }

  if (!exp?.composition?.nodes) {
    // Standalone block content (not an experience) — send to the isolated preview route
    // so it renders without site chrome and with proper communicationinjector.js setup.
    if (dm.isEnabled && exp?.__typename) {
      const qs = new URLSearchParams({
        preview_token: sp_str('preview_token'),
        key:           sp_str('key'),
        ver:           sp_str('ver'),
        loc:           sp_str('loc'),
        ctx:           'edit',
      })
      redirect(`/preview?${qs}`)
    }
    notFound()
  }

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

export default withAppContext(CmsPage)
