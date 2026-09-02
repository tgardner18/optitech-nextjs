import { type NextRequest, NextResponse } from 'next/server'
import { getCmpAccessToken, cmpConfigured } from '@/lib/cmpApi'
import { getClient } from '@/lib/optimizely'

// Shape consumed by TopicHubPage DocRow and DocResult type
type DocResult = {
  id:        string
  title:     string
  url:       string
  extension: string | null
  fileSize:  number | null
}

// ─── CMP folder search ────────────────────────────────────────────────────────
// Fetches all assets in a CMP folder, title-scores by query, returns top-N.
// The CMP API exposes `folder_id` as a filter; Content Graph's _AssetItem has
// no folder filter, so folder-scoped doc search must go through the CMP API.

interface CmpAsset {
  id:             string
  title?:         string
  is_archived?:   boolean
  file_extension?: string | null
  content?:       { type: string; value: string }
}

interface CmpAssetsResponse {
  data?: CmpAsset[]
}

function titleScore(title: string, q: string): number {
  const t = title.toLowerCase()
  const ql = q.toLowerCase()
  if (t === ql) return 4
  if (t.startsWith(ql)) return 3
  if (t.includes(ql)) return 2
  const terms = ql.split(/\s+/).filter(Boolean)
  if (!terms.length) return 0
  const hits = terms.filter(term => t.includes(term)).length
  return hits / terms.length
}

// The Assets bucket is for downloadable documents, not photos/video that happen
// to live in the same DAM folder — restrict to known document extensions so a
// stray image never gets a lying "PDF" badge (the old `?? 'pdf'` fallback).
const DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'])

const EXTENSION_SUFFIX = /\.([a-z0-9]{2,5})$/i

/** Strip a trailing filename extension from a display title, e.g. "Guide.pdf" -> "Guide". */
function stripExtension(title: string): string {
  return title.replace(EXTENSION_SUFFIX, '')
}

/** Extension from an explicit field if present, else parsed off the title's own suffix. */
function deriveExtension(explicit: string | null | undefined, title: string): string | null {
  const fromField = explicit?.toLowerCase() ?? null
  if (fromField) return fromField
  return EXTENSION_SUFFIX.exec(title)?.[1]?.toLowerCase() ?? null
}

/** De-dupe by normalized title + extension — CMP/Graph both surface real duplicate uploads as separate ids. */
function dedupeDocs(docs: DocResult[]): DocResult[] {
  const seen = new Set<string>()
  return docs.filter(d => {
    const key = `${d.title.toLowerCase()}|${d.extension ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function searchCmpFolder(
  q: string,
  folderId: string,
  limit: number,
): Promise<DocResult[]> {
  const token = await getCmpAccessToken()
  const url = `https://api.cmp.optimizely.com/v3/assets?folder_id=${encodeURIComponent(folderId)}&include_subfolder_assets=true&page_size=100`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`CMP folder fetch failed: ${res.status}`)

  const body = (await res.json()) as CmpAssetsResponse
  const assets = body.data ?? []

  const scored = assets
    .filter(a => !a.is_archived && a.content?.value)
    .map(a => ({ a, ext: deriveExtension(a.file_extension, a.title ?? '') }))
    .filter((x): x is { a: CmpAsset; ext: string } => !!x.ext && DOC_EXTENSIONS.has(x.ext))
    .map(({ a, ext }) => ({ a, ext, score: titleScore(a.title ?? '', q) }))
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit * 2) // headroom for de-dupe below

  return dedupeDocs(
    scored.map(({ a, ext }) => ({
      id:        a.id,
      title:     stripExtension(a.title ?? ''),
      url:       a.content!.value,
      extension: ext,
      fileSize:  null,
    })),
  ).slice(0, limit)
}

// ─── Graph fallback (no folder scope) ────────────────────────────────────────
// Used when no folderId is provided or CMP credentials are absent.

const DOCS_GRAPH_QUERY = `
  query SearchDocs($query: String!, $limit: Int!) {
    _AssetItem(
      orderBy: { _ranking: RELEVANCE }
      where: { _fulltext: { match: $query, fuzzy: true } }
      limit: $limit
    ) {
      items {
        _itemMetadata { key displayName }
        _assetMetadata { fileSize mimeType url }
      }
    }
  }
`

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf':     'pdf',
  'application/msword':  'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
}

async function searchGraphDocs(q: string, limit: number): Promise<DocResult[]> {
  // Unscoped — spans every asset Graph can see, so filtering to document mime
  // types is what keeps photos/video out of a bucket meant for downloads.
  const data = await getClient().request(DOCS_GRAPH_QUERY, { query: q, limit: limit * 2 })
  const items: any[] = (data as any)?._AssetItem?.items ?? []
  const docs = items
    .map((item: any) => {
      const title = item._itemMetadata?.displayName ?? 'Untitled'
      const ext   = MIME_TO_EXT[item._assetMetadata?.mimeType ?? ''] ?? deriveExtension(null, title)
      return {
        id:        item._itemMetadata?.key ?? '',
        title:     stripExtension(title),
        url:       item._assetMetadata?.url ?? '',
        extension: ext,
        fileSize:  item._assetMetadata?.fileSize ?? null,
      }
    })
    .filter(d => !!d.extension && DOC_EXTENSIONS.has(d.extension))
  return dedupeDocs(docs).slice(0, limit)
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q        = (searchParams.get('q') ?? '').trim()
  const folderId = searchParams.get('folderId')?.trim()
  const limit    = 12

  if (q.length < 2) return NextResponse.json([])

  // Folder-scoped search via CMP API (primary path for Topic Hub doc buckets).
  // If CMP IS configured and the call fails, return empty — don't fall through
  // to the unscoped Graph query (which returns assets from all sites).
  // If CMP is NOT configured (no credentials in env), fall through to Graph so
  // editors still see some results without needing CMP set up.
  if (folderId && cmpConfigured()) {
    try {
      const results = await searchCmpFolder(q, folderId, limit)
      return NextResponse.json(results)
    } catch (err) {
      console.error('[search/docs] CMP folder search failed:', err)
      return NextResponse.json([])
    }
  }

  // No folderId, or folderId present but CMP not configured — Graph fulltext
  // across all accessible assets. Leaving DAM Folder ID blank in the CMS is
  // the explicit opt-in for this unscoped mode.
  try {
    const results = await searchGraphDocs(q, limit)
    return NextResponse.json(results)
  } catch (err) {
    console.error('[search/docs] Graph docs search failed:', err)
    return NextResponse.json([])
  }
}
