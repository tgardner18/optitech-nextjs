/**
 * BigQuery `customer_products` table — append-only snapshot of each customer's
 * product holdings. Pairs with the auto-derived `customer_products_current`
 * view. Server-only.
 */
import 'server-only'
import type { TableSchema } from '@google-cloud/bigquery'
import { getBigQuery } from './client'
import { streamingInsertWithRetry } from './events'

export const PRODUCTS_TABLE = 'customer_products'
export const PRODUCTS_CURRENT_VIEW = 'customer_products_current'

export interface CustomerProductRow {
  customer_id: string
  fs_user_id: string | null
  email: string | null
  product_id: string
  product_name: string | null
  product_type: 'checking' | 'savings' | 'credit_card' | null
  segment: 'Personal' | 'Business' | null
  account_id: string | null
  account_number: string | null
  balance: number | null
  is_primary: boolean | null
  opened_at: string | null // YYYY-MM-DD
  status: string
  interest_rate: string | null
  apr: string | null
  rewards_rate: string | null
  annual_fee: number | null
  monthly_fee: number | null
  minimum_balance: number | null
  features: string | null
  event_timestamp: string // ISO-8601
  demo_user: boolean
}

const SCHEMA: TableSchema = {
  fields: [
    { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'fs_user_id', type: 'STRING' },
    { name: 'email', type: 'STRING' },
    { name: 'product_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'product_name', type: 'STRING' },
    { name: 'product_type', type: 'STRING' },
    { name: 'segment', type: 'STRING' },
    { name: 'account_id', type: 'STRING' },
    { name: 'account_number', type: 'STRING' },
    { name: 'balance', type: 'NUMERIC' },
    { name: 'is_primary', type: 'BOOL' },
    { name: 'opened_at', type: 'DATE' },
    { name: 'status', type: 'STRING' },
    { name: 'interest_rate', type: 'STRING' },
    { name: 'apr', type: 'STRING' },
    { name: 'rewards_rate', type: 'STRING' },
    { name: 'annual_fee', type: 'NUMERIC' },
    { name: 'monthly_fee', type: 'NUMERIC' },
    { name: 'minimum_balance', type: 'NUMERIC' },
    { name: 'features', type: 'STRING' },
    { name: 'event_timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'demo_user', type: 'BOOL' },
  ],
}

let ensured = false

async function ensureProductsTableAndView(): Promise<void> {
  if (ensured) return

  const env = getBigQuery()
  if (!env) throw new Error('BigQuery not configured')

  const dataset = env.bq.dataset(env.datasetId)
  const table = dataset.table(PRODUCTS_TABLE)
  const [exists] = await table.exists()

  const fq = `\`${env.projectId}.${env.datasetId}.${PRODUCTS_TABLE}\``
  const viewFq = `\`${env.projectId}.${env.datasetId}.${PRODUCTS_CURRENT_VIEW}\``

  if (!exists) {
    await dataset.createTable(PRODUCTS_TABLE, {
      schema: SCHEMA,
      timePartitioning: { type: 'DAY', field: 'event_timestamp' },
      clustering: { fields: ['customer_id', 'product_id'] },
    })
  } else {
    await env.bq.query({
      query: `ALTER TABLE ${fq} ADD COLUMN IF NOT EXISTS fs_user_id STRING`,
    })
  }

  const viewSql = `
    CREATE OR REPLACE VIEW ${viewFq} AS
    SELECT
      customer_id, fs_user_id, email,
      product_id, product_name, product_type, segment,
      account_id, account_number, balance, is_primary, opened_at, status,
      interest_rate, apr, rewards_rate, annual_fee, monthly_fee,
      minimum_balance, features, event_timestamp, demo_user
    FROM (
      SELECT *, ROW_NUMBER() OVER (
        PARTITION BY customer_id, product_id ORDER BY event_timestamp DESC
      ) AS rn
      FROM ${fq}
    )
    WHERE rn = 1 AND status = 'active'
  `
  await env.bq.query({ query: viewSql })

  ensured = true
}

export async function insertCustomerProducts(rows: CustomerProductRow[]): Promise<void> {
  if (rows.length === 0) return

  const env = getBigQuery()
  if (!env) throw new Error('BigQuery not configured')

  await ensureProductsTableAndView()

  const table = env.bq.dataset(env.datasetId).table(PRODUCTS_TABLE)
  await streamingInsertWithRetry(() => table.insert(rows))
}
