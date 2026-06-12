import { contentType } from '@optimizely/cms-sdk'
import { ICON_ENUM_WITH_NONE } from '../display-templates/_shared/iconChoices'

export const OT_TabItem = contentType({
  key:         'OT_TabItem',
  displayName: 'Tab Item',
  description: 'Single tab panel with label, icon, heading, body, and optional CTA.',
  baseType:    '_component',
  // No compositionBehaviors — only exists as an array item inside OT_TabsBlock
  properties: {
    tabLabel: {
      type:        'string',
      displayName: 'Tab Label',
      description: 'The trigger text shown on the tab. Keep under 24 characters.',
      isLocalized: true,
      maxLength:   24,
      group:       'OT_Content',
      sortOrder:   10,
    },
    tabIcon: {
      type:        'string',
      displayName: 'Tab Icon',
      description: 'Optional icon shown alongside the tab label.',
      format:      'selectOne',
      // Full canonical icon library, alphabetically sorted — shared with the
      // display-template icon pickers (Stat, Callout, FeatureGrid, Button) via
      // a single source of truth so every icon selector offers the same set.
      enum:        ICON_ENUM_WITH_NONE,
      group:     'OT_Content',
      sortOrder: 20,
      // Not localized — icon choice is structural, not language-dependent
    },
    heading: {
      type:        'string',
      displayName: 'Panel Heading',
      description: 'Optional headline inside the tab panel. Leave blank for body-only panels.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
    body: {
      type:        'richText',
      displayName: 'Panel Body',
      description: 'Primary panel content. Supports bold, italic, links, and lists.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   40,
      indexingType: 'searchable',
    },
    image: {
      type:         'contentReference',
      displayName:  'Panel Image',
      description:  'Optional image. Only renders when Content Layout is set to Image Right or Image Left.',
      allowedTypes: ['_image'],
      group:        'OT_Content',
      sortOrder:    50,
      // Not localized — media references are shared across locales
    },
    ctaLabel: {
      type:        'string',
      displayName: 'CTA Label',
      description: 'Optional button label. Requires CTA URL to be set.',
      isLocalized: true,
      maxLength:   40,
      group:       'OT_Content',
      sortOrder:   60,
    },
    ctaUrl: {
      type:        'url',
      displayName: 'CTA URL',
      description: 'Destination URL for the CTA button. Can be locale-specific (e.g. /en/page vs /de/seite).',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   70,
    },
  },
})
