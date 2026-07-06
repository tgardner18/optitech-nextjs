'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, CheckCircle2, AlertCircle, Send, FileBox } from 'lucide-react'
import DynamicCmpField from './DynamicCmpField'
import TextboxField from '@/components/forms/TextboxField'
import type { CmpTemplateSummary, CmpTemplateDetail } from '@/lib/admin/cmpWorkRequests'
import type { CmpWorkRequestFormField } from '@/lib/cmpApi'

const selectCls = [
  'w-full appearance-none border border-fg/[0.12] bg-canvas px-md pr-[36px] py-[9px]',
  'text-[0.875rem] font-medium text-fg',
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
  'transition-[border-color,box-shadow] duration-150 rounded-input',
].join(' ')

const submitBtnCls = [
  'flex items-center justify-center gap-sm px-lg py-[11px] w-full sm:w-auto',
  'bg-brand text-fg-on-brand text-[0.8125rem] font-semibold uppercase tracking-[0.06em]',
  'hover:bg-brand-hover transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

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
      .filter(f => f.type !== 'file') // no input rendered for these — see DynamicCmpField
      .map(f => ({
        identifier: f.identifier,
        type:       f.type,
        values:     data.getAll(f.identifier).map(String),
      }))

    const requester = {
      name:       String(data.get('requester-name') ?? ''),
      email:      String(data.get('requester-email') ?? ''),
      department: String(data.get('requester-department') ?? ''),
    }

    // The form has noValidate (native browser tooltips don't match the rest of
    // OptiAdmin's error styling), so required fields need an explicit check here.
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
    <div className="max-w-168">
      {/* ── Template picker ── */}
      <div className="flex flex-col gap-xs">
        <label htmlFor="template-select" className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-fg-muted">
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
          <ChevronDown size={14} strokeWidth={1.75} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
        </div>
        {templatesError && (
          <p role="alert" className="text-[0.8125rem] text-fg-muted mt-xs">{templatesError}</p>
        )}
      </div>

      {templateLoading && (
        <p className="mt-lg text-[0.875rem] text-fg-muted">Loading template fields…</p>
      )}

      {templateError && (
        <p role="alert" className="mt-lg text-[0.875rem] text-fg border border-fg/[0.08] px-md py-sm">
          {templateError}
        </p>
      )}

      {/* ── Dynamic form ── */}
      {template && (
        <form key={template.id} onSubmit={handleSubmit} noValidate className="mt-xl flex flex-col gap-lg">
          <div className="border-t border-fg/[0.07] pt-lg flex flex-col gap-md">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-muted/50">
              Your details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <TextboxField id="requester-name" name="requester-name" label="Name" required autoComplete="name" />
              <TextboxField id="requester-email" name="requester-email" label="Email" required autoComplete="email" />
              <div className="sm:col-span-2">
                <TextboxField id="requester-department" name="requester-department" label="Department" placeholder="Sales, HR, Product…" />
              </div>
            </div>
          </div>

          <div className="border-t border-fg/[0.07] pt-lg flex flex-col gap-md">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-muted/50">
              {template.name}
            </p>
            {template.fields.length === 0 ? (
              <p className="text-[0.875rem] text-fg-muted">
                This template returned no field definitions to render — check the server logs
                for the raw CMP response and confirm the shape in{' '}
                <code className="font-mono text-[0.8em]">lib/admin/cmpWorkRequests.ts</code>.
              </p>
            ) : (
              template.fields.map(field => (
                <DynamicCmpField key={field.identifier} field={field} />
              ))
            )}
          </div>

          {/* ── Status ── */}
          {status === 'success' && (
            <div role="status" className="flex items-start gap-sm px-md py-sm bg-fg/[0.04] border border-fg/[0.10] text-[0.8125rem] text-fg">
              <CheckCircle2 size={14} strokeWidth={2} className="shrink-0 mt-[1px] text-fg-muted" aria-hidden="true" />
              {statusMessage}
            </div>
          )}
          {status === 'error' && (
            <div role="alert" className="flex items-start gap-sm px-md py-sm bg-fg/[0.04] border border-fg/[0.10] text-[0.8125rem] text-fg">
              <AlertCircle size={14} strokeWidth={2} className="shrink-0 mt-[1px] text-fg-muted" aria-hidden="true" />
              {statusMessage}
            </div>
          )}

          <button type="submit" disabled={submitting} className={submitBtnCls}>
            <Send size={14} strokeWidth={2} aria-hidden="true" />
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      )}

      {/* ── Pre-selection empty state ── */}
      {!template && !templateLoading && !templateError && (
        <div className="mt-2xl flex flex-col items-center gap-md text-center">
          <FileBox size={32} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <div>
            <p className="text-[0.9375rem] font-medium text-fg-muted">Select a request type to begin</p>
            <p className="text-[0.8125rem] text-fg-muted/60 mt-xs">
              The form below adapts to whichever CMP Request Type template you choose.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
