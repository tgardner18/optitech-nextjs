import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ResourceAsset = {
  title:       string
  url:         string
  extension:   string | null
  fileSize:    number | null
  description: string | null
  // Populated when the CMP schema exposes a Tags field on cmp_Asset.
  // Add `Tags` to SIBLINGS_QUERY and map it in the merge step to enable.
  tags:        string[] | null
}

// ─── GraphQL queries ────────────────────────────────────────────────────────────
//
// DAM assets in this Optimizely instance are indexed as cmp_Asset (Optimizely
// CMP integration). The DAM folder is identified by ParentFolderGuid — the GUID
// visible in the DAM URL bar (parentFolderGuid=...).
//
// Two-step pattern:
//   1. Fetch all cmp_Asset items in the folder (Title, MimeType, keys).
//   2. Batch-fetch CDN download URLs from _AssetItem using the asset keys.
//      _assetMetadata.url on _AssetItem is the only place the CDN URL lives;
//      cmp_Asset itself has no url field.

const SIBLINGS_QUERY = `
  query GetFolderSiblings($parentFolderGuid: String!) {
    cmp_Asset(
      where: { ParentFolderGuid: { eq: $parentFolderGuid } }
      orderBy: { Title: ASC }
      limit: 50
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
  query GetAssetUrls($keys: [String]) {
    _AssetItem(
      where: { _itemMetadata: { key: { in: $keys } } }
      limit: 50
    ) {
      items {
        _itemMetadata { key }
        _assetMetadata { fileSize url }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────────

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf':  'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'video/mp4':  'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'text/csv':   'csv',
}

function extFromMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null
}

function extFromFilename(filename: string): string | null {
  const dot = filename.lastIndexOf('.')
  if (dot < 1 || dot === filename.length - 1) return null
  return filename.slice(dot + 1).toLowerCase()
}

function titleWithoutExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot > 0 ? filename.slice(0, dot) : filename
}

function matchesFilter(mime: string, filterType: string): boolean {
  if (filterType === 'all') return true
  if (filterType === 'images')    return mime.startsWith('image/')
  if (filterType === 'video')     return mime.startsWith('video/')
  if (filterType === 'documents') return mime.startsWith('application/') || mime.startsWith('text/')
  return true
}

// ─── Data access ────────────────────────────────────────────────────────────────

/**
 * Fetches all CMP assets in the same DAM folder as the given anchor asset.
 *
 * anchorAssetKey — ContentReference.key of the cmp_Asset selected by the editor
 * folderGuid  — the ParentFolderGuid of the DAM folder (from the damFolderId
 *               property; visible in the DAM URL bar as parentFolderGuid=...)
 * filterType  — display-template value; filters by MIME type category
 */
export async function getResourceLibraryAssets(
  folderGuid: string,
  filterType = 'all',
): Promise<ResourceAsset[]> {
  try {
    // ── Step 1: fetch all cmp_Asset items in the DAM folder ───────────────────
    const siblingsData = await getClient().request(SIBLINGS_QUERY, { parentFolderGuid: folderGuid })
    const siblings: Array<{ key: string; Title: string; MimeType: string }> =
      ((siblingsData as any)?.cmp_Asset?.items ?? [])
        .map((item: any) => ({
          key:      String(item._itemMetadata?.key   ?? ''),
          Title:    String(item.Title    ?? ''),
          MimeType: String(item.MimeType ?? ''),
        }))
        .filter((s: { key: string; Title: string }) => s.key && s.Title)
        .filter((s: { MimeType: string }) => matchesFilter(s.MimeType, filterType))

    if (!siblings.length) return []

    // ── Step 2: batch-fetch CDN download URLs via _AssetItem ──────────────────
    // cmp_Asset has no url field; _assetMetadata.url on _AssetItem is the source.
    const keys    = siblings.map(s => s.key)
    const urlData = await getClient().request(ASSET_URLS_QUERY, { keys })
    const urlMap  = new Map<string, { url: string; fileSize: number | null }>()
    for (const item of (urlData as any)?._AssetItem?.items ?? []) {
      const k   = item._itemMetadata?.key as string | undefined
      const url = item._assetMetadata?.url as string | undefined
      if (k && url) {
        urlMap.set(k, {
          url,
          fileSize: typeof item._assetMetadata?.fileSize === 'number'
            ? item._assetMetadata.fileSize
            : null,
        })
      }
    }

    // ── Merge and return ResourceAsset list ───────────────────────────────────
    return siblings
      .filter(s => urlMap.has(s.key))
      .map(s => {
        const { url, fileSize } = urlMap.get(s.key)!
        return {
          title:       titleWithoutExt(s.Title),
          url,
          extension:   extFromMime(s.MimeType) ?? extFromFilename(s.Title),
          fileSize,
          description: null,
          tags:        null,
        }
      })
  } catch {
    return []
  }
}
