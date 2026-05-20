import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_LandingRow = displayTemplate({
  key: 'OT_LandingRow',
  displayName: 'Landing Row',
  nodeType: 'row',
  isDefault: true,
  settings: {
    displayAs: {
      displayName: 'Display as',
      editor: 'select',
      sortOrder: 5,
      choices: {
        grid:   { displayName: 'Grid (Default)', sortOrder: 10 },
        slider: { displayName: 'Slider',         sortOrder: 20 },
      },
    },
    showAsRowFrom: {
      displayName: 'Stack columns until',
      editor: 'select',
      sortOrder: 10,
      choices: {
        sm:    { displayName: 'Small (≥640px)',  sortOrder: 10 },
        md:    { displayName: 'Medium (≥768px)', sortOrder: 20 },
        lg:    { displayName: 'Large (≥1024px)', sortOrder: 30 },
        xl:    { displayName: 'XL (≥1280px)',    sortOrder: 40 },
        never: { displayName: 'Always stacked',  sortOrder: 50 },
      },
    },
    contentSpacing: {
      displayName: 'Column gap',
      editor: 'select',
      sortOrder: 20,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
        xl:     { displayName: 'XL',     sortOrder: 50 },
      },
    },
    verticalPadding: {
      displayName: 'Vertical padding',
      editor: 'select',
      sortOrder: 30,
      choices: {
        none:   { displayName: 'None',   sortOrder: 10 },
        small:  { displayName: 'Small',  sortOrder: 20 },
        medium: { displayName: 'Medium', sortOrder: 30 },
        large:  { displayName: 'Large',  sortOrder: 40 },
        xl:     { displayName: 'XL',     sortOrder: 50 },
      },
    },
    justifyContent: {
      displayName: 'Justify content',
      editor: 'select',
      sortOrder: 40,
      choices: {
        start:   { displayName: 'Start',          sortOrder: 10 },
        center:  { displayName: 'Center',         sortOrder: 20 },
        end:     { displayName: 'End',            sortOrder: 30 },
        between: { displayName: 'Space between',  sortOrder: 40 },
        evenly:  { displayName: 'Space evenly',   sortOrder: 50 },
      },
    },
    alignItems: {
      displayName: 'Align items',
      editor: 'select',
      sortOrder: 50,
      choices: {
        start:    { displayName: 'Start',    sortOrder: 10 },
        center:   { displayName: 'Center',   sortOrder: 20 },
        end:      { displayName: 'End',      sortOrder: 30 },
        stretch:  { displayName: 'Stretch',  sortOrder: 40 },
        baseline: { displayName: 'Baseline', sortOrder: 50 },
      },
    },
    backgroundColor: {
      displayName: 'Background color',
      editor: 'select',
      sortOrder: 70,
      choices: {
        none:        { displayName: 'None',       sortOrder: 10 },
        canvas:      { displayName: 'Canvas',     sortOrder: 20 },
        surface:     { displayName: 'Surface',    sortOrder: 30 },
        brand:       { displayName: 'Brand',      sortOrder: 40 },
        brandDeep: { displayName: 'Brand deep', sortOrder: 50 },
      },
    },
    backgroundImage: {
      displayName: 'Background image URL',
      editor: 'select',
      sortOrder: 80,
      choices: {},
    },
    imageOverlay: {
      displayName: 'Image overlay',
      editor: 'select',
      sortOrder: 90,
      choices: {
        none:  { displayName: 'None',  sortOrder: 10 },
        dark:  { displayName: 'Dark',  sortOrder: 20 },
        brand: { displayName: 'Brand', sortOrder: 30 },
      },
    },
    wrapColumns: {
      displayName: 'Wrap columns',
      editor: 'select',
      sortOrder: 100,
      choices: {
        false: { displayName: 'No (Default)', sortOrder: 10 },
        true:  { displayName: 'Yes',          sortOrder: 20 },
      },
    },
    reverseColumns: {
      displayName: 'Reverse column order',
      editor: 'select',
      sortOrder: 110,
      choices: {
        false: { displayName: 'No (Default)', sortOrder: 10 },
        true:  { displayName: 'Yes',          sortOrder: 20 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation',
      editor: 'select',
      sortOrder: 120,
      choices: {
        none:  { displayName: 'None',     sortOrder: 10 },
        fade:  { displayName: 'Fade in',  sortOrder: 20 },
        slide: { displayName: 'Slide up', sortOrder: 30 },
      },
    },
    sliderTransition: {
      displayName: 'Slider — transition style',
      editor: 'select',
      sortOrder: 200,
      choices: {
        slide: { displayName: 'Slide — items translate horizontally (Default)', sortOrder: 10 },
        fade:  { displayName: 'Fade — crossfade between items',                 sortOrder: 20 },
        cover: { displayName: 'Cover — active item at full scale, others shrink', sortOrder: 30 },
        morph: { displayName: 'Morph — fade + blur dissolve',                   sortOrder: 40 },
      },
    },
    sliderControls: {
      displayName: 'Slider — navigation',
      editor: 'select',
      sortOrder: 210,
      choices: {
        both:   { displayName: 'Arrows + dots (Default)', sortOrder: 10 },
        arrows: { displayName: 'Arrows only',             sortOrder: 20 },
        dots:   { displayName: 'Dots only',               sortOrder: 30 },
        none:   { displayName: 'None — swipe/drag only',  sortOrder: 40 },
      },
    },
    sliderAutoplay: {
      displayName: 'Slider — auto-advance',
      editor: 'select',
      sortOrder: 220,
      choices: {
        off:    { displayName: 'Off (Default)', sortOrder: 10 },
        slow:   { displayName: 'Slow — 8s',    sortOrder: 20 },
        medium: { displayName: 'Medium — 5s',  sortOrder: 30 },
        fast:   { displayName: 'Fast — 3s',    sortOrder: 40 },
      },
    },
    sliderLoop: {
      displayName: 'Slider — loop behavior',
      editor: 'select',
      sortOrder: 230,
      choices: {
        loop:   { displayName: 'Loop — wraps from last to first (Default)', sortOrder: 10 },
        none:   { displayName: 'Stop — pauses at first and last',           sortOrder: 20 },
        bounce: { displayName: 'Bounce — reverses direction at each end',   sortOrder: 30 },
      },
    },
    sliderPeek: {
      displayName: 'Slider — peek next slide',
      editor: 'select',
      sortOrder: 240,
      choices: {
        none: { displayName: 'None — full bleed (Default)', sortOrder: 10 },
        sm:   { displayName: 'Small — ~8% of next visible', sortOrder: 20 },
        md:   { displayName: 'Medium — ~15% visible',       sortOrder: 30 },
        lg:   { displayName: 'Large — ~25% visible',        sortOrder: 40 },
      },
    },
    sliderSnap: {
      displayName: 'Slider — scroll snap',
      editor: 'select',
      sortOrder: 250,
      choices: {
        single: { displayName: 'One at a time (Default)', sortOrder: 10 },
        free:   { displayName: 'Free scroll — momentum',  sortOrder: 20 },
      },
    },
    sliderMobileItems: {
      displayName: 'Slider — items visible on mobile',
      editor: 'select',
      sortOrder: 260,
      choices: {
        '1':  { displayName: '1 item (Default)', sortOrder: 10 },
        '2':  { displayName: '2 items',          sortOrder: 20 },
        auto: { displayName: 'Auto — follow column widths', sortOrder: 30 },
      },
    },
  },
})
