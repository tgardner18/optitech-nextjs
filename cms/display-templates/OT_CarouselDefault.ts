import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_CarouselDefault = displayTemplate({
  key:         'OT_CarouselDefault',
  displayName: 'Carousel Default',
  contentType: 'OT_CarouselBlock',
  isDefault:   true,
  settings: {

    // ── Slide layout ──────────────────────────────────────────────────────────
    slideLayout: {
      displayName: 'Slide Layout',
      editor:      'select',
      sortOrder:   10,
      choices: {
        fullBleed: { displayName: 'Full Bleed (image background)',    sortOrder: 10 },
        split:     { displayName: 'Split (image left, content right)', sortOrder: 20 },
      },
    },

    // ── Full-bleed overlay ────────────────────────────────────────────────────
    overlay: {
      displayName: 'Image Overlay',
      editor:      'select',
      sortOrder:   15,
      choices: {
        gradient: { displayName: 'Gradient (Default)', sortOrder: 10 },
        none:     { displayName: 'None (photo only)',  sortOrder: 20 },
      },
    },

    // ── Slide transition ──────────────────────────────────────────────────────
    transition: {
      displayName: 'Transition',
      editor:      'select',
      sortOrder:   20,
      choices: {
        slide: { displayName: 'Slide (Default)', sortOrder: 10 },
        cover: { displayName: 'Cover',           sortOrder: 20 },
        fade:  { displayName: 'Fade',            sortOrder: 30 },
        morph: { displayName: 'Morph',           sortOrder: 40 },
      },
    },

    // ── Controls ──────────────────────────────────────────────────────────────
    controls: {
      displayName: 'Controls',
      editor:      'select',
      sortOrder:   30,
      choices: {
        both:   { displayName: 'Arrows + Dots (Default)', sortOrder: 10 },
        arrows: { displayName: 'Arrows only',             sortOrder: 20 },
        dots:   { displayName: 'Dots only',               sortOrder: 30 },
        none:   { displayName: 'None',                    sortOrder: 40 },
      },
    },

    // ── Auto-play ─────────────────────────────────────────────────────────────
    autoplay: {
      displayName: 'Auto-Play',
      editor:      'select',
      sortOrder:   40,
      choices: {
        off:    { displayName: 'Off (Default)', sortOrder: 10 },
        slow:   { displayName: 'Slow (8s)',     sortOrder: 20 },
        medium: { displayName: 'Medium (5s)',   sortOrder: 30 },
        fast:   { displayName: 'Fast (3s)',     sortOrder: 40 },
      },
    },

    // ── Loop mode ─────────────────────────────────────────────────────────────
    loop: {
      displayName: 'Loop Mode',
      editor:      'select',
      sortOrder:   50,
      choices: {
        loop:   { displayName: 'Loop (Default)', sortOrder: 10 },
        bounce: { displayName: 'Bounce',         sortOrder: 20 },
        none:   { displayName: 'No loop',        sortOrder: 30 },
      },
    },

    // ── Peek adjacent slides ──────────────────────────────────────────────────
    peek: {
      displayName: 'Peek',
      editor:      'select',
      sortOrder:   60,
      choices: {
        none: { displayName: 'None (Default)', sortOrder: 10 },
        sm:   { displayName: 'Small',          sortOrder: 20 },
        md:   { displayName: 'Medium',         sortOrder: 30 },
        lg:   { displayName: 'Large',          sortOrder: 40 },
      },
    },

    // ── Gap between slides ────────────────────────────────────────────────────
    gap: {
      displayName: 'Slide Gap',
      editor:      'select',
      sortOrder:   70,
      choices: {
        none:   { displayName: 'None',              sortOrder: 10 },
        small:  { displayName: 'Small',             sortOrder: 20 },
        medium: { displayName: 'Medium (Default)',  sortOrder: 30 },
        large:  { displayName: 'Large',             sortOrder: 40 },
      },
    },

    // ── Background / panel color (split layout) ───────────────────────────────
    color: {
      displayName: 'Content Panel Color',
      editor:      'select',
      sortOrder:   80,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },

    // ── Entrance animation ────────────────────────────────────────────────────
    entranceAnimation: {
      displayName: 'Entrance Animation',
      editor:      'select',
      sortOrder:   90,
      choices: {
        none:  { displayName: 'None (Default)', sortOrder: 10 },
        fade:  { displayName: 'Fade in',        sortOrder: 20 },
        slide: { displayName: 'Slide up',       sortOrder: 30 },
      },
    },

  },
})
