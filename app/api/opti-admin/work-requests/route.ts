import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin/auth'
import { cmpConfigured, createCmpWorkRequest, type CmpWorkRequestFormField } from '@/lib/cmpApi'

// Field types treated as free-text enough to carry the external requester's
// context (name / email / department) as a prefixed line. The CMP work-request
// body only accepts template_id/assignees/form_fields (no separate "requester"
// concept), so this is the fold-in point described in the product spec.
const TEXT_LIKE_TYPES = new Set(['brief', 'text_area', 'richtext'])

type RequestBody = {
  templateId: string
  assignees?: string[]
  formFields: CmpWorkRequestFormField[]
  requester: { name: string; email: string; department?: string }
}

function foldRequesterContext(
  formFields: CmpWorkRequestFormField[],
  requester: RequestBody['requester'],
): { fields: CmpWorkRequestFormField[]; folded: boolean } {
  const contextLine = `Submitted via external request form by ${requester.name} (${requester.email})` +
    (requester.department ? `, ${requester.department}` : '')

  const targetIndex = formFields.findIndex(f => TEXT_LIKE_TYPES.has(f.type))
  if (targetIndex === -1) return { fields: formFields, folded: false }

  const fields = formFields.map((f, i) =>
    i === targetIndex
      ? { ...f, values: [contextLine, ...f.values] }
      : f
  )
  return { fields, folded: true }
}

export async function POST(request: Request) {
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

  let payload: RequestBody
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!payload.templateId || !Array.isArray(payload.formFields) || !payload.requester?.name || !payload.requester?.email) {
    return NextResponse.json({ error: 'templateId, formFields, and requester.name/email are required.' }, { status: 400 })
  }

  const { fields, folded } = foldRequesterContext(payload.formFields, payload.requester)

  console.log(
    `[work-requests] creating from template ${payload.templateId} — requester ${payload.requester.name} ` +
    `<${payload.requester.email}>${payload.requester.department ? ` (${payload.requester.department})` : ''}` +
    (folded ? '' : ' — no text-like field to attach requester context to, dropped from CMP payload'),
  )

  try {
    const result = await createCmpWorkRequest({
      templateId: payload.templateId,
      assignees:  payload.assignees,
      formFields: fields,
    })

    if (!result.ok) {
      return NextResponse.json({ error: 'CMP rejected the work request.', status: result.status, body: result.body }, { status: 502 })
    }

    return NextResponse.json({ ok: true, workRequest: result.body })
  } catch (err) {
    console.error('[work-requests] create failed:', err)
    return NextResponse.json({ error: 'Could not reach CMP.' }, { status: 502 })
  }
}
