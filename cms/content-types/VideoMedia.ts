import { contentType } from '@optimizely/cms-sdk'

// VideoMedia is the built-in Optimizely SaaS CMS video asset type.
// It has no custom properties — all video data lives in _metadata
// (url.default, displayName, mimeType).
// Registering it here lets the SDK resolve the type during preview rendering,
// mirroring ImageMedia for the '_video' base type.
export const VideoMedia = contentType({
  key: 'VideoMedia',
  displayName: 'Video',
  baseType: '_video',
  properties: {},
})
