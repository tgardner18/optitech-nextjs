/**
 * BigQuery client singleton. Server-only — never import from browser code.
 *
 * Credentials come from BQ_SERVICE_ACCOUNT_JSON (the full service-account JSON
 * as one string). The dataset comes from BQ_DATASET (default 'demo').
 */
import 'server-only'
import { BigQuery } from '@google-cloud/bigquery'

let cached: { bq: BigQuery; projectId: string; datasetId: string } | null = null

export function getBigQuery(): { bq: BigQuery; projectId: string; datasetId: string } | null {
  if (cached) return cached

  const raw = process.env.BQ_SERVICE_ACCOUNT_JSON
  if (!raw) {
    console.warn('[BQ] BQ_SERVICE_ACCOUNT_JSON not set — BigQuery sync disabled')
    return null
  }

  let credentials: { project_id: string; client_email: string; private_key: string }
  try {
    credentials = JSON.parse(raw)
  } catch (e) {
    console.error('[BQ] BQ_SERVICE_ACCOUNT_JSON is not valid JSON:', e)
    return null
  }

  if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
    console.error('[BQ] Service account JSON is missing project_id, client_email, or private_key')
    return null
  }

  const datasetId = process.env.BQ_DATASET || 'demo'

  const bq = new BigQuery({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  })

  cached = { bq, projectId: credentials.project_id, datasetId }
  return cached
}
