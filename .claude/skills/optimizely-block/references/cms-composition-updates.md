# CMS Composition Updates — BlankExperience

This reference covers the correct data shapes for creating and updating BlankExperience
page compositions via the REST API (`POST /v1/content`) or the MCP `cms_update_content_item`
tool. All formats are **verified against a live CMS instance**.

---

## Array Property Format (CRITICAL — not obvious)

When a block has an array of structured sub-items (e.g. `OT_StatBlock.stats`,
`OT_AccordionBlock.items`, `OT_FeatureGridBlock.features`, `OT_TabsBlock.tabs`), the correct
value format is:

```json
"stats": {
  "value": [
    {
      "properties": {
        "value":   { "value": "5,000+" },
        "label":   { "value": "Member Banks" },
        "context": { "value": "Across all 50 states" }
      }
    },
    {
      "properties": {
        "value":   { "value": "95%" },
        "label":   { "value": "Industry Assets" },
        "context": { "value": "Represented by ABA members" }
      }
    }
  ]
}
```

**Rules:**
- Each array item is `{ "properties": { propName: { "value": "..." } } }` — no `contentType` wrapper
- String properties: `{ "value": "plain text" }`
- richText properties: `{ "value": { "html": "<p>...</p>" } }`
- Do NOT use: `[{ "value": "5000", "label": "..." }]` (flat)
- Do NOT use: `[{ "contentType": "OT_StatItem", "properties": {...} }]` (with contentType)

This format was confirmed from live CMS data (Cardiology page OT_AccordionBlock, Student Promo
OT_StatBlock). The API returns error "Could not read value as 'component'. Expected object." for
all other formats.

---

## Section / Row / Column / Component Nesting Template

Visual Builder sections (multi-column card grids, etc.) require this exact nesting:

```json
{
  "displayName": "3 Card Row",
  "nodeType": "section",
  "layoutType": "grid",
  "displaySettings": {
    "displayTemplate": "OT_LandingSection",
    "settings": {
      "gridWidth": "default",
      "verticalSpacing": "large",
      "backgroundColor": "canvas",
      "sectionOverlap": "none",
      "entranceAnimation": "none"
    }
  },
  "component": { "contentType": "BlankSection" },
  "nodes": [
    {
      "displayName": "Header Row",
      "nodeType": "row",
      "displaySettings": {
        "displayTemplate": "OT_LandingRow",
        "settings": {
          "showAsRowFrom": "sm",
          "contentSpacing": "none",
          "verticalPadding": "none",
          "justifyContent": "start",
          "alignItems": "start",
          "backgroundColor": "none",
          "wrapColumns": "false",
          "reverseColumns": "false",
          "entranceAnimation": "none"
        }
      },
      "nodes": [
        {
          "displayName": "Column",
          "nodeType": "column",
          "displaySettings": {
            "displayTemplate": "OT_LandingColumn",
            "settings": {
              "gridSpan": "auto",
              "contentSpacing": "none",
              "verticalPadding": "none",
              "horizontalPadding": "none",
              "justifyContent": "start",
              "alignContent": "center"
            }
          },
          "nodes": [
            {
              "displayName": "Component Name",
              "nodeType": "component",
              "displaySettings": { "displayTemplate": "OT_PrimaryTextDefault", "settings": { ... } },
              "component": {
                "contentType": "OT_PrimaryTextBlock",
                "properties": { ... }
              }
            }
          ]
        }
      ]
    },
    {
      "displayName": "Cards Row",
      "nodeType": "row",
      "displaySettings": {
        "displayTemplate": "OT_LandingRow",
        "settings": {
          "showAsRowFrom": "sm",
          "contentSpacing": "medium",
          "verticalPadding": "medium",
          "justifyContent": "start",
          "alignItems": "start",
          "backgroundColor": "none",
          "wrapColumns": "false",
          "reverseColumns": "false",
          "entranceAnimation": "fade"
        }
      },
      "nodes": [
        {
          "displayName": "Card 1",
          "nodeType": "column",
          "displaySettings": {
            "displayTemplate": "OT_LandingColumn",
            "settings": {
              "gridSpan": "auto",
              "contentSpacing": "none",
              "verticalPadding": "none",
              "horizontalPadding": "none",
              "justifyContent": "start",
              "alignContent": "start"
            }
          },
          "nodes": [
            {
              "displayName": "Card Block",
              "nodeType": "component",
              "displaySettings": {
                "displayTemplate": "OT_CardDefault",
                "settings": {
                  "fill": "surface",
                  "border": "subtle",
                  "imageSide": "left",
                  "hover": "lift",
                  "density": "default",
                  "noise": "false",
                  "accentLine": "top",
                  "maxHeight": "none",
                  "minHeight": "none",
                  "aspectRatio": "auto",
                  "imageAspectRatio": "auto"
                }
              },
              "component": {
                "contentType": "OT_CardBlock",
                "properties": {
                  "Heading":     { "value": "Card Heading" },
                  "Eyebrow":     { "value": "Eyebrow Text" },
                  "Description": { "value": { "html": "<p>Card description.</p>" } },
                  "ctaLabel":    { "value": "Learn More" },
                  "ctaUrl":      { "value": "/path" }
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Critical rules for sections:**
- `nodeType: "section"` requires **both** `layoutType: "grid"` AND `"component": { "contentType": "BlankSection" }`
- Without `component: { contentType: "BlankSection" }`, the API returns: "node is of type 'component' but does not have the required 'component' property" because it treats the section as a component.
- `displaySettings.displayTemplate` for a section is `"OT_LandingSection"` (which has `baseType: "_section"` in its template definition, not `nodeType: "section"` — don't confuse those)
- The "Blank Section" template key (`DisplayTemplate_9731ff4dce8044b3ab697e1b4cdbb60c`) is the alternative section display template for nodeType-bound sections

---

## Valid Setting Values Reference

### OT_HeroDefault
- `layout`: `imageLeft` | `imageRight` (only 2 — **no "standard"**)
- `color`: `brand` | `canvas` | `surface`
- `animation`: `none` | `fade` | `slide` | `parallax`

### OT_CardDefault
- `imageSide`: `left` | `right` (only 2 — **no "top"**)
- `fill`: `surface` | `ghost` | `canvas` | `brand` | `image` (5 choices)
- `hover`: `none` | `lift` | `glow` | `fill`
- `accentLine`: `top` | `bottom` | `none`
- `aspectRatio`: `auto` | `square` | `wide` | `portrait` | ...

### OT_EventListingDefault
- `showPastEvents`: `hide` | `show` | `toggle` (3 choices)
  - **NOT "current"** — that's invalid

### schemaType (BlankExperience SEO property)
- Valid: `none` | `WebPage` | `Article` | `FAQPage` | `Product` | `Event`
- **NOT valid**: `Organization`, `EducationalOrganization`, `NewsMediaOrganization`

---

## Full-Replacement Semantics (via MCP cms_update_content_item)

When using `cms_update_content_item` with an `Experience` outline:
- The entire composition is **replaced**, not merged
- Always pass the full composition tree
- This is different from property updates which use merge-patch semantics

---

## Payload Size Limit

Keep compositions under ~6–7 KB. The CMS may reject larger payloads with 400 errors.
Training & Events (9.4KB) and Membership (9.6KB) were accepted in testing (July 2026) but
this may vary. Keep rich text HTML concise to stay within safe limits.

---

## HTML in RichText Properties

Use HTML entities for special characters inside JSON strings:
- `&` → `&amp;` (required, `&` in JSON strings causes XML parse errors in CMS)
- `<` → OK in JSON strings as-is, but in some contexts wrap as `&lt;`
- `>` → OK in JSON strings

The "HTML angle-bracket XML hazard" documented in older references refers to CMS
processing pipelines that re-parse the stored HTML as XML — use entities for safety.
