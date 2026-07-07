/**
 * BigQuery `customer_events` table — append-only log of login/register events
 * with a full customer-profile snapshot per row. Pairs with the auto-derived
 * `customer_summary` view. Server-only.
 */
import 'server-only'
import type { TableSchema } from '@google-cloud/bigquery'
import { getBigQuery } from './client'

export const EVENTS_TABLE = 'customer_events'
export const SUMMARY_VIEW = 'customer_summary'

export interface CustomerEventRow {
  customer_id: string
  fs_user_id: string | null
  email: string | null
  first_name: string | null
  last_name: string | null
  gender: string | null
  phone: string | null
  avatar_url: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  dob: string | null // YYYY-MM-DD
  age: number | null
  member_since: string | null // YYYY-MM-DD
  customer_type: 'Personal' | 'Business' | null
  linked_product_ids: string[]
  linked_product_count: number
  event_type: 'login' | 'register' | 'product_change'
  event_timestamp: string // ISO-8601
  signup_source: string | null
  demo_user: boolean
}

const SCHEMA: TableSchema = {
  fields: [
    { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'fs_user_id', type: 'STRING' },
    { name: 'email', type: 'STRING' },
    { name: 'first_name', type: 'STRING' },
    { name: 'last_name', type: 'STRING' },
    { name: 'gender', type: 'STRING' },
    { name: 'phone', type: 'STRING' },
    { name: 'avatar_url', type: 'STRING' },
    { name: 'street', type: 'STRING' },
    { name: 'city', type: 'STRING' },
    { name: 'state', type: 'STRING' },
    { name: 'zip', type: 'STRING' },
    { name: 'country', type: 'STRING' },
    { name: 'dob', type: 'DATE' },
    { name: 'age', type: 'INT64' },
    { name: 'member_since', type: 'DATE' },
    { name: 'customer_type', type: 'STRING' },
    { name: 'linked_product_ids', type: 'STRING', mode: 'REPEATED' },
    { name: 'linked_product_count', type: 'INT64' },
    { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
    { name: 'event_timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'signup_source', type: 'STRING' },
    { name: 'demo_user', type: 'BOOL' },
  ],
}

let ensured = false

async function ensureEventsTableAndView(): Promise<void> {
  if (ensured) return

  const env = getBigQuery()
  if (!env) throw new Error('BigQuery not configured')

  const dataset = env.bq.dataset(env.datasetId)
  const [datasetExists] = await dataset.exists()
  if (!datasetExists) {
    throw new Error(
      `Dataset "${env.datasetId}" does not exist in project ${env.projectId}. ` +
        `Create it in the BigQuery console first.`,
    )
  }

  const table = dataset.table(EVENTS_TABLE)
  const [exists] = await table.exists()

  const fq = `\`${env.projectId}.${env.datasetId}.${EVENTS_TABLE}\``
  const viewFq = `\`${env.projectId}.${env.datasetId}.${SUMMARY_VIEW}\``

  if (!exists) {
    await dataset.createTable(EVENTS_TABLE, {
      schema: SCHEMA,
      timePartitioning: { type: 'DAY', field: 'event_timestamp' },
      clustering: { fields: ['customer_id'] },
    })
  } else {
    await env.bq.query({
      query: `ALTER TABLE ${fq} ADD COLUMN IF NOT EXISTS fs_user_id STRING`,
    })
  }

  const viewSql = `
    CREATE OR REPLACE VIEW ${viewFq} AS
    WITH latest AS (
      SELECT * EXCEPT(rn) FROM (
        SELECT *, ROW_NUMBER() OVER (
          PARTITION BY customer_id ORDER BY event_timestamp DESC
        ) AS rn
        FROM ${fq}
      ) WHERE rn = 1
    ),
    agg AS (
      SELECT
        customer_id,
        MIN(event_timestamp) AS first_seen_at,
        MAX(event_timestamp) AS last_seen_at,
        COUNTIF(event_type = 'login')    AS total_logins,
        COUNTIF(event_type = 'register') AS total_registers,
        COUNT(*)                         AS total_events
      FROM ${fq}
      GROUP BY customer_id
    )
    SELECT
      l.customer_id, l.fs_user_id,
      l.email, l.first_name, l.last_name, l.gender, l.phone,
      l.avatar_url, l.street, l.city, l.state, l.zip, l.country,
      l.dob, l.age, l.member_since, l.customer_type,
      l.linked_product_ids, l.linked_product_count,
      l.signup_source, l.demo_user,
      l.event_type      AS latest_event_type,
      l.event_timestamp AS latest_event_at,
      a.first_seen_at, a.last_seen_at,
      a.total_logins, a.total_registers, a.total_events
    FROM latest l JOIN agg a USING (customer_id)
  `
  await env.bq.query({ query: viewSql })

  ensured = true
}

export async function insertCustomerEvent(row: CustomerEventRow): Promise<void> {
  const env = getBigQuery()
  if (!env) throw new Error('BigQuery not configured')

  await ensureEventsTableAndView()

  const table = env.bq.dataset(env.datasetId).table(EVENTS_TABLE)
  await streamingInsertWithRetry(() => table.insert([row]))
}

/**
 * Freshly-created BigQuery tables return "destination table has no schema" for
 * ~10-30s while metadata propagates. Retry that specific error.
 */
export async function streamingInsertWithRetry(insert: () => Promise<unknown>): Promise<void> {
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await insert()
      return
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      const isPropagation = message.includes('no schema') || message.includes('Not found')
      if (!isPropagation || attempt === maxAttempts) throw e
      const delayMs = 1500 * attempt
      console.warn(`[BQ] insert attempt ${attempt}/${maxAttempts} hit propagation race, retrying in ${delayMs}ms`)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}
