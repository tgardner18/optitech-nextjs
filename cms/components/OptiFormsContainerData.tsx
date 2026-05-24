import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'
import FormWrapper from '@/components/forms/FormWrapper'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

const widthClasses: Record<string, string> = {
  narrow:  'max-w-2xl w-full mx-auto px-lg',
  default: 'max-w-3xl w-full mx-auto px-lg',
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
            /* Empty state — shown in standalone CMS preview or when no elements
               have been added to this form container in the Visual Builder.
               In a VB experience, add form elements (Textbox, Selection, etc.)
               directly inside this form container section. */
            <div className="flex flex-col gap-sm">
              {/* Placeholder fields — labels are visible text so you can see
                  what the form will look like when embedded in a VB experience */}
              {[
                { label: 'Text field', w: 'w-full' },
                { label: 'Text field', w: 'w-full' },
                { label: 'Selection', w: 'w-full md:w-1/2' },
              ].map((f, i) => (
                <div key={i} className={`${f.w} flex flex-col gap-xs`}>
                  <p className="text-label font-medium text-fg-muted/50 tracking-label uppercase">
                    {f.label}
                  </p>
                  <div className="h-10 w-full rounded-input border border-fg/10 bg-canvas/40" />
                </div>
              ))}
              <div className="pt-sm">
                <div className="h-10 w-32 rounded-sm bg-brand/20 border border-brand/30" />
              </div>
              <p className="text-label text-fg-muted/50 tracking-label uppercase pt-xs">
                Add form elements in the Visual Builder
              </p>
            </div>
          )}
        </FormWrapper>
      </div>
    </section>
  )
}
