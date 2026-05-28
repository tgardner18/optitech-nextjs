import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'
import FormWrapper from '@/components/forms/FormWrapper'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

const widthClasses: Record<string, string> = {
  narrow:  'max-w-2xl w-full mx-auto',
  default: 'max-w-3xl w-full mx-auto',
  wide:    'max-w-5xl w-full mx-auto',
  full:    'w-full px-md lg:px-lg',
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

  const widthClass   = widthClasses[width]    ?? widthClasses.default
  const spacingClass = spacingClasses[spacing] ?? spacingClasses.large
  const bgClass      = bgClasses[bg]           ?? ''

  // nodes can live at content.nodes (composition context) or
  // content.__composition?.nodes (some SDK versions surface it there).
  const nodes: any[] = (
    Array.isArray(content.nodes)               ? content.nodes :
    Array.isArray(content.__composition?.nodes)? content.__composition.nodes :
    []
  )

  return (
    <section className={`vb:section flex flex-col w-full ${bgClass}`} {...pa(content)}>
      <div className={`flex flex-col flex-1 ${widthClass} ${spacingClass}`}>
        <FormWrapper
          title={content.Title ?? undefined}
          description={content.Description ?? undefined}
          submitUrl={content.SubmitUrl?.default ?? undefined}
          confirmationMessage={content.SubmitConfirmationMessage ?? undefined}
        >
          {nodes.length > 0 ? (
            <OptimizelyGridSection nodes={nodes} />
          ) : (
            /*
             * Empty state — the Forms editor preview calls this adapter with only
             * the form's metadata (Title, Description, SubmitUrl). The form's step/
             * row/column/element composition is not passed in this context, so form
             * fields can't render here.
             *
             * The form fields DO render correctly when the form is embedded on a VB
             * page — preview from the page to see the real layout.
             */
            <div className="flex flex-col gap-sm">
              <p className="text-label font-medium text-fg-muted/40 tracking-label uppercase">
                Form fields not visible in Forms editor preview
              </p>
              <p className="text-[11px] text-fg-muted/30 leading-snug max-w-sm">
                To preview form fields, open the page this form is placed on and use the Visual Builder preview from there.
              </p>
            </div>
          )}
        </FormWrapper>
      </div>
    </section>
  )
}
