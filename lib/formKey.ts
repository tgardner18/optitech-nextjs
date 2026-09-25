// Strict allowlist for an Optimizely content key pasted by a person (e.g. the
// Forms showcase's "look up by key" box). Two shapes are accepted because the
// CMS UI displays a dashed GUID while Optimizely Graph's delivery key is the
// same value dashless — everything else is rejected outright.
const HEX32 = /^[0-9a-f]{32}$/
const UUID  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/**
 * Normalizes a pasted content key/GUID to Graph's dashless lowercase-hex form.
 * Returns null for anything that doesn't match one of the two accepted shapes.
 *
 * The GraphQL query this feeds is already parameterized (`$key`), so this
 * isn't standing in for query safety — it's the allowlist check so a
 * malformed or clearly-not-a-key paste never reaches the query variable in
 * the first place, and never renders back into the page unescaped.
 */
export function normalizeFormKey(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (HEX32.test(trimmed)) return trimmed
  if (UUID.test(trimmed)) return trimmed.replace(/-/g, '')
  return null
}
