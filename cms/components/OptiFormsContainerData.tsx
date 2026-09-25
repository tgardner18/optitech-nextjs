import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'
import FormWrapper from '@/components/forms/FormWrapper'
import type { FormDependencyRule } from '@/components/forms/FormRulesContext'
import { getClient } from '@/lib/optimizely'

// Forms placed inline on a VB page arrive in the page's composition as
// section → step → row → column → OptiForms*Element (verified live on
// /campaigns/developers, 2026-09-24). Since @optimizely/cms-sdk 3.0.0 the
// page query selects the element fields, so the inline nodes render fully;
// on 2.2.0 the columns came back empty. An inline section has no
// `_metadata.key`, so the refetch-by-key below only runs for keyed forms
// (e.g. the showcase demo). Earlier (2026-09-03) a form placed as a
// shared-block *reference* was dropped from Graph's `composition.nodes`
// entirely — re-test that placement if a form ever goes missing outright.

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

// Fields Optimizely Forms exposes per element type — confirmed live against the
// connected CMS instance via cms_get_content_type_details (the field names on
// this fragment previously didn't match: Choice had no `SingleChoice` field,
// Selection had no `Feed` field, Range's step field is `Increment` not `Step`,
// and Url has no `AutoComplete`).
const FORM_ELEMENTS_FRAGMENT = `
  __typename
  ... on OptiFormsTextboxElement    { Label Placeholder Tooltip PredefinedValue Validators AutoComplete SubmissionFieldName }
  ... on OptiFormsTextareaElement   { Label Placeholder Tooltip PredefinedValue Validators AutoComplete SubmissionFieldName }
  ... on OptiFormsChoiceElement     { Label Tooltip AllowMultiSelect Options Validators SubmissionFieldName }
  ... on OptiFormsNumberElement     { Label Placeholder Tooltip PredefinedValue Validators AutoComplete SubmissionFieldName }
  ... on OptiFormsRangeElement      { Label Tooltip Min Max Increment PredefinedValue SubmissionFieldName }
  ... on OptiFormsSelectionElement  { Label Placeholder Tooltip Options AllowMultiSelect AutoComplete Validators SubmissionFieldName }
  ... on OptiFormsSubmitElement     { Label Tooltip }
  ... on OptiFormsResetElement      { Label Tooltip }
  ... on OptiFormsUrlElement        { Label Placeholder Tooltip PredefinedValue Validators SubmissionFieldName }
`

// Per-level composition node fields. Matches the field set the SDK itself
// fetches for VB page composition (see @optimizely/cms-sdk's
// buildNestedCompositionNodes) — key/nodeType/displayTemplateKey/displaySettings
// are exactly what OptimizelyGridSection and the registered Row/Column adapters
// (cms/compositions/Row.tsx, Column.tsx) read. `nodeType` is what actually
// distinguishes a step ("step") from a row/column — confirmed live: Optimizely
// Forms tags its own top-level composition node `nodeType: "step"`.
const NODE_FIELDS = '__typename key nodeType displayTemplateKey displaySettings { key value }'

// Optimizely Forms composition is 4 levels deep (step → row → column → field),
// matching the depth the SDK itself hard-codes for VB composition generally —
// confirmed both by live introspection of a real form and by the SDK's own
// source (@optimizely/cms-sdk's @recursive directive is a documented no-op
// workaround on the Graph server today; the SDK hand-nests to depth 4 instead).
// A CompositionComponentNode fragment is included at every level since a field
// can in principle sit directly under any of them, not only the deepest.
function componentFragment(): string {
  return `... on CompositionComponentNode { component { ${FORM_ELEMENTS_FRAGMENT} } }`
}
function nodesQuery(remainingDepth: number): string {
  if (remainingDepth <= 0) return `${NODE_FIELDS} ${componentFragment()}`
  return `
    ${NODE_FIELDS}
    ${componentFragment()}
    ... on CompositionStructureNode { nodes { ${nodesQuery(remainingDepth - 1)} } }
  `
}

const DEPENDENCY_RULES_FRAGMENT = `
  DependencyRules {
    TargetElement
    SatisfiedAction
    ConditionCombination
    Conditions { DependsOnField ComparisonOperator ComparisonValue }
  }
`

async function fetchFormData(contentKey: string): Promise<{
  title: string | undefined
  description: string | undefined
  submitUrl: string | undefined
  confirmationMessage: string | undefined
  rules: FormDependencyRule[]
  topLevelNodes: any[]
} | null> {
  try {
    const data = await getClient().request(
      `query GetFormData($key: String!) {
        OptiFormsContainerData(where: { _metadata: { key: { eq: $key } } }, limit: 1) {
          items {
            Title
            Description
            SubmitUrl { default }
            SubmitConfirmationMessage
            ${DEPENDENCY_RULES_FRAGMENT}
            composition {
              nodes { ${nodesQuery(3)} }
            }
          }
        }
      }`,
      { key: contentKey },
    )

    const item = (data as any)?.OptiFormsContainerData?.items?.[0]
    if (!item) return null

    return {
      title:               item.Title ?? undefined,
      description:         item.Description ?? undefined,
      submitUrl:           item.SubmitUrl?.default ?? undefined,
      confirmationMessage: item.SubmitConfirmationMessage ?? undefined,
      rules:               item.DependencyRules ?? [],
      topLevelNodes:       item.composition?.nodes ?? [],
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

  // Always fetch this form's own composition by key rather than trusting
  // whatever the page's generic composition query happened to inline for
  // this nested section. Confirmed live: on a real page, that inline data
  // includes the row/column structure (this section's own displaySettings-
  // derived shell) but NOT the leaf fields/buttons inside it — inconsistent
  // with a direct fetch of the same published content, which returns all of
  // it. Since the underlying cause is which query built the composition
  // tree, not whether one exists, the fix is to never depend on the
  // page-inlined tree for OptiForms — only for the plain scalar fields
  // (Title/Description/etc.), which are reliable regardless of source.
  let title               = content.Title              ?? undefined
  let description         = content.Description        ?? undefined
  let submitUrl           = content.SubmitUrl?.default ?? undefined
  let confirmationMessage = content.SubmitConfirmationMessage ?? undefined
  let rules: FormDependencyRule[] = content.DependencyRules ?? []
  let topLevelNodes: any[] = []

  if (content._metadata?.key) {
    const fetched = await fetchFormData(content._metadata.key)
    if (fetched) {
      title               = title               ?? fetched.title
      description         = description         ?? fetched.description
      submitUrl           = submitUrl           ?? fetched.submitUrl
      confirmationMessage = confirmationMessage  ?? fetched.confirmationMessage
      rules               = rules.length > 0     ? rules : fetched.rules
      topLevelNodes       = fetched.topLevelNodes
    }
  }

  // Last-resort fallback: no key at all (e.g. an unsaved draft in the VB
  // editor) — use whatever the composition pipeline inlined, if anything.
  if (topLevelNodes.length === 0) {
    topLevelNodes = (
      Array.isArray(content.nodes)                ? content.nodes :
      Array.isArray(content.__composition?.nodes) ? content.__composition.nodes :
      Array.isArray(content.composition?.nodes)    ? content.composition.nodes :
      []
    )
  }

  // The Forms editor (unlike a human VB page author) always authors its own
  // rows/columns with contentSpacing: "none" and never sets a row's own
  // verticalPadding at all — confirmed live. Left as-is, every field renders
  // flush against the next with zero gap, and two stacked rows share only
  // Row.tsx's own fallback padding ('small' → py-md top+bottom) — enough
  // when every field in a row is the same height, but a tooltip or
  // validation message under just one field eats into that shared gap and
  // crowds the row below it (confirmed live on a two-column multi-row form:
  // a tooltip'd field's column visibly crowds the next row, its plain
  // sibling column doesn't). Rows get a small contentSpacing gap between
  // side-by-side columns (e.g. Reset next to Submit) and a more generous
  // verticalPadding so stacked rows keep a clear gap regardless of any one
  // field's height; columns get a larger contentSpacing gap between stacked
  // fields. Only ever replaces the Forms editor's own blank/absent defaults
  // — an explicit non-default value (from a future Forms editor update, or
  // hand-authored settings) is left alone.
  const SETTINGS_OVERRIDE: Record<string, Record<string, string>> = {
    row:    { contentSpacing: 'small', verticalPadding: 'medium' },
    column: { contentSpacing: 'large' },
  }
  function withFieldSpacing(nodes: any[]): any[] {
    return nodes.map(node => {
      if (!node || node.__typename !== 'CompositionStructureNode') return node
      const overrides = SETTINGS_OVERRIDE[node.nodeType as string]
      let nextSettings: any[] = Array.isArray(node.displaySettings) ? node.displaySettings : []
      if (overrides) {
        for (const [key, value] of Object.entries(overrides)) {
          nextSettings = nextSettings.some(s => s.key === key)
            ? nextSettings.map(s => (s.key === key && s.value === 'none') ? { ...s, value } : s)
            : [...nextSettings, { key, value }]
        }
      }
      return {
        ...node,
        displaySettings: nextSettings,
        nodes: Array.isArray(node.nodes) ? withFieldSpacing(node.nodes) : node.nodes,
      }
    })
  }

  // Optimizely Forms tags its own step nodes `nodeType: "step"` (confirmed
  // live). If none are tagged (unexpected shape), treat everything as one
  // step rather than guessing a split — a single step is always safe.
  const spacedNodes = withFieldSpacing(topLevelNodes)
  const stepNodes = spacedNodes.filter(n => n?.nodeType === 'step')
  const steps = stepNodes.length > 0
    ? stepNodes
    : spacedNodes.length > 0
      ? [{ __typename: 'CompositionStructureNode', key: 'implicit-step', nodeType: 'step', nodes: spacedNodes }]
      : []

  return (
    <section className={`vb:section flex flex-col w-full ${bgClass}`} {...pa(content)}>
      <div className={`flex flex-col flex-1 ${widthClass} ${spacingClass}`}>
        {steps.length > 0 ? (
          <FormWrapper
            title={title}
            description={description}
            submitUrl={submitUrl}
            confirmationMessage={confirmationMessage}
            rules={rules}
            steps={steps.map(node => (
              // OptimizelyGridSection only understands 'row'/'column' nodeTypes
              // (its component-registry lookup crashes on 'step', an unrecognized
              // value) — so render the step's own children, not the step node.
              <OptimizelyGridSection key={node.key} nodes={node.nodes ?? []} />
            ))}
          />
        ) : (
          <div className="flex flex-col gap-sm">
            <p className="text-label font-medium text-fg-muted/40 tracking-label uppercase">
              No form elements configured
            </p>
            <p className="text-[11px] text-fg-muted/30 leading-snug max-w-[30ch]">
              Add form elements in the CMS Forms editor to display them here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
