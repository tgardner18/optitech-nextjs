import { contentType } from '@optimizely/cms-sdk'
import { OT_ComparisonCell } from './OT_ComparisonCell'

export const OT_ComparisonRow = contentType({
  key:         'OT_ComparisonRow',
  displayName: 'Comparison Row',
  description: 'A single row in a Comparison Table. Use "Group Header" rows to create named sections, and "Data Row" rows for individual features.',
  baseType:    '_component',
  properties: {
    rowType: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Row Type',
      description: '"Data Row" renders a feature label with cell values. "Group Header" renders a full-width section divider.',
      group:       'OT_Content',
      sortOrder:   5,
      enum: [
        { value: 'row',   displayName: 'Data Row — feature label with cell values across columns' },
        { value: 'group', displayName: 'Group Header — full-width section divider with a label' },
      ],
    },
    label: {
      type:        'string',
      maxLength:   100,
      isLocalized: true,
      displayName: 'Label',
      description: 'For data rows: the feature name (e.g. "Overdraft Protection"). For group headers: the section name (e.g. "Core Features", "Support").',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    tooltip: {
      type:        'string',
      maxLength:   200,
      isLocalized: true,
      displayName: 'Tooltip',
      description: 'Optional note shown on hover/focus via an info icon beside the row label. For data rows only.',
      group:       'OT_Content',
      sortOrder:   20,
    },
    cells: {
      type:        'array',
      displayName: 'Cell Values',
      description: 'One cell per column, in column order. Leave a cell empty (no icon, no text) to render a dash. Group Header rows ignore this field.',
      group:       'OT_Content',
      sortOrder:   30,
      items:       { type: 'component', contentType: OT_ComparisonCell },
    },
  },
})
