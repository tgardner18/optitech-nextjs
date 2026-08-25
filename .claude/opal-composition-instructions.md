# Optimizely SaaS CMS — Page Composition Instructions for Opal

These instructions cover how to create and populate BlankExperience pages via the CMS REST API.
They correct the most common failure modes when building pages with nested content blocks.

---

## 1. Create Pages in One Step — Never Two

**Always** create a BlankExperience with its full composition in the initial `POST /v1/content` call.
Do NOT create a shell first and then PATCH the composition — creating without `layoutType: "outline"` 
initializes an internal StructureNode layout that cannot be repaired. Delete and recreate is the only fix.

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
- `composition.layoutType` = `"outline"` (always — this is the single most important field)
- Container key has **no hyphens** (strip them from the GUID)
- The response body is **empty** — extract the content key from the `Location` response header

---

## 2. Composition Node Shape

Every block on the page is a `component` node. Do NOT wrap in section/row/column unless you specifically need a multi-column layout.

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
      "eyebrow":          { "value": "Welcome" },
      "headline":         { "value": "The Headline" },
      "body":             { "value": "Supporting text." },
      "primaryCtaLabel":  { "value": "Get Started" },
      "primaryCtaUrl":    { "value": "/contact" }
    }
  }
}
```

### Mandatory field: `displayName` on every node

Every composition node MUST include a `displayName` field. This is what the CMS editor's page outline
shows to the content editor. Without it, the outline displays the raw content type key (e.g. `OT_FeatureGridBlock`).

Use a short, descriptive human label that reflects the block's role on this specific page:
- `"Feature Grid — Why Us"`
- `"Comparison Table — Account Types"`
- `"Hero — Homepage Banner"`

### Forbidden field: `key`

**Never** include a `key` field anywhere in the composition or its nodes. The API rejects it with 400:
`"The field 'key' does not exist on type 'CompositionNode'"`.

### `displaySettings` rules

- Only `displayTemplate` and `settings` — no `key` field inside `displaySettings`
- `displayTemplate` must match an existing registered template key (see table below)

---

## 3. Property Value Formats

**String property** (type: `string`):
```json
{ "value": "plain text here" }
```

**Rich text property** (type: `richText`):
```json
{ "value": { "html": "<p>Body copy here.</p>" } }
```

**URL property** (type: `url`):
```json
{ "value": "/path/to/page" }
```

Do NOT use `{ "html": "..." }` for string properties. Do NOT use a plain string for richText properties.
Mixing these formats silently saves empty content — no error is returned.

---

## 4. Component Arrays (Features, Stats, Tabs, Accordion Items, etc.)

This is the most common failure point. Component array items in a composition **require a specific wrapper format**.

### The ONLY correct format

```json
"features": {
  "value": [
    {
      "properties": {
        "headline": { "value": "No Monthly Fees" },
        "body":     { "value": { "html": "<p>Open an account for free.</p>" } }
      }
    },
    {
      "properties": {
        "headline": { "value": "Online Banking" },
        "body":     { "value": { "html": "<p>Manage your account 24/7.</p>" } }
      }
    }
  ]
}
```

### Rules for array items

1. Each item is `{ "properties": { ... } }` — nothing else at the top level
2. **NO `contentType` field** on array items — the CMS infers the type from the property definition
3. **NO flat properties** — `{ "headline": "..." }` without the `properties` wrapper fails
4. Property values follow the same string/richText/url format rules as top-level properties

### Formats that FAIL (do not use)

```json
// WRONG — contentType field is rejected
{ "contentType": "OT_FeatureItem", "properties": { "headline": { "value": "..." } } }

// WRONG — contentType as object is also rejected  
{ "contentType": { "key": "OT_FeatureItem" }, "properties": { ... } }

// WRONG — flat properties without wrapper
{ "headline": "...", "body": "..." }

// WRONG — value wrapper around the whole item
{ "value": { "headline": "...", "body": "..." } }
```

---

## 5. Deeply Nested Arrays (ComparisonTable)

`OT_ComparisonTableBlock` has three levels of nesting: `columns`, `rows`, and `cells` (inside rows).
All three levels use the same `{ "properties": { ... } }` item format.

```json
{
  "nodeType": "component",
  "displayName": "Comparison Table — Account Types",
  "displaySettings": {
    "displayTemplate": "OT_ComparisonTableDefault",
    "settings": { "color": "canvas" }
  },
  "component": {
    "contentType": "OT_ComparisonTableBlock",
    "properties": {
      "eyebrow":     { "value": "Compare" },
      "headline":    { "value": "Choose the right account" },
      "subHeadline": { "value": "All accounts include no monthly fees." },
      "tableStyle":  { "value": "clean" },
      "columns": {
        "value": [
          {
            "properties": {
              "label":     { "value": "Basic Checking" },
              "subLabel":  { "value": "$0/month" },
              "ctaLabel":  { "value": "Open Account" },
              "ctaUrl":    { "value": "/open/basic" }
            }
          },
          {
            "properties": {
              "label":     { "value": "Premium Checking" },
              "subLabel":  { "value": "$12/month" },
              "badgeText": { "value": "Most Popular" },
              "ctaLabel":  { "value": "Open Account" },
              "ctaUrl":    { "value": "/open/premium" }
            }
          }
        ]
      },
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
          },
          {
            "properties": {
              "rowType": { "value": "row" },
              "label":   { "value": "Overdraft Protection" },
              "cells": {
                "value": [
                  { "properties": { "icon": { "value": "minus" } } },
                  { "properties": { "icon": { "value": "check" } } }
                ]
              }
            }
          }
        ]
      }
    }
  }
}
```

---

## 6. Block Properties Quick Reference

Property names that are commonly confused — using the wrong name silently saves empty content.

| Block | Property | Type | Notes |
|---|---|---|---|
| OT_HeroBlock | `headline` | string | NOT `heading` |
| OT_HeroBlock | `body` | string | NOT richText |
| OT_BannerBlock | `heading` | string | NOT `headline` |
| OT_BannerBlock | `body` | richText | IS richText (unlike Hero) |
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
| OT_TabsBlock | `heading` | string | — |
| OT_TabsBlock | `tabs` | array of OT_TabItem | — |
| OT_TabItem | `tabLabel` | string | The tab trigger label |
| OT_TabItem | `body` | richText | — |
| OT_ComparisonTableBlock | `headline` | string | — |
| OT_ComparisonTableBlock | `subHeadline` | string | NOT `subheading` |
| OT_ComparisonTableBlock | `columns` | array of OT_ComparisonColumn | — |
| OT_ComparisonTableBlock | `rows` | array of OT_ComparisonRow | — |
| OT_ComparisonRow | `rowType` | string enum | `"row"` or `"group"` |
| OT_ComparisonRow | `cells` | array of OT_ComparisonCell | — |
| OT_ComparisonCell | `icon` | string enum | `"check"`, `"minus"`, `"xmark"`, etc. |
| OT_RichTextBlock | `content` | richText | NOT `body` or `text` |
| OT_QuoteBlock | `quote` | **string** | NOT richText, NOT `body` (max 500 chars) |

---

## 7. Display Templates Reference

| contentType | displayTemplate | Key settings |
|---|---|---|
| OT_HeroBlock | OT_HeroDefault | layout: imageRight\|imageLeft; color: brand\|canvas\|surface; animation: none\|fade\|slide\|parallax |
| OT_BannerBlock | OT_BannerBlockDefault | color: canvas\|surface\|brand; alignment: center\|left; size: large\|compact\|display |
| OT_FeatureGridBlock | OT_FeatureGridDefault | color: canvas\|surface\|brand; layout: grid\|ruled; columns: col2\|col3\|col4; iconStyle: none\|accent\|structural; animate: true\|false |
| OT_StatBlock | OT_StatBlockDefault | color: brand\|canvas\|surface; columns: col2\|col3\|col4; animate: true\|false |
| OT_AccordionBlock | OT_AccordionDefault | borderStyle: ruled\|boxed\|clean; color: canvas\|surface\|brand |
| OT_QuoteBlock | OT_QuoteDefault | color: brand\|none\|canvas\|surface; alignment: center\|left; size: large\|small |
| OT_TabsBlock | OT_TabsDefault | tabPosition: top\|side; color: canvas\|surface\|brand\|glass; contentLayout: textOnly\|imageRight\|imageLeft |
| OT_RichTextBlock | OT_RichTextDefault | color: none\|canvas\|brand\|surface; alignment: left\|center; size: editorial\|compact |
| OT_ComparisonTableBlock | OT_ComparisonTableDefault | color: canvas\|surface\|brand |
| OT_TrustRail | OT_TrustRailDefault | treatment, background, density, size |
| OT_CalloutBlock | OT_CalloutDefault | variant, size, alignment, dismissible |
| OT_PrimaryTextBlock | OT_PrimaryTextDefault | alignment, color, size |
| OT_BlogFeedBlock | OT_BlogFeedDefault | color: canvas\|surface\|brand; defaultView: grid\|list; columns: col3\|col2 |

---

## 8. Publishing

Use the MCP tool `cms_publish_content_item({ ContentKey: key, ContentVersion: version })`.

Do NOT guess the REST publish path — it differs from what you'd expect and returns 404.

---

## 9. Failure Mode Decoder

| Error | Cause | Fix |
|---|---|---|
| `"Could not read value as 'component'. Expected object."` | Array item missing `{ "properties": { ... } }` wrapper, or has a `contentType` field | Use `{ "properties": { ... } }` only — no contentType field |
| `"The field 'key' does not exist on type 'CompositionNode'"` | `key` field included in a composition node | Strip all `key` fields from composition |
| `"StructureNode is not of type Composition"` on publish | Page created without `layoutType: "outline"` | Delete and recreate with `layoutType: "outline"` |
| Property silently saves as empty | Wrong property name, or wrong value format (string vs richText) | Check property name table above; check value format |
| `400` on container | Hyphens in container GUID | Strip hyphens from container key |
| `415` on application PATCH | Wrong Content-Type | Use `application/merge-patch+json` for PATCH /v1/applications |
| `500` on parallel creates | DB deadlock from concurrent writes | Batch creates at 3–4 per batch with retry |
