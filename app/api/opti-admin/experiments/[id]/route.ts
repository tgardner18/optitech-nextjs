import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { isRestConfigured, getExperimentBlueprint, OptimizelyRestError } from '@/lib/optimizely/rest'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isValidAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isRestConfigured()) {
    return NextResponse.json(
      { error: 'OPTIMIZELY_REST_API_TOKEN is not configured on this server.' },
      { status: 503 },
    )
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing experiment id.' }, { status: 400 })
  }

  try {
    const blueprint = await getExperimentBlueprint(id)
    return NextResponse.json({ blueprint })
  } catch (err) {
    const status = err instanceof OptimizelyRestError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to load experiment.'
    return NextResponse.json({ error: message }, { status })
  }
}
