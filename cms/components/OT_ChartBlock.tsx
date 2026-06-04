import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_ChartBlock as OT_ChartBlockContentType } from '@/cms/content-types/OT_ChartBlock'
import { getChartStyles } from '@/cms/styling/OT_ChartBlock.styling'
import ChartBlock from '@/components/blocks/ChartBlock'

type Props = {
  content:          ContentProps<typeof OT_ChartBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_ChartBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  const styleOptions = getChartStyles(displaySettings)

  return (
    <div style={{ width: '100%', minWidth: 0 }} {...pa(content.__composition)}>
      <ChartBlock
        heading={content.heading ?? ''}
        subtext={content.subtext ?? undefined}
        chartType={content.chartType ?? 'bar'}
        chartData={content.chartData ?? null}
        seriesColors={content.seriesColors ?? 'brand'}
        valuePrefix={content.valuePrefix ?? undefined}
        valueSuffix={content.valueSuffix ?? undefined}
        showLegend={content.showLegend ?? true}
        showGrid={content.showGrid ?? true}
        styleOptions={styleOptions}
      />
    </div>
  )
}
