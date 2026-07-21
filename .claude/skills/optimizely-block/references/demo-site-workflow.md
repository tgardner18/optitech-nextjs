# Demo Site Workflow — CMS Multi-Page Builds

This reference covers how to build a complete demo site (10–30 pages) in the Optimizely SaaS CMS using direct REST API calls. It documents the patterns that work and the failure modes that will waste hours if you hit them.

---

## Core Pattern: One-Step Create with Composition

**Create every page in a single `POST /v1/content` call with the full composition in `initialVersion.composition`.**

There is no two-phase create. The old "create shell, then update with composition" pattern is broken by design — creating a `BlankExperience` without `layoutType: "outline"` in the composition initializes an internal StructureNode layout that **cannot be repaired in place**. Delete and recreate is the only fix.

### The correct create call

```bash
POST https://api.cms.optimizely.com/v1/content
Content-Type: application/json
Authorization: Bearer {token}

{
  "contentType": "BlankExperience",
  "container": "{parentContentKeyNoHyphens}",
  "initialVersion": {
    "displayName": "Page Name",
    "locale": "en",
    "routeSegment": "page-url-slug",
    "composition": {
      "nodeType": "experience",
      "layoutType": "outline",
      "nodes": [ ...blocks... ]
    }
  }
}
```

**Critical rules:**
- `composition.nodeType` must be `"experience"`
- `composition.layoutType` must be `"outline"` — **this is the single most important rule**
- No `key` fields anywhere in the composition or its nodes — the API rejects them with 400
- Container key has **no hyphens** (strip them from the GUID)

### Reading the response

The API returns **HTTP 201 with an empty body**. The content key and version are in response headers:

```
Location: https://...cms.optimizely.com/v1/content/{contentKey}
cms-content-version-location: https://...cms.optimizely.com/v1/content/{contentKey}/versions/{version}
```

Extract the key as `location.split('/').pop()` and version as `cms-content-version-location.split('/').pop()`.

---

## Authentication

```bash
POST https://api.cms.optimizely.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={OPTIMIZELY_CMS_CLIENT_ID}&client_secret={OPTIMIZELY_CMS_CLIENT_SECRET}
```

Tokens expire. Re-fetch if you get 401 responses.

---

## Publishing

Use the MCP tool — the REST API publish endpoint path is different from what you'd expect:

```javascript
// Via MCP (always works):
cms_publish_content_item({ ContentKey: key, ContentVersion: version })

// REST API publish (if needed):
// Use cms_publish_content_item via MCP — don't guess the REST path
```

Do NOT try to publish via `PUT /v1/content/{key}/versions/{version}/publish` — that path returns 404. Use the MCP tool.

---

## Application Entry Point

To update which page the application routes to as home:

```bash
PATCH https://api.cms.optimizely.com/v1/applications/{appKey}
Content-Type: application/merge-patch+json    # ← must be merge-patch, not json
Authorization: Bearer {token}

{ "entryPoint": "cms://content/{contentKeyNoHyphens}" }
```

**Note:** `Content-Type: application/json` returns 415. Must use `application/merge-patch+json`.

The change takes ~2–3 seconds to propagate. Verify with a subsequent GET before relying on it.

You cannot delete a page that is set as the application entry point, even after updating the entry point. Wait for propagation and verify the GET reflects the new entry point first.

---

## Composition Structure (BlankExperience)

Every composition must start with:

```json
{
  "nodeType": "experience",
  "layoutType": "outline",
  "nodes": [...]
}
```

### Component node shape (flat — no section nesting)

```json
{
  "nodeType": "component",
  "displaySettings": {
    "displayTemplate": "OT_HeroDefault",
    "settings": { "layout": "standard", "color": "brand", "animation": "none" }
  },
  "component": {
    "contentType": "OT_HeroBlock",
    "properties": {
      "eyebrow": { "value": "..." },
      "headline": { "value": "..." },
      "body": { "value": "..." },
      "primaryCtaLabel": { "value": "..." },
      "primaryCtaUrl": { "value": "..." }
    }
  }
}
```

Using flat `nodeType: "component"` blocks (no sections) is simpler and valid. Section nesting (section → row → column → component) is only needed for multi-column layouts.

**`displaySettings` must NOT include a `key` field** — only `displayTemplate` and `settings`.

### Display templates reference

| contentType | displayTemplate | Key settings |
|---|---|---|
| OT_HeroBlock | OT_HeroDefault | layout: imageRight\|imageLeft\|standard; color: brand\|canvas\|surface; animation: none\|fade\|slide\|parallax |
| OT_BannerBlock | OT_BannerBlockDefault | color: canvas\|surface\|brand; alignment: center\|left; size: large\|compact\|display; imageBlend: overlay\|multiply |
| OT_FeatureGridBlock | OT_FeatureGridDefault | color: canvas\|surface\|brand; layout: grid\|ruled; columns: col2\|col3\|col4; iconStyle: none\|accent\|structural; animate: true\|false |
| OT_StatBlock | OT_StatBlockDefault | color: brand\|canvas\|surface; columns: col2\|col3\|col4; animate: true\|false; showIcons: false\|true; glass: false\|true; entranceAnimation: none\|fade\|slide\|parallax |
| OT_AccordionBlock | OT_AccordionDefault | borderStyle: ruled\|boxed\|clean; color: canvas\|surface\|brand; defaultOpen: false\|true; openMode: single\|multiple |
| OT_QuoteBlock | OT_QuoteDefault | color: brand\|none\|canvas\|surface; alignment: center\|left; size: large\|small |
| OT_TabsBlock | OT_TabsDefault | tabPosition: top\|side; color: canvas\|surface\|brand\|glass; contentLayout: textOnly\|imageRight\|imageLeft; triggerAlign: left\|center; autoPlay: off\|on; entranceAnimation: none\|fade\|slide\|parallax |
| OT_RichTextBlock | OT_RichTextDefault | color: none\|canvas\|brand\|surface; alignment: left\|center; size: editorial\|compact; treatment: standard\|lead\|toc\|glow_frame\|layered_depth\|float_elevation\|sidebar_accent\|layers_3d |
| OT_BlogFeedBlock | OT_BlogFeedDefault | color: canvas\|surface\|brand; defaultView: grid\|list; columns: col3\|col2; headingSize: headline\|display\|title |
| OT_PrimaryTextBlock | OT_PrimaryTextDefault | alignment, color, size, entranceAnimation |
| OT_ComparisonTableBlock | OT_ComparisonTableDefault | color |
| OT_TrustRail | OT_TrustRailDefault | treatment, background, density, size, glass, entranceAnimation |
| OT_CalloutBlock | OT_CalloutDefault | variant, size, alignment, dismissible, sticky, entranceAnimation |

### Block property names (confirmed from CMS schema)

| Block | Top-level props | Array prop | Array item type | Item props |
|---|---|---|---|---|
| OT_HeroBlock | eyebrow, **headline**, body (string), primaryCtaLabel, primaryCtaUrl | — | — | — |
| OT_BannerBlock | eyebrow, **heading**, body (**richText**), primaryCtaLabel, primaryCtaUrl | — | — | — |
| OT_FeatureGridBlock | eyebrow, **heading**, **features** | features | OT_FeatureItem | headline, body (**richText**) |
| OT_StatBlock | eyebrow, **heading**, **stats** | stats | OT_StatItem | **value**, label, context |
| OT_AccordionBlock | eyebrow, **headline**, **items** | items | OT_AccordionItem | question, answer |
| OT_QuoteBlock | quote, attributionName, attributionTitle | — | — | — |
| OT_TabsBlock | **heading**, **tabs** | tabs | OT_TabItem | **tabLabel**, heading, body (**richText**) |
| OT_RichTextBlock | **content** (richText) | — | — | — |
| OT_BlogFeedBlock | **heading** | — | — | — |

**Bold** = commonly confused name (wrong name silently saves as empty).

richText property value format: `{ "value": { "html": "<p>...</p>" } }`  
string property value format: `{ "value": "plain text" }`

### Array of component sub-items (CRITICAL format)

Array properties (stats, features, tabs, items) use this format — verified live July 2026:

```json
"stats": {
  "value": [
    {
      "properties": {
        "value":   { "value": "5,000+" },
        "label":   { "value": "Member Banks" },
        "context": { "value": "Across all 50 states" }
      }
    }
  ]
}
```

**Each item is `{ "properties": { propName: { "value": "..." } } }` — no `contentType` wrapper.**
All other formats produce: "Could not read value as 'component'. Expected object."

See `references/cms-composition-updates.md` for the full section/row/column nesting template.

---

## Blog Articles (OT_BlogPage)

OT_BlogPage uses **direct properties**, not a composition. Never set `composition` on a blog page.

Correct property names (verified against schema):

```json
{
  "headline": { "value": "Article Title" },
  "subHeadline": { "value": "Short summary shown in feed (max 200 chars)." },
  "body": { "value": { "html": "<h2>Section</h2><p>Body content.</p>" } },
  "topic": { "value": "resources" }
}
```

`topic` enum values: `news`, `insights`, `leadership`, `stories`, `innovation`, `culture`, `events`, `resources`

**Wrong names that silently fail:** `heading` (use `headline`), `introduction` (use `subHeadline`), `category` (use `topic`), `author` (use `authorRef` — a content reference to an OT_Author item, not a string).

---

## Site Hierarchy

A demo site must have a BlankExperience **home page** as the parent. Do not place section pages directly under the CMS root container.

```
ROOT (43f936c9-9b23-4ea3-97b2-61c538ad07c9)
└── Vantage Insurance [BlankExperience] ← create first, set as app entry point
    ├── Personal Insurance [BlankExperience]
    │   ├── Auto Insurance
    │   ├── Homeowners Insurance
    │   ├── Renters Insurance
    │   └── Life Insurance
    ├── Business Insurance [BlankExperience]
    │   ├── Business Liability
    │   ├── Workers' Compensation
    │   ├── Commercial Auto
    │   └── Commercial Property
    ├── About [BlankExperience]
    │   ├── Our Story
    │   ├── Leadership
    │   └── Careers
    ├── Claims [BlankExperience]
    │   ├── File a Claim
    │   └── Claims FAQ
    ├── Contact [BlankExperience]
    └── News & Resources [BlankExperience]
        ├── Article 1 [OT_BlogPage]
        ├── Article 2 [OT_BlogPage]
        └── Article 3 [OT_BlogPage]
```

Creation order must respect parent→child dependencies:
1. Home page → capture key from Location header
2. Top-level sections (can run in parallel batches of 3–4) → capture keys
3. Child pages (parallel batches, using parent keys from step 2)
4. Blog articles (parallel, using news section key)
5. Publish all via `cms_publish_content_item` MCP tool

---

## Node.js Build Script Pattern

```javascript
const https = require('https');
const fs = require('fs');

let TOKEN = '';

async function getToken() {
  // POST /oauth/token with client_credentials grant
}

function lastSeg(url) { return url ? url.split('/').pop() : null; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createPage({ contentType, displayName, routeSegment, container, composition, properties }, attempt = 1) {
  const payload = {
    contentType,
    container,   // no hyphens
    initialVersion: {
      displayName,
      locale: 'en',
      routeSegment,
      ...(composition ? { composition } : {}),
      ...(properties ? { properties } : {}),
    },
  };
  const res = await req('POST', '/v1/content', payload, TOKEN);

  // Retry transient 500 deadlock errors
  if (res.status === 500 && attempt <= 4) {
    await sleep(attempt * 2000);
    return createPage({ ... }, attempt + 1);
  }
  if (res.status !== 201) throw new Error(`${res.status}: ${JSON.stringify(res.body)}`);

  // Key and version are in headers, NOT in the body (body is empty)
  const key = lastSeg(res.headers['location']);
  const version = parseInt(lastSeg(res.headers['cms-content-version-location']), 10);
  return { key, version, name: displayName };
}

// Batch parallel to avoid CMS deadlocks
async function batchedParallel(fns, batchSize = 3) {
  const results = [];
  for (let i = 0; i < fns.length; i += batchSize) {
    const batch = await Promise.all(fns.slice(i, i + batchSize).map(f => f()));
    results.push(...batch);
    if (i + batchSize < fns.length) await sleep(500);
  }
  return results;
}

// Load pre-written composition JSON files (with layoutType: "outline", no key fields)
function loadComp(name) {
  return JSON.parse(fs.readFileSync(`/path/to/${name}_nokeys.json`, 'utf8')).composition;
}
```

**Batch size guidance:** use 3–4 for parallel creates. The CMS database deadlocks under higher concurrency (8+ simultaneous creates to the same container). The retry logic handles transient 500s, but batching prevents most of them.

---

## Composition JSON Preparation

Write compositions in full as JSON files, then strip all `key` fields before using them:

```python
import json, glob

def strip_keys(obj):
    if isinstance(obj, dict):
        return {k: strip_keys(v) for k, v in obj.items() if k != 'key'}
    elif isinstance(obj, list):
        return [strip_keys(i) for i in obj]
    return obj

for fpath in glob.glob('*_comp.json'):
    d = json.load(open(fpath))
    # Add layoutType if missing
    d['composition']['layoutType'] = 'outline'
    d = strip_keys(d)
    out = fpath.replace('_comp.json', '_nokeys.json')
    json.dump(d, open(out, 'w'))
```

Keep compositions under ~6KB. The CMS rejects payloads that are too large.

---

## Failure Modes and Fixes

### "StructureNode is not of type Composition" on publish
**Cause:** Page was created without `layoutType: "outline"` in the composition root.  
**Fix:** Delete the content item and recreate it. There is no in-place fix.

### "The field 'key' does not exist on type 'CompositionNode'"
**Cause:** Node `key` fields were included in the composition.  
**Fix:** Strip all `key` fields from the composition JSON before sending.

### 500 deadlock on parallel creates
**Cause:** Too many concurrent creates to the same container (CMS DB row lock contention).  
**Fix:** Use batched parallel with batchSize 3–4 and retry logic with exponential backoff.

### "Name in URL already in use"
**Cause:** A previous (possibly failed) run created a page with the same route segment, leaving an orphan.  
**Fix:** Query Graph for draft pages by displayName, get their keys, delete them, then retry.

### Publish returns 404 via REST
**Cause:** The REST publish endpoint path is not `PUT /v1/content/{key}/versions/{version}/publish`.  
**Fix:** Always publish via the `cms_publish_content_item` MCP tool.

### PATCH /v1/applications/{key} returns 415
**Cause:** Wrong Content-Type header. The PATCH endpoint requires `application/merge-patch+json`.  
**Fix:** Use `Content-Type: application/merge-patch+json` for the application entry point PATCH.

### Cannot delete page — it's the entry point
**Cause:** A page set as the application entry point cannot be deleted until the entry point is updated.  
**Fix:**
1. Create new home page → get key
2. PATCH application with `application/merge-patch+json` to update entry point
3. Wait ~3 seconds, verify GET shows new entry point
4. Delete old home

### Graph returns empty or stale results right after creation
**Cause:** Graph indexing lags 2–5 minutes behind CMS writes.  
**Fix:** Use `cms_get_content_data` or the REST API for immediate verification. Graph is for read queries once data has settled.

---

## Time Estimates (with correct one-step approach)

| Pages | Create phase | Publish phase | Total |
|---|---|---|---|
| 10 | ~3 min | ~1 min | ~4 min |
| 23 | ~5 min | ~2 min | ~7 min |
| 40 | ~8 min | ~3 min | ~11 min |

The one-step create approach (vs. the broken two-phase approach) eliminates the entire composition phase, cutting total time roughly in half.
