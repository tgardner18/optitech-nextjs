import { contentType } from '@optimizely/cms-sdk'
import { OT_FooterLink } from './OT_FooterLink'

/**
 * OT_FooterBlock — site footer content block.
 *
 * Referenced from OT_ThemeManager.footerRef. Not a Visual Builder element;
 * editors manage it as a standalone shared item and assign it to the theme.
 *
 * Logo: when footerLogo is set here, it overrides the ThemeManager site logo
 * specifically in the footer — useful when the footer calls for an icon mark
 * rather than the full wordmark used in the header.
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
    // ── Logo override ─────────────────────────────────────────────────────────
    // When set, this logo is displayed in the footer instead of the ThemeManager
    // site logo. Editors can use a different visual weight for the footer
    // (e.g. icon mark in the footer, full wordmark in the header).
    footerLogo: {
      type: 'contentReference',
      allowedTypes: ['_image'],
      displayName: 'Footer Logo',
      description: 'Override the footer logo. Defaults to the site logo from ThemeManager when not set.',
      group: 'OT_Style',
      sortOrder: 5,
    },
    footerLogoSize: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Footer Logo Size',
      description: 'Display height of the footer logo.',
      group: 'OT_Style',
      sortOrder: 6,
      enum: [
        { value: 'sm', displayName: 'Small (40px)' },
        { value: 'md', displayName: 'Medium (56px)' },
        { value: 'lg', displayName: 'Large (80px)' },
        { value: 'xl', displayName: 'Extra Large (112px)' },
      ],
    },
    footerLogoInvertDark: {
      type: 'boolean',
      displayName: 'Invert Logo in Dark Mode',
      description: 'Applies a brightness/invert filter so a dark logo reads as white on dark backgrounds.',
      group: 'OT_Style',
      sortOrder: 7,
    },
    // ── Content ───────────────────────────────────────────────────────────────
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
