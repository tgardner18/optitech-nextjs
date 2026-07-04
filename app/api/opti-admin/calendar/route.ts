import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin/auth'
import { getCalendarItems } from '@/lib/admin/graph'

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

  const items = await getCalendarItems()
  return NextResponse.json({ items })
}
