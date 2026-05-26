// ─── Shared showcase navigation config ───────────────────────────────────────
// Single source of truth for type tabs and per-section component lists.
// Consumed by both the desktop sidebar (nav.tsx) and mobile strip (MobileNav.tsx).

export type NavSection = { id: string; label: string }

export const TYPE_TABS = [
  { label: 'Overview', href: '/showcase',        match: '/showcase',        exact: true  },
  { label: 'Blocks',   href: '/showcase/blocks', match: '/showcase/blocks', exact: false },
  { label: 'Pages',    href: '/showcase/pages',  match: '/showcase/pages',  exact: false },
  { label: 'Tokens',   href: '/showcase/tokens', match: '/showcase/tokens', exact: false },
  { label: 'Theme',    href: '/showcase/theme',  match: '/showcase/theme',  exact: false },
] as const

/** Matches the section `id=` attributes in app/(site)/showcase/blocks/page.tsx */
export const BLOCK_SECTIONS: NavSection[] = [
  { id: 'button',             label: 'Button' },
  { id: 'button-block',       label: 'Button Block' },
  { id: 'hero-block',         label: 'Hero' },
  { id: 'primary-text-block', label: 'Primary Text' },
  { id: 'rich-text-block',    label: 'Rich Text' },
  { id: 'quote-block',        label: 'Quote' },
  { id: 'image-block',        label: 'Image' },
  { id: 'video-block',        label: 'Video' },
  { id: 'card-block',         label: 'Card' },
  { id: 'stat-block',         label: 'Stat Block' },
  { id: 'feature-grid-block', label: 'Feature Grid' },
  { id: 'accordion-block',    label: 'Accordion' },
]

/** Matches the section `id=` attributes in app/(site)/showcase/tokens/page.tsx */
export const TOKEN_SECTIONS: NavSection[] = [
  { id: 'colors',     label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons',    label: 'Buttons' },
  { id: 'inputs',     label: 'Form Elements' },
  { id: 'spacing',    label: 'Spacing' },
  { id: 'motion',     label: 'Motion' },
]

/** Returns the correct section list for the given pathname. */
export function getSectionsForPath(pathname: string): NavSection[] {
  if (pathname.startsWith('/showcase/blocks')) return BLOCK_SECTIONS
  if (pathname.startsWith('/showcase/tokens')) return TOKEN_SECTIONS
  return []
}
