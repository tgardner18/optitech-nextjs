import { Suspense } from 'react'
import { SectionLabel, VariantGroup } from '../../components'
import OptiFormsContainerDataAdapter from '@/cms/components/OptiFormsContainerData'
import FormWrapper from '@/components/forms/FormWrapper'
import ConditionalField from '@/components/forms/ConditionalField'
import TextboxField from '@/components/forms/TextboxField'
import TextareaField from '@/components/forms/TextareaField'
import NumberField from '@/components/forms/NumberField'
import RangeField from '@/components/forms/RangeField'
import UrlField from '@/components/forms/UrlField'
import SelectionField from '@/components/forms/SelectionField'
import ChoiceField from '@/components/forms/ChoiceField'
import SubmitButton from '@/components/forms/SubmitButton'
import ResetButton from '@/components/forms/ResetButton'
import type { FormDependencyRule } from '@/components/forms/FormRulesContext'
import { normalizeFormKey } from '@/lib/formKey'
import FormKeyLookup from '../forms-key-lookup'

// This is its own literal route rather than a case in blocks/[block]/page.tsx:
// it's the only showcase block page that needs searchParams (for the
// "render by content key" lookup below), and reading searchParams in that
// shared file would force every other statically-generated block page to
// opt out of static rendering too. A literal segment (blocks/forms/) always
// wins over the sibling dynamic segment (blocks/[block]/) for this one path,
// so this trades nothing — the nav link and URL are unchanged.

type Props = { searchParams: Promise<{ formKey?: string }> }

// ─── "All field types" — every OptiForms element, authored directly in code ──
// so this always renders regardless of what forms exist in the connected CMS.
// No submitUrl: FormWrapper's submit just flips to its local confirmation
// state, exactly like a real form would once its POST resolves.

function AllFieldTypesDemo() {
  return (
    <FormWrapper
      confirmationMessage="This is a static demo — nothing was submitted anywhere. This is the confirmation state a real form shows once its POST resolves."
      steps={[
        <div key="fields" className="flex flex-col gap-lg">
          <TextboxField id="af-name" name="name" label="Full name (single-line text)" placeholder="Ada Lovelace" required />
          <TextboxField id="af-company" name="company" label="Company (single-line text, optional)" placeholder="Acme Inc." autoComplete="organization" />
          <UrlField id="af-website" name="website" label="Company website (URL)" placeholder="https://acme.com" />
          <NumberField id="af-team-size" name="teamSize" label="Team size (number)" placeholder="12" />
          <RangeField id="af-confidence" name="confidence" label="Budget confidence (range slider)" min={1} max={10} tooltip="1 = just browsing, 10 = ready to buy" />
          <TextareaField id="af-notes" name="notes" label="What are you hoping to solve? (multi-line text)" placeholder="Tell us a bit about your use case…" />
          <SelectionField
            id="af-timeline"
            name="timeline"
            label="Timeline (dropdown, single-select)"
            placeholder="Select a timeline"
            options={[
              { caption: 'This quarter', value: 'this-quarter', checked: false },
              { caption: 'Next quarter', value: 'next-quarter', checked: false },
              { caption: 'Just exploring', value: 'exploring', checked: true },
            ]}
          />
          <SelectionField
            id="af-interests"
            name="interests"
            label="Interested in (dropdown, multi-select)"
            allowMultiSelect
            options={[
              { caption: 'CMS', value: 'cms', checked: true },
              { caption: 'Experimentation', value: 'experimentation', checked: false },
              { caption: 'Personalization', value: 'personalization', checked: false },
              { caption: 'Content Recommendations', value: 'content-recs', checked: false },
            ]}
          />
          <ChoiceField
            id="af-contact"
            name="contactMethod"
            label="Preferred contact method (radio buttons)"
            required
            options={[
              { caption: 'Email', value: 'email', checked: true },
              { caption: 'Phone', value: 'phone', checked: false },
            ]}
          />
          <ChoiceField
            id="af-teams"
            name="teams"
            label="Which teams will use this? (checkboxes)"
            allowMultiSelect
            options={[
              { caption: 'Marketing', value: 'marketing', checked: false },
              { caption: 'Engineering', value: 'engineering', checked: false },
              { caption: 'Sales', value: 'sales', checked: false },
            ]}
          />
          <div className="flex items-center justify-between gap-sm pt-sm">
            <ResetButton />
            <SubmitButton />
          </div>
        </div>,
      ]}
    />
  )
}

// ─── Multi-step + conditional field ───────────────────────────────────────────
// "Company size" only appears once Role = Business — proves DependencyRules
// (show/hide) and step navigation both work, with no CMS-authored form needed.

const MULTI_STEP_RULES: FormDependencyRule[] = [
  {
    TargetElement: 'ms-company-size',
    SatisfiedAction: 'Show',
    ConditionCombination: 'All',
    Conditions: [{ DependsOnField: 'ms-role', ComparisonOperator: 'Equal', ComparisonValue: 'Business' }],
  },
]

function MultiStepDemo() {
  return (
    <FormWrapper
      rules={MULTI_STEP_RULES}
      confirmationMessage="This is a static demo — nothing was submitted anywhere. This is the confirmation state a real form shows once its POST resolves."
      steps={[
        <div key="about-you" className="flex flex-col gap-lg">
          <TextboxField id="ms-name" name="name" label="Full name" placeholder="Ada Lovelace" required />
          <TextboxField id="ms-email" name="email" label="Work email" placeholder="ada@acme.com" required />
          <SelectionField
            id="ms-role"
            name="role"
            label="How would you describe your role?"
            placeholder="Select a role"
            options={[
              { caption: 'Developer', value: 'Developer', checked: false },
              { caption: 'Marketer', value: 'Marketer', checked: false },
              { caption: 'Business', value: 'Business', checked: false },
            ]}
          />
        </div>,
        <div key="your-project" className="flex flex-col gap-lg">
          <ConditionalField nodeKey="ms-company-size">
            <NumberField
              id="ms-company-size"
              name="companySize"
              label="Approximate company size"
              tooltip="Shown only because Role = Business on the previous step — go back and change it to see this field disappear."
            />
          </ConditionalField>
          <TextareaField id="ms-goal" name="goal" label="What are you hoping to solve?" placeholder="Tell us a bit about your use case…" />
          <ChoiceField
            id="ms-areas"
            name="areas"
            label="Which areas interest you? (multi-select)"
            allowMultiSelect
            options={[
              { caption: 'CMS', value: 'cms', checked: false },
              { caption: 'Personalization', value: 'personalization', checked: false },
              { caption: 'Experimentation', value: 'experimentation', checked: false },
            ]}
          />
        </div>,
        <div key="confirm" className="flex flex-col gap-lg">
          <RangeField id="ms-urgency" name="urgency" label="How urgent is this?" min={1} max={10} tooltip="1 = no rush, 10 = need this yesterday" />
          <TextboxField id="ms-else" name="anythingElse" label="Anything else we should know? (optional)" />
        </div>,
      ]}
    />
  )
}

// ─── Live CMS form, by content key ────────────────────────────────────────────

function LiveFormLookup({ formKey }: { formKey: string | null }) {
  if (!formKey) {
    return (
      <div className="px-md pb-xl lg:px-lg">
        <Suspense fallback={<div className="h-24" />}>
          <FormKeyLookup />
        </Suspense>
        <p className="mt-lg text-label text-fg-muted/60 max-w-prose">
          Paste a Forms container&rsquo;s content key above to render it here, exactly as it renders when
          placed on a real page — no form is loaded until you do, since not every connected CMS
          instance has the same sample content.
        </p>
      </div>
    )
  }

  return (
    <div className="px-md pb-xl lg:px-lg flex flex-col gap-lg">
      <Suspense fallback={<div className="h-24" />}>
        <FormKeyLookup />
      </Suspense>
      <OptiFormsContainerDataAdapter content={{ _metadata: { key: formKey } }} />
    </div>
  )
}

export default async function FormsShowcasePage({ searchParams }: Props) {
  const { formKey: rawKey } = await searchParams
  // Never pass an unvalidated query-string value into the Graph query below —
  // it's parameterized either way, but this also stops a malformed paste from
  // silently round-tripping back into the URL/input unexamined.
  const formKey = rawKey ? normalizeFormKey(rawKey) : null

  return (
    <>
      <div className="px-md pt-xl pb-lg lg:px-lg">
        <SectionLabel index="Blocks · OptiFormsContainerData" title="OptiFormsContainerData" />
        <p className="text-body leading-body text-fg-muted max-w-[100ch]">
          Built-in Optimizely Forms. Authored entirely in the CMS&rsquo;s Forms editor — text/number/range/choice/selection/textarea/url
          fields, a submit action, and optional show/hide dependency rules — then dropped onto a page as a section.
        </p>
      </div>

      <VariantGroup
        label="All field types"
        note="Every OptiForms element type, authored directly in code so this always renders — required-field markers, single- and multi-select dropdowns, and radio/checkbox choice fields all included."
      />
      <div className="px-md pb-xl lg:px-lg">
        <AllFieldTypesDemo />
      </div>

      <VariantGroup
        label="Multi-step form · conditional field"
        note={'Set Role to "Business" on step 1, then continue — "Approximate company size" only appears on step 2 when that condition is met.'}
      />
      <div className="px-md pb-xl lg:px-lg">
        <MultiStepDemo />
      </div>

      <VariantGroup
        label="Live form · look up by content key"
        note="Fetched by content key from the connected CMS instance, exactly as it renders when placed on a real page."
      />
      <LiveFormLookup formKey={formKey} />
    </>
  )
}
