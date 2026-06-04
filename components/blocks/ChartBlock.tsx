import ChartBlockClient from './ChartBlock.client'
import type { ChartBlockClientProps } from './ChartBlock.client'

export type ChartBlockProps = ChartBlockClientProps

export default function ChartBlock(props: ChartBlockProps) {
  return <ChartBlockClient {...props} />
}
