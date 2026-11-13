'use client'

import { BarChart2 } from 'lucide-react'
import type { ChartStyleOptions } from '@/cms/styling/OT_ChartBlock.styling'
import { HEIGHT_MAP } from '@/cms/styling/OT_ChartBlock.styling'

type Props = {
  height: ChartStyleOptions['height']
  color?: ChartStyleOptions['color']
}

/** Editor-only: the live page renders nothing for invalid data (see ChartBlock). */
export default function ChartEmptyState({ height }: Props) {
  return (
    <div data-part="empty" style={{ minHeight: Math.round(HEIGHT_MAP[height] * 0.6) }}>
      <span data-part="empty-badge">Only editors see this</span>
      <BarChart2 aria-hidden strokeWidth={1.75} />
      <p data-part="empty-title">This chart has no data to show</p>
      <p data-part="empty-text">The chart data isn&rsquo;t valid for this chart type. On the live page the block is hidden until it&rsquo;s fixed.</p>
    </div>
  )
}
