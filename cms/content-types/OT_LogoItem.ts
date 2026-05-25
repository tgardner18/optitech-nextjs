import { contentType } from '@optimizely/cms-sdk'

/**
 * OT_LogoItem — a single partner or customer logo within OT_TrustRail.
 * Not a standalone block; only appears as an array item inside OT_TrustRail.
 *
 * Editors upload the logo image, provide an accessible company name via
 * altText, and optionally link the logo to an external URL.
 *
 * Image guidance: transparent PNG or SVG strongly recommended. The component
 * applies grayscale / brightness filters based on the display template's
 * treatment setting — a transparent background is required for those to work.
 */
export const OT_LogoItem = contentType({
  key:         'OT_LogoItem',
  displayName: 'Logo Item',
  baseType:    '_component',
  properties: {
    image: {
      type:         'contentReference',
      allowedTypes: ['_image'],
      displayName:  'Logo Image',
      description:  'Partner or customer logo. Transparent PNG or SVG recommended.',
      group:        'OT_Content',
      sortOrder:    10,
      isRequired:   true,
    },
    altText: {
      type:        'string',
      maxLength:   120,
      displayName: 'Company Name',
      description: 'Accessible label — the company or brand name. e.g. "Acme Corp"',
      group:       'OT_Content',
      sortOrder:   20,
    },
    url: {
      type:        'url',
      displayName: 'Link URL',
      description: 'Optional. Makes the logo a clickable link to the partner site.',
      group:       'OT_Content',
      sortOrder:   30,
    },
  },
})
