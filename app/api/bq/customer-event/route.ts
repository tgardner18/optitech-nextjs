/**
 * POST /api/bq/customer-event
 *
 * Writes one row into customer_events + N rows into customer_products. Called
 * fire-and-forget by the Traffic Simulator's BigQuery sync. Admin-session
 * guarded (this project only exposes it via the operator tooling).
 */
import { NextResponse } from 'next/server'
import { isValidAdminSession } from '@/lib/admin/requireSession'
import { insertCustomerEvent, type CustomerEventRow } from '@/lib/bq/events'
import { insertCustomerProducts, type CustomerProductRow } from '@/lib/bq/products'

export const dynamic = 'force-dynamic'

function isString(x: unknown): x is string {
  return typeof x === 'string'
}
function asString(x: unknown): string | null {
  return isString(x) && x.length > 0 ? x : null
}
function asStringArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter(isString) : []
}
function asNumber(x: unknown): number | null {
  return typeof x === 'number' && Number.isFinite(x) ? x : null
}
function asBool(x: unknown): boolean | null {
  return typeof x === 'boolean' ? x : null
}

function buildProductRow(
  customer_id: string,
  fs_user_id: string | null,
  email: string | null,
  event_timestamp: string,
  demo_user: boolean,
  raw: Record<string, unknown>,
): CustomerProductRow | null {
  const product_id = asString(raw.product_id)
  if (!product_id) return null
  const product_type =
    raw.product_type === 'checking' || raw.product_type === 'savings' || raw.product_type === 'credit_card'
      ? raw.product_type
      : null
  const segment = raw.segment === 'Personal' || raw.segment === 'Business' ? raw.segment : null
  return {
    customer_id,
    fs_user_id,
    email,
    product_id,
    product_name: asString(raw.product_name),
    product_type,
    segment,
    account_id: asString(raw.account_id),
    account_number: asString(raw.account_number),
    balance: asNumber(raw.balance),
    is_primary: asBool(raw.is_primary),
    opened_at: asString(raw.opened_at),
    status: asString(raw.status) || 'active',
    interest_rate: asString(raw.interest_rate),
    apr: asString(raw.apr),
    rewards_rate: asString(raw.rewards_rate),
    annual_fee: asNumber(raw.annual_fee),
    monthly_fee: asNumber(raw.monthly_fee),
    minimum_balance: asNumber(raw.minimum_balance),
    features: asString(raw.features),
    event_timestamp,
    demo_user,
  }
}

export async function POST(request: Request) {
  if (!(await isValidAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  const customer_id = asString(b.customer_id)
  const event_type =
    b.event_type === 'register' || b.event_type === 'login' || b.event_type === 'product_change'
      ? b.event_type
      : null
  if (!customer_id || !event_type) {
    return NextResponse.json(
      { error: 'customer_id and event_type (login|register|product_change) are required' },
      { status: 400 },
    )
  }

  const customerType = b.customer_type === 'Personal' || b.customer_type === 'Business' ? b.customer_type : null
  const event_timestamp = asString(b.event_timestamp) ?? new Date().toISOString()
  const demo_user = b.demo_user !== false

  const eventRow: CustomerEventRow = {
    customer_id,
    fs_user_id: asString(b.fs_user_id),
    email: asString(b.email),
    first_name: asString(b.first_name),
    last_name: asString(b.last_name),
    gender: asString(b.gender),
    phone: asString(b.phone),
    avatar_url: asString(b.avatar_url),
    street: asString(b.street),
    city: asString(b.city),
    state: asString(b.state),
    zip: asString(b.zip),
    country: asString(b.country),
    dob: asString(b.dob),
    age: asNumber(b.age),
    member_since: asString(b.member_since),
    customer_type: customerType,
    linked_product_ids: asStringArray(b.linked_product_ids),
    linked_product_count: asNumber(b.linked_product_count) ?? asStringArray(b.linked_product_ids).length,
    event_type,
    event_timestamp,
    signup_source: asString(b.signup_source),
    demo_user,
  }

  const productRows: CustomerProductRow[] = Array.isArray(b.products)
    ? (b.products as unknown[])
        .map((p) =>
          buildProductRow(customer_id, eventRow.fs_user_id, eventRow.email, event_timestamp, demo_user, p as Record<string, unknown>),
        )
        .filter((r): r is CustomerProductRow => r !== null)
    : []

  try {
    await insertCustomerEvent(eventRow)
    if (productRows.length > 0) {
      await insertCustomerProducts(productRows)
    }
    return NextResponse.json({ ok: true, products: productRows.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[BQ] insert failed:', message)
    const err = e as { errors?: unknown }
    if (err && err.errors) console.error('[BQ] row errors:', JSON.stringify(err.errors))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
