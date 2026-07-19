import '@/cms/registry'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { PreviewParams } from '@optimizely/cms-sdk'
import { NextPreviewComponent } from '@optimizely/cms-sdk/react/nextjs'
import { getClient } from '@/lib/optimizely'
import BlockRenderer from '@/components/preview/BlockRenderer'

export const dynamic  = 'force-dynamic'
export const revalidate = 0

type Props = {
  params:       Promise<{ version: string; key: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DraftBlockPage({ params, searchParams }: Props) {
  const dm = await draftMode()
  if (!dm.isEnabled) notFound()

  const { version, key } = await params
  const sp = await searchParams

  const str = (k: string) => {
    const v = sp[k]
    return typeof v === 'string' ? v : ''
  }

  let content: any
  try {
    content = await getClient().getPreviewContent({
      key,
      ver:           version,
      loc:           str('loc'),
      preview_token: str('preview_token'),
      ctx:           'edit',
    } as PreviewParams)
  } catch {
    notFound()
  }

  if (!content) notFound()

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl h-auto max-h-[80vh] overflow-y-auto">
        <BlockRenderer content={content} contentKey={key} />
      </div>
      <NextPreviewComponent />
    </div>
  )
}
