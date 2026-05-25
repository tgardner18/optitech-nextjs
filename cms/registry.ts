import { initContentTypeRegistry, initDisplayTemplateRegistry } from '@optimizely/cms-sdk'
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server'

// Display template definitions — registered so the SDK resolves template tags at render time
import { OT_HeroDefault }         from '@/cms/display-templates/OT_HeroDefault'
import { OT_ButtonDefault }       from '@/cms/display-templates/OT_ButtonDefault'
import { OT_CardDefault }         from '@/cms/display-templates/OT_CardDefault'
import { OT_PrimaryTextDefault }  from '@/cms/display-templates/OT_PrimaryTextDefault'
import { OT_QuoteDefault }        from '@/cms/display-templates/OT_QuoteDefault'
import { OT_AuthorDefault }       from '@/cms/display-templates/OT_AuthorDefault'
import { OT_FooterBlockDefault }  from '@/cms/display-templates/OT_FooterBlockDefault'
import { OT_RichTextDefault }     from '@/cms/display-templates/OT_RichTextDefault'
import { OT_ImageDefault }        from '@/cms/display-templates/OT_ImageDefault'
import { OT_VideoDefault }        from '@/cms/display-templates/OT_VideoDefault'
import { OT_StatBlockDefault }      from '@/cms/display-templates/OT_StatBlockDefault'
import { OT_FeatureGridDefault }    from '@/cms/display-templates/OT_FeatureGridDefault'
import { OT_TrustRailDefault }      from '@/cms/display-templates/OT_TrustRailDefault'
import { OT_LandingSection }          from '@/cms/display-templates/OT_LandingSection'
import { OT_LandingRow }              from '@/cms/display-templates/OT_LandingRow'
import { OT_LandingRowSlider }        from '@/cms/display-templates/OT_LandingRowSlider'
import { OT_LandingColumn }           from '@/cms/display-templates/OT_LandingColumn'
import { OptiFormsContainerDefault }  from '@/cms/display-templates/OptiFormsContainer'

// Content type definitions — required at runtime so the SDK's query builder
// can generate the correct GraphQL fragments for each type
import { OT_HeroBlock }         from '@/cms/content-types/OT_HeroBlock'
import { OT_ButtonBlock }       from '@/cms/content-types/OT_ButtonBlock'
import { OT_CardBlock }         from '@/cms/content-types/OT_CardBlock'
import { OT_PrimaryTextBlock }  from '@/cms/content-types/OT_PrimaryTextBlock'
import { OT_QuoteBlock }        from '@/cms/content-types/OT_QuoteBlock'
import { OT_RichTextBlock }     from '@/cms/content-types/OT_RichTextBlock'
import { OT_ImageBlock }        from '@/cms/content-types/OT_ImageBlock'
import { OT_VideoBlock }        from '@/cms/content-types/OT_VideoBlock'
import { OT_StatItem }           from '@/cms/content-types/OT_StatItem'
import { OT_StatBlock }          from '@/cms/content-types/OT_StatBlock'
import { OT_FeatureItem }        from '@/cms/content-types/OT_FeatureItem'
import { OT_FeatureGridBlock }   from '@/cms/content-types/OT_FeatureGridBlock'
import { OT_LogoItem }           from '@/cms/content-types/OT_LogoItem'
import { OT_TrustRail }          from '@/cms/content-types/OT_TrustRail'
import { BlankExperience }  from '@/cms/content-types/BlankExperience'
import { OT_ThemeManager } from '@/cms/content-types/OT_ThemeManager'
import { OT_NavigationItem }    from '@/cms/content-types/OT_NavigationItem'
import { OT_NavigationSubItem } from '@/cms/content-types/OT_NavigationSubItem'
import { OT_FooterLink }        from '@/cms/content-types/OT_FooterLink'
import { OT_FooterColumn }      from '@/cms/content-types/OT_FooterColumn'
import { OT_Author }            from '@/cms/content-types/OT_Author'
import { OT_FooterBlock }       from '@/cms/content-types/OT_FooterBlock'
import { OT_BlogPage }          from '@/cms/content-types/OT_BlogPage'
import { OT_FolderPage }        from '@/cms/content-types/OT_FolderPage'

// OptiForm content types — built-in Forms for Visual Builder element schemas
import { OptiFormsContainerData }   from '@/cms/content-types/OptiFormsContainerData'
import { OptiFormsDependencyRule }  from '@/cms/content-types/OptiFormsDependencyRule'
import { OptiFormsCondition }       from '@/cms/content-types/OptiFormsCondition'
import { OptiFormsChoiceElement }   from '@/cms/content-types/OptiFormsChoiceElement'
import { OptiFormsNumberElement }   from '@/cms/content-types/OptiFormsNumberElement'
import { OptiFormsRangeElement }    from '@/cms/content-types/OptiFormsRangeElement'
import { OptiFormsResetElement }    from '@/cms/content-types/OptiFormsResetElement'
import { OptiFormsSelectionElement }from '@/cms/content-types/OptiFormsSelectionElement'
import { OptiFormsSubmitElement }   from '@/cms/content-types/OptiFormsSubmitElement'
import { OptiFormsTextareaElement } from '@/cms/content-types/OptiFormsTextareaElement'
import { OptiFormsTextboxElement }  from '@/cms/content-types/OptiFormsTextboxElement'
import { OptiFormsUrlElement }      from '@/cms/content-types/OptiFormsUrlElement'

// React component adapters — maps content type keys to Server Component renderers
import OT_HeroBlockAdapter        from '@/cms/components/OT_HeroBlock'
import OT_ButtonBlockAdapter      from '@/cms/components/OT_ButtonBlock'
import OT_CardBlockAdapter        from '@/cms/components/OT_CardBlock'
import OT_PrimaryTextBlockAdapter from '@/cms/components/OT_PrimaryTextBlock'
import OT_QuoteBlockAdapter       from '@/cms/components/OT_QuoteBlock'
import OT_RichTextBlockAdapter    from '@/cms/components/OT_RichTextBlock'
import OT_ImageBlockAdapter       from '@/cms/components/OT_ImageBlock'
import OT_VideoBlockAdapter       from '@/cms/components/OT_VideoBlock'
import OT_StatBlockAdapter            from '@/cms/components/OT_StatBlock'
import OT_FeatureGridBlockAdapter     from '@/cms/components/OT_FeatureGridBlock'
import OT_TrustRailAdapter            from '@/cms/components/OT_TrustRail'
import OT_ThemeManagerAdapter     from '@/cms/components/OT_ThemeManager'
import OT_AuthorAdapter           from '@/cms/components/OT_Author'
import OT_FooterBlockAdapter      from '@/cms/components/OT_FooterBlock'
import OT_BlogPageAdapter         from '@/cms/components/OT_BlogPage'
import OT_FolderPageAdapter       from '@/cms/components/OT_FolderPage'

// OptiForm component adapters
import OptiFormsContainerDataAdapter   from '@/cms/components/OptiFormsContainerData'
import OptiFormsChoiceElementAdapter    from '@/cms/components/OptiFormsChoiceElement'
import OptiFormsNumberElementAdapter    from '@/cms/components/OptiFormsNumberElement'
import OptiFormsRangeElementAdapter     from '@/cms/components/OptiFormsRangeElement'
import OptiFormsResetElementAdapter     from '@/cms/components/OptiFormsResetElement'
import OptiFormsSelectionElementAdapter from '@/cms/components/OptiFormsSelectionElement'
import OptiFormsSubmitElementAdapter    from '@/cms/components/OptiFormsSubmitElement'
import OptiFormsTextareaElementAdapter  from '@/cms/components/OptiFormsTextareaElement'
import OptiFormsTextboxElementAdapter   from '@/cms/components/OptiFormsTextboxElement'
import OptiFormsUrlElementAdapter       from '@/cms/components/OptiFormsUrlElement'

// Composition structure adapters — section/row/column renderers for Visual Builder
import BlankSectionAdapter    from '@/cms/compositions/Section'
import RowAdapter             from '@/cms/compositions/Row'
import ColumnAdapter          from '@/cms/compositions/Column'

initDisplayTemplateRegistry([
  OT_HeroDefault,
  OT_ButtonDefault,
  OT_CardDefault,
  OT_PrimaryTextDefault,
  OT_QuoteDefault,
  OT_AuthorDefault,
  OT_FooterBlockDefault,
  OT_RichTextDefault,
  OT_ImageDefault,
  OT_VideoDefault,
  OT_StatBlockDefault,
  OT_FeatureGridDefault,
  OT_TrustRailDefault,
  OT_LandingSection,
  OT_LandingRow,
  OT_LandingRowSlider,
  OT_LandingColumn,
  OptiFormsContainerDefault,
])

initContentTypeRegistry([
  OT_HeroBlock,
  OT_ButtonBlock,
  OT_CardBlock,
  OT_PrimaryTextBlock,
  OT_QuoteBlock,
  OT_RichTextBlock,
  OT_ImageBlock,
  OT_VideoBlock,
  OT_StatItem,
  OT_StatBlock,
  OT_FeatureItem,
  OT_FeatureGridBlock,
  OT_LogoItem,
  OT_TrustRail,
  BlankExperience,
  OT_ThemeManager,
  OT_NavigationItem,
  OT_NavigationSubItem,
  OT_FooterLink,
  OT_FooterColumn,
  OT_Author,
  OT_FooterBlock,
  OT_BlogPage,
  OT_FolderPage,
  // OptiForm types
  OptiFormsContainerData,
  OptiFormsDependencyRule,
  OptiFormsCondition,
  OptiFormsChoiceElement,
  OptiFormsNumberElement,
  OptiFormsRangeElement,
  OptiFormsResetElement,
  OptiFormsSelectionElement,
  OptiFormsSubmitElement,
  OptiFormsTextareaElement,
  OptiFormsTextboxElement,
  OptiFormsUrlElement,
])

initReactComponentRegistry({
  resolver: {
    // Content blocks
    OT_HeroBlock:        OT_HeroBlockAdapter,
    OT_ButtonBlock:      OT_ButtonBlockAdapter,
    OT_CardBlock:        OT_CardBlockAdapter,
    OT_PrimaryTextBlock: OT_PrimaryTextBlockAdapter,
    OT_QuoteBlock:       OT_QuoteBlockAdapter,
    OT_RichTextBlock:    OT_RichTextBlockAdapter,
    OT_ImageBlock:       OT_ImageBlockAdapter,
    OT_VideoBlock:       OT_VideoBlockAdapter,
    OT_StatBlock:        OT_StatBlockAdapter,
    OT_FeatureGridBlock: OT_FeatureGridBlockAdapter,
    OT_TrustRail:        OT_TrustRailAdapter,
    OT_ThemeManager:     OT_ThemeManagerAdapter,
    OT_Author:           OT_AuthorAdapter,
    OT_FooterBlock:      OT_FooterBlockAdapter,
    OT_BlogPage:         OT_BlogPageAdapter,
    OT_FolderPage:       OT_FolderPageAdapter,
    // Composition structure — 'BlankSection' is the SDK's built-in section type key;
    // '_Row' and '_Column' are the fixed registry keys OptimizelyGridSection resolves.
    BlankSection:       BlankSectionAdapter,
    _Row:               RowAdapter,
    _Column:            ColumnAdapter,
    // OptiForm elements — resolved by content type key when encountered in compositions
    OptiFormsContainerData:    OptiFormsContainerDataAdapter,
    OptiFormsChoiceElement:    OptiFormsChoiceElementAdapter,
    OptiFormsNumberElement:    OptiFormsNumberElementAdapter,
    OptiFormsRangeElement:     OptiFormsRangeElementAdapter,
    OptiFormsResetElement:     OptiFormsResetElementAdapter,
    OptiFormsSelectionElement: OptiFormsSelectionElementAdapter,
    OptiFormsSubmitElement:    OptiFormsSubmitElementAdapter,
    OptiFormsTextareaElement:  OptiFormsTextareaElementAdapter,
    OptiFormsTextboxElement:   OptiFormsTextboxElementAdapter,
    OptiFormsUrlElement:       OptiFormsUrlElementAdapter,
  },
})
