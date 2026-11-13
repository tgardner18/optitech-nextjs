/**
 * Deterministic element id for server components, where React's useId is unavailable.
 * Same input gives the same id on server and client, so aria-labelledby stays valid.
 */
export function stableId(prefix: string, seed: string): string {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0
  return `${prefix}-${(h >>> 0).toString(36)}`
}
