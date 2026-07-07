#!/usr/bin/env node
/**
 * cms:push wrapper — pushes content types/templates to the CMS, with automatic
 * first-import bootstrapping for fresh instances.
 *
 * Why this exists
 * ---------------
 * `mayContainTypes` lets page types reference each other (e.g. a Folder may
 * contain an Experience, which may contain a Blog page, …). Those declared
 * references form a cycle. On an instance where the types ALREADY exist the
 * push is an update and the cycle is fine. On a FRESH instance the importer has
 * to CREATE all the types in one atomic manifest, and a cyclic set of declared
 * references has no valid creation order — the server rejects it with
 * "circular dependency through …", which then cascades into misleading
 * "Unable to find a content type 'OT_…'" errors as the whole import rolls back.
 *
 * The fix is a two-phase bootstrap, done automatically and only when needed:
 *   Phase 1 — push the manifest with every `mayContainTypes` stripped, so all
 *             types create with no declared cross-references (no cycle).
 *   Phase 2 — push the real manifest; the references now resolve against types
 *             that already exist (exactly the "update" case that always works).
 *
 * Established instances never hit phase 1 — the first push just succeeds. The
 * content-type source files are never modified; the stripping happens only on
 * the in-memory manifest the CLI emits.
 *
 * Usage: node scripts/cms-push.mjs [--force] [--dryRun] [config file]
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const CLI = 'node_modules/@optimizely/cms-cli/bin/run.js'
const MANIFEST_MEDIA_TYPE = 'application/vnd.optimizely.cms.v1.manifest+json'
const DEFAULT_GATEWAY = 'https://api.cms.optimizely.com'

const passthru = process.argv.slice(2)
const isDryRun = passthru.includes('--dryRun')
const isForce = passthru.includes('--force')

// Opt-in bootstrap. The two-phase fix forces `ignore-data-loss-warnings` to
// create/restore the cyclic types, which is safe on an empty instance but could
// mask real data loss on a populated one — so it is OFF by default. Without the
// flag, a first-import cycle is surfaced as an error (no auto-fix, no forcing).
const doBootstrap = passthru.some((a) => a === '--ignore-circular-dependency' || a === '--bootstrap')
// Strip our own flags before forwarding to the CLI — oclif rejects unknown flags.
const cliPassthru = passthru.filter((a) => a !== '--ignore-circular-dependency' && a !== '--bootstrap')

// ── 1. Resolve the env file ───────────────────────────────────────────────────
// Prefer .env.<branch> (the repo's per-branch-instance convention), sanitizing
// '/' → '-' so slashed branch names like feature/x don't break the path. Fall
// back to .env.local so a fresh clone without a per-branch file still works.
function resolveEnvFile() {
  if (process.env.CMS_ENV_FILE) return process.env.CMS_ENV_FILE
  let branch = ''
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  } catch { /* not a git repo — fall through */ }
  const candidates = [branch && `.env.${branch.replace(/\//g, '-')}`, '.env.local'].filter(Boolean)
  const found = candidates.find((f) => existsSync(f))
  if (!found) {
    console.error(`\n✖ No env file found. Looked for: ${candidates.join(', ')}`)
    console.error('  Create one (with OPTIMIZELY_CMS_CLIENT_ID / _SECRET) or set CMS_ENV_FILE.\n')
    process.exit(1)
  }
  return found
}

const envFile = resolveEnvFile()
console.log(`› cms:push using ${envFile}`)

// Load creds into this process too, for the bootstrap self-POST.
try { process.loadEnvFile(envFile) } catch { /* values still reach the CLI via --env-file */ }

// ── 2. Run the CLI push, capturing output so we can detect the cycle error ────
function runCliPush(extraArgs = []) {
  return new Promise((resolve) => {
    const args = [`--env-file=${envFile}`, CLI, 'config', 'push', ...cliPassthru, ...extraArgs]
    const child = spawn('node', args, { stdio: ['inherit', 'pipe', 'pipe'] })
    let output = ''
    const tee = (stream, dest) => stream.on('data', (d) => { dest.write(d); output += d.toString() })
    tee(child.stdout, process.stdout)
    tee(child.stderr, process.stderr)
    child.on('close', (code) => resolve({ code, output }))
  })
}

// ── 3. Bootstrap helpers (only used when phase 1 is needed) ───────────────────
function resolveHost() {
  return (process.env.OPTIMIZELY_CMS_API_URL || DEFAULT_GATEWAY).replace(/\/$/, '')
}
// Mirrors the CLI: SaaS gateways take the token at the root and the manifest at
// /v1; PaaS instances use the /_cms/v1 prefix.
function isSaasGateway(url) {
  return /^https:\/\/api(-[^.]+)?\.cms[^.]*\.optimizely\.com$/.test(url)
}
function urls() {
  const base = resolveHost()
  if (!isSaasGateway(base)) {
    return { token: `${base}/_cms/v1/oauth/token`, manifest: `${base}/_cms/v1/manifest` }
  }
  return { token: `${base}/oauth/token`, manifest: `${base}/v1/manifest` }
}

async function getToken() {
  const { OPTIMIZELY_CMS_CLIENT_ID: id, OPTIMIZELY_CMS_CLIENT_SECRET: secret } = process.env
  if (!id || !secret) throw new Error('OPTIMIZELY_CMS_CLIENT_ID / _SECRET not in env')
  const res = await fetch(urls().token, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  })
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  if (!data?.access_token) throw new Error('Token endpoint returned no access_token')
  return data.access_token
}

async function pushManifest(manifest, token, ignoreDataLoss = false) {
  const res = await fetch(urls().manifest, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      'content-type': MANIFEST_MEDIA_TYPE,
      'cms-ignore-data-loss-warnings': String(ignoreDataLoss || isForce),
    },
    body: JSON.stringify(manifest),
  })
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = null }
  if (!res.ok) throw new Error(`Manifest POST failed: ${res.status} ${text}`)
  if (body?.errors?.length) {
    throw new Error('Bootstrap manifest rejected:\n' + body.errors.map((e) => `  - ${e.message ?? JSON.stringify(e)}`).join('\n'))
  }
  return body
}

// ── 4. Orchestrate ────────────────────────────────────────────────────────────
const manifestTmp = join(tmpdir(), `cms-manifest-${process.pid}.json`)
const cleanup = () => { try { rmSync(manifestTmp, { force: true }) } catch { /* ignore */ } }

async function main() {
  // First attempt — also writes the manifest JSON (before the server call) so
  // we already have it on hand if we need to strip + bootstrap.
  const first = await runCliPush(isDryRun ? [] : ['--output', manifestTmp])

  if (first.code === 0) return 0
  if (isDryRun) return first.code

  if (!/circular dependency/i.test(first.output)) {
    // Failed for some other reason — surface it as-is.
    return first.code
  }

  // A first-import cycle was detected. Only auto-resolve it when explicitly
  // opted in — the fix forces ignore-data-loss-warnings (see doBootstrap above).
  if (!doBootstrap) {
    console.error('\n✖ Push failed: a first-import dependency cycle (mayContainTypes) was detected.')
    console.error('  This is expected on a fresh CMS instance where these types do not exist yet.')
    console.error('  Re-run with the opt-in bootstrap to create the types in two phases:')
    console.error('      yarn cms:push --ignore-circular-dependency      (alias: --bootstrap)')
    console.error('  Note: bootstrapping forces `ignore-data-loss-warnings`, so use it only when')
    console.error('  you accept that (always safe on an empty instance; review on a populated one).')
    return first.code || 1
  }

  console.log('\n› Detected a first-import dependency cycle. Bootstrapping (--ignore-circular-dependency set)…')

  if (!existsSync(manifestTmp)) {
    console.error('✖ Expected manifest at', manifestTmp, '— cannot bootstrap.')
    return first.code
  }

  // Keep the full manifest for phase 2; strip a clone for phase 1.
  const fullManifest = JSON.parse(readFileSync(manifestTmp, 'utf8'))
  const phase1 = JSON.parse(JSON.stringify(fullManifest))
  let stripped = 0
  for (const ct of phase1.contentTypes ?? []) {
    if (ct.mayContainTypes) { delete ct.mayContainTypes; stripped++ }
  }

  // Both phases force `ignore-data-loss-warnings`: stripping then restoring
  // mayContainTypes on an already-existing type (e.g. BlankExperience) is always
  // flagged "breaking" by the server, even though no content is actually lost.
  const token = await getToken()

  console.log(`› Phase 1: creating/updating ${phase1.contentTypes?.length ?? 0} content types with mayContainTypes stripped (${stripped} had references)…`)
  const r1 = await pushManifest(phase1, token, /* ignoreDataLoss */ true)
  for (const o of r1?.outcomes ?? []) console.log('  ✓', o.message ?? o)
  console.log('› Phase 1 complete.')

  // Phase 2: full manifest — references now resolve against the just-created types.
  console.log('› Phase 2: applying full manifest (restoring mayContainTypes)…')
  const r2 = await pushManifest(fullManifest, token, /* ignoreDataLoss */ true)
  for (const o of r2?.outcomes ?? []) console.log('  ✓', o.message ?? o)
  console.log('› Phase 2 complete. CMS schema is in sync.')
  return 0
}

main()
  .then((code) => { cleanup(); process.exit(code ?? 0) })
  .catch((err) => { cleanup(); console.error('\n✖', err.message); process.exit(1) })
