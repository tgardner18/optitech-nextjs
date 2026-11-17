/** One colour per category group, used the same way on the article panel, the hub panel and hub cards. */
const FIXED: Record<string, 'brand' | 'accent' | 'ink'> = { Category: 'brand', Audience: 'accent', Theme: 'ink' }
const CYCLE = ['brand', 'accent', 'ink'] as const

export function slotFor(group: string, index = 0): 'brand' | 'accent' | 'ink' {
  return FIXED[group] ?? CYCLE[index % CYCLE.length]
}
