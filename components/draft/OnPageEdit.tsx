'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ContentSavedMessage = {
  properties?: Array<{ name: string; value: any }>
}

export default function OnPageEdit() {
  const router = useRouter()

  useEffect(() => {
    function handleContentSaved(msg: ContentSavedMessage) {
      const { properties = [] } = msg

      for (const prop of properties) {
        const selector = `[data-epi-property-name="${CSS.escape(prop.name)}"]`
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach(el => {
            if (el.closest('[is-on-page-editing-block-container]')) return
            if (prop.value != null) el.innerHTML = prop.value
          })
      }

      router.refresh()
    }

    // The CMS sends a raw postMessage with id:'contentSaved' and a previewUrl
    // containing the new version + preview token. communicationinjector.js does
    // NOT translate this into window.epi events — so we handle it directly.
    function handleMessage(e: MessageEvent) {
      if (e.data?.id !== 'contentSaved') return
      const previewUrl: string | undefined =
        e.data?.data?.previewUrl ?? e.data?.message?.previewUrl
      if (previewUrl) {
        try {
          const url = new URL(previewUrl)
          router.push(url.pathname + url.search)
        } catch {
          router.refresh()
        }
      } else {
        handleContentSaved(e.data?.data ?? e.data?.message ?? {})
      }
    }

    window.addEventListener('message', handleMessage)

    // Fallback: newer SDK versions dispatch this CustomEvent
    function handleNewEvent(e: Event) {
      handleContentSaved((e as CustomEvent).detail ?? {})
    }
    window.addEventListener('optimizely:cms:contentSaved', handleNewEvent)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('optimizely:cms:contentSaved', handleNewEvent)
    }
  }, [])

  return null
}
