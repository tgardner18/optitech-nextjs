export default {
  components: [
    // Include all content types and display templates …
    'cms/content-types/*.ts',
    'cms/display-templates/*.ts',
    // … except the built-in OptiForms types, which are owned by the Forms
    // product and cannot be modified via the CLI. They are still registered
    // in cms/registry.ts so the SDK can render form compositions at runtime.
    '!cms/content-types/OptiForms*.ts',
  ],
  propertyGroups: [
    { key: 'OT_Content',      displayName: 'Content',          sortOrder: 100 },
    { key: 'OT_Theme',        displayName: 'Theme',             sortOrder: 200 },
    { key: 'OT_SEO',          displayName: 'Search & Discovery', sortOrder: 300 },
    { key: 'OT_Integrations', displayName: 'Integrations',      sortOrder: 400 },
  ],
}
