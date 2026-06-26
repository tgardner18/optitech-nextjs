import type { BlogPageContent } from '@/lib/blog'

// ─── CMP preview payload → BlogPageContent mapping ──────────────────────────────
//
// Optimizely CMP (Welcome) delivers structured content in a deeply-nested,
// locale-and-version-aware shape. The actual field values live at:
//
//   data.assets.structured_contents[0]
//     .content_body.fields_version.fields[<fieldKey>][n].field_values[0]
//
// where each field is an array of per-locale entries, and each entry has a
// field_values array whose item shape depends on the field type:
//   text-field     → { text_value }
//   choice         → { choice_key }
//   rich-text      → { rich_text_value }   (HTML string)
//   library-asset  → { asset_guid, asset_type, links: { self } }
//
// This module flattens that into the flat BlogPageContent our <BlogPage>
// component already consumes, so the CMP preview renders through the exact same
// UI as a CMS-backed blog page.

type AnyRec = Record<string, any>

// Picks the field_values[0] object for a field, preferring the entry matching
// the content's primary locale and falling back to the first entry.
function fieldValue(fields: AnyRec, key: string, locale?: string): AnyRec | undefined {
  const entries = fields?.[key]
  if (!Array.isArray(entries) || entries.length === 0) return undefined
  const entry = (locale && entries.find((e: AnyRec) => e?.locale === locale)) || entries[0]
  return entry?.field_values?.[0]
}

export type MappedCmpBlog = {
  content: BlogPageContent
  /** Identifiers needed to acknowledge / complete the preview back to CMP (phase 3). */
  previewId?: string
  contentId?: string
  versionId?: string
  /** Stable CMP content identifier — the idempotency key for CMS create/update (phase 4). */
  contentGuid?: string
  contentHash?: string
  /** CMP asset-urls endpoint for the featured image — needs CMP API auth to resolve. */
  featuredImageAssetUrl?: string | null
  /** Raw CMP DAM asset guid. In the CMS shared DAM this is the key of the
   *  federated graph:cmp_PublicImageAsset, referenceable as cms://content/<guid>. */
  featuredImageAssetGuid?: string | null
  /** Content locale (CMP primary_locale), defaulting to 'en'. */
  locale: string
  links?: { acknowledge?: string; complete?: string }
}

// Maps a captured `content_preview_requested` payload to BlogPageContent.
// Returns null if the payload contains no structured content. `blogStyle` lets
// the caller pick a header treatment (CMP's content type has no such field).
export function mapCmpPreviewToBlog(
  rawPayload: unknown,
  opts?: { blogStyle?: string },
): MappedCmpBlog | null {
  const payload = rawPayload as AnyRec
  const sc = payload?.data?.assets?.structured_contents?.[0]
  if (!sc) return null

  // CMP emits locales inconsistently — `en_US` (underscore), a bare `en`, or an
  // odd-cased `En` — while the CMS Management API requires a canonical BCP-47 tag
  // (`en-US`, `en`). Normalize the separator and subtag casing (language lower,
  // 2-letter region upper). Only applied to values handed to the CMS — the raw
  // form is kept for CMP per-locale field matching below.
  const toBcp47 = (l: string): string => {
    const parts = l.replace(/_/g, '-').split('-').filter(Boolean)
    if (parts.length === 0) return 'en'
    parts[0] = parts[0].toLowerCase() // language subtag
    if (parts[1] && /^[A-Za-z]{2}$/.test(parts[1])) parts[1] = parts[1].toUpperCase() // region subtag
    return parts.join('-')
  }

  const body = sc.content_body ?? {}
  // content_preview_requested nests fields under `fields_version`; asset_published
  // uses `latest_fields_version`. Accept either so one mapper serves both events.
  const fieldsVersion = body.latest_fields_version ?? body.fields_version ?? {}
  const fields = fieldsVersion.fields ?? {}
  const locale: string | undefined = body.primary_locale

  const text   = (k: string) => fieldValue(fields, k, locale)?.text_value as string | undefined
  const rich   = (k: string) => fieldValue(fields, k, locale)?.rich_text_value as string | undefined
  const choice = (k: string) => fieldValue(fields, k, locale)?.choice_key as string | undefined

  const headline    = text('headline') ?? sc.title ?? 'Untitled'
  const subHeadline = text('subHeadline')
  const readTime    = text('readTime')
  const bodyHtml    = rich('body') ?? ''
  // BlogPage's TOPIC_LABELS are keyed lowercase; CMP choice keys are TitleCase.
  const topicRaw    = choice('topic')
  const topic       = topicRaw ? topicRaw.toLowerCase() : undefined
  const published   = body.updated_at ?? body.created_at ?? ''

  const featuredImageField    = fieldValue(fields, 'featuredImage', locale)
  const featuredImageAssetUrl  = featuredImageField?.links?.self ?? null
  const featuredImageAssetGuid = featuredImageField?.asset_guid ?? null

  const content: BlogPageContent = {
    _metadata: {
      key: body.content_guid ?? sc.id ?? 'cmp-preview',
      published,
      url: { default: null },
    },
    headline,
    subHeadline,
    topic,
    blogStyle: opts?.blogStyle ?? 'editorial',
    body: { html: bodyHtml },
    readTime,
    // CMP's blog content type has no author field, and the featured image is a
    // CMP-hosted asset that needs API auth to resolve — both omitted for now.
    authorRef: null,
  }

  return {
    content,
    previewId: payload?.data?.preview_id,
    contentId: sc.id,
    versionId: sc.version_id,
    contentGuid: body.content_guid,
    contentHash: fieldsVersion.content_hash,
    featuredImageAssetUrl,
    featuredImageAssetGuid,
    locale: toBcp47(locale ?? 'en'),
    links: {
      acknowledge: payload?.data?.links?.acknowledge,
      complete: payload?.data?.links?.complete,
    },
  }
}
