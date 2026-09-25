'use client'
import type { ReactNode } from 'react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import FormStepTracker from './FormStepTracker'
import { FormRulesProvider, type FormDependencyRule } from './FormRulesContext'

type Status = 'idle' | 'submitting' | 'submitted' | 'error'

type Props = {
  /** One entry per step. A single-step form just passes a one-element array. */
  steps: ReactNode[]
  title?: string
  description?: string
  submitUrl?: string
  confirmationMessage?: string
  rules?: FormDependencyRule[]
}

export default function FormWrapper({ steps, title, description, submitUrl, confirmationMessage, rules }: Props) {
  const [status, setStatus]       = useState<Status>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  // Live field values, keyed by `name` — read by DependencyRules to decide
  // which other fields to show/hide. Updated via delegated form input events
  // rather than controlling every field, so uncontrolled inputs stay simple.
  const [values, setValues] = useState<Record<string, string>>({})

  const isLastStep = stepIndex === steps.length - 1

  // Keyed by the field's `id` (the composition node's own key), not its `name`
  // (which may be an author-set SubmissionFieldName) — DependencyRules
  // reference the node key, so rule lookups must match on that, independent
  // of whatever name the field submits under.
  function handleFormChange(e: React.SyntheticEvent<HTMLFormElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if (!target?.id) return
    setValues(v => ({ ...v, [target.id]: target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLastStep) {
      setStepIndex(i => i + 1)
      return
    }
    setStatus('submitting')
    try {
      if (submitUrl) {
        const res = await fetch(submitUrl, { method: 'POST', body: new FormData(e.currentTarget) })
        if (!res.ok) throw new Error('Submission failed')
      }
      setStatus('submitted')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'submitted') {
    return (
      <div className="relative w-full bg-surface border border-fg/10 shadow-[0_4px_24px_var(--ot-bloom-brand-faint)] px-lg py-lg my-lg lg:my-xl">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-brand" />
        <p className="text-body leading-body text-fg">
          {confirmationMessage ?? 'Thank you. Your submission has been received.'}
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-surface border border-fg/10 shadow-[0_4px_24px_var(--ot-bloom-brand-faint)] px-lg py-lg my-lg lg:my-xl">
      {/* 2px brand rule at the top of the form card */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-brand" />

      {(title || description) && (
        <>
          <header className="mb-lg">
            {title && (
              // Theme's primary font (font-display is Syne, a fixed accent
              // face reserved for headline-scale moments elsewhere — not
              // appropriate as a form's default heading), heading weight,
              // and a size that actually reads as a heading over the body
              // copy below it — matches how every other heading in this
              // codebase pairs its text-* size with font-bold (see
              // SectionLabel).
              <h2
                className="font-bold text-headline leading-headline tracking-headline text-fg"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-xs text-body text-fg-muted leading-body max-w-prose">{description}</p>
            )}
          </header>
          <div className="mb-lg h-px bg-fg/8" />
        </>
      )}

      <FormRulesProvider value={{ rules: rules ?? [], values }}>
        <form onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
          <FormStepTracker total={steps.length} current={stepIndex} />

          <fieldset disabled={status === 'submitting'} className="contents">
            {/* All steps stay mounted (via `hidden`, not unmounted) so every
                step's fields are present in FormData when the last step submits. */}
            {steps.map((step, index) => (
              <div key={index} hidden={index !== stepIndex}>
                {step}
              </div>
            ))}
          </fieldset>

          {status === 'error' && (
            <p
              className="text-label tracking-label text-[oklch(65%_0.2_25)] mt-md"
              role="alert"
            >
              Submission failed — please try again.
            </p>
          )}

          {steps.length > 1 && (
            <div className="mt-lg flex items-center justify-between border-t border-fg/10 pt-lg">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex(i => Math.max(0, i - 1))}
              >
                Back
              </Button>
              <Button type="submit" variant="brand" size="sm">
                {isLastStep ? 'Submit' : 'Next'}
              </Button>
            </div>
          )}
        </form>
      </FormRulesProvider>
    </div>
  )
}
