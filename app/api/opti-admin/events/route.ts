import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { isRestConfigured, listEventsForProjects, OptimizelyRestError } from '@/lib/optimizely/rest'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await isValidAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isRestConfigured()) {
    return NextResponse.json(
      { error: 'OPTIMIZELY_REST_API_TOKEN is not configured on this server.' },
      { status: 503 },
    )
  }

  // Zero or more project_id params. None → all projects the token can access.
  const projectIds = new URL(request.url).searchParams.getAll('project_id')

  try {
    const events = await listEventsForProjects(projectIds)
    return NextResponse.json({ events })
  } catch (err) {
    const status = err instanceof OptimizelyRestError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to list events.'
    return NextResponse.json({ error: message }, { status })
  }
}
