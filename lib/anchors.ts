/**
 * In-page anchors for CMS outline items.
 *
 * Every top-level item on an experience page gets an invisible marker with an id, so an editor
 * can point any link (a hero CTA, a nav item, a button) at "#something" with no extra block.
 * The id comes from the item's name in the CMS outline:
 *
 *   1. An explicit tag wins:  "Form — Auto Refinance Quote #quote-form"  ->  #quote-form
 *   2. Otherwise the name is slugified:  "Form — Auto Refinance Quote"  ->  #form-auto-refinance-quote
 *
 * Outline names are never shown to visitors, so the tag costs nothing visually.
 */

const TAG = /(?:^|\s)#([a-z0-9][\w-]*)\s*$/i

export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Id for one outline item, or null when it has no usable name. `taken` keeps ids unique on the page. */
export function anchorIdFor(displayName: string | null | undefined, taken: Set<string>): string | null {
  const name = (displayName ?? '').trim()
  if (!name) return null
  const tag = name.match(TAG)?.[1]
  const base = tag ? tag.toLowerCase() : slugify(name)
  if (!base || base === 'main-content') return null
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  taken.add(id)
  return id
}
