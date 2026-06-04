import { getPreviewUtils, OptimizelyGridSection, OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import FormWrapper from '@/components/forms/FormWrapper'
import { getClient } from '@/lib/optimizely'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

const widthClasses: Record<string, string> = {
  narrow:  'max-w-3xl w-full mx-auto',
  default: 'max-w-4xl w-full mx-auto',
  wide:    'max-w-6xl w-full mx-auto',
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

// Fragment for form element component data — matches the element types registered in the registry.
// This is queried against OptiFormsContainerData.composition.grids[].compositionComponentNodes
// since the form's internal composition uses "grids" (not VB "nodes @recursive").
const FORM_ELEMENTS_FRAGMENT = `
  __typename
  _metadata { key }
  ... on OptiFormsTextboxElement    { Label Placeholder Tooltip PredefinedValue Validators AutoComplete }
  ... on OptiFormsTextareaElement   { Label Placeholder Tooltip PredefinedValue Validators }
  ... on OptiFormsChoiceElement     { Label Tooltip AllowMultiSelect SingleChoice Validators }
  ... on OptiFormsNumberElement     { Label Placeholder Tooltip PredefinedValue Validators }
  ... on OptiFormsRangeElement      { Label Tooltip Min Max Step PredefinedValue Validators }
  ... on OptiFormsSelectionElement  { Label Tooltip PredefinedValue Feed Validators }
  ... on OptiFormsSubmitElement     { Label Tooltip }
  ... on OptiFormsResetElement      { Label Tooltip }
  ... on OptiFormsUrlElement        { Label Placeholder Tooltip PredefinedValue Validators AutoComplete }
`

// Fetch the form's title, submit metadata, and element composition via Optimizely Content Graph.
// OptiFormsContainerData is a _section type — its internal elements live in composition.grids,
// not in the VB-page composition.nodes @recursive. This fetch is the bridge.
//
// Schema reference: each grid in composition.grids[] represents a form row and exposes
// compositionComponentNode with the element data directly.
async function fetchFormData(contentKey: string): Promise<{
  title: string | undefined
  description: string | undefined
  submitUrl: string | undefined
  confirmationMessage: string | undefined
  elementNodes: any[]
} | null> {
  try {
    const data = await getClient().request(
      `query GetFormData($key: String!) {
        OptiFormsContainerData(
          where: { _metadata: { key: { eq: $key } } }
          limit: 1
        ) {
          items {
            Title
            Description
            SubmitUrl { default }
            SubmitConfirmationMessage
            composition {
              grids {
                compositionType
                compositionComponentNode {
                  ${FORM_ELEMENTS_FRAGMENT}
                }
              }
            }
          }
        }
      }`,
      { key: contentKey },
    )

    const item = data?.OptiFormsContainerData?.items?.[0]
    if (!item) return null

    // Flatten grids into element nodes — each grid is a form row with one element
    const elementNodes: any[] = (item.composition?.grids ?? [])
      .map((g: any) => g.compositionComponentNode)
      .filter((n: any) => n?.__typename)

    return {
      title:               item.Title ?? undefined,
      description:         item.Description ?? undefined,
      submitUrl:           item.SubmitUrl?.default ?? undefined,
      confirmationMessage: item.SubmitConfirmationMessage ?? undefined,
      elementNodes,
    }
  } catch {
    return null
  }
}

export default async function OptiFormsContainerDataAdapter({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)

  const width   = String(displaySettings.contentWidth      ?? 'default')
  const spacing = String(displaySettings.verticalSpacing   ?? 'large')
  const bg      = String(displaySettings.backgroundColor   ?? 'none')

  const widthClass   = widthClasses[width]    ?? widthClasses.default
  const spacingClass = spacingClasses[spacing] ?? spacingClasses.large
  const bgClass      = bgClasses[bg]           ?? ''

  // VB-page nodes (populated when composition system inlines the form section's child nodes)
  const compositionNodes: any[] = (
    Array.isArray(content.nodes)               ? content.nodes :
    Array.isArray(content.__composition?.nodes)? content.__composition.nodes :
    []
  )

  // Form metadata from content object (available when rendered as a typed section)
  let title               = content.Title              ?? undefined
  let description         = content.Description        ?? undefined
  let submitUrl           = content.SubmitUrl?.default ?? undefined
  let confirmationMessage = content.SubmitConfirmationMessage ?? undefined

  // Element nodes from the grids fetch (used when compositionNodes is empty)
  let elementNodes: any[] = []

  if (compositionNodes.length === 0 && content._metadata?.key) {
    const fetched = await fetchFormData(content._metadata.key)
    if (fetched) {
      title               = title               ?? fetched.title
      description         = description         ?? fetched.description
      submitUrl           = submitUrl           ?? fetched.submitUrl
      confirmationMessage = confirmationMessage ?? fetched.confirmationMessage
      elementNodes        = fetched.elementNodes
    }
  }

  return (
    <section className={`vb:section flex flex-col w-full ${bgClass}`} {...pa(content)}>
      <div className={`flex flex-col flex-1 ${widthClass} ${spacingClass}`}>
        <FormWrapper
          title={title}
          description={description}
          submitUrl={submitUrl}
          confirmationMessage={confirmationMessage}
        >
          {compositionNodes.length > 0 ? (
            // Standard VB composition path — form elements provided by the page's composition
            <OptimizelyGridSection nodes={compositionNodes} />
          ) : elementNodes.length > 0 ? (
            // Forms-grids path — elements fetched directly from OptiFormsContainerData.composition.grids
            <div className="flex flex-col gap-md">
              {elementNodes.map((node: any) => (
                <OptimizelyComponent
                  key={node._metadata?.key ?? node.__typename}
                  content={{ ...node, __composition: { key: node._metadata?.key } }}
                />
              ))}
            </div>
          ) : (
            // Empty state — no form elements configured or form key unavailable
            <div className="flex flex-col gap-sm">
              <p className="text-label font-medium text-fg-muted/40 tracking-label uppercase">
                No form elements configured
              </p>
              <p className="text-[11px] text-fg-muted/30 leading-snug max-w-[30ch]">
                Add form elements in the CMS Forms editor to display them here.
              </p>
            </div>
          )}
        </FormWrapper>
      </div>
    </section>
  )
}
