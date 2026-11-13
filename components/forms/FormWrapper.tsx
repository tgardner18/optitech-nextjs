'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert } from 'lucide-react'
import FormStepTracker from './FormStepTracker'
import { FormRulesProvider, type FormDependencyRule } from './FormRulesContext'

type FieldError = { id: string; label: string; message: string }

const CONTROL = 'input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea'

/** Checks one field wrapper, sets/clears its invalid state in the DOM, and returns the error (or null). */
function checkField(field: HTMLElement): FieldError | null {
  const labelEl = field.querySelector<HTMLElement>('[data-part="label"]')
  const label = (labelEl?.textContent ?? '').replace(/\s*\*\s*$/, '').trim() || 'This field'
  const radios = field.querySelectorAll<HTMLInputElement>('input[type=radio]')
  let message: string | null = null
  let control: HTMLElement | null = null
  if (radios.length > 0) {
    control = radios[0]
    if (radios[0].required && !Array.from(radios).some(r => r.checked)) message = `Choose an option for ${label}`
  } else {
    const el = field.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(CONTROL)
    control = el
    if (el && !el.checkValidity()) {
      const v = el.validity
      message = v.valueMissing ? `${label} is required`
        : el.type === 'url' ? `Enter a full web address, like https://example.com`
        : el.type === 'number' ? `Enter a valid number for ${label}`
        : `Enter a valid value for ${label}`
    }
  }
  const errText = field.querySelector('[data-part="error-text"]')
  const invalid = !!message
  if (invalid) field.setAttribute('data-invalid', ''); else field.removeAttribute('data-invalid')
  if (errText) errText.textContent = message ?? ''
  const targets: HTMLElement[] = radios.length > 0 ? [field] : control ? [control] : []
  targets.forEach(t => { if (invalid) t.setAttribute('aria-invalid', 'true'); else t.removeAttribute('aria-invalid') })
  const id = (control?.id) || ''
  return invalid ? { id, label, message: message! } : null
}

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

  const [errors, setErrors] = useState<FieldError[]>([])
  const [alertTick, setAlertTick] = useState(0)
  const alertRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const stepRefs = useRef<Array<HTMLDivElement | null>>([])

  const isLastStep = stepIndex === steps.length - 1

  useEffect(() => {
    if (alertTick > 0) alertRef.current?.focus()
  }, [alertTick])
  useEffect(() => {
    if (status === 'submitted') doneRef.current?.focus()
  }, [status])

  function validateCurrentStep(): FieldError[] {
    const root = stepRefs.current[stepIndex]
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>('[data-part="field"]'))
      .map(checkField)
      .filter((e): e is FieldError => e !== null)
  }

  // Keyed by the field's `id` (the composition node's own key), not its `name`
  // (which may be an author-set SubmissionFieldName) — DependencyRules
  // reference the node key, so rule lookups must match on that, independent
  // of whatever name the field submits under.
  function handleFormChange(e: React.SyntheticEvent<HTMLFormElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if (!target?.id) return
    // Re-check a field that is showing an error as soon as it changes.
    const field = target.closest<HTMLElement>('[data-part="field"][data-invalid]')
    if (field) {
      const next = checkField(field)
      setErrors(list => next ? list.map(x => (x.id === next.id ? next : x)) : list.filter(x => x.id !== target.id && !field.contains(document.getElementById(x.id))))
    }
    setValues(v => ({ ...v, [target.id]: target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validateCurrentStep()
    setErrors(found)
    if (found.length > 0) {
      setAlertTick(t => t + 1)
      return
    }
    if (!isLastStep) {
      setStepIndex(i => i + 1)
      return
    }
    setStatus('submitting')
    try {
      if (submitUrl) {
        // Formspree (and most form backends built for browser-navigation
        // submits) treats a request with no Accept header as a plain HTML
        // form post and replies with a redirect to its own hosted "thanks"
        // page — AFTER already accepting the submission. fetch() follows
        // that redirect by default, lands on a page that isn't CORS-enabled
        // for our origin, and the browser refuses to let us read it — so
        // this threw "Submission failed" on a submission that had, in
        // fact, already succeeded (confirmed live: both attempts were
        // captured by Formspree; the first showed the error message, the
        // second showed neither message at all). Accept: application/json
        // is the documented way to ask for its real AJAX response — a
        // same-origin-readable JSON body with no redirect involved.
        const res = await fetch(submitUrl, {
          method:  'POST',
          headers: { Accept: 'application/json' },
          body:    new FormData(e.currentTarget),
        })
        if (!res.ok) throw new Error('Submission failed')
      }
      setStatus('submitted')
    } catch {
      setStatus('error')
    }
  }

  const header = (title || description) && (
    <header data-part="head">
      {title && <h2 data-part="title">{title}</h2>}
      {description && <p data-part="desc">{description}</p>}
    </header>
  )

  if (status === 'submitted') {
    return (
      <>
        {header}
        <div data-part="card" data-form-card="">
          <div data-part="done" role="status">
            <span data-part="done-icon" aria-hidden="true"><Check /></span>
            <h3 data-part="done-title" ref={doneRef} tabIndex={-1}>Thank you</h3>
            <p data-part="done-text">
              {confirmationMessage ?? 'Your submission has been received.'}
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      <div data-part="card" data-form-card="">
        <FormRulesProvider value={{ rules: rules ?? [], values }}>
          <form onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
            <FormStepTracker total={steps.length} current={stepIndex} />
            <p data-part="req-note"><b aria-hidden="true">*</b> marks a required field</p>

            {errors.length > 0 && (
              <div data-part="alert" role="alert" tabIndex={-1} ref={alertRef}>
                <CircleAlert aria-hidden="true" />
                <div>
                  <strong>{errors.length === 1 ? 'Fix 1 field to continue' : `Fix ${errors.length} fields to continue`}</strong>
                  <ul>
                    {errors.map(er => (
                      <li key={er.id || er.message}>
                        <a
                          href={`#${er.id}`}
                          onClick={ev => {
                            ev.preventDefault()
                            document.getElementById(er.id)?.focus()
                          }}
                        >
                          {er.message}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <fieldset disabled={status === 'submitting'} className="contents">
              {/* All steps stay mounted (via `hidden`) so every step's fields
                  are present in FormData when the last step submits. */}
              {steps.map((step, index) => (
                <div
                  key={index}
                  hidden={index !== stepIndex}
                  data-part="fields"
                  ref={el => { stepRefs.current[index] = el }}
                >
                  {step}
                </div>
              ))}
            </fieldset>

            {status === 'error' && (
              <p data-part="alert" role="alert">
                <CircleAlert aria-hidden="true" />
                <span>Submission failed. Please try again.</span>
              </p>
            )}

            {steps.length > 1 && (
              <div data-part="actions" data-step-nav="">
                <button
                  type="button"
                  data-part="back"
                  disabled={stepIndex === 0}
                  onClick={() => { setErrors([]); setStepIndex(i => Math.max(0, i - 1)) }}
                >
                  <ArrowLeft aria-hidden="true" />
                  Back
                </button>
                <button type="submit" data-part="submit">
                  {isLastStep ? 'Submit' : 'Next'}
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
          </form>
        </FormRulesProvider>
      </div>
    </>
  )
}
