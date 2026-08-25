# Site Accelerator — Block Library Guide (for Content-Building Agents)

**Purpose:** This is the reference an AI agent should consult when it has crawled a prospect's website (or received a content brief) and needs to translate that content into a page built from the Site Accelerator project's registered blocks. It answers three questions for every block: **what is it**, **how does it typically get used**, and **what do its style settings actually do**.

This guide also covers the **REST API mechanics** for building pages programmatically (Section 8) — including the exact format for nested component arrays, which is the most common failure point.

This guide describes blocks generically. Any specific implementation (a given demo site built on the Site Accelerator project) may prefix content type keys with its own convention (e.g. `<Prefix>_HeroBlock`) — the block names used below are the functional names, not literal schema keys.

---

## 0. How to use this guide

When building a page from crawled prospect content:

1. **Classify the source content** into the categories in Section 6 (hero statement, testimonial, feature list, stat/proof point, FAQ, team bio, location, event, resource/download, blog post, etc.).
2. **Map each category to a block** using Section 2 (block catalog) and Section 6 (content-to-block heuristics).
3. **Sequence the blocks based on the client site's own structure** — use Section 4 only as illustrative starting patterns, not a template to force content into. The prospect's actual page is the source of truth for what order things should appear in and which elements are even needed.
4. **Pick style settings** deliberately, not by default — use the "when to use" notes under each option, not just the first choice in the list.
5. **Choose the structural approach (Section 1)** that matches the intended layout — full section/row/column nesting for multi-item or multi-column layouts, or a standalone section-level block where a single element should occupy its own full-width section.
6. **When building pages via the REST API**, follow Section 8 exactly — the array item format in particular is non-obvious and will silently fail or throw if wrong.

There are no fixed rules here about block ordering or how many times a given block can appear on a page. Those are compositional decisions the agent makes based on what best replicates the prospect's site — not constraints imposed by this guide.

---

## 1. Page structure — two approaches

Pages are composed from sections, which can be built two ways depending on what the section needs to contain:

**Approach A — Section → Row → Column → Block.** Used when a section needs multiple blocks arranged side by side, or a grid of repeated items (e.g. a 3-column feature layout, a card grid, an image next to a text column). The Row controls flex direction, gap, alignment, background, and entrance animation. The Column controls span (1–12, or auto) and padding.

```
Section
└── Row
    ├── Column
    │   └── Block
    └── Column
        └── Block
```

**Approach B — Standalone section-level block.** Most block elements can also be dropped in directly as their own full-width section, with no Row/Column wrapping at all. This is the simpler and often more natural choice whenever a block is meant to occupy its own section by itself (a full-width stat row, a pull-quote, a chart, a divider, a hero, a banner, etc.) rather than sharing a row with something else.

**Which to use:** if the content calls for one block filling a section on its own, use Approach B. If the content calls for two or more elements to sit next to each other in the same section (side-by-side text + image, a row of cards, a multi-column layout), use Approach A.

**Card/item grids still need internal nesting.** Because a card grid is a repeated set of individual items rather than one block, a grid of cards is still built as section → row → column → card, with one row per visual row of cards (e.g. a 2×3 grid = two row nodes, three columns each). This is a property of grids-of-items, not a general rule about blocks needing row/column wrapping.

**When using the REST API:** Section 8 covers how to represent both Approach A and Approach B in the JSON composition payload. For most full-width blocks, use a flat `nodeType: "component"` node directly under the experience root (Approach B equivalent) — it is simpler and avoids section/row/column wrapper complexity.

---

## 2. Block catalog

Each entry: **Purpose** · **Typical use** · **Style options & effects** · **Content mapping notes**

### HeroBlock

**Purpose:** Split layout, text panel + optional visual panel, for a page's opening statement. When no visual is set, text expands full width. **Typical use:** Opening element on a landing/home page. Can be used standalone as a section (Approach B).

| Setting | Options | Effect |
| --- | --- | --- |
| `layout` | `imageRight` (default), `imageLeft` | Which side the visual sits on |
| `color` | `brand`, `canvas`, `surface` | Background fill |
| `animation` | `none`, `fade`, `slide`, `parallax` | Entrance animation on mount, all motion-safe |
| Design Direction (content field) | `editorialSplit`, `spotlight`, `overlap`, `diagonal` | Restyles the *same* content into 4 distinct compositions. Spotlight = visual floats as a lit object with a chromatic bloom halo. Editorial Overlap = solid headline plate overlaps the image edge with a number/index marker — feels magazine-style. Diagonal Split = sharp accent-lit diagonal seam between panel and image, energetic. |
| No image | — | Text panel expands full width — use for a pure statement/CTA hero with no available imagery |

**Content mapping:** The prospect's primary value proposition / homepage headline + subhead + primary/secondary CTA. If the crawl finds a strong hero image on the source site, carry the same visual; if not, use a no-image variant rather than stock-photo filler.

---

### BannerBlock

**Purpose:** Full-bleed background-image section with layered content (eyebrow, headline, optional body, up to 2 CTAs). **Typical use:** Commonly used as a closing CTA band, but can also work as a mid-page section break on campaign pages — position it wherever the client's page structure calls for a strong, image-backed statement.

| Setting | Options | Effect |
| --- | --- | --- |
| Treatment (content field) | `scrim`, `glass` | Scrim = flat color overlay pressed over the image (opacity varies by `imageBlend`). Glass = lighter scrim + content sits inside a frosted panel — better when the image itself should read clearly. |
| `color` | `canvas`, `brand`, `surface` | Overlay/panel tint |
| `alignment` | `center`, `left` | Text alignment/position |
| `size` | `large`, `compact`, `display` | Section height |
| `imageBlend` | `overlay`, `multiply` | Overlay = lighter, image reads as texture. Multiply = heavier, image becomes an underpainting. |
| No image | — | Flat color fills the section — works as a standalone CTA band |

**Content mapping:** "Book a demo" / "get started" / "talk to sales" CTA content, or any strong image-backed statement the client's page structure calls for. Use the prospect's strongest supporting image (product screenshot, office, team) if available.

---

### CardBlock

**Purpose:** Single composable card — eyebrow, heading, description, optional image, optional CTA. The workhorse for feature triads, use-cases, and service tiles. **Typical use:** As part of a card grid (section → row → column → card, per Section 1). Each card grid holds as many cards as the client's source content calls for. **Note:** Uses capitalized field names (`Heading`, `Eyebrow`, `Description`) — differs from other blocks. `Description` is a richText field.

| Setting | Options | Effect |
| --- | --- | --- |
| `fill` | `surface`, `ghost`, `brand`, `glass` | Background treatment. `glass` needs visual interest beneath it (imagery/brand section) — don't use over a flat same-color surface. |
| `border` | `none`, `subtle`, `brand` | `none` = contrast-only definition. `subtle` = 1px @ 10% fg opacity, for cards floating on dark grounds. `brand` = 1px teal border, signals selection/attention — pairs best with `ghost` fill on a dark section. |
| Image position | `top` (4:3), `side` (`imageSide: left/right`), `background` (scrim, content at bottom), `float` (content slides up over image bottom), none | Side stacks vertically on mobile; image occupies 40% of card width at md+. |
| `hover` | `lift`, `glow`, `none` | Lift = 4px rise + faint teal shadow. Glow = shadow blooms beneath, no translate — pure atmospheric depth. |
| `accentLine` | `top`, none | 3px rule on the accent color; shifts to white@40% on brand fill |
| `noise` | `true`/`false` | SVG grain overlay at 7%, `mix-blend-mode: overlay` — tactile depth on dark fills |
| `density` | compact / default | Padding scale |
| `maxHeight` | numeric/none | Caps card height, useful in image-heavy grids |

**Content mapping:** Any feature/benefit/product-tier content from the prospect site that reads as discrete items. Feature triads with icons and no image/CTA per item → consider FeatureGridBlock instead unless each item needs its own image or CTA.

---

### PrimaryTextBlock

**Purpose:** Typographic accent — eyebrow + headline only. Section openers, pacing moments, statement callouts. No body copy, no image. **Typical use:** Can be used standalone as a section (Approach B) anywhere a page needs a strong typographic beat.

| Setting | Options | Effect |
| --- | --- | --- |
| `size` | `display`, `headline`, `title`, `label` | Type scale — `display` for major statements, `label` for a small section tag |
| `color` | `brand`, `canvas`, `surface` | Background |
| `align` | left / center | Text alignment |
| `effect` | `gradient`, `animatedGradient`, `depth3d`, `embossed`, `outline`, `neon`, `glow`, `highlight` | One-dropdown header treatment. All token-derived (adapt to any brand/accent + dark/light). `animatedGradient` and `neon`-style effects animate and degrade under reduced-motion. These are loud typographic moments — reach for them when the content genuinely calls for that level of statement. |

**Content mapping:** Section-opening statements pulled from H2-level statements on the crawled site that don't need a supporting image.

---

### QuoteBlock

**Purpose:** Large typographic pull-quote for customer social proof / editorial quotes. Can be used standalone as a section without row/column wrapping. **Typical use:** Social-proof moments, case-study/blog pages, wherever the client's content includes a testimonial worth featuring.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `brand`, `canvas`, `surface` | Background |
| `size` | `large`, `small` | Type scale |
| `alignment` | `left`, `center` | Text alignment |
| Treatment (content field) | `default`, `bubble`, `glow` | Default = editorial mark. Bubble = speech bubble framing. Glow = ambient backlit treatment. |

**Content mapping:** Direct customer testimonials found on the prospect's site (or provided in the brief). Attribution fields: name + title only (no separate company field). The `quote` field is a plain string (max 500 chars), not rich text.

---

### RichTextBlock

**Purpose:** Full-width prose section — WYSIWYG output (headings, paragraphs, lists, blockquotes, inline formatting). The block for long-form explanatory content. **Typical use:** Blog/article bodies, detailed product/feature explanation sections, legal/policy content, "About us" narrative.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `treatment` | `standard`, `lead`, `toc` | `lead` = first paragraph styled as an editorial deck (larger, lighter weight, brand color) — only affects the first paragraph. `toc` = auto-generates a navigable Contents panel from h2 headings, each with anchors + back-to-top arrows — use for long guides/documentation-style articles. |
| `size` | `default`, `compact` | Compact = tighter scale for short sections |
| `ruledHeadings` | `true`/`false` | Thin rule above h2/h3 |
| `align` | left, `center` | Center = column centered in section, for opening statements |
| `ground` | `ruled`, `grain`, `framed`, none | Background texture behind the prose (ledger ruling / halftone dot / bordered masthead). Purely textural. |
| `dividers` | `ornament`, `asterism`, none | Retro print-style section breaks between h2 chapters |
| `numberedHeadings` | `true`/`false` | Chapter numbers in tracked mono accent |
| `reveal` | `cascade`, none | Scroll-triggered fade/rise per block |

**Content mapping:** Long-form crawled content that doesn't decompose neatly into cards/stats — About pages, policy/compliance pages, in-depth guides, blog post bodies. Use `treatment: "toc"` for anything the crawl identifies as a long-form guide/whitepaper with multiple H2 sections.

---

### ImageBlock

**Purpose:** Flexible image presentation — two frame modes, brand overlay, captions, chromatic shadow bloom, scroll-triggered wipe reveal. Auto-switches to a two-column editorial layout the moment any editorial field (eyebrow/heading/body/CTA) is populated. **Typical use:** Supporting visual, either standalone or in the editorial layout as an alternating feature-with-image section.

| Setting | Options | Effect |
| --- | --- | --- |
| Frame | `clean`, `offset`, `glow` | Clean = no treatment. Offset = bold mounting-board strip behind the image. Glow = inset ring + outer ambient bloom, image appears backlit. |
| `overlay` | `true`/`false` | Brand-color wash, multiply blend — unifies tone |
| Caption position | `inset`, `below`, none | Inset = badge over bottom-left corner. Below = label-scale text beneath. |
| `aspectRatio` | `16:9`, `4:3`, `3:2`, `1:1` | Crop ratio |
| `bloom` | `brand`, `accent`, `none` | Chromatic shadow: dual radial gradient beneath the image |
| `animate` | `true`/`false` | Scroll-triggered clip-path wipe reveal, fires once on entry |
| `lightbox` | `true`/`false` | Click-to-expand full-screen modal w/ backdrop blur — use for architecture diagrams, detail-rich images |
| Editorial layout | `mediaSide: left/right`, auto-enabled by populating eyebrow/heading/body/CTA | Two-column grid; stacks on mobile with text above media |

**Content mapping:** Product screenshots, architecture diagrams (pair with `lightbox: true`), office/team photography, any single supporting image the crawl finds worth featuring.

---

### VideoBlock

**Purpose:** YouTube/Vimeo embeds with a branded poster state. Same frame/overlay/caption treatments as ImageBlock, and the same editorial auto-layout when text fields are populated. **Typical use:** Product demo section, customer story, "see it in motion" section. **Constraint:** `videoUrl` must be a valid YouTube or Vimeo URL — a plain string silently misassigns fields. Never pass placeholder/non-video-platform URLs.

| Setting | Options | Effect |
| --- | --- | --- |
| Platform | auto-detected from URL | YouTube gets platform thumbnail; Vimeo thumbnail fetched client-side (shimmer while loading) |
| Frame / Overlay / Caption | same as ImageBlock | See above |
| Editorial layout | `mediaSide: left/right` | Auto-enabled by populating eyebrow/heading/body/CTA |

**Content mapping:** Any demo reel, explainer video, or customer testimonial video found during the crawl (or requested for the build).

---

### StatBlock

**Purpose:** Horizontal row of metric callouts with scroll-triggered count-up animation. **Typical use:** Proof section, most naturally used as a standalone section (Approach B).

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `brand`, `canvas`, `surface` | Background |
| `columns` | `col2`, `col3`, `col4` | 2-col uses full display type scale — good for a small number of heroic anchor stats. 3–4 col for a standard metrics row. |
| Header | optional eyebrow + heading (content fields) | Turns the row into a full editorial section; omit both for a bare metric row |
| `showIcons` | on/off | Small icon above or beside the value |
| `iconPlacement` | `inline`, `above` | Inline = left of label. Above = centered above numeral. |
| `glass` | `true`/`false` | Frosts each stat into its own card with gaps — dividers drop in favor of the gaps; section color shows through |
| `animate` | on/off | Stagger slide-up → dividers draw in → count 0→target, on scroll |
| `entranceAnimation` | `none`, `fade`, `slide`, `parallax` | Section-level entrance animation |
| Effect (content field) | `none`, `gradient`, `glow` | Visual treatment on each numeral. Gradient = brand-to-accent fill. Glow = backlit bloom. |

**Content mapping:** Quantified proof points from the prospect's site or brief (uptime %, customer count, time saved, growth %, satisfaction scores). If the crawl only turns up 2 strong numbers, use `columns: "col2"` rather than padding to 3–4 with weak filler stats.

---

### FeatureGridBlock

**Purpose:** Grid of feature tiles (heading + body, optional icon), with an optional eyebrow/heading/CTA header. **Typical use:** Core "what we offer" / product-capability section, most naturally used as a standalone section (Approach B).

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `layout` | `grid`, `ruled` (2-col with horizontal divider lines between items) | Ruled reads more editorial/sparse; grid is the standard tile layout |
| `columns` | `col2`, `col3`, `col4` | Tile count per row |
| `iconStyle` | `none`, `accent`, `structural` | None = no icon. Accent = inline before headline. Structural = above headline. |
| Per-slot icons | `feature1Icon`–`feature6Icon` | Icon per feature slot (select from Lucide set) |
| `animate` | on/off | Stagger entrance on scroll |

**Content mapping:** Bulleted or sectioned feature/capability lists from the prospect's product/platform pages. Default landing spot for "here's what our product does" content — use it before reaching for a CardBlock grid unless items need individual images/CTAs. **Note:** `features` items have `headline` (string) and `body` (richText).

---

### TrustRail

**Purpose:** Logo strip for customer/partner social proof. **Typical use:** Used in a limited subset of site builds — only when the prospect actually has a defined set of client/partner/press logos worth showing and reuse is appropriate. Not a default component to include on every build.

| Setting | Options | Effect |
| --- | --- | --- |
| Motion | `scroll` (seamless marquee, doubled track), `fade` (staggered scroll-reveal), `static` (plain grid, no animation) | Scroll = good default for many logos; fade = good for a curated smaller set; static = safest choice on a slower/lower-motion page |
| `treatment` | `mono`, `color`, `auto` | Mono = grayscale, color-on-hover. Color = shows logos' true hues undimmed — reserve for a white/light surface. Auto = forces a theme-matched silhouette; brand background always forces a white silhouette regardless of treatment setting. |
| `background` | `canvas`, `surface`, `brand` | Section fill |
| `size` | `xs`, `sm`, `md`, `lg`, `xl` | Logo size ladder |
| `density` | compact / default | Spacing between logos |
| `glass` | on/off | Frosted panel treatment |

**Constraint:** Logo assets should be SVG (or high-res transparent PNG) — raster/opaque images break the grayscale/mono filter treatment by exposing background color.

**Content mapping:** Client/partner/press logos found on the prospect's site — only when appropriate to reuse and only for the site builds where this kind of proof matters.

---

### AccordionBlock

**Purpose:** Expandable FAQ/content sections. **Typical use:** FAQ section, wherever the client's own site has FAQ or expandable-detail content.

| Setting | Options | Effect |
| --- | --- | --- |
| `borderStyle` | `ruled`, `boxed`, `clean` | Ruled = hairline dividers between items. Boxed = each item is its own bordered panel. Clean = minimal, no visible separators. |
| `color` | `canvas`, `surface`, `brand` | Background |
| Open mode | single (one at a time) / multiple (independent open/close) | Multiple is better for longer FAQ lists people scan non-linearly |
| Default state | first item open / all closed | First-open gives an immediate content preview |

**Content mapping:** FAQ content crawled from the prospect's site, or common objections/questions for their vertical. **Note:** Both `question` and `answer` fields are plain strings (not rich text). `answer` supports up to 2,000 characters.

---

### TabsBlock

**Purpose:** Tabbed content block — good for showing multiple related capabilities/workflows without a long scroll. **Typical use:** Feature-deep-dive section (e.g. product capability breakdown by category).

| Setting | Options | Effect |
| --- | --- | --- |
| `tabStyle` | `underline`, `pill`, `buttonGroup` | Visual style of the tab triggers |
| `color` | `canvas`, `surface`, `brand` | Background |
| Position | `top`, `side` (triggers stack vertically on the left) | Side position suits a longer list of tabs |
| Image panel | optional, `right` | Adds a supporting visual alongside the tab content |
| Auto-play | on/off | Cycles tabs automatically |

**Content mapping:** Multi-capability content the crawl finds organized as sub-sections/categories that would otherwise be several separate FeatureGrid tiles but benefit from being explored one at a time. **Note:** `tabLabel` (string) is the tab trigger; `body` is richText.

---

### BlogFeedBlock

**Purpose:** CMS-driven grid of blog posts, fetched at render time from the connected article root. **Typical use:** Blog/insights landing page, or a "Latest from our blog" section elsewhere.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `columns` | `col2`, `col3` | Grid density |
| Heading size | e.g. headline / display | Section heading scale |
| Category filter chips | auto-derived from post categories | "All" + one per category present |

**Content mapping:** Not populated from crawled prospect content directly — this pulls from the project's own blog content model. Use when the page needs a content-marketing tie-in.

---

### Button

**Purpose:** Standalone CTA button, or embedded inline within other blocks. **Typical use:** Anywhere a CTA is needed; also the CTA slot within Hero/Banner/Card/etc.

| Setting | Options | Effect |
| --- | --- | --- |
| `variant` | `brand`, `accent`, `ghost`, `signal`, `hover-fill`, `glass` | `signal` = kinetic left-to-right fill sweep on hover. `hover-fill` = ambient glow border at rest, brand color floods in + intensified glow on hover. `glass` = frosted backdrop blur, text auto-adapts light/dark. |
| `size` | `sm`, `md`, `lg` | Button scale |
| Icon | `leading`, `trailing`, none | Icon slot position |
| `alignment` | (CMS Button block only) | Content alignment within its container |
| `fullWidth` | `true`/`false` (CMS Button block only) | Stretches to container width |
| Disabled | `true`/`false` | Disabled state styling |

**Content mapping:** Primary CTA = `brand` or `signal`. Secondary/tertiary CTA = `ghost`. Use `glass` where the frosted effect has visual interest beneath it (imagery/brand fills).

---

### ChartBlock

**Purpose:** CMS-driven data visualization. Can be used standalone as a section. Five chart types. **Typical use:** Data/proof-heavy pages — pricing/ROI pages, industry-report content, dashboards-as-marketing-proof.

| Setting | Options | Effect |
| --- | --- | --- |
| `chartType` | `line`, `area`, `bar`, `barStacked`, `radial` | Line = multi-series trend over time. Area = single series with gradient fill, volume/growth. Bar = category comparison. Bar Stacked = composition/breakdown by category. Radial = single KPI/score gauge with count-up animation. |
| `color` | `canvas`, `surface`, `brand` | Background |
| `seriesColors` | `brand`, `cool`, `warm`, `diverging`, `mono` | Palette applied to series/bars. Warm = amber-gold, hue-contrast but harmonious. Diverging = distinct hue per series for stacked comparisons. Mono = single-hue. |
| `showLegend` | `true`/`false` | Multi-series legend |
| `height` | `md`, `lg` | Chart height |
| `valueSuffix` | e.g. `%`, `M`, `/100` | Appended to values/tooltips |

**Note:** Empty/invalid data renders a sized "Chart data unavailable" placeholder — never collapses layout, but don't rely on this as an intentional design state.

**Content mapping:** Any quantitative data set found in a prospect's reports, industry benchmarks, or authored proof content. Match chart type to the data shape: trend-over-time → line/area, category comparison → bar, composition/mix → barStacked, single KPI → radial.

---

### ResourceLibraryBlock

**Purpose:** DAM-connected downloadable asset list (whitepapers, decks, datasheets), fetched from a CMS collection anchor. **Typical use:** Resources/downloads page, or a "Documentation" section on a product page.

| Setting | Options | Effect |
| --- | --- | --- |
| Layout | `list` (dense rows with file-type icon chip), `grid` (card, brand-fill header band with oversized icon) | List = better for many files scanned quickly. Grid = better for a curated, visually distinct small set. |
| `color` | `canvas`, `surface` | Background |
| File size visibility | on/off | Shows size badge |
| Pagination | numeric page size | For long collections |

**Content mapping:** Whitepapers, case studies, spec sheets, brand kits found during the crawl or supplied by the prospect for a resources hub.

---

### CalloutBlock

**Purpose:** Compact semantic inline notification/alert — 6 intents (`neutral`, `info`, `success`, `warning`, `danger`, `brand`). **Typical use:** Inline within page flow wherever a status/notice/alert needs to interrupt reading — system status, trial/expiry notices, compliance announcements. Not typically a marketing hero element.

| Setting | Options | Effect |
| --- | --- | --- |
| `intent` | `neutral`, `info`, `success`, `warning`, `danger`, `brand` | Drives icon/CTA/border color |
| `variant` | `filled`, `bordered`, `bar` | Filled = tint + border, most visually present. Bordered = surface bg + top accent rule, subdued but distinct. Bar = full-width strip, for site-wide status banners. |
| Icon | on/off | Small icon in intent color |
| `size` | default, `compact` | Compact collapses heading+CTA to one row when no body text |
| `alignment` | left, center | Text alignment |
| Dismissible | `true`/`false` | Two-phase kinetic exit |

**Content mapping:** Not typically sourced from crawled marketing content — use for system-status banners, compliance notices, or promotional announcements the prospect wants surfaced.

---

### DividerBlock

**Purpose:** Structural section-break block that opens vertical breathing room between stacked sections. **Typical use:** Between any two sections that could use a visible "chapter break" — most useful on long single-page layouts or between strongly contrasting color sections. A layout/pacing tool, use it where the composition benefits from one, not on a fixed schedule.

| Setting | Options | Effect |
| --- | --- | --- |
| `style` | `mark`, `bleed`, `prism` | Mark = hairline broken by an editable label or ornament. Bleed = waterfall gradient pouring from top, dissolving at bottom, full width. Prism = angled/faceted gradient ribbon. |
| `tone` | `neutral`, `brand`, `accent`, `spectrum`, `aurora` | Spectrum = brand→accent blend. Aurora = brand·accent·brand. Neutral = quiet light seam. |
| `label` / `ornament` | text label, or ornament glyph | Label takes precedence; falls back to ornament if no label |
| `weight` | `slim`, `bold` (prism style only) | Ribbon thickness |
| `space` | `sm`, `md`, `lg`, `xl` | Vertical padding/gap size |
| `reveal` | `draw`, none | Scroll-triggered draw-in animation |

**Content mapping:** Not content-driven — a layout/pacing tool. Insert wherever the page needs a deliberate pause.

---

### ComparisonTableBlock

**Purpose:** Side-by-side feature comparison for plans, tiers, or account types. Supports grouped rows, a featured/recommended column, icon cells, and short-text cells. **Typical use:** Pricing/plans page, account type comparison, any "which option is right for you" content.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `tableStyle` (content field) | `clean`, `elevated`, `bold` | Clean = subtle brand tinting on featured column. Elevated = deeper gradient + stronger shadow. Bold = solid brand fill across the full featured column. |

**Structure:** `columns` (array of OT_ComparisonColumn — one per option/plan) + `rows` (array of OT_ComparisonRow — mix group headers and data rows). Each data row has a `cells` array (one OT_ComparisonCell per column, in column order).

**Content mapping:** Plan comparison tables, account type breakdowns, feature matrices. Set `badgeText` on one column to mark it as the featured/recommended option.

---

### DisclosureBlock

**Purpose:** Legal and regulatory disclosures, rate notices, and footnotes. **Typical use:** Placed at the bottom of a page composition — particularly required for financial services, healthcare, legal, and other regulated verticals.

| Setting | Options | Effect |
| --- | --- | --- |
| `style` (content field) | `finePrint`, `section` | Fine Print = minimal footnote treatment, smallest scale, muted. Section = slightly elevated with more visual presence. |
| `markerStyle` (content field) | `numeric`, `alpha` | How each item is labeled: ¹ ² ³ or a b c. Single-item disclosures show no marker. |

**Content mapping:** Rate disclosures, APY/APR footnotes, "member FDIC"-style notices, regulatory language. Items are `OT_DisclosureItem` with a single `body` (richText) field that supports bold, italic, and links. The optional `heading` field labels the section (e.g. "Rates & Fees", "Important Disclosures").

---

### ContentRecommendationsBlock

**Purpose:** Personalized content feed powered by Optimizely Content Recommendations (Idio). Fetches recommendations for the current visitor at render time. **Typical use:** "Recommended for you" sections on content-heavy sites, blog sidebars, resource pages.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `rpp` (content field) | `3`, `6`, `9`, `12` | How many recommendations to request and display |

**Prerequisite:** The Idio delivery API key and tracking IDs must be configured in ThemeManager (Integrations section) — not on the block itself.

**Content mapping:** No static content to author — the engine populates this at runtime based on visitor behavior. Just set `heading`, optional `subheading`, and `rpp`.

---

### ProductRecommendationsBlock

**Purpose:** Live product recommendations from Optimizely Product Recommendations (Peerius). At runtime the Peerius engine calls `smartRecs`, which dispatches a `peerius:recs` event; the widget renders the returned cards. **Typical use:** "You might also like" sections on retail/commerce-oriented demo sites.

| Setting | Options | Effect |
| --- | --- | --- |
| `color` | `canvas`, `surface`, `brand` | Background |
| `widgetPosition` (content field) | e.g. `homePage_1` | Peerius widget position key. Leave blank to use the first widget the engine returns. |
| `initialCount` (content field) | `3`, `4`, `6` | How many recommendations to show before a "Show all" control |

**Prerequisite:** The Peerius script URL must be configured in ThemeManager (Integrations → Product Recommendations Script URL).

**Content mapping:** No static content needed beyond heading, subheading, and the widget position key. When the engine returns nothing, an empty state is shown.

---

### EventListingBlock

**Purpose:** CMS-driven listing of Event Pages (webinars, conferences, workshops, seminars, community events, training) — card grid, list, or monthly calendar view. **Typical use:** Events landing page; can also be embedded on a product page pre-filtered to one event type.

| Setting | Options | Effect |
| --- | --- | --- |
| Default view | `cards`, `list`, `calendar` | Cards = default browse experience. List = compact date-block rows. Calendar = monthly grid with day agenda, collapses to an agenda list on small screens. |
| `showViewToggle` | `true`/`false` | Turn off to lock to a single view for embedded/curated use |
| `filterByType` | event type string, or none | Pre-filter to one type for the embedded use case |
| Type filter chips | auto-derived | Only shows chips for types present in the loaded set |
| Show past events | toggle | De-emphasizes past events rather than hiding them |

**Content mapping:** Directly maps to a prospect's events/webinars page content. Works across verticals since event types are generic.

---

### PractitionerListingBlock

**Purpose:** CMS-driven, vertical-agnostic people directory (doctors, attorneys, engineers, executives) with search + dynamically-derived specialty/language filter chips. **Typical use:** "Our team" / "Meet our doctors" / "Our attorneys" page, or a curated subset embedded on a service-line page.

| Setting | Options | Effect |
| --- | --- | --- |
| Layout | `grid` (2–4 col cards), `list` (rows) | Grid = browsing directory. List = compact, includes inline contact info per row. |
| `color` | `canvas`, `surface` | Background |
| Search + filters | on/off | Client-side search across name/credentials/specialty; suppress for a small curated set |
| Group Tag Filter | e.g. a division/vertical tag | Scopes the directory to one vertical/brand group — useful when a build spans multiple divisions or sub-brands |
| Portrait fallback | headshot or designed initials | Automatic — no broken-image risk |

**Content mapping:** Crawl team/leadership/provider bio pages. Use the Group Tag Filter to scope a directory to a specific service line or sub-brand when the prospect operates multiple divisions.

---

### LocationListingBlock

**Purpose:** CMS-driven, vertical-agnostic location directory (clinics, offices, hospitals, pharmacies) with a map view + synchronized rail, grid, or list view. **Typical use:** "Locations" / "Find us" page, or a curated "Our offices" section embedded elsewhere.

| Setting | Options | Effect |
| --- | --- | --- |
| Default view | `map` (map + synced scrollable rail, click marker/card to fly + open popup), `grid` (image-plate cards), `list` (compact rows) | Map = full directory experience. Grid = editorial, image-forward. List = dense, scannable. |
| `color` | `canvas`, `surface` | Background |
| Search + label filter | on/off | Client-side search across name/label/address; single-select label filter |
| Group Tag Filter | e.g. a division/vertical tag | Scopes to one vertical/brand group |
| Map height | standard, `tall` | Taller map for a curated single-vertical scoped view |
| `columns` (grid view) | `2`, `3` | Card grid density |
| `compact` (grid view) | on/off | Tightens footer density |

**Content mapping:** Crawl "locations/offices/find a clinic" content. Requires geocodable addresses — flag any addresses that can't be resolved.

---

## 3. Composition-adjacent building blocks (not content blocks, but load-bearing)

- **Section / Row / Column display templates** — control width, spacing, flex direction, gap, background, and entrance choreography. Get the section width (full-bleed/container/wide/narrow) right before worrying about block-level styling.
- **ThemeManager** — site-wide color token overrides. If a prospect has a defined brand color, this is where it gets mapped (semantic tokens: brand, brand-hover, accent, accent-hover, canvas, surface, fg, fg-muted, fg-on-brand, fg-on-accent) — not per-block color props. Also the configuration point for Optimizely integrations (Content Recommendations, Product Recommendations).

---

## 4. Illustrative page patterns (starting points, not templates)

These are examples of how blocks commonly get sequenced — useful as a mental model, not a checklist to force onto every build. The actual structure and block selection for a given page should come from the prospect's own site content and priorities; skip, reorder, repeat, or omit anything here as the source content calls for.

**Marketing/product landing page** might include: an opening Hero or PrimaryTextBlock statement, a FeatureGridBlock or CardBlock grid for core capabilities, a StatBlock for proof points, a QuoteBlock for testimonial, supporting Image/VideoBlock content, an AccordionBlock for FAQ, a closing Banner or CTA moment, and (for regulated verticals) a DisclosureBlock at the very bottom. TrustRail only if the prospect has logos worth featuring and the build calls for that kind of proof.

**Long-form / guide page** might include: a title statement, a RichTextBlock (with `toc` treatment for longer pieces) as the main body, DividerBlocks between major sections if it's long, and a closing CTA.

**Team/directory page** (medical, legal, professional services) might include: an intro statement, a PractitionerListingBlock (optionally Group Tag scoped), and a contact/appointment CTA.

**Locations page** might include: an intro statement and a LocationListingBlock (map view), plus a contact CTA.

**Events/webinars page** might include: an intro statement and an EventListingBlock.

**Resources/downloads page** might include: an intro statement and a ResourceLibraryBlock.

**Data/proof/ROI page** might include: an opening statement, a StatBlock, one or more ChartBlocks (matched to the data shape), a QuoteBlock, and a closing CTA.

**Plans/pricing page** might include: an opening statement, a ComparisonTableBlock, a FeatureGridBlock for what's included in every plan, an AccordionBlock for billing FAQ, and a DisclosureBlock for rate/fee notices.

---

## 5. Technical constraints worth knowing

These are implementation details that affect correctness, not editorial rules about page structure:

- **CardBlock** uses capitalized field names (`Heading`, `Eyebrow`, `Description`) — differs from most other blocks. `Description` is richText.
- **VideoBlock's** `videoUrl` must be a real YouTube or Vimeo URL — placeholder/non-platform strings silently misassign fields.
- **TrustRail logos** should be SVG (or high-res transparent PNG) — raster/opaque images break the mono-grayscale filter.
- **Card/item grids** need section → row → column → card nesting (one row per visual row of items) — this is a property of grids specifically, not blocks in general (see Section 1).
- **Colors are token-driven, not hardcoded** — every block's color options map to semantic tokens (brand/canvas/surface/accent), which is how a prospect's brand color propagates through the ThemeManager. Reference tokens rather than inventing one-off hex values when briefing content.
- **Motion respects** `prefers-reduced-motion` **automatically** everywhere — don't treat animated settings (StatBlock count-up, ImageBlock wipe reveal, Divider draw-in, PrimaryTextBlock animated effects) as guaranteed-visible; they degrade to instant/static, so don't make an animation load-bearing for comprehension.
- **QuoteBlock `quote` is a plain string** (max 500 chars) — not rich text. Do not try to pass an HTML object.
- **AccordionBlock `answer` is a plain string** (max 2,000 chars) — not rich text.
- **ContentRecommendationsBlock and ProductRecommendationsBlock** require ThemeManager integration configuration to function — they show an empty/placeholder state without it.
- **DisclosureBlock** items (`OT_DisclosureItem.body`) ARE richText — bold, italic, and links are supported within disclosure copy.
- **StatBlock columns** use `col2`/`col3`/`col4` values, not bare integers `2`/`3`/`4`. Same for FeatureGridBlock and BlogFeedBlock columns.

---

## 6. Content-to-block heuristics (for crawling a prospect site)

Use this table to classify crawled content and route it to the right block:

| If the crawl finds… | Use this block | Notes |
| --- | --- | --- |
| Homepage headline + subhead + primary CTA | **HeroBlock** | Pick Design Direction based on whether a strong hero image exists |
| Client/partner logo strip | **TrustRail** | Only when logos exist and reuse is appropriate — this is a limited-use block, not a default |
| A short feature/benefit list (icons + short text, 3–6 items) | **FeatureGridBlock** | Default landing spot for "what we do" content |
| Feature items that each need their own image or CTA | **CardBlock** grid | Heavier than FeatureGrid; use when items are more autonomous |
| Quantified proof points (%, counts, uptime, ratings) | **StatBlock** | `col2` for a small set of heroic numbers, `col3`/`col4` for a standard row |
| Customer testimonial quote with attribution | **QuoteBlock** | Needs name + title (no separate company field); `quote` is a plain string |
| Long-form narrative (About, mission, policy, guide) | **RichTextBlock** | Use `treatment: "toc"` if there are 3+ H2-level sections |
| A single supporting product/office/team photo | **ImageBlock** | Add `lightbox` for diagrams; editorial layout if paired with text |
| A YouTube/Vimeo demo or testimonial video | **VideoBlock** | Confirm it's an actual YouTube/Vimeo URL |
| FAQ content | **AccordionBlock** | `multiple` open mode for longer lists |
| Multi-category capability breakdown (e.g. by workflow stage) | **TabsBlock** | Especially if 3+ categories with meaningfully different content |
| Data set / chart / graph from a report | **ChartBlock** | Match `chartType` to data shape (trend→line/area, comparison→bar, mix→barStacked, single KPI→radial) |
| Downloadable whitepapers/decks/datasheets | **ResourceLibraryBlock** | Grid for a curated few, list for many |
| Plans, tiers, or options compared side by side | **ComparisonTableBlock** | Set `badgeText` on the recommended column |
| Legal disclosures, rate notices, or regulatory footnotes | **DisclosureBlock** | Always place at page bottom; required for regulated verticals |
| "Recommended for you" / personalized content feed | **ContentRecommendationsBlock** | Requires Idio integration in ThemeManager |
| Product recommendations / "you might also like" | **ProductRecommendationsBlock** | Requires Peerius integration in ThemeManager |
| Team/provider/attorney bios | **PractitionerListingBlock** | Use Group Tag Filter to scope by division/vertical |
| Office/clinic/branch addresses | **LocationListingBlock** | Map view is a strong default; confirm addresses are geocodable |
| Webinars/conferences/workshops | **EventListingBlock** | Pre-filter with `filterByType` for an embedded single-type view |
| System status / compliance notice / promo banner | **CalloutBlock** | Match `intent` to the message (info/success/warning/danger) |
| Blog articles | **BlogFeedBlock** | Only relevant if building on the project's own blog content model |
| A closing "book a demo" / CTA statement | **BannerBlock** | Position wherever the client's structure calls for it |
| A section needs visual pacing / breathing room, not content | **DividerBlock** | Layout tool, not content-driven |

---

## 7. Style-decision defaults (when the brief doesn't specify)

- **Background rhythm:** vary `canvas` → `surface` → `brand` across sections rather than repeating the same background back-to-back, so sections read as distinct.
- **Hover:** `lift` is a reasonable default on cards in a grid; `glow` is a good alternative when the section already has strong motion elsewhere.
- **CTA variant:** `signal` or `brand` for the most important action per section; `ghost` for secondary actions. Avoid two competing high-emphasis CTA variants in the same view.
- **Animation:** treat every animated setting as a bonus, not a requirement — pick it when it reinforces the content's message (e.g. StatBlock count-up for a "by the numbers" section) rather than by default on every block.

---

## 8. API Composition Reference (for building pages via REST)

This section is required reading when building pages programmatically. The composition JSON format has specific rules that cause silent failures or hard errors if violated.

### 8.1 Create pages in one step — never two

Always create a BlankExperience with its full composition in the initial `POST /v1/content` call. Creating a shell and then PATCHing the composition is broken by design — creating without `layoutType: "outline"` initializes an internal layout that cannot be repaired. Delete and recreate is the only fix.

```
POST https://api.cms.optimizely.com/v1/content
Authorization: Bearer {token}
Content-Type: application/json

{
  "contentType": "BlankExperience",
  "container": "{parentContentKeyNoHyphens}",
  "initialVersion": {
    "displayName": "Page Name",
    "locale": "en",
    "routeSegment": "url-slug",
    "composition": {
      "nodeType": "experience",
      "layoutType": "outline",
      "nodes": [ ...block nodes... ]
    }
  }
}
```

**Critical rules:**
- `composition.nodeType` = `"experience"` (always)
- `composition.layoutType` = `"outline"` (always — omitting this breaks the page permanently)
- Container key has **no hyphens** (strip them from the GUID)
- The response body is **empty** — extract the content key from the `Location` response header

### 8.2 Composition node shape

Every block on the page is a `component` node. For full-width blocks, place them flat under the experience root — no section/row/column wrapping needed unless you're building a multi-column layout.

```json
{
  "nodeType": "component",
  "displayName": "Hero — Homepage",
  "displaySettings": {
    "displayTemplate": "OT_HeroDefault",
    "settings": {
      "layout": "imageRight",
      "color": "brand",
      "animation": "none"
    }
  },
  "component": {
    "contentType": "OT_HeroBlock",
    "properties": {
      "eyebrow":         { "value": "Welcome" },
      "headline":        { "value": "The Headline" },
      "body":            { "value": "Supporting text." },
      "primaryCtaLabel": { "value": "Get Started" },
      "primaryCtaUrl":   { "value": "/contact" }
    }
  }
}
```

**`displayName` is mandatory on every node.** This is what the CMS editor's page outline shows to the content editor. Without it, the outline displays the raw content type key (e.g. `OT_FeatureGridBlock`). Use a short, descriptive label that reflects the block's role on this page: `"Feature Grid — Why Us"`, `"Comparison Table — Account Types"`.

**`key` is forbidden** anywhere in composition nodes. The API rejects it with 400.

**`displaySettings`** may only contain `displayTemplate` and `settings` — no `key` field inside it.

### 8.3 Property value formats

| Type | Format |
|---|---|
| string | `{ "value": "plain text" }` |
| richText | `{ "value": { "html": "<p>Body copy.</p>" } }` |
| url | `{ "value": "/path/to/page" }` |

Never use `{ "html": "..." }` for string properties. Never use a bare string for richText properties. Mixing formats silently saves empty content with no error.

### 8.4 Component arrays — the most common failure point

Array properties (features, stats, tabs, accordion items, comparison columns/rows/cells) require a specific wrapper format for each item. This is non-obvious and every wrong format fails silently or throws.

**The ONLY correct format:**

```json
"features": {
  "value": [
    {
      "properties": {
        "headline": { "value": "No Monthly Fees" },
        "body":     { "value": { "html": "<p>Open an account for free.</p>" } }
      }
    }
  ]
}
```

**Rules:**
1. Each item is `{ "properties": { ... } }` — nothing else at the top level of the item
2. **No `contentType` field** on array items — the CMS infers the type from the property definition
3. Property values follow the same string/richText/url format rules as top-level properties

**Formats that FAIL:**

```json
// WRONG — contentType field is rejected
{ "contentType": "OT_FeatureItem", "properties": { ... } }

// WRONG — flat properties without the wrapper
{ "headline": "...", "body": "..." }

// WRONG — value wrapper around the whole item
{ "value": { "headline": "...", "body": "..." } }
```

### 8.5 Deeply nested arrays

ComparisonTableBlock has three levels: `columns` → `rows` → `cells`. All levels use the same `{ "properties": { ... } }` item format.

```json
"rows": {
  "value": [
    {
      "properties": {
        "rowType": { "value": "group" },
        "label":   { "value": "Core Features" }
      }
    },
    {
      "properties": {
        "rowType": { "value": "row" },
        "label":   { "value": "Monthly Fee" },
        "cells": {
          "value": [
            { "properties": { "text": { "value": "$0" } } },
            { "properties": { "text": { "value": "$12/mo" } } }
          ]
        }
      }
    }
  ]
}
```

DisclosureBlock items follow the same pattern:

```json
"items": {
  "value": [
    { "properties": { "body": { "value": { "html": "<p>APY is variable and subject to change.</p>" } } } },
    { "properties": { "body": { "value": { "html": "<p>Membership eligibility required.</p>" } } } }
  ]
}
```

### 8.6 Block properties quick reference

Properties that are commonly confused — wrong name silently saves empty content.

| Block | Property | Type | Notes |
|---|---|---|---|
| OT_HeroBlock | `headline` | string | NOT `heading` |
| OT_HeroBlock | `body` | string | NOT richText (max 300 chars) |
| OT_HeroBlock | `direction` | string enum | Content field: `editorialSplit`, `spotlight`, `overlap`, `diagonal` |
| OT_BannerBlock | `heading` | string | NOT `headline` |
| OT_BannerBlock | `body` | richText | IS richText (unlike Hero) |
| OT_BannerBlock | `treatment` | string enum | Content field: `scrim`, `glass` |
| OT_FeatureGridBlock | `heading` | string | NOT `headline` |
| OT_FeatureGridBlock | `features` | array of OT_FeatureItem | — |
| OT_FeatureItem | `headline` | string | — |
| OT_FeatureItem | `body` | richText | — |
| OT_StatBlock | `heading` | string | NOT `headline` |
| OT_StatBlock | `stats` | array of OT_StatItem | — |
| OT_StatItem | `value` | string | The big number/text |
| OT_AccordionBlock | `headline` | string | NOT `heading` |
| OT_AccordionBlock | `items` | array of OT_AccordionItem | — |
| OT_AccordionItem | `question` | string | — |
| OT_AccordionItem | `answer` | **string** | NOT richText (max 2,000 chars) |
| OT_QuoteBlock | `quote` | **string** | NOT richText (max 500 chars) |
| OT_QuoteBlock | `treatment` | string enum | Content field: `default`, `bubble`, `glow` |
| OT_TabsBlock | `heading` | string | — |
| OT_TabsBlock | `tabs` | array of OT_TabItem | — |
| OT_TabItem | `tabLabel` | string | The tab trigger label |
| OT_TabItem | `body` | richText | — |
| OT_ComparisonTableBlock | `headline` | string | — |
| OT_ComparisonTableBlock | `subHeadline` | string | NOT `subheading` |
| OT_ComparisonTableBlock | `tableStyle` | string enum | Content field: `clean`, `elevated`, `bold` |
| OT_ComparisonTableBlock | `columns` | array of OT_ComparisonColumn | — |
| OT_ComparisonTableBlock | `rows` | array of OT_ComparisonRow | — |
| OT_ComparisonRow | `rowType` | string enum | `"row"` or `"group"` |
| OT_ComparisonRow | `cells` | array of OT_ComparisonCell | — |
| OT_ComparisonCell | `icon` | string enum | `"check"`, `"minus"`, `"xmark"`, `"circle-check"`, `"infinity"`, etc. |
| OT_RichTextBlock | `content` | richText | NOT `body` or `text` |
| OT_CardBlock | `Heading` | string | Capitalized — `H` |
| OT_CardBlock | `Eyebrow` | string | Capitalized — `E` |
| OT_CardBlock | `Description` | richText | Capitalized — `D`; IS richText |
| OT_DisclosureBlock | `heading` | string | Optional section label |
| OT_DisclosureBlock | `style` | string enum | Content field: `finePrint`, `section` |
| OT_DisclosureBlock | `markerStyle` | string enum | Content field: `numeric`, `alpha` |
| OT_DisclosureBlock | `items` | array of OT_DisclosureItem | — |
| OT_DisclosureItem | `body` | richText | Full disclosure text; supports bold, italic, links |

### 8.7 Display templates reference

| contentType | displayTemplate | Key settings |
|---|---|---|
| OT_HeroBlock | OT_HeroDefault | layout: imageRight\|imageLeft; color: brand\|canvas\|surface; animation: none\|fade\|slide\|parallax |
| OT_BannerBlock | OT_BannerBlockDefault | color: canvas\|surface\|brand; alignment: center\|left; size: large\|compact\|display; imageBlend: overlay\|multiply |
| OT_FeatureGridBlock | OT_FeatureGridDefault | color: canvas\|surface\|brand; layout: grid\|ruled; columns: col2\|col3\|col4; iconStyle: none\|accent\|structural; animate: true\|false |
| OT_StatBlock | OT_StatBlockDefault | color: brand\|canvas\|surface; columns: col2\|col3\|col4; animate: true\|false; showIcons: false\|true; iconPlacement: inline\|above; glass: false\|true; entranceAnimation: none\|fade\|slide\|parallax |
| OT_AccordionBlock | OT_AccordionDefault | borderStyle: ruled\|boxed\|clean; color: canvas\|surface\|brand |
| OT_QuoteBlock | OT_QuoteDefault | color: brand\|none\|canvas\|surface; alignment: center\|left; size: large\|small |
| OT_TabsBlock | OT_TabsDefault | tabPosition: top\|side; color: canvas\|surface\|brand\|glass; contentLayout: textOnly\|imageRight\|imageLeft |
| OT_RichTextBlock | OT_RichTextDefault | color: none\|canvas\|brand\|surface; alignment: left\|center; size: editorial\|compact |
| OT_ComparisonTableBlock | OT_ComparisonTableDefault | color: canvas\|surface\|brand |
| OT_DisclosureBlock | OT_DisclosureBlockDefault | (no display settings — controlled via content fields) |
| OT_ContentRecommendationsBlock | OT_ContentRecommendationsDefault | color: canvas\|surface\|brand |
| OT_ProductRecommendationsBlock | OT_ProductRecommendationsDefault | color: canvas\|surface\|brand |
| OT_TrustRailBlock | OT_TrustRailDefault | treatment, background, density, size, glass, entranceAnimation |
| OT_CalloutBlock | OT_CalloutDefault | variant, size, alignment, dismissible |
| OT_PrimaryTextBlock | OT_PrimaryTextDefault | alignment, color, size, effect |
| OT_BlogFeedBlock | OT_BlogFeedDefault | color: canvas\|surface\|brand; defaultView: grid\|list; columns: col3\|col2 |

### 8.8 Publishing

Use `cms_publish_content_item({ ContentKey: key, ContentVersion: version })` via the MCP tool. Do not guess the REST publish path — it returns 404.

### 8.9 Failure mode decoder

| Error | Cause | Fix |
|---|---|---|
| `"Could not read value as 'component'. Expected object."` | Array item missing `{ "properties": { ... } }` wrapper, or has a `contentType` field | Use `{ "properties": { ... } }` only — no contentType field on items |
| `"The field 'key' does not exist on type 'CompositionNode'"` | `key` field included in a composition node | Strip all `key` fields from composition |
| `"StructureNode is not of type Composition"` on publish | Page created without `layoutType: "outline"` | Delete and recreate with `layoutType: "outline"` |
| Property silently saves as empty | Wrong property name, or wrong value format (string vs richText) | Check the property table in Section 8.6 property table; verify value format |
| `400` on create | Hyphens in container GUID | Strip hyphens from container key |
| `415` on application PATCH | Wrong Content-Type | Use `application/merge-patch+json` for PATCH /v1/applications |
| `500` on parallel creates | DB deadlock from concurrent writes | Batch creates at 3–4 per batch with exponential retry |
| Page outline shows `OT_FeatureGridBlock` instead of a friendly name | Missing `displayName` field on the composition node | Add `"displayName": "Feature Grid — [descriptive label]"` to every node |
