import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const preview_token = searchParams.get('preview_token')
  const key           = searchParams.get('key')         ?? ''
  const ctx           = searchParams.get('ctx')         ?? '/'
  const ver           = searchParams.get('ver')         ?? ''
  const loc           = searchParams.get('loc')         ?? ''
  // ext_preview=1 marks a link shared externally (outside the CMS editor).
  // Forwarded to the target page so it can render the draft-state banner.
  const extPreview    = searchParams.get('ext_preview') ?? ''

  if (!preview_token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()

  // Forward all preview params to the target page so it can call getPreviewContent
  const target = new URL(ctx, request.url)
  target.searchParams.set('preview_token', preview_token)
  target.searchParams.set('key', key)
  target.searchParams.set('ver', ver)
  target.searchParams.set('loc', loc)
  if (extPreview) target.searchParams.set('ext_preview', extPreview)

  redirect(target.pathname + target.search)
}
