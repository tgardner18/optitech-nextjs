export type AdminBlockType = {
  key:         string
  displayName: string
  category:    'content' | 'media' | 'data' | 'layout'
}

export const ADMIN_BLOCK_TYPES: AdminBlockType[] = [
  { key: 'OT_HeroBlock',            displayName: 'Hero',             category: 'content' },
  { key: 'OT_CardBlock',            displayName: 'Card',             category: 'content' },
  { key: 'OT_PrimaryTextBlock',     displayName: 'Primary Text',     category: 'content' },
  { key: 'OT_RichTextBlock',        displayName: 'Rich Text',        category: 'content' },
  { key: 'OT_QuoteBlock',           displayName: 'Quote',            category: 'content' },
  { key: 'OT_BannerBlock',          displayName: 'Banner',           category: 'content' },
  { key: 'OT_AccordionBlock',       displayName: 'Accordion',        category: 'content' },
  { key: 'OT_TabsBlock',            displayName: 'Tabs',             category: 'content' },
  { key: 'OT_FeatureGridBlock',     displayName: 'Feature Grid',     category: 'content' },
  { key: 'OT_TrustRail',            displayName: 'Trust Rail',       category: 'content' },
  { key: 'OT_BlogFeedBlock',        displayName: 'Blog Feed',        category: 'content' },
  { key: 'OT_ResourceLibraryBlock', displayName: 'Resource Library', category: 'content' },
  { key: 'OT_StatBlock',            displayName: 'Stat Block',       category: 'data'    },
  { key: 'OT_ChartBlock',           displayName: 'Chart',            category: 'data'    },
  { key: 'OT_ImageBlock',           displayName: 'Image',            category: 'media'   },
  { key: 'OT_VideoBlock',           displayName: 'Video',            category: 'media'   },
  { key: 'BlankExperience',         displayName: 'Experience Page',  category: 'layout'  },
  { key: 'OT_BlogPage',             displayName: 'Blog Post',        category: 'layout'  },
]

export function getBlockType(key: string): AdminBlockType | undefined {
  return ADMIN_BLOCK_TYPES.find(t => t.key === key)
}

export const ALLOWED_QUERY_KEYS = new Set(ADMIN_BLOCK_TYPES.map(t => t.key))
