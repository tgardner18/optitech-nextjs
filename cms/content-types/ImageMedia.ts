import { contentType } from '@optimizely/cms-sdk'

// ImageMedia is the built-in Optimizely SaaS CMS image asset type.
// It has no custom properties — all image data lives in _metadata
// (url.default, displayName, mimeType).
// Registering it here lets the SDK resolve the type during preview rendering.
export const ImageMedia = contentType({
  key: 'ImageMedia',
  displayName: 'Image',
  baseType: '_image',
  properties: {},
})
