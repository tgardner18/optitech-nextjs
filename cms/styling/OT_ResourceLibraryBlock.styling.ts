import type { ResourceLibraryStyleOptions } from '@/components/blocks/ResourceLibraryBlock'

export function getResourceLibraryStyles(
  s: Record<string, string | boolean>,
): ResourceLibraryStyleOptions {
  const PAGE_SIZE: Record<string, number> = { ps6: 6, ps9: 9, ps12: 12, ps24: 24 }
  return {
    layout:       (s.layout       ?? 'list') as ResourceLibraryStyleOptions['layout'],
    color:        (s.color        ?? 'canvas') as ResourceLibraryStyleOptions['color'],
    showFileSize: s.showFileSize === 'show' || s.showFileSize === true,
    filterType:   (s.filterType   ?? 'all') as ResourceLibraryStyleOptions['filterType'],
    pageSize:     PAGE_SIZE[String(s.pageSize ?? 'ps12')] ?? 12,
  }
}
