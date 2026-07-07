import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { isRestConfigured, listExperiments, OptimizelyRestError } from '@/lib/optimizely/rest'

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

  const projectId = new URL(request.url).searchParams.get('project_id')
  if (!projectId) {
    return NextResponse.json({ error: 'Missing project_id.' }, { status: 400 })
  }

  try {
    const experiments = await listExperiments(projectId)
    return NextResponse.json({ experiments })
  } catch (err) {
    const status = err instanceof OptimizelyRestError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to list experiments.'
    return NextResponse.json({ error: message }, { status })
  }
}
