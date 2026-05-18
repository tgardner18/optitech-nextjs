'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    epi?: {
      subscribe:   (event: string, cb: (msg: any) => void) => void
      unsubscribe: (event: string, cb: (msg: any) => void) => void
    }
  }
}

type ContentSavedMessage = {
  workId?:     string
  newWorkId?:  string
  properties?: Array<{ name: string; value: any }>
}

type Props = {
  workId:       string
  currentRoute: string
}

export default function OnPageEdit({ workId, currentRoute }: Props) {
  const router = useRouter()

  // Refs keep the handler closure fresh without re-subscribing on every render.
  const workIdRef = useRef(workId)
  const routeRef  = useRef(currentRoute)
  workIdRef.current = workId
  routeRef.current  = currentRoute

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    function handleContentSaved(msg: ContentSavedMessage) {
      const { properties = [], newWorkId } = msg

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

      if (newWorkId && newWorkId !== workIdRef.current) {
        router.push(routeRef.current.replace(workIdRef.current, newWorkId))
      }
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
  }, [router]) // router ref is stable; re-subscribe only if it ever changes

  return null
}
