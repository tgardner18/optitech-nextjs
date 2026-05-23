export type FormOption = { caption: string; value: string; checked: boolean }

export function parseOptions(raw: unknown): FormOption[] {
  if (!Array.isArray(raw)) return []
  return (raw as any[])
    .filter(o => typeof o?.caption === 'string')
    .map(o => ({
      caption: String(o.caption),
      value:   String(o.value ?? o.caption),
      checked: o.checked === true,
    }))
}
