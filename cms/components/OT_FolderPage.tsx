import { FolderOpen, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { content: any }

// ─── Breadcrumb helpers ───────────────────────────────────────────────────────

/** Convert a URL slug segment to a display label: "arm-hammer" → "Arm Hammer" */
function segmentToLabel(seg: string): string {
  return seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Parse a URL (absolute or relative) into an ordered list of breadcrumb labels.
 * Strips a leading locale segment (e.g. "en", "en-US") when present.
 */
function buildBreadcrumb(url: string | { default?: string } | undefined): string[] {
  if (!url) return []
  const raw = typeof url === 'string' ? url : (url.default ?? '')
  if (!raw) return []

  let pathname = raw
  try { pathname = new URL(raw).pathname } catch { /* already a path */ }

  const parts = pathname.split('/').filter(Boolean)
  if (!parts.length) return []

  // Strip locale prefix: "en", "fr", "de", "en-US", "nb-NO", etc.
  const isLocale = /^[a-z]{2}(-[a-zA-Z]{2,4})?$/i.test(parts[0])
  const segments = isLocale ? parts.slice(1) : parts

  return ['Home', ...segments.map(segmentToLabel)]
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CMS editor preview for OT_FolderPage.
 *
 * Renders in the Visual Builder / preview pane only — this component is never
 * served to public visitors (those receive a 404).
 *
 * Shows:
 *   • The full tree path as a breadcrumb, derived from the content URL
 *   • The folder name as the page heading
 *   • A notice explaining this page never renders on the front-end
 *   • Optional editor notes if the content.notes field is populated
 */
export default async function OT_FolderPageAdapter({ content }: Props) {
  const meta   = content._metadata ?? {}
  const rawUrl = meta.url ?? ''
  const crumbs = buildBreadcrumb(rawUrl)

  // Folder display name: last breadcrumb segment, or route segment, or fallback
  const folderName =
    crumbs.at(-1) ??
    (meta.routeSegment ? segmentToLabel(String(meta.routeSegment)) : 'Folder')

  const notes = content.notes as string | undefined

  return (
    <div className="min-h-screen bg-canvas flex items-start justify-center px-lg py-2xl">
      <div className="w-full max-w-xl">

        {/* ── Folder icon ───────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-xl">
          <FolderOpen
            className="text-fg-muted/25"
            size={80}
            strokeWidth={1}
          />
        </div>

        {/* ── Breadcrumb path ───────────────────────────────────────────────── */}
        {crumbs.length > 1 && (
          <nav aria-label="Folder path" className="mb-sm">
            <p className="text-label tracking-label uppercase text-fg-muted/50 font-medium mb-xs">
              Location in tree
            </p>
            <ol className="flex items-center flex-wrap gap-y-xs">
              {crumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-xs">
                  <span className={cn(
                    'text-sm font-medium',
                    i === crumbs.length - 1 ? 'text-fg' : 'text-fg-muted/55',
                  )}>
                    {crumb}
                  </span>
                  {i < crumbs.length - 1 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="text-fg-muted/30 shrink-0"
                      size={13}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* ── Folder name ───────────────────────────────────────────────────── */}
        <h1 className="text-2xl font-bold text-fg tracking-tight mb-xl">
          {folderName}
        </h1>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="h-px bg-fg/8 mb-xl" />

        {/* ── Info notice ───────────────────────────────────────────────────── */}
        <div className="flex gap-md items-start bg-surface border border-fg/8 rounded-sm px-lg py-md">
          <Info
            aria-hidden="true"
            className="text-fg-muted/50 shrink-0 mt-0.5"
            size={17}
          />
          <div>
            <p className="text-sm font-medium text-fg leading-snug">
              This folder is never rendered on the live website.
            </p>
            <p className="text-sm text-fg-muted mt-xs leading-relaxed">
              It exists to organize content in the CMS tree and to provide a clean
              URL namespace for child pages. Visitors who navigate directly to this
              URL will see a 404 page.
            </p>
          </div>
        </div>

        {/* ── Editor notes (optional) ───────────────────────────────────────── */}
        {notes && (
          <div className="mt-md border border-fg/8 rounded-sm px-lg py-md">
            <p className="text-label tracking-label uppercase text-fg-muted/50 font-medium mb-xs">
              Editor Notes
            </p>
            <p className="text-sm text-fg-muted leading-relaxed">{notes}</p>
          </div>
        )}

      </div>
    </div>
  )
}
