// ─── CMP Work Request types + shape normalization ───────────────────────────
//
// The CMP "Requests" REST surface (/v3/templates, /v3/work-requests) is marked
// "Experimental" in Optimizely's docs. The shapes below are confirmed against
// a live CMP instance (GET /v3/templates and GET /v3/templates/{id}):
//
//   GET /v3/templates → { data: [ { id, title, description, applicable_to: [...], ... } ], pagination }
//
//   GET /v3/templates/{id} → {
//     id, title, description, applicable_to: [...],
//     form_fields: [
//       { identifier, label, is_required, type, type_specific_meta, ... }
//     ]
//   }
//
// Surprise: a field's *choice options* (when present) live under
// `type_specific_meta: { choices: [{ id, name }], is_multi_select }` — NOT a
// top-level `options`/`choices` key. And a field's nominal `type` doesn't
// reliably say whether it's choice-driven: one live template used `type:
// "label"` for a genuine multi-select field (choices + is_multi_select),
// not static display text. So options are read from type_specific_meta first
// (with a couple of speculative top-level fallbacks kept for forward
// compatibility with templates/instances not yet seen), and the renderer
// (components/admin/DynamicCmpField.tsx) treats "has options" as the primary
// signal, falling back to `type` only for fields with no choices data.

export type CmpTemplateSummary = {
  id:          string
  name:        string
  description?: string
}

export type CmpFieldOption = {
  label: string
  value: string
}

export type CmpFieldDef = {
  identifier:     string
  type:           string // text | text_area | brief | date | file | dropdown | radio_button | checkbox | simple_number | currency_number | percentage_number | richtext | label | section | ...
  label:          string
  required:       boolean
  isReadonly?:    boolean
  options?:       CmpFieldOption[]
  isMultiSelect?: boolean
}

export type CmpTemplateDetail = {
  id:     string
  name:   string
  fields: CmpFieldDef[]
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function pickBool(obj: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

// Templates list: confirmed shape is `{ data: [...] }`; a bare array and
// `{ templates: [...] }` are kept as fallbacks for other API versions.
// Only templates that can actually back a work request are surfaced —
// `applicable_to` has been seen including "campaign_brief"/"task_brief" too.
export function normalizeTemplateSummaries(raw: unknown): CmpTemplateSummary[] {
  const root = raw as Record<string, unknown>
  const list = Array.isArray(raw) ? raw
    : asArray(root?.data).length > 0 ? asArray(root.data)
    : asArray(root?.templates).length > 0 ? asArray(root.templates)
    : asArray(root?.items)

  return asArray(list)
    .map(entry => entry as Record<string, unknown>)
    .filter(entry => {
      const applicableTo = asArray(entry.applicable_to)
      return applicableTo.length === 0 || applicableTo.includes('work_request')
    })
    .map((entry): CmpTemplateSummary | null => {
      const id = pickString(entry, ['id', 'template_id', 'templateId'])
      const name = pickString(entry, ['title', 'name'])
      if (!id || !name) return null
      const description = pickString(entry, ['description', 'summary'])
      return description ? { id, name, description } : { id, name }
    })
    .filter((t): t is CmpTemplateSummary => t !== null)
}

// Template detail: confirmed shape is a flat object (no `data` wrapper) with
// its field array at `form_fields`. `fields`/`data`-wrapped variants are kept
// as fallbacks in case a differently-versioned instance responds that way.
export function normalizeTemplateDetail(raw: unknown, fallbackId: string): CmpTemplateDetail {
  const root = raw as Record<string, unknown>
  const data = asRecord(root?.data) ?? root

  const id   = pickString(data, ['id', 'template_id', 'templateId']) ?? fallbackId
  const name = pickString(data, ['title', 'name']) ?? 'Untitled template'

  const rawFields = asArray(data?.form_fields).length > 0 ? asArray(data.form_fields)
    : asArray(data?.fields).length > 0 ? asArray(data.fields)
    : asArray(data?.field_definitions)

  const fields = rawFields
    .map(entry => entry as Record<string, unknown>)
    .map((entry): CmpFieldDef | null => {
      const identifier = pickString(entry, ['identifier', 'key', 'field_key'])
      const type = pickString(entry, ['type', 'field_type', 'fieldType']) ?? 'text'
      if (!identifier) return null

      const meta = asRecord(entry.type_specific_meta)
      const rawChoices = meta ? asArray(meta.choices) : []
      const rawOptions = rawChoices.length > 0 ? rawChoices
        : asArray(entry.options).length > 0 ? asArray(entry.options)
        : asArray(entry.choices)

      const options: CmpFieldOption[] = rawOptions.map(opt => {
        const o = opt as Record<string, unknown>
        if (typeof opt === 'string') return { label: opt, value: opt }
        // Live shape is { id, name }; kept tolerant of { value, label } too.
        const value = pickString(o, ['id', 'value']) ?? pickString(o, ['name', 'label']) ?? ''
        const label = pickString(o, ['name', 'label']) ?? value
        return { label, value }
      })

      const isMultiSelect = meta ? pickBool(meta, ['is_multi_select', 'isMultiSelect']) : false

      const isReadonly = pickBool(entry, ['is_readonly', 'isReadonly'])

      return {
        identifier,
        type,
        label: pickString(entry, ['label', 'name', 'title']) ?? identifier,
        required: pickBool(entry, ['is_required', 'required', 'isRequired']),
        ...(isReadonly ? { isReadonly } : {}),
        ...(options.length > 0 ? { options, isMultiSelect } : {}),
      }
    })
    .filter((f): f is CmpFieldDef => f !== null)

  return { id, name, fields }
}
