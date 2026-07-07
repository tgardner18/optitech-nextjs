'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, CheckCircle2, AlertCircle, Send, FileBox } from 'lucide-react'
import DynamicCmpField from './DynamicCmpField'
import TextboxField from '@/components/forms/TextboxField'
import type { CmpTemplateSummary, CmpTemplateDetail } from '@/lib/admin/cmpWorkRequests'
import type { CmpWorkRequestFormField } from '@/lib/cmpApi'

// ── Shared class strings ────────────────────────────────────────────────────

const selectCls = [
  'w-full appearance-none bg-fg/5 border border-fg/9 rounded-input ot-field',
  'px-md pr-10 py-[10px]',
  'text-[0.9375rem] font-medium text-fg',
  'focus:outline-none focus-visible:border-brand focus-visible:bg-fg/8 focus-visible:ring-2 focus-visible:ring-brand/20',
  'transition-[border-color,background-color,box-shadow] duration-150 ease-quick',
  'disabled:opacity-40',
].join(' ')

const submitBtnCls = [
  'inline-flex items-center justify-center gap-sm',
  'px-xl py-[11px]',
  'bg-brand text-fg-on-brand text-[0.8125rem] font-semibold uppercase tracking-[0.08em]',
  'hover:bg-brand-hover transition-colors duration-150 ease-quick',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

// ── Section divider used for "Your Details" and the template block ──────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-md">
      <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-brand/60 whitespace-nowrap shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-fg/[0.07]" />
    </div>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

type Status = 'idle' | 'success' | 'error'

export default function WorkRequestClient() {
  const [templates,       setTemplates]       = useState<CmpTemplateSummary[] | null>(null)
  const [templatesError,  setTemplatesError]  = useState<string | null>(null)
  const [selectedId,      setSelectedId]      = useState('')

  const [template,        setTemplate]        = useState<CmpTemplateDetail | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateError,   setTemplateError]   = useState<string | null>(null)

  const [submitting,      setSubmitting]      = useState(false)
  const [status,          setStatus]          = useState<Status>('idle')
  const [statusMessage,   setStatusMessage]   = useState<string | null>(null)

  // Load the template list once on mount.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res  = await fetch('/api/opti-admin/cmp-templates')
        const data = await res.json() as { templates?: CmpTemplateSummary[]; error?: string }
        if (cancelled) return
        if (!res.ok) { setTemplatesError(data.error ?? 'Could not load templates.'); return }
        setTemplates(data.templates ?? [])
      } catch {
        if (!cancelled) setTemplatesError('Could not reach the server.')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Fetch field definitions whenever the selected template changes.
  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!selectedId) { setTemplate(null); return }
      setTemplateLoading(true)
      setTemplateError(null)
      setTemplate(null)
      setStatus('idle')

      try {
        const res  = await fetch(`/api/opti-admin/cmp-templates/${encodeURIComponent(selectedId)}`)
        const data = await res.json() as { template?: CmpTemplateDetail; error?: string }
        if (cancelled) return
        if (!res.ok) { setTemplateError(data.error ?? 'Could not load this template.'); return }
        setTemplate(data.template ?? null)
      } catch {
        if (!cancelled) setTemplateError('Could not reach the server.')
      } finally {
        if (!cancelled) setTemplateLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!template) return

    setStatus('idle')
    setStatusMessage(null)

    const data = new FormData(e.currentTarget)

    const formFields: CmpWorkRequestFormField[] = template.fields
      .filter(f => f.type !== 'file' && f.type !== 'section') // no input rendered for these — see DynamicCmpField
      .map(f => ({
        identifier: f.identifier,
        type:       f.type,
        values:     data.getAll(f.identifier).map(v => {
          const s = String(v)
          // CMP requires full ISO datetime; date inputs return YYYY-MM-DD only.
          if (f.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00`
          return s
        }),
      }))

    const requester = {
      name:       String(data.get('requester-name') ?? ''),
      email:      String(data.get('requester-email') ?? ''),
      department: String(data.get('requester-department') ?? ''),
    }

    const missingLabels = [
      ...(!requester.name.trim() ? ['Name'] : []),
      ...(!requester.email.trim() ? ['Email'] : []),
      ...template.fields
        .filter(f => f.required && !formFields.find(ff => ff.identifier === f.identifier)?.values.some(v => v.trim()))
        .map(f => f.label),
    ]

    if (missingLabels.length > 0) {
      setStatus('error')
      setStatusMessage(`Please fill in: ${missingLabels.join(', ')}.`)
      return
    }

    setSubmitting(true)

    try {
      const res  = await fetch('/api/opti-admin/work-requests', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ templateId: template.id, formFields, requester }),
      })
      const body = await res.json() as { error?: string }

      if (!res.ok) {
        setStatus('error')
        setStatusMessage(body.error ?? 'CMP rejected the work request.')
        return
      }

      setStatus('success')
      setStatusMessage(`Work request created in CMP from "${template.name}".`)
    } catch {
      setStatus('error')
      setStatusMessage('Could not reach the server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-215 mx-auto">

      {/* ── Page header ── */}
      <div className="mb-xl">
        <h1 className="text-[1.5rem] font-semibold text-fg tracking-[-0.02em] leading-tight">
          Work Requests
        </h1>
        <p className="text-[0.9375rem] text-fg-muted mt-xs leading-relaxed max-w-[65ch]">
          Submit a marketing work request into Optimizely CMP without CMP access. Pick a request type and the form adapts to its fields.
        </p>
      </div>

      {/* ── Template picker ── */}
      <div className="flex flex-col gap-xs">
        <label htmlFor="template-select" className="text-[0.6875rem] font-bold uppercase tracking-widest text-fg-muted/50">
          Request type
        </label>
        <div className="relative">
          <select
            id="template-select"
            className={selectCls}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={!templates}
          >
            <option value="">
              {templates === null ? 'Loading templates…' : 'Select a request type'}
            </option>
            {templates?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className="absolute right-3.25 top-1/2 -translate-y-1/2 text-fg-muted/40 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {templatesError && (
          <p role="alert" className="text-[0.8125rem] text-fg-muted/70 mt-xs">{templatesError}</p>
        )}
      </div>

      {templateLoading && (
        <p className="mt-lg text-[0.875rem] text-fg-muted/60">Loading template fields…</p>
      )}

      {templateError && (
        <p role="alert" className="mt-lg text-[0.875rem] text-fg border border-fg/8 px-md py-sm">
          {templateError}
        </p>
      )}

      {/* ── Dynamic form ── */}
      {template && (
        <form key={template.id} onSubmit={handleSubmit} noValidate className="mt-2xl flex flex-col gap-xl">

          {/* Your details */}
          <div className="flex flex-col gap-lg">
            <SectionHeader label="Your details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <TextboxField id="requester-name" name="requester-name" label="Name" required autoComplete="name" />
              <TextboxField id="requester-email" name="requester-email" label="Email" required autoComplete="email" />
              <div className="sm:col-span-2">
                <TextboxField id="requester-department" name="requester-department" label="Department" placeholder="Sales, HR, Product…" />
              </div>
            </div>
          </div>

          {/* Template fields */}
          <div className="flex flex-col gap-lg">
            <SectionHeader label={template.name} />
            {template.fields.length === 0 ? (
              <p className="text-[0.875rem] text-fg-muted/60">
                This template returned no field definitions — check server logs for the raw CMP response
                and confirm the shape in{' '}
                <code className="font-mono text-[0.8em]">lib/admin/cmpWorkRequests.ts</code>.
              </p>
            ) : (
              <div className="flex flex-col gap-lg">
                {template.fields.map(field => (
                  <DynamicCmpField key={field.identifier} field={field} />
                ))}
              </div>
            )}
          </div>

          {/* Submit row */}
          <div className="border-t border-fg/[0.07] pt-lg flex flex-col gap-md">
            {status === 'success' && (
              <div
                role="status"
                className="flex items-start gap-sm px-md py-sm border text-[0.8125rem]"
                style={{ background: 'oklch(from var(--ot-brand) calc(l * 0.25) calc(c * 0.6) h / 0.18)', borderColor: 'oklch(from var(--ot-brand) calc(l * 0.9) c h / 0.3)' }}
              >
                <CheckCircle2 size={14} strokeWidth={2} className="shrink-0 mt-px text-brand" aria-hidden="true" />
                <span className="text-fg">{statusMessage}</span>
              </div>
            )}
            {status === 'error' && (
              <div
                role="alert"
                className="flex items-start gap-sm px-md py-sm border text-[0.8125rem]"
                style={{ background: 'oklch(42% 0.08 25 / 0.18)', borderColor: 'oklch(65% 0.15 25 / 0.35)' }}
              >
                <AlertCircle size={14} strokeWidth={2} className="shrink-0 mt-px" style={{ color: 'oklch(65% 0.18 25)' }} aria-hidden="true" />
                <span className="text-fg">{statusMessage}</span>
              </div>
            )}
            <div>
              <button type="submit" disabled={submitting} className={submitBtnCls}>
                <Send size={13} strokeWidth={2} aria-hidden="true" />
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Pre-selection empty state ── */}
      {!template && !templateLoading && !templateError && selectedId === '' && (
        <div className="mt-2xl flex flex-col items-start gap-md">
          <FileBox size={28} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <div>
            <p className="text-[0.9375rem] font-medium text-fg-muted/70">Select a request type to begin</p>
            <p className="text-[0.8125rem] text-fg-muted/40 mt-xs">
              The form adapts to whichever CMP Request Type template you choose.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
