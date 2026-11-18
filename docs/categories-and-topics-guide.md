# Categories and Topics: end-to-end guide

**Purpose of this document:** a complete walkthrough of how to use CMS categories (taxonomy) in the Site Accelerator, written so it can be handed to Mark AI as the source for a how-to video. Each section ends with a "Show on screen" note describing what the video should capture.

**One-sentence version:** build a category tree once, tag your content against it, add a Topic Hub page and point Theme Manager at it, and every article then ends with a "More on these topics" panel that sends visitors into a filterable hub of everything else tagged the same way.

**Audience:** solution engineers and marketers setting up a demo site. No coding is needed for any step below.

**Terms used**

| Term | Meaning |
|---|---|
| Category / topic | A term in the CMS category tree (for example "Mortgages"). The site shows these to visitors as topics. |
| Tagging | Assigning one or more categories to a content item. |
| Topic Hub | A page of type **Topic Hub Page** that gives visitors a search and filter experience driven by topics. |
| Theme Manager | The per-site settings item that controls the look, navigation and integrations of a site. |
| Marker | A small tag chip on an article showing one topic, with a count of how many pages carry it. |

---

## The flow at a glance

1. **Populate** the category tree in the CMS.
2. **Tag** content items against the tree (by hand or with Mark AI).
3. **Create** a Topic Hub Page.
4. **Link** the Topic Hub Page in Theme Manager.
5. **Check** an article: the topics panel appears at the bottom and routes into the hub.

Steps 3 and 4 are what switch the experience on. Without a linked hub, an article still shows its categories, but as a quiet "Filed under" row with no links.

---

## Step 1. Populate the categories in the CMS

Categories live in the CMS under **Settings > Categories**. The quickest way to populate them is to import the ready-made taxonomy package from this repo, using the CMS's standard content import.

### Import the taxonomy package

The file [`docs/Taxonomy.episerverdata`](Taxonomy.episerverdata) is an export of the full taxonomy for all seven verticals (Banking, Insurance, Healthcare, Education, Retail, Technology, Public Sector). Download it from the repo, then:

1. In the CMS, open **Settings** and go to the **import** capability for content (the same one used to bring in exported content packages).
2. Upload `Taxonomy.episerverdata` and run the import.
3. Open **Settings > Categories** and confirm the tree is there.

Keep the file as is. Do not rename or unzip it.

### The tree structure

Three levels sit above the terms that content is tagged with:

- **Level 1: the group a visitor sees in the hub.** There are three: **Category** (subject matter), **Audience** (who it is for) and **Theme** (the underlying message, such as trust or convenience).
- **Level 2: the vertical.** Banking, Insurance, Healthcare, Education, Retail, Technology, Public Sector. Each site only shows its own vertical.
- **Level 3 and below: the topics.** These are what you tag content with. Subject topics have one extra grouping level (for example Banking > Lending > Mortgages).

Format (article, event, and so on) is deliberately **not** a category. It comes from the content type.

### Notes

- Importing into an instance that already has terms with the same names can create duplicates. Import into a clean taxonomy, or delete any test terms first.
- Terms in the package are Public and Selectable. Terms marked for internal use are hidden from visitors, so keep that setting if you add your own.
- You only need the verticals you will demo. Delete the others in **Settings > Categories** if you want a shorter picker.
- To add your own terms, create them in **Settings > Categories**, parents before children. The site resolves terms itself and never relies on typed keys.

### Alternative: build the tree with Mark AI

If you would rather build or customize the tree by hand, the outline files in [`cms/taxonomy/`](../cms/taxonomy/) ([`banking-categories.md`](../cms/taxonomy/banking-categories.md), then [`other-verticals-categories.md`](../cms/taxonomy/other-verticals-categories.md)) can be given to Mark AI to create the terms through the CMS UI. Suggested prompt:

> Open the CMS Settings > Categories. Using the attached outline file, create every term in the order listed, parents before children. Keep each term Public and Selectable. Create the Banking file first, then the other-verticals file.

**Show on screen:** the Categories settings screen empty, the package being imported, and the finished tree expanded to show Category > Banking > Lending > Mortgages.

---

## Step 2. Tag your content against the taxonomy

Open any content item that supports categories (blog posts are the main case) and pick categories in the page's **settings** panel. Choose the specific topics, not just the vertical: a mortgage article might carry Mortgages, Homebuyers and Financial confidence.

Two ways to do it:

- **Manually**: open each item, add categories in settings, publish.
- **With Mark AI**: ask it to read each article and assign the closest topics from the tree, then publish. This is the quickest route for a site with many articles.

Tips:

- Aim for two to five topics per item, mixing the groups (a subject, an audience, a theme). The hub's "related" matching works best when items share several topics.
- Tag across enough items that each topic you want to demo has at least two or three pages. A topic only one page carries shows as a plain label rather than a link, because linking would only lead back to the article just read.
- Changes appear on the site after the CMS republishes and the search index updates, which can take a few minutes.

**Show on screen:** a blog post's settings panel with three categories chosen, then Mark AI tagging a batch of articles.

---

## Step 3. Add a Topic Hub Page

The hub is a normal CMS page of type **Topic Hub Page**.

1. In the CMS, create a new page and choose the type **Topic Hub Page**.
2. Give it a title (the default is "Topic Hub") and pick a title style if you want one.
3. Optionally add **Search Recommendations** (up to five quick-start suggestion pills) and arrange the **Content Buckets** (the result sections: blog posts, events, practitioners, locations, documents).
4. Fill in the SEO fields if needed, then **publish**.

What visitors get on this page:

- A **topic browser**: a collapsible panel of topics grouped by Category, Audience and Theme, with a count beside each.
- **Any / All matching**: with two or more topics selected, visitors choose whether results must match any selected topic or all of them. Topics that would give zero results are disabled in All mode.
- **Results** as cards that show their topic markers, ranked so the best matches come first, with content-type tabs and a "show more" button.
- **Search inside topics**: typing a query narrows and ranks within the selected topics.
- Counts and results are limited to the current site automatically.

Filtered hub URLs are marked noindex and point their canonical at the plain hub, so search engines do not index every topic combination.

**Show on screen:** creating the page, choosing the type, publishing.

---

## Step 4. Link the hub in Theme Manager

This is the step that turns on the article panel.

1. Open the site's **Theme Manager** item.
2. Find the **Topic Hub Page** field in the integrations group.
3. Select the hub page you just created and publish Theme Manager.

If you create the hub after Theme Manager, come back and select it. If the field is empty, articles show categories as plain labels in a "Filed under" row and nothing links anywhere.

**Show on screen:** the Theme Manager field being set and the item published.

---

## Step 5. See it working on a blog page

Open a categorized blog post and scroll to the bottom. A glass panel titled **More on these topics** appears, showing one marker per topic (tag icon, topic name, and how many pages carry it) and a **View related content** button.

- Selecting a marker, or the button, opens the Topic Hub with the article's topics already selected. The article itself is left out of the results.
- On the hub, visitors can add or remove topics, switch Any / All, search, and switch content-type tabs.
- A page with no categories shows no panel at all.
- To hide the panel on one post, turn on **Hide Categories** in that post's settings. Categories show by default.

Behind the scenes, topic clicks are also reported to Optimizely Data Platform as a `topic_select` event, with its source (article marker, article button or hub), so personalization can build on topic interest.

**Show on screen:** the article bottom, hover on a marker, click through to the hub with topics pre-selected, add a second topic, toggle Any / All.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| No topics panel on an article | The article has no categories, or **Hide Categories** is on. |
| Topics show as plain "Filed under" labels | No hub linked. Set **Topic Hub Page** in Theme Manager and publish. |
| A topic is not clickable | Only that one page carries it. Tag more content with it. |
| Hub shows no results or a topic list from the wrong vertical | Content is not tagged, or was tagged recently and the index has not caught up. Wait a few minutes and refresh. |
| A category is missing from the tag picker | It is not Public and Selectable, or its parent was not created first. |
| Practitioners or locations are missing from hub results | Their **Site Key** must match the **Front-end Domain** in Theme Manager. |

---

## Suggested video outline (about 4 to 5 minutes)

1. **Hook (0:20):** an article ending in "More on these topics", click through into the hub.
2. **The idea (0:30):** one tree, tagged once, powers related reading everywhere.
3. **Build the tree (0:50):** Settings > Categories, importing the taxonomy package.
4. **Tag content (0:50):** manual tagging, then Mark AI tagging a batch.
5. **Create the hub (0:40):** new Topic Hub Page, publish.
6. **Connect it (0:30):** Theme Manager field.
7. **Payoff (0:50):** the article panel, the hub filtering, Any / All, search.
8. **Close (0:15):** recap of the five steps.

## For the technical reader

| Concern | Location |
|---|---|
| Article panel | [`components/taxonomy/CategoryChips.tsx`](../components/taxonomy/CategoryChips.tsx) |
| Hub topic browser | [`components/taxonomy/TopicBrowser.tsx`](../components/taxonomy/TopicBrowser.tsx) |
| Taxonomy resolution (never hardcode term keys) | [`lib/taxonomy.ts`](../lib/taxonomy.ts) |
| Hub data and topic search | [`lib/topicHub.ts`](../lib/topicHub.ts), [`app/api/topics/route.ts`](../app/api/topics/route.ts) |
| Hub content type | [`cms/content-types/OT_TopicHubPage.ts`](../cms/content-types/OT_TopicHubPage.ts) |
| Theme Manager field (`topicHubRef`) | [`cms/content-types/OT_ThemeManager.ts`](../cms/content-types/OT_ThemeManager.ts) |
| Blog `hideCategories` field | [`cms/content-types/OT_BlogPage.ts`](../cms/content-types/OT_BlogPage.ts) |
