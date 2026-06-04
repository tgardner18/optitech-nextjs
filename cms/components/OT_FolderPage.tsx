import { ContentProps } from '@optimizely/cms-sdk'
import { OT_FolderPage } from '@/cms/content-types/OT_FolderPage'
import { FolderOpen, Info } from 'lucide-react'

type Props = { content: ContentProps<typeof OT_FolderPage> }

/**
 * CMS editor preview for OT_FolderPage.
 *
 * Designed for the narrow Optimizely editor preview pane (~300–500 px wide).
 * Does NOT attempt to show a "CMS tree path" — the Content Graph does not
 * expose ancestor data, and the URL path does not reliably reflect the tree.
 * Instead, shows the folder's display name, its public URL, and a clear
 * explanation that the page never renders on the front-end site.
 */
export default async function OT_FolderPageAdapter({ content }: Props) {
  const meta        = content._metadata ?? {}
  // Prefer displayName from metadata (set by editor in CMS); fall back to URL segment.
  const displayName = String(meta.displayName ?? meta.routeSegment ?? 'Folder')
  const rawUrl: string =
    typeof meta.url === 'string'
      ? meta.url
      : (meta.url?.default ?? '')
  const notes = content.notes as string | undefined

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0d1117',
        color:      '#e6edf3',
        minHeight:  '100vh',
        padding:    '24px 20px',
        boxSizing:  'border-box',
      }}
    >
      {/* ── Folder icon ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <FolderOpen
          size={40}
          strokeWidth={1}
          style={{ color: 'rgba(230,237,243,0.25)' }}
        />
      </div>

      {/* ── Folder name ───────────────────────────────────────────────────── */}
      <h1
        style={{
          fontSize:     22,
          fontWeight:   700,
          lineHeight:   1.2,
          margin:       '0 0 8px',
          letterSpacing: '-0.02em',
          color:         '#e6edf3',
        }}
      >
        {displayName}
      </h1>

      {/* ── URL path ──────────────────────────────────────────────────────── */}
      {rawUrl && (
        <p
          style={{
            fontSize:    12,
            fontFamily:  'ui-monospace, monospace',
            color:       'rgba(230,237,243,0.40)',
            margin:      '0 0 20px',
            wordBreak:   'break-all',
          }}
        >
          {rawUrl}
        </p>
      )}

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div
        style={{
          height:       1,
          background:   'rgba(230,237,243,0.08)',
          margin:       '0 0 20px',
        }}
      />

      {/* ── Info notice ───────────────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          gap:          10,
          alignItems:   'flex-start',
          background:   'rgba(230,237,243,0.04)',
          border:       '1px solid rgba(230,237,243,0.10)',
          borderRadius:  6,
          padding:       '12px 14px',
          marginBottom:  notes ? 12 : 0,
        }}
      >
        <Info
          size={14}
          strokeWidth={2}
          style={{ color: 'rgba(230,237,243,0.35)', marginTop: 2, flexShrink: 0 }}
        />
        <div>
          <p
            style={{
              fontSize:    13,
              fontWeight:  500,
              color:       '#e6edf3',
              margin:      '0 0 4px',
              lineHeight:  1.4,
            }}
          >
            This folder is never rendered on the live website.
          </p>
          <p
            style={{
              fontSize:   12,
              color:      'rgba(230,237,243,0.50)',
              margin:     0,
              lineHeight: 1.6,
            }}
          >
            It exists to organise content in the CMS tree. Visitors who navigate
            directly to this URL will see a 404.
          </p>
        </div>
      </div>

      {/* ── Editor notes (optional) ───────────────────────────────────────── */}
      {notes && (
        <div
          style={{
            border:       '1px solid rgba(230,237,243,0.10)',
            borderRadius:  6,
            padding:       '12px 14px',
          }}
        >
          <p
            style={{
              fontSize:    10,
              fontWeight:  600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'rgba(230,237,243,0.30)',
              margin:        '0 0 6px',
            }}
          >
            Editor Notes
          </p>
          <p
            style={{
              fontSize:   12,
              color:      'rgba(230,237,243,0.55)',
              margin:     0,
              lineHeight: 1.6,
            }}
          >
            {notes}
          </p>
        </div>
      )}
    </div>
  )
}
