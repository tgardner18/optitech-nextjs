// ─── Shared showcase navigation config ───────────────────────────────────────

// `href` overrides the default `/showcase/<category>/<slug>` route — used for
// in-page anchor links (e.g. the Theme playground's section jumps).
export type ShowcaseItem = { label: string; slug: string; href?: string }

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
      { label: 'Callout',          slug: 'callout'          },
      { label: 'Divider',          slug: 'divider'          },
      { label: 'Event Listing',    slug: 'event-listing'    },
      { label: 'Practitioner Listing', slug: 'practitioner-listing' },
      { label: 'Location Listing',     slug: 'location-listing'     },
      { label: 'Content Recommendations', slug: 'content-recommendations' },
      { label: 'Product Recommendations', slug: 'product-recommendations' },
      { label: 'Comparison Table',        slug: 'comparison-table'        },
    ],
  },
  {
    label: 'Pages',
    slug:  'pages',
    match: '/showcase/pages',
    href:  '/showcase/pages/blog',
    items: [
      { label: 'Blog',   slug: 'blog'   },
      { label: 'Event',  slug: 'event'  },
      { label: 'Folder', slug: 'folder' },
    ],
  },
  {
    label: 'Layout',
    slug:  'layout',
    match: '/showcase/layout',
    href:  '/showcase/layout/row-rhythm',
    items: [
      { label: 'Row Rhythm',        slug: 'row-rhythm'       },
      { label: 'Section Overlap',   slug: 'section-overlap'  },
      { label: 'Carousel',          slug: 'carousel'         },
      { label: 'Row Settings',      slug: 'row-settings'     },
      { label: 'Section Settings',  slug: 'section-settings' },
    ],
  },
  {
    label: 'Theme',
    slug:  'theme',
    match: '/showcase/theme',
    href:  '/showcase/theme',
    // Single live playground; sub-items jump to preview sections on the page.
    items: [
      { label: 'Colors',        slug: 'colors',     href: '/showcase/theme#colors'     },
      { label: 'Typography',    slug: 'typography', href: '/showcase/theme#typography' },
      { label: 'Buttons',       slug: 'buttons',    href: '/showcase/theme#buttons'    },
      { label: 'Form Elements', slug: 'inputs',     href: '/showcase/theme#inputs'     },
      { label: 'Spacing',       slug: 'spacing',    href: '/showcase/theme#spacing'    },
      { label: 'Motion',        slug: 'motion',     href: '/showcase/theme#motion'     },
    ],
  },
]

export function getCategoryForPath(pathname: string): ShowcaseCategory | null {
  return CATEGORIES.find(c => pathname.startsWith(c.match)) ?? null
}
