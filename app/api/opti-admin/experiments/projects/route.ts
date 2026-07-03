import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { isRestConfigured, listProjects, OptimizelyRestError } from '@/lib/optimizely/rest'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isValidAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isRestConfigured()) {
    return NextResponse.json(
      { error: 'OPTIMIZELY_REST_API_TOKEN is not configured on this server.' },
      { status: 503 },
    )
  }

  try {
    const projects = await listProjects()
    return NextResponse.json({ projects })
  } catch (err) {
    const status = err instanceof OptimizelyRestError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to list projects.'
    return NextResponse.json({ error: message }, { status })
  }
}
