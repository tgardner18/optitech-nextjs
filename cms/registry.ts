import { initContentTypeRegistry, initDisplayTemplateRegistry } from '@optimizely/cms-sdk'
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server'

// Display template definitions — registered so the SDK resolves template tags at render time
import { OT_HeroDefault }         from '@/cms/display-templates/OT_HeroDefault'
import { OT_CardDefault }         from '@/cms/display-templates/OT_CardDefault'
import { OT_PrimaryTextDefault }  from '@/cms/display-templates/OT_PrimaryTextDefault'
import { OT_QuoteDefault }        from '@/cms/display-templates/OT_QuoteDefault'
import { OT_RichTextDefault }     from '@/cms/display-templates/OT_RichTextDefault'
import { OT_ImageDefault }        from '@/cms/display-templates/OT_ImageDefault'
import { OT_VideoDefault }        from '@/cms/display-templates/OT_VideoDefault'
import { OT_LandingSection }      from '@/cms/display-templates/OT_LandingSection'
import { OT_LandingRow }          from '@/cms/display-templates/OT_LandingRow'
import { OT_LandingColumn }       from '@/cms/display-templates/OT_LandingColumn'

// Content type definitions — required at runtime so the SDK's query builder
// can generate the correct GraphQL fragments for each type
import { OT_HeroBlock }         from '@/cms/content-types/OT_HeroBlock'
import { OT_CardBlock }         from '@/cms/content-types/OT_CardBlock'
import { OT_PrimaryTextBlock }  from '@/cms/content-types/OT_PrimaryTextBlock'
import { OT_QuoteBlock }        from '@/cms/content-types/OT_QuoteBlock'
import { OT_RichTextBlock }     from '@/cms/content-types/OT_RichTextBlock'
import { OT_ImageBlock }        from '@/cms/content-types/OT_ImageBlock'
import { OT_VideoBlock }        from '@/cms/content-types/OT_VideoBlock'
import { BlankExperience }       from '@/cms/content-types/BlankExperience'
import { OT_LandingExperience } from '@/cms/content-types/OT_LandingExperience'
import { OT_SiteSettings }      from '@/cms/content-types/OT_SiteSettings'
import { OT_NavItem }           from '@/cms/content-types/OT_NavItem'
import { OT_FooterLink }        from '@/cms/content-types/OT_FooterLink'
import { OT_FooterColumn }      from '@/cms/content-types/OT_FooterColumn'

// React component adapters — maps content type keys to Server Component renderers
import OT_HeroBlockAdapter        from '@/cms/components/OT_HeroBlock'
import OT_CardBlockAdapter        from '@/cms/components/OT_CardBlock'
import OT_PrimaryTextBlockAdapter from '@/cms/components/OT_PrimaryTextBlock'
import OT_QuoteBlockAdapter       from '@/cms/components/OT_QuoteBlock'
import OT_RichTextBlockAdapter    from '@/cms/components/OT_RichTextBlock'
import OT_ImageBlockAdapter       from '@/cms/components/OT_ImageBlock'
import OT_VideoBlockAdapter       from '@/cms/components/OT_VideoBlock'

// Composition structure adapters — section/row/column renderers for Visual Builder
import BlankSectionAdapter from '@/cms/compositions/Section'
import RowAdapter          from '@/cms/compositions/Row'
import ColumnAdapter       from '@/cms/compositions/Column'

initDisplayTemplateRegistry([
  OT_HeroDefault,
  OT_CardDefault,
  OT_PrimaryTextDefault,
  OT_QuoteDefault,
  OT_RichTextDefault,
  OT_ImageDefault,
  OT_VideoDefault,
  OT_LandingSection,
  OT_LandingRow,
  OT_LandingColumn,
])

initContentTypeRegistry([
  OT_HeroBlock,
  OT_CardBlock,
  OT_PrimaryTextBlock,
  OT_QuoteBlock,
  OT_RichTextBlock,
  OT_ImageBlock,
  OT_VideoBlock,
  BlankExperience,
  OT_LandingExperience,
  OT_SiteSettings,
  OT_NavItem,
  OT_FooterLink,
  OT_FooterColumn,
])

initReactComponentRegistry({
  resolver: {
    // Content blocks
    OT_HeroBlock:        OT_HeroBlockAdapter,
    OT_CardBlock:        OT_CardBlockAdapter,
    OT_PrimaryTextBlock: OT_PrimaryTextBlockAdapter,
    OT_QuoteBlock:       OT_QuoteBlockAdapter,
    OT_RichTextBlock:    OT_RichTextBlockAdapter,
    OT_ImageBlock:       OT_ImageBlockAdapter,
    OT_VideoBlock:       OT_VideoBlockAdapter,
    // Composition structure — 'BlankSection' is the SDK's built-in section type key;
    // '_Row' and '_Column' are the fixed registry keys OptimizelyGridSection resolves.
    BlankSection: BlankSectionAdapter,
    _Row:         RowAdapter,
    _Column:      ColumnAdapter,
  },
})
