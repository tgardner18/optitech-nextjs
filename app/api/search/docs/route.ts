import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'

// ABA member resources folder in the connected DAM
const ABA_FOLDER_ID = 'd4a8d598869a11f199e246ea6176c851'

export type DocResult = {
  id:        string
  title:     string
  url:       string
  extension: string | null
  fileSize:  number | null
}

const SEMANTIC_DOCS_QUERY = `
  query SearchDamDocs($query: String!, $folderId: String!) {
    cmp_Asset(
      limit: 5
      orderBy: { _ranking: SEMANTIC }
      where: {
        _fulltext: { match: $query }
        FolderGuids: { eq: $folderId }
      }
    ) {
      items {
        _itemMetadata { key }
        Title
        MimeType
      }
    }
  }
`

const ASSET_URLS_QUERY = `
  query GetDocCdnUrls($keys: [String]) {
    _AssetItem(
      where: { _itemMetadata: { key: { in: $keys } } }
      limit: 5
    ) {
      items {
        _itemMetadata { key }
        _assetMetadata { url fileSize }
      }
    }
  }
`

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'text/csv': 'csv',
}

function titleWithoutExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot > 0 ? filename.slice(0, dot) : filename
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q        = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const folderId = req.nextUrl.searchParams.get('folderId') ?? ABA_FOLDER_ID

  if (q.length < 2) return NextResponse.json([])

  try {
    const searchData = await getClient().request(SEMANTIC_DOCS_QUERY, { query: q, folderId })
    const assets: Array<{ key: string; Title: string; MimeType: string }> =
      ((searchData as any)?.cmp_Asset?.items ?? [])
        .map((item: any) => ({
          key:      String(item._itemMetadata?.key ?? ''),
          Title:    String(item.Title    ?? ''),
          MimeType: String(item.MimeType ?? ''),
        }))
        .filter((a: { key: string }) => a.key)

    if (!assets.length) return NextResponse.json([])

    const keys    = assets.map(a => a.key)
    const urlData = await getClient().request(ASSET_URLS_QUERY, { keys })
    const urlMap  = new Map<string, { url: string; fileSize: number | null }>()
    for (const item of (urlData as any)?._AssetItem?.items ?? []) {
      const k   = item._itemMetadata?.key as string | undefined
      const url = item._assetMetadata?.url  as string | undefined
      if (k && url) {
        urlMap.set(k, {
          url,
          fileSize: typeof item._assetMetadata?.fileSize === 'number'
            ? item._assetMetadata.fileSize
            : null,
        })
      }
    }

    const results: DocResult[] = assets
      .filter(a => urlMap.has(a.key))
      .map(a => {
        const { url, fileSize } = urlMap.get(a.key)!
        return {
          id:        a.key,
          title:     titleWithoutExt(a.Title),
          url,
          extension: MIME_TO_EXT[a.MimeType] ?? null,
          fileSize,
        }
      })

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
