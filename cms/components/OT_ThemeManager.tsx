import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { buildThemeCSS, getSiteSettings } from '@/lib/optimizely'
import ThemePreviewContent from '@/components/theme/ThemePreviewContent'

type Props = { content: any }

// Scope the draft token overrides to the preview container so they don't bleed into the
// surrounding CMS shell. All three rules are scoped, including nested light/dark surfaces
// (a Light footer, a dark mode panel), so those show the draft values, not the published ones.
function buildScopedPreviewCSS(settings: any): string {
  const css = buildThemeCSS(settings)
  if (!css) return ''
  return css
    .replace(/:root\s*\{/g, '#ot-theme-preview {')
    .replace(/\[data-theme="dark"\]\s*\{/g, '#ot-theme-preview [data-theme="dark"] {')
    .replace(/\[data-theme="light"\]\s*\{/g, '#ot-theme-preview[data-theme="light"], #ot-theme-preview [data-theme="light"] {')
}

export default async function OT_ThemeManagerAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const defaultMode = (content?.defaultMode as string | undefined) === 'light' ? 'light' : 'dark'
  const previewCSS  = buildScopedPreviewCSS(content)

  // The footer assigned to this Theme Manager, resolved the way the live site does.
  let footerBlock: unknown
  try {
    const live = content?.frontEndDomain ? await getSiteSettings(content.frontEndDomain) : null
    footerBlock = live?.footerRef?.item
  } catch { footerBlock = undefined }

  return (
    <div
      id="ot-theme-preview"
      {...pa(content.__composition)}
      className="min-h-screen bg-canvas"
      data-theme={defaultMode}
    >
      {previewCSS && <style dangerouslySetInnerHTML={{ __html: previewCSS }} />}
      <ThemePreviewContent settings={content} footerBlock={footerBlock} rootId="ot-theme-preview" />
    </div>
  )
}
