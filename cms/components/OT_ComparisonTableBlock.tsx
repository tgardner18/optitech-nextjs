import { ContentProps }       from '@optimizely/cms-sdk'
import { getPreviewUtils }   from '@optimizely/cms-sdk/react/server'
import { OT_ComparisonTableBlock as OT_ComparisonTableBlockContentType } from '@/cms/content-types/OT_ComparisonTableBlock'
import ComparisonTableBlock  from '@/components/blocks/ComparisonTableBlock'
import type { ComparisonColumn, ComparisonRow, ComparisonCell, TableStyle } from '@/components/blocks/ComparisonTableBlock'

type Props = {
  content:          ContentProps<typeof OT_ComparisonTableBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

function buildColumns(content: any): ComparisonColumn[] {
  if (!Array.isArray(content.columns)) return []
  return (content.columns as any[]).map(col => ({
    label:     String(col.label   ?? ''),
    subLabel:  col.subLabel   ? String(col.subLabel)          : undefined,
    badgeText: col.badgeText  ? String(col.badgeText)         : undefined,
    ctaLabel:  col.ctaLabel   ? String(col.ctaLabel)          : undefined,
    ctaHref:   col.ctaUrl?.default ? String(col.ctaUrl.default) : undefined,
  }))
}

function buildRows(content: any): ComparisonRow[] {
  if (!Array.isArray(content.rows)) return []
  return (content.rows as any[]).map(row => {
    const cells: ComparisonCell[] = Array.isArray(row.cells)
      ? (row.cells as any[]).map(cell => ({
          icon:    cell.icon && cell.icon !== 'none' ? String(cell.icon) : undefined,
          text:    cell.text    ? String(cell.text)  : undefined,
          isEmpty: cell.isEmpty === true,
        }))
      : []
    return {
      rowType: row.rowType === 'group' ? 'group' as const : 'row' as const,
      label:   String(row.label ?? ''),
      tooltip: row.tooltip ? String(row.tooltip) : undefined,
      cells,
    }
  })
}

export default function OT_ComparisonTableBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const columns      = buildColumns(content)
  const rows         = buildRows(content)
  const color        = String(displaySettings.color ?? 'canvas') as 'canvas' | 'surface'
  const tableStyle   = String(content.tableStyle ?? 'clean') as TableStyle

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ComparisonTableBlock
        eyebrow={content.eyebrow      ?? undefined}
        headline={content.headline    ?? ''}
        subHeadline={content.subHeadline ?? undefined}
        columns={columns}
        rows={rows}
        color={color}
        tableStyle={tableStyle}
      />
    </div>
  )
}
