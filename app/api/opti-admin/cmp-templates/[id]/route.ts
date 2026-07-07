import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin/auth'
import { cmpConfigured, getCmpTemplateDetail } from '@/lib/cmpApi'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!await verifySessionToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!cmpConfigured()) {
    return NextResponse.json({ error: 'CMP_CLIENT_ID / CMP_CLIENT_SECRET are not configured.' }, { status: 503 })
  }

  const { id } = await params

  try {
    const { detail, raw } = await getCmpTemplateDetail(id)

    // The template-detail shape is unconfirmed (CMP's Requests API is
    // "Experimental") — log the raw response so the real field-definition
    // contract can be read once against a live template and normalizeTemplateDetail
    // (lib/admin/cmpWorkRequests.ts) tightened to match.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[cmp-templates/${id}] raw response:\n` + JSON.stringify(raw, null, 2))
    }

    return NextResponse.json({ template: detail, raw })
  } catch (err) {
    console.error(`[cmp-templates/${id}] fetch failed:`, err)
    return NextResponse.json({ error: 'Could not reach CMP.' }, { status: 502 })
  }
}
