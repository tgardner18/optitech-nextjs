import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin/auth'
import { cmpConfigured, listCmpTemplates } from '@/lib/cmpApi'

export async function GET() {
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

  try {
    const { templates } = await listCmpTemplates()
    return NextResponse.json({ templates })
  } catch (err) {
    console.error('[cmp-templates] list failed:', err)
    return NextResponse.json({ error: 'Could not reach CMP.' }, { status: 502 })
  }
}
