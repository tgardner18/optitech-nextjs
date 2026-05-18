'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    epi?: {
      subscribe:   (event: string, cb: (msg: any) => void) => void
      unsubscribe: (event: string, cb: (msg: any) => void) => void
    }
  }
}

type ContentSavedMessage = {
  properties?: Array<{ name: string; value: any }>
}

export default function OnPageEdit() {
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    function handleContentSaved(msg: ContentSavedMessage) {
      const { properties = [] } = msg

      for (const prop of properties) {
        const selector = `[data-epi-property-name="${CSS.escape(prop.name)}"]`
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach(el => {
            // Block containers manage their own on-page editing — skip their descendants.
            if (el.closest('[is-on-page-editing-block-container]')) return
            if (prop.value != null) el.innerHTML = prop.value
          })
      }
      // Navigation after saves is handled by PreviewComponent via the
      // optimizely:cms:contentSaved event, which carries a fresh preview token.
    }

    function trySubscribe() {
      if (cancelled) return
      if (window.epi?.subscribe) {
        window.epi.subscribe('contentSaved', handleContentSaved)
      } else {
        timer = setTimeout(trySubscribe, 100)
      }
    }

    trySubscribe()

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.epi?.unsubscribe?.('contentSaved', handleContentSaved)
    }
  }, [])

  return null
}
