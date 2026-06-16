/**
 * Conversion-event entry point used by every call site in the app.
 *
 * Flow:
 *   trackConversion(name, tags)
 *     └─ FX SDK: userContext.trackEvent(name, tags)
 *        └─ TRACK notification listener (registered in browser-client.ts)
 *           └─ window.zaius.event(name, tags)  ← only place ODP receives events
 *
 * Events fired before the FX client finishes booting are queued and replayed
 * once it is ready. If FX is not configured at all (no SDK key) the queue is
 * drained directly into ODP so tracking still works.
 */
import { getBrowserFxClientSync, initBrowserFxClient } from './browser-client'

type EventTags = Record<string, unknown>

interface QueuedEvent {
  eventKey: string
  eventTags: EventTags
}

const queue: QueuedEvent[] = []
let drainStarted = false

function dispatchToFx(client: ReturnType<typeof getBrowserFxClientSync>, evt: QueuedEvent): boolean {
  if (!client) return false
  try {
    client.userContext.trackEvent(evt.eventKey, evt.eventTags)
    return true
  } catch (e) {
    console.warn('[track] FX trackEvent failed:', evt.eventKey, e)
    return false
  }
}

function dispatchToOdpDirect(evt: QueuedEvent): void {
  if (typeof window === 'undefined' || !window.zaius) return
  try {
    window.zaius.event(evt.eventKey, evt.eventTags)
  } catch (e) {
    console.warn('[track] direct ODP fallback failed:', evt.eventKey, e)
  }
}

async function startDrain(): Promise<void> {
  if (drainStarted) return
  drainStarted = true

  const ready = await initBrowserFxClient()

  while (queue.length > 0) {
    const evt = queue.shift()!
    if (ready) {
      dispatchToFx(ready, evt)
    } else {
      // FX not configured — route directly to ODP so events are still captured.
      dispatchToOdpDirect(evt)
    }
  }
}

/**
 * Send a conversion event. Same shape as ODP's event tags so the TRACK
 * listener's forward to `zaius.event()` is a direct passthrough.
 */
export function trackConversion(eventKey: string, eventTags: EventTags = {}): void {
  if (typeof window === 'undefined') return

  const ready = getBrowserFxClientSync()
  if (ready) {
    dispatchToFx(ready, { eventKey, eventTags })
    return
  }

  queue.push({ eventKey, eventTags })
  void startDrain()
}
