import { displayTemplate } from '@optimizely/cms-sdk'

// Note: display-template `settings` entries cannot carry a `description` field
// (only content-type properties can) — it fails `config push` with an
// InvalidModel error. Guidance that would otherwise live in a setting's
// description is folded into its `displayName` or documented here instead:
//   - Content Vertical Alignment was removed: heights are minimum heights
//     that grow to fit the text, so content always centers in the room there is.
//   - navigation: resolves differently per Presentation Style — see
//     OT_SliderBlock-requirements.md §5 for the per-style mapping. Emerge's
//     own dock: `arrows`/`both` show the chevron pair, `dots` has no
//     separate meaning (the card row is always the pagination), and `none`
//     keeps the dock visible but makes its cards non-interactive.
//   - headingLevel: applies to every slide's headline. Use H1 only when this
//     slider replaces the page's hero.
//   - entranceAnimation: plays once on first scroll into view, independent of
//     the slide-to-slide transition (which is fixed by the Presentation Style).
export const OT_SliderDefault = displayTemplate({
  key: 'OT_SliderDefault',
  displayName: 'Slider Default',
  contentType: 'OT_SliderBlock',
  isDefault: true,
  settings: {
    width: {
      displayName: 'Width', editor: 'select', sortOrder: 10,
      choices: {
        fullBleed: { displayName: 'Full Bleed (Default)', sortOrder: 10 },
        contained: { displayName: 'Contained',             sortOrder: 20 },
      },
    },
    height: {
      displayName: 'Height', editor: 'select', sortOrder: 20,
      choices: {
        compact:    { displayName: 'Compact',              sortOrder: 10 },
        standard:   { displayName: 'Standard (Default)',   sortOrder: 20 },
        large:      { displayName: 'Large',                sortOrder: 30 },
        fullScreen: { displayName: 'Full Screen',           sortOrder: 40 },
        fitContent: { displayName: 'Fit Content',           sortOrder: 50 },
      },
    },
    autoPlay: {
      displayName: 'Auto-Play', editor: 'select', sortOrder: 40,
      choices: {
        off:    { displayName: 'Off (Default)', sortOrder: 10 },
        slow:   { displayName: 'Slow (8s)',     sortOrder: 20 },
        medium: { displayName: 'Medium (5s)',   sortOrder: 30 },
        fast:   { displayName: 'Fast (3s)',     sortOrder: 40 },
      },
    },
    loop: {
      displayName: 'Loop Mode', editor: 'select', sortOrder: 50,
      choices: {
        loop:   { displayName: 'Loop (Default)', sortOrder: 10 },
        bounce: { displayName: 'Bounce',          sortOrder: 20 },
        none:   { displayName: 'Stop at ends',    sortOrder: 30 },
      },
    },
    navigation: {
      displayName: 'Navigation', editor: 'select', sortOrder: 60,
      choices: {
        both:   { displayName: 'Arrows + Dots (Default)', sortOrder: 10 },
        arrows: { displayName: 'Arrows only',              sortOrder: 20 },
        dots:   { displayName: 'Dots only',                sortOrder: 30 },
        none:   { displayName: 'None',                     sortOrder: 40 },
      },
    },
    headingLevel: {
      displayName: 'Heading Level', editor: 'select', sortOrder: 70,
      choices: {
        h2: { displayName: 'H2 (Default)', sortOrder: 10 },
        h1: { displayName: 'H1 — page title', sortOrder: 20 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance Animation', editor: 'select', sortOrder: 80,
      choices: {
        none: { displayName: 'None (Default)', sortOrder: 10 },
        fade: { displayName: 'Fade in',          sortOrder: 20 },
        slide:{ displayName: 'Slide up',        sortOrder: 30 },
      },
    },
  },
})
