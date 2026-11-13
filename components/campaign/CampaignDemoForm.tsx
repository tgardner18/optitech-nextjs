'use client'

import { useRef, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'

type Field = { id: string; label: string; error: string; half?: boolean; type?: string; autoComplete?: string; placeholder?: string; options?: string[] }

const FIELDS: Field[] = [
  { id: 'first', label: 'First name', error: 'Enter your first name.', half: true, autoComplete: 'given-name', placeholder: 'Alex' },
  { id: 'last', label: 'Last name', error: 'Enter your last name.', half: true, autoComplete: 'family-name', placeholder: 'Morgan' },
  { id: 'email', label: 'Email', error: 'Enter an email address like name@example.com.', type: 'email', autoComplete: 'email', placeholder: 'alex@example.com' },
  { id: 'day', label: 'Which day suits you?', error: 'Choose a day.', options: ['Friday', 'Saturday', 'Sunday'] },
]

const valid = (f: Field, v: string) => (f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) : v.trim() !== '')

/**
 * The demo route's request form. A working form in the shared form markup (see forms.css): required fields marked,
 * an error summary that takes focus and links to each problem, a message under each field, and a confirmation.
 * A real campaign page renders its OptiForms form here instead; this exists so the demo behaves the same way.
 */
export default function CampaignDemoForm() {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const set = (id: string, v: string) => {
    setVals(s => ({ ...s, [id]: v }))
    if (errs[id]) setErrs(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    for (const f of FIELDS) if (!valid(f, vals[f.id] ?? '')) next[f.id] = f.error
    setErrs(next)
    if (Object.keys(next).length) { setTimeout(() => alertRef.current?.focus(), 0); return }
    setSent(true)
    setTimeout(() => doneRef.current?.focus(), 0)
  }

  if (sent) {
    return (
      <div data-block="form">
        <div data-part="inner">
          <div data-part="card" data-form-card="">
            <div data-part="done" role="status">
              <span data-part="done-icon" aria-hidden="true"><CheckCircle2 strokeWidth={2.5} /></span>
              <h2 data-part="done-title" tabIndex={-1} ref={doneRef}>You&rsquo;re on the list</h2>
              <p data-part="done-text">We&rsquo;ll confirm your place by email within two working days.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ids = Object.keys(errs)
  return (
    <div data-block="form">
      <div data-part="inner">
        <div data-part="card" data-form-card="">
          <form noValidate onSubmit={submit} aria-label="Request an invitation">
            {ids.length > 0 && (
              <div data-part="alert" role="alert" tabIndex={-1} ref={alertRef}>
                <AlertCircle aria-hidden strokeWidth={2} />
                <div>
                  {ids.length === 1 ? 'Fix 1 field to continue:' : `Fix ${ids.length} fields to continue:`}{' '}
                  {ids.map((id, i) => (
                    <span key={id}>{i > 0 && ', '}<a href={`#cd-${id}`} onClick={e => { e.preventDefault(); document.getElementById(`cd-${id}`)?.focus() }}>{FIELDS.find(f => f.id === id)!.label}</a></span>
                  ))}
                </div>
              </div>
            )}
            <p data-part="req-note"><b aria-hidden="true">*</b> Required</p>
            <div data-part="row" data-cols="2">
              {FIELDS.filter(f => f.half).map(f => <div key={f.id} data-part="col" style={{ '--span': 6 } as React.CSSProperties}>{field(f)}</div>)}
            </div>
            <div data-part="fields" style={{ marginTop: '1.5rem' }}>
              {FIELDS.filter(f => !f.half).map(f => <div key={f.id}>{field(f)}</div>)}
            </div>
            <div data-part="actions">
              <button type="submit" data-part="submit">Request an invitation<ArrowRight aria-hidden strokeWidth={2} /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  function field(f: Field) {
    const e = errs[f.id], id = `cd-${f.id}`
    const a11y = { id, name: f.id, 'data-part': 'input', required: true, 'aria-required': true as const, ...(e ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-err` } : {}) }
    return (
      <div data-part="field" data-invalid={e ? '' : undefined}>
        <div data-part="label-row">
          <label data-part="label" htmlFor={id}>{f.label}<span data-part="req" aria-hidden="true">*</span><span className="sr-only"> (required)</span></label>
        </div>
        {f.options ? (
          <div data-part="select">
            <select {...a11y} className="ot-field" value={vals[f.id] ?? ''} onChange={ev => set(f.id, ev.target.value)} data-empty={vals[f.id] ? undefined : ''}>
              <option value="" disabled>Choose a day</option>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown data-part="chev" aria-hidden strokeWidth={2} />
          </div>
        ) : (
          <input {...a11y} className="ot-field" type={f.type ?? 'text'} autoComplete={f.autoComplete} placeholder={f.placeholder} value={vals[f.id] ?? ''} onChange={ev => set(f.id, ev.target.value)} />
        )}
        <p data-part="error" id={`${id}-err`}><AlertCircle aria-hidden strokeWidth={2} /><span>{e}</span></p>
      </div>
    )
  }
}
