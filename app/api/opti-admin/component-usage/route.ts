import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { computeSessionToken, SESSION_COOKIE } from '@/lib/admin/auth'
import { getComponentInstances } from '@/lib/admin/graph'
import { ALLOWED_QUERY_KEYS } from '@/lib/admin/contentTypes'

export async function GET(request: Request) {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const expected = await computeSessionToken()
  if (session !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('type') ?? ''

  if (!contentType || !ALLOWED_QUERY_KEYS.has(contentType)) {
    return NextResponse.json({ error: 'Invalid or missing content type.' }, { status: 400 })
  }

  const result = await getComponentInstances(contentType)
  return NextResponse.json(result)
}
