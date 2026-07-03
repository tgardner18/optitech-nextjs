/**
 * Browser-side helpers that fire customer login/register snapshots at
 * /api/bq/customer-event. Fire-and-forget — failures log to console but never
 * reject so UX stays clean. Client-safe: does NOT import @google-cloud/bigquery.
 *
 * The payload bundles the customer profile (→ customer_events) AND a products[]
 * array (→ customer_products). One HTTP round trip per customer.
 */
import type { DemoPersona, DemoAccount } from '@/lib/demo/personas'
import type { RandomUserProfile } from '@/lib/demo/randomUser'
import { getLinkedProductIds, getOrPersistFsUserId } from '@/lib/demo/state'
import { PRODUCTS, getProductById, type DemoProduct } from '@/lib/demo/products'

type EventType = 'login' | 'register' | 'product_change'

interface ProductPayload {
  product_id: string
  product_name: string | null
  product_type: 'checking' | 'savings' | 'credit_card' | null
  segment: 'Personal' | 'Business' | null
  account_id: string | null
  account_number: string | null
  balance: number | null
  is_primary: boolean | null
  opened_at: string | null
  status: 'active' | 'removed'
  interest_rate: string | null
  apr: string | null
  rewards_rate: string | null
  annual_fee: number | null
  monthly_fee: number | null
  minimum_balance: number | null
  features: string | null
}

async function post(payload: Record<string, unknown>): Promise<void> {
  try {
    const r = await fetch('/api/bq/customer-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      console.warn('[BQ:sync] non-OK response:', r.status, text)
    }
  } catch (e) {
    console.warn('[BQ:sync] request failed:', e)
  }
}

function fromCatalog(p: DemoProduct, account: DemoAccount | null): ProductPayload {
  return {
    product_id: p.product_id,
    product_name: p.name,
    product_type: p.product_type,
    segment: p.segment,
    account_id: account?.id ?? null,
    account_number: account?.accountNumber ?? null,
    balance: account?.balance ?? null,
    is_primary: account?.isPrimary ?? null,
    opened_at: account?.openedAt ?? null,
    status: 'active',
    interest_rate: p.interest_rate || null,
    apr: p.apr || null,
    rewards_rate: p.rewards_rate || null,
    annual_fee: p.annual_fee,
    monthly_fee: p.monthly_fee,
    minimum_balance: p.minimum_balance,
    features: p.features || null,
  }
}

function buildProductPayloads(
  accounts: DemoAccount[],
  linkedIds: string[],
  removedIds: string[] = [],
): ProductPayload[] {
  const accountByProductId = new Map<string, DemoAccount>(
    accounts
      .filter((a): a is DemoAccount & { productId: string } => !!a.productId)
      .map((a) => [a.productId, a]),
  )

  const out: ProductPayload[] = []
  const seen = new Set<string>()

  for (const id of linkedIds) {
    const product = getProductById(id)
    if (!product) continue
    out.push(fromCatalog(product, accountByProductId.get(id) ?? null))
    seen.add(id)
  }

  for (const id of removedIds) {
    if (seen.has(id)) continue
    const product = PRODUCTS.find((p) => p.product_id === id)
    if (!product) continue
    out.push({ ...fromCatalog(product, accountByProductId.get(id) ?? null), status: 'removed' })
  }

  return out
}

/** Push a hardcoded-persona snapshot to BQ (login, register, product_change). */
export function syncPersonaToBigQuery(
  persona: DemoPersona,
  eventType: EventType,
  removedProductIds: string[] = [],
): void {
  const linked = getLinkedProductIds()
  const products = buildProductPayloads(persona.accounts, linked, removedProductIds)

  void post({
    customer_id: persona.id,
    fs_user_id: persona.fsUserId,
    email: persona.profile.email,
    first_name: persona.profile.firstName,
    last_name: persona.profile.lastName,
    gender: persona.profile.gender === 'M' ? 'male' : 'female',
    phone: persona.profile.phone,
    avatar_url: persona.profile.avatarUrl,
    street: persona.profile.location.street,
    city: persona.profile.location.city,
    state: persona.profile.location.state,
    zip: persona.profile.location.zip,
    country: persona.profile.location.country,
    dob: persona.profile.dob,
    age: persona.profile.age,
    member_since: persona.profile.memberSince,
    customer_type: persona.type,
    linked_product_ids: linked,
    linked_product_count: linked.length,
    event_type: eventType,
    event_timestamp: new Date().toISOString(),
    signup_source: 'demo_login',
    demo_user: true,
    products,
  })
}

/**
 * Push a random-user signup snapshot. `accounts` provides product holdings;
 * the Traffic Simulator passes an empty array (visitors have no accounts).
 */
export function syncRandomUserToBigQuery(
  user: RandomUserProfile,
  accountType: 'personal' | 'business',
  accounts: DemoAccount[],
  eventType: EventType,
): void {
  const inherited = accounts.map((a) => a.productId).filter((x): x is string => !!x)
  const linked = Array.from(new Set([...inherited, ...getLinkedProductIds()]))
  const products = buildProductPayloads(accounts, linked)

  void post({
    customer_id: user.login.uuid,
    fs_user_id: getOrPersistFsUserId(user.login.uuid),
    email: user.email,
    first_name: user.name.first,
    last_name: user.name.last,
    gender: user.gender,
    phone: user.phone,
    avatar_url: user.picture.large,
    street: `${user.location.street.number} ${user.location.street.name}`,
    city: user.location.city,
    state: user.location.state,
    zip: String(user.location.postcode),
    country: user.location.country,
    dob: user.dob.date.split('T')[0],
    age: user.dob.age,
    member_since: null,
    customer_type: accountType === 'personal' ? 'Personal' : 'Business',
    linked_product_ids: linked,
    linked_product_count: linked.length,
    event_type: eventType,
    event_timestamp: new Date().toISOString(),
    signup_source: 'web',
    demo_user: true,
    products,
  })
}
