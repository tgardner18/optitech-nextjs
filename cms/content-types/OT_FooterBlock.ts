import { contentType } from '@optimizely/cms-sdk'
import { OT_FooterLink } from './OT_FooterLink'

/**
 * OT_FooterBlock — site footer content block.
 *
 * Referenced from OT_ThemeManager.footerRef. Not a Visual Builder element;
 * editors manage it as a standalone shared item and assign it to the theme.
 *
 * The logo is NOT stored here — it is read from the ThemeManager directly so
 * there is a single source of truth for the site logo across header and footer.
 *
 * All fields are localized so the footer can be authored per locale.
 * Links auto-flow into two columns in the UI when more than 5 items are added.
 * Maximum 10 links.
 */
export const OT_FooterBlock = contentType({
  key: 'OT_FooterBlock',
  displayName: 'Footer',
  baseType: '_component',
  // No compositionBehaviors — this is a singleton managed via ThemeManager.footerRef,
  // never placed directly in a Visual Builder canvas. elementEnabled is intentionally
  // absent because the CMS disallows array/component properties on elementEnabled blocks.
  properties: {
    description: {
      type: 'richText',
      isLocalized: true,
      displayName: 'Description',
      description: 'Mission statement or value message displayed beneath the site logo.',
      group: 'OT_Content',
      sortOrder: 10,
    },
    links: {
      type: 'array',
      isLocalized: true,
      displayName: 'Footer Links',
      description: 'Navigation links — up to 10 items. Automatically flows into two columns when more than 5 links are added.',
      group: 'OT_Content',
      sortOrder: 20,
      maxItems: 10,
      items: { type: 'component', contentType: OT_FooterLink },
    },
  },
})
