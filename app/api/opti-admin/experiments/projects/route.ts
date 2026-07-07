import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { isRestConfigured, listProjects, OptimizelyRestError } from '@/lib/optimizely/rest'

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

  // ?scope=all includes Feature Experimentation projects (e.g. a central FX
  // "Events" project). Default is Web-Experimentation-only.
  const scope = new URL(request.url).searchParams.get('scope')
  const includeFeatureExperimentation = scope === 'all'

  try {
    const projects = await listProjects({ includeFeatureExperimentation })
    return NextResponse.json({ projects })
  } catch (err) {
    const status = err instanceof OptimizelyRestError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to list projects.'
    return NextResponse.json({ error: message }, { status })
  }
}
