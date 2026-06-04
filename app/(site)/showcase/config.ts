// ─── Shared showcase navigation config ───────────────────────────────────────

export type ShowcaseItem = { label: string; slug: string }

export type ShowcaseCategory = {
  label: string
  slug: string
  match: string  // pathname prefix for active detection
  href: string   // where the category tab navigates to
  items: ShowcaseItem[]
}

export const CATEGORIES: ShowcaseCategory[] = [
  {
    label: 'Blocks',
    slug:  'blocks',
    match: '/showcase/blocks',
    href:  '/showcase/blocks/hero',
    items: [
      { label: 'Hero',         slug: 'hero'         },
      { label: 'Card',         slug: 'card'         },
      { label: 'Primary Text', slug: 'primary-text' },
      { label: 'Quote',        slug: 'quote'        },
      { label: 'Rich Text',    slug: 'rich-text'    },
      { label: 'Image',        slug: 'image'        },
      { label: 'Video',        slug: 'video'        },
      { label: 'Stat',         slug: 'stat'         },
      { label: 'Feature Grid', slug: 'feature-grid' },
      { label: 'Trust Rail',   slug: 'trust-rail'   },
      { label: 'Accordion',    slug: 'accordion'    },
      { label: 'Tabs',         slug: 'tabs'         },
      { label: 'Blog Feed',    slug: 'blog-feed'    },
      { label: 'Button',       slug: 'button'       },
      { label: 'Chart',        slug: 'chart'        },
      { label: 'Banner',            slug: 'banner'           },
      { label: 'Resource Library', slug: 'resource-library' },
    ],
  },
  {
    label: 'Pages',
    slug:  'pages',
    match: '/showcase/pages',
    href:  '/showcase/pages/blog',
    items: [
      { label: 'Blog',   slug: 'blog'   },
      { label: 'Folder', slug: 'folder' },
    ],
  },
  {
    label: 'Theme',
    slug:  'theme',
    match: '/showcase/theme',
    href:  '/showcase/theme',
    items: [],
  },
  {
    label: 'Tokens',
    slug:  'tokens',
    match: '/showcase/tokens',
    href:  '/showcase/tokens/colors',
    items: [
      { label: 'Colors',        slug: 'colors'     },
      { label: 'Typography',    slug: 'typography' },
      { label: 'Buttons',       slug: 'buttons'    },
      { label: 'Form Elements', slug: 'inputs'     },
      { label: 'Spacing',       slug: 'spacing'    },
      { label: 'Motion',        slug: 'motion'     },
    ],
  },
]

export function getCategoryForPath(pathname: string): ShowcaseCategory | null {
  return CATEGORIES.find(c => pathname.startsWith(c.match)) ?? null
}
