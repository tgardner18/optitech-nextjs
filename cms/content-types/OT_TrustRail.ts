import { contentType } from '@optimizely/cms-sdk'
import { OT_LogoItem } from './OT_LogoItem'

/**
 * OT_TrustRail — a horizontal logo strip for social proof.
 *
 * Shows partner, customer, or integration logos in a scrolling marquee,
 * staggered fade, or static grid. Editors add 3–12 OT_LogoItem entries.
 *
 * Motion style, image treatment (grayscale / color), background,
 * logo size, density, and glass overlay are all controlled via the
 * OT_TrustRailDefault display template — not as content properties.
 *
 * Min logos: 3 (enforced in the UI component — block renders an empty
 * state placeholder when fewer logos are present).
 * Max logos: 12 (excess items silently capped in the UI component).
 */
export const OT_TrustRail = contentType({
  key:                  'OT_TrustRail',
  displayName:          'Trust Rail',
  baseType:             '_component',
  compositionBehaviors: ['sectionEnabled'],
  properties: {
    headline: {
      type:        'string',
      maxLength:   120,
      displayName: 'Headline',
      description: 'Optional label above the logo strip. e.g. "Trusted by industry leaders"',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   10,
    },
    logos: {
      type:        'array',
      displayName: 'Logos',
      description: 'Add 3–12 partner or customer logos. Each has an image, company name, and optional link.',
      group:       'OT_Content',
      sortOrder:   20,
      items:       { type: 'component', contentType: OT_LogoItem },
    },
  },
})
