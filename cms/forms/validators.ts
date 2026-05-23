type ValidatorEntry = { type: string; model?: { isRequired?: boolean } }

export function parseValidators(raw: unknown): { required: boolean } {
  if (!Array.isArray(raw)) return { required: false }
  const required = (raw as ValidatorEntry[]).some(v => {
    if (typeof v?.type !== 'string') return false
    return v.type.toLowerCase().includes('required') && v.model?.isRequired !== false
  })
  return { required }
}
