import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'
import FormWrapper from '@/components/forms/FormWrapper'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

const widthClasses: Record<string, string> = {
  narrow:  'max-w-2xl w-full mx-auto px-lg',
  default: 'container mx-auto px-lg w-full',
  wide:    'max-w-5xl w-full mx-auto px-lg',
  full:    'w-full px-lg',
}

const spacingClasses: Record<string, string> = {
  none:   'py-0',
  small:  'py-md',
  medium: 'py-lg',
  large:  'py-xl',
}

const bgClasses: Record<string, string> = {
  none:    '',
  canvas:  'bg-canvas',
  surface: 'bg-surface',
}

export default async function OptiFormsContainerDataAdapter({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)

  const width   = String(displaySettings.contentWidth      ?? 'default')
  const spacing = String(displaySettings.verticalSpacing   ?? 'large')
  const bg      = String(displaySettings.backgroundColor   ?? 'none')

  const widthClass   = widthClasses[width]   ?? widthClasses.default
  const spacingClass = spacingClasses[spacing] ?? spacingClasses.large
  const bgClass      = bgClasses[bg]           ?? ''

  return (
    <section className={`vb:section w-full ${spacingClass} ${bgClass}`} {...pa(content)}>
      <div className={widthClass}>
        <FormWrapper
          title={content.Title ?? undefined}
          description={content.Description ?? undefined}
          submitUrl={content.SubmitUrl?.default ?? undefined}
          confirmationMessage={content.SubmitConfirmationMessage ?? undefined}
        >
          <OptimizelyGridSection nodes={content.nodes ?? []} />
        </FormWrapper>
      </div>
    </section>
  )
}
