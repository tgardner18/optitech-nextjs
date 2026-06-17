import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_PractitionerProfile as OT_PractitionerProfileContentType } from '@/cms/content-types/OT_PractitionerProfile'
import type { PractitionerData, PracticeAreaData } from '@/lib/practitioners'
import PractitionerHeader from '@/components/practitioner/PractitionerHeader'

type Props = {
  content:          ContentProps<typeof OT_PractitionerProfileContentType>
  displaySettings?: Record<string, string | boolean>
}

// Preview-only adapter. OT_PractitionerProfile is a reference-only record (no
// compositionBehaviors, so it never appears in the Visual Builder element
// picker) and the listing / profile page read it directly via
// lib/practitioners.ts. But the CMS preview route (/preview) renders standalone
// content through <OptimizelyComponent>, which needs a registered React
// component — without one the profile preview is blank. This adapter maps the
// record onto PractitionerData and shows the locked header, which is the
// natural preview of the record. It is NOT used for composition rendering.
export default function OT_PractitionerProfileAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)

  const practiceAreas: PracticeAreaData[] = (content.practiceAreas ?? [])
    .filter(Boolean)
    .map(a => ({
      areaName:  a?.areaName ?? '',
      facility:  a?.facility ?? undefined,
      isPrimary: a?.isPrimary ?? undefined,
    }))

  const practitioner: PractitionerData = {
    key:            content._metadata?.key ?? '',
    firstName:      content.firstName ?? '',
    lastName:       content.lastName ?? '',
    suffix:         content.suffix ?? undefined,
    credentials:    content.credentials ?? undefined,
    title:          content.title ?? undefined,
    headshotUrl:    src(content.headshot) ?? undefined,
    bio:            content.bio?.html ? { html: content.bio.html } : undefined,
    practiceAreas,
    phone:          content.phone ?? undefined,
    email:          content.email ?? undefined,
    officeLocation: content.officeLocation ?? undefined,
    languages:      content.languages ?? undefined,
    linkedIn:       content.linkedIn?.default ?? undefined,
    groupTag:       content.groupTag ?? undefined,
    url:            '',
  }

  // Standalone preview shell (Optimizely.md guidance): full-height canvas so the
  // record reads clearly without surrounding page chrome. The block-level pa()
  // carries the data-epi-block-id for CMS selection.
  return (
    <div className="min-h-screen bg-canvas" {...pa(content.__composition)}>
      <PractitionerHeader practitioner={practitioner} />
    </div>
  )
}
